import { WORKOUT_PROMPT, NUTRITION_PROMPT, DASHBOARD_PROMPT } from '@/config/aiPrompts';
import { UserData, initialUserData } from '@/contexts/UserContextTypes';
import { agenticEngine } from './AgenticEngine';
import { getStrictSystemPrompt } from '@/utils/dietaryValidator';
import { buildTrainerContext } from './aiContextBuilder';
import { TRAINER_SYSTEM_PROMPT } from '@/config/aiSystemPrompt';
import { validateSessionSafety } from '@/utils/safetyValidator';
import {
  AIRecommendation,
  PersonalizedWorkout,
  PersonalizedRecipe,
  DashboardInsights
} from '@/types/aiTypes';

class AIService {
  private apiKey: string | null = null;
  private baseURL: string = '';

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY ||
      import.meta.env.VITE_GEMINI_API_KEY ||
      null;

    if (import.meta.env.VITE_OPENAI_API_KEY) {
      this.baseURL = 'https://api.openai.com/v1';
    } else if (import.meta.env.VITE_GEMINI_API_KEY) {
      this.baseURL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
    }
  }

  private isConfigured(): boolean {
    return this.apiKey !== null;
  }

  private async makeRequest(messages: any[], maxTokens: number = 1000, modelOverride?: string): Promise<string> {
    if (!this.apiKey) {
      console.error("AI Service Error: No API Key found for OpenAI or Gemini.");
      throw new Error("MISSING_PROVIDER: No AI API configured. Please check .env or use local features.");
    }

    try {
      if (this.baseURL.includes('googleapis')) {
        const lastMsg = messages[messages.length - 1].content;
        const response = await fetch(`${this.baseURL}?key=${this.apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: typeof lastMsg === 'string' ? lastMsg : JSON.stringify(lastMsg) }] }] })
        });
        if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
      }

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: modelOverride || (import.meta.env.VITE_OPENAI_API_KEY ? 'gpt-3.5-turbo' : 'gemini-1.5-flash'),
          messages,
          max_tokens: maxTokens,
          temperature: 0.7,
        }),
      });

      if (response.status === 429) {
        console.warn("AI Quota Exceeded (429). Switching to Rule-Based Engine.");
        const lastMsg = messages[messages.length - 1].content;
        if (typeof lastMsg === 'string' && lastMsg.includes('recipe')) return JSON.stringify(this.getFallbackRecipes({} as any));
        if (typeof lastMsg === 'string' && lastMsg.includes('workout')) return JSON.stringify(this.getFallbackWorkouts({} as any));
        return "I am currently at capacity. Please try again later or use the offline tools.";
      }

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error: any) {
      console.error('AI API Error:', error);
      if (error.message?.includes('429')) {
        return "QUOTA_EXCEEDED";
      }
      throw new Error(`Failed to get AI response: ${error}`);
    }
  }

  async chat(messages: any[]): Promise<string> {
    return this.makeRequest(messages, 1500);
  }

  async generateWeeklyPlan(userData: UserData): Promise<any[]> {
    console.log("Delegating to Agentic Engine for Weekly Split...");
    try {
      const weeklyPrompt = `
      TASK: Create a 7-Day Workout Split for this user.
      CONTEXT: User Goal: ${userData.fitnessGoal}, Level: ${userData.activityLevel}, Days Available: ${userData.activityRestrictions || '5 days'}.
      
      REQUIREMENTS:
      1. Return a JSON ARRAY of 7 objects (Day 1 to Day 7).
      2. Each object MUST strictly follow this schema:
         {
           "day": "Monday", 
           "focus": "Chest & Triceps", 
           "exercises": [ { "name": "Bench Press", "sets": "3", "reps": "10", "description": "..." } ]
         }
      3. Include Rest Days where appropriate.
      4. Ensure progressive overload logic matches their level.
      `;

      const response = await this.makeRequest([
        { role: 'system', content: "You are the Periodization Architect Agent. Generate 7-day splits." },
        { role: 'user', content: weeklyPrompt }
      ], 2500, import.meta.env.VITE_GEMINI_API_KEY ? 'gemini-1.5-flash' : 'gpt-4');

      return this.parseJSONResponse(response);

    } catch (error) {
      console.error('Weekly Plan Generation Failed:', error);
      return Array(7).fill(null).map((_, i) => ({
        day: `Day ${i + 1}`,
        focus: i % 3 === 0 ? "Rest & Recovery" : "Full Body Fundamentals",
        exercises: this.getFallbackWorkouts(userData)[0].exercises
      }));
    }
  }

  async generatePersonalizedWorkouts(userData: UserData, count: number = 3, mode: 'strict_profile' | 'guest' = 'strict_profile'): Promise<PersonalizedWorkout[]> {
    console.log("Delegating to Agentic Engine for Workouts...");
    try {
      const result = await agenticEngine.runWorkflow(userData, 'generate_workout');
      if (!result) throw new Error("Agentic Engine returned null");

      return [{
        id: result.id || `ai-workout-${Date.now()}`,
        title: result.title,
        description: result.focus || "AI Optimized Session",
        duration: "45-60 min",
        difficulty: userData.activityLevel || "Intermediate",
        category: "Personalized",
        exercises: result.exercises || [],
        benefits: ["Bio-Mechanically Matched", "Goal Aligned", "Recovery Aware"],
        equipment: ["Dynamic"],
        calories: 300
      } as PersonalizedWorkout];
    } catch (error) {
      console.error('Agentic Engine Generation Failed:', error);
      return this.getFallbackWorkouts(userData);
    }
  }

  async generateFromNaturalLanguage(
    userData: UserData | null,
    query: string,
    type: 'workout' | 'recipe',
    mode: 'strict_profile' | 'guest' = 'guest'
  ): Promise<PersonalizedWorkout[] | PersonalizedRecipe[]> {
    const isGuest = mode === 'guest' || !userData;

    // 1. Context Build (Workout Only)
    let trainerContext = null;
    if (type === 'workout' && !isGuest) {
      trainerContext = buildTrainerContext(userData, query);
    }

    const systemPrompt = type === 'workout' && !isGuest
      ? `${TRAINER_SYSTEM_PROMPT} \nCONTEXT: ${JSON.stringify(trainerContext)}`
      : `SYSTEM: You are an elite ${type === 'workout' ? 'personal trainer' : 'nutritionist'}.
         USER REQUEST: "${query}"
         TASK: Generate a ${type === 'recipe' ? 'recipe' : 'workout'}.
         OUTPUT: Return ONLY valid JSON.`;

    try {
      if (type === 'workout') {
        const messages = [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate a workout for: "${query}"` }
        ];

        const rawJson = await this.makeRequest(messages, 2000, 'gemini-1.5-flash');
        const generatedSessions: PersonalizedWorkout[] = this.parseJSONResponse(rawJson);
        const session = Array.isArray(generatedSessions) ? generatedSessions[0] : generatedSessions;

        // 2. Safety Validation (Workout Only)
        if (!isGuest && trainerContext) {
          const safetyCheck = validateSessionSafety(session, userData, trainerContext.readiness_score);

          if (!safetyCheck.safe) {
            console.warn("Safety Validation Failed:", safetyCheck.reason);
            if (safetyCheck.modifiedSession) {
              return [{
                ...safetyCheck.modifiedSession,
                trainerNote: `⚠️ ${safetyCheck.reason} Switched to recovery mode.`,
                readinessScore: trainerContext.readiness_score
              }];
            }
          }

          return [{
            ...session,
            trainerNote: trainerContext.readiness_score < 5
              ? "📉 Low Readiness detected. Lowered volume."
              : "🚀 High Readiness detected. Push yourself!",
            readinessScore: trainerContext.readiness_score
          }];
        }

        return Array.isArray(generatedSessions) ? generatedSessions : [generatedSessions];

      } else {
        return await this.generatePersonalizedRecipes(userData || ({} as UserData), 1, query);
      }
    } catch (error) {
      console.error(`Failed to generate ${type} from query:`, error);
      return type === 'workout'
        ? this.getFallbackWorkouts(userData || ({} as UserData))
        : this.getFallbackRecipes(userData || ({} as UserData));
    }
  }

  async generatePersonalizedRecipes(userData: UserData, count: number = 6, ingredients?: string): Promise<PersonalizedRecipe[]> {
    console.log("Delegating to Agentic Engine for Nutrition...");
    try {
      const result = await agenticEngine.runWorkflow(userData, 'generate_meal');
      if (!result) throw new Error("Agentic Engine returned null");

      let dietaryType: 'vegetarian' | 'non-vegetarian' | 'vegan' = 'non-vegetarian';
      if (userData.dietaryPreference === 'Veg' || userData.dietaryPreference === 'Eggetarian') {
        dietaryType = 'vegetarian';
      } else if (userData.dietaryPreference === 'Vegan') {
        dietaryType = 'vegan';
      }

      return [{
        id: result.id || `ai-recipe-${Date.now()}`,
        title: result.title || "Chef's Special",
        description: result.description || "Macronutrient matched meal.",
        prepTime: "20 mins",
        calories: result.calories || 500,
        category: "lunch",
        dietaryType: dietaryType,
        tags: ["Agentic Choice", "Bio-Availabile", userData.dietaryPreference || "Custom"],
        ingredients: result.ingredients || [],
        steps: result.steps || [],
        nutritionFacts: result.nutritionFacts || { protein: 30, carbs: 40, fat: 15, fiber: 5 }
      } as PersonalizedRecipe];
    } catch (error) {
      console.error('Agentic Engine Recipe Failed:', error);
      return this.getFallbackRecipes(userData);
    }
  }

  async analyzeFoodImage(base64Image: string): Promise<any> {
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      console.warn("Vision features require OpenAI Key. Returning mock.");
      return this.getFallbackFoodAnalysis();
    }

    const messages = [
      {
        role: "user",
        content: [
          { type: "text", text: "Analyze this image. Return valid JSON with foodName, calories, protein, carbs, fat." },
          { type: "image_url", image_url: { url: base64Image } }
        ]
      }
    ];

    try {
      const response = await this.makeRequest(messages, 500, "gpt-4o");
      return this.parseJSONResponse(response);
    } catch (error) {
      console.error("Vision Analysis Failed:", error);
      return this.getFallbackFoodAnalysis();
    }
  }

  private getFallbackFoodAnalysis() {
    return {
      foodName: "Detected Food (Mock)",
      calories: 350,
      protein: 20,
      carbs: 45,
      fat: 10,
      confidence: 0.85
    };
  }

  async generateDashboardInsights(userData: UserData, progressData: any): Promise<DashboardInsights> {
    return this.getFallbackInsights(userData);
  }

  private buildUserProfile(userData: UserData): string {
    return JSON.stringify(userData);
  }

  private parseJSONResponse(response: string): any {
    try {
      let cleanResponse = response.trim();
      cleanResponse = cleanResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      const jsonStart = cleanResponse.indexOf('[') !== -1 ? cleanResponse.indexOf('[') : cleanResponse.indexOf('{');
      const jsonEnd = cleanResponse.lastIndexOf(']') !== -1 ? cleanResponse.lastIndexOf(']') + 1 : cleanResponse.lastIndexOf('}') + 1;
      if (jsonStart !== -1 && jsonEnd !== -1) {
        cleanResponse = cleanResponse.substring(jsonStart, jsonEnd);
      }
      return JSON.parse(cleanResponse);
    } catch (error) {
      console.error('Failed to parse JSON response:', response);
      throw new Error('Invalid JSON response from AI service');
    }
  }

  private getFallbackWorkouts(userData: UserData): PersonalizedWorkout[] {
    return [{
      id: 'fallback-1',
      title: 'Basic Foundation',
      description: 'Fallback routine due to connection error.',
      duration: '30 min',
      difficulty: 'Beginner',
      category: 'General',
      exercises: [
        {
          name: "Bodyweight Squats",
          duration: "45 sec",
          reps: "15",
          sets: "3",
          description: "Stand with feet shoulder-width apart, lower hips back and down.",
          targetMuscles: ["Quads", "Glutes"]
        },
        {
          name: "Push-ups (or Knee/Wall)",
          duration: "45 sec",
          reps: "10",
          sets: "3",
          description: "Keep core tight, lower chest to floor.",
          targetMuscles: ["Chest", "Triceps"]
        }
      ],
      benefits: ['Movement', 'Circulation', 'Stress Relief'],
      equipment: ['None'],
      calories: 100
    }];
  }

  private getFallbackRecipes(userData: UserData): PersonalizedRecipe[] {
    return [{
      id: 'fallback-meal',
      title: 'Simple Meal',
      description: 'Fallback meal due to connection error.',
      prepTime: '5 min',
      calories: 400,
      category: 'lunch',
      dietaryType: 'vegetarian',
      tags: ['Quick'],
      ingredients: ['Apple'],
      steps: ['Eat'],
      nutritionFacts: { protein: 0, carbs: 20, fat: 0, fiber: 2 }
    }];
  }

  private getFallbackInsights(userData: UserData): DashboardInsights {
    return {
      personalizedTip: 'Keep moving!',
      recommendedAction: 'Drink water',
      progressAnalysis: 'Steady progress',
      motivationalMessage: 'You got this'
    };
  }

  isAvailable(): boolean {
    return this.isConfigured();
  }

  getConfigurationStatus(): { configured: boolean; provider: string | null } {
    if (import.meta.env.VITE_GEMINI_API_KEY) return { configured: true, provider: 'Google Gemini' };
    if (import.meta.env.VITE_OPENAI_API_KEY) return { configured: true, provider: 'OpenAI' };
    return { configured: false, provider: null };
  }

  async generate(params: { type: 'meal' | 'workout' | 'nutrition_plan' | 'recipe'; prompt: string; preferences?: any; userId: string }) {
    console.log(`Generating ${params.type} for ${params.userId}`);
    const type = params.type === 'workout' ? 'workout' : 'recipe';
    const userData: UserData = {
      ...initialUserData,
      fitnessGoal: params.preferences?.goal || 'General Fitness',
      dietaryPreference: 'Other',
      activityLevel: 'Intermediate',
      age: 30,
      weight: 70,
      height: 175,
      gender: 'Male'
    };

    return await this.generateFromNaturalLanguage(userData, params.prompt, type as 'workout' | 'recipe');
  }

  async getGenerationHistory(params: { userId: string; limit: number; offset: number }) {
    console.log(`Fetching history for ${params.userId}`);
    return {
      items: [],
      total: 0
    };
  }

  async deleteGeneratedItem(params: { id: string; userId: string }) {
    console.log(`Deleting item ${params.id}`);
    return true;
  }
}

export const aiService = new AIService();
export default aiService;