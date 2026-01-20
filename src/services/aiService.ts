import { WORKOUT_PROMPT, NUTRITION_PROMPT, DASHBOARD_PROMPT } from '@/config/aiPrompts';
import { UserData } from '@/contexts/UserContextTypes';
import { agenticEngine } from './AgenticEngine';

export interface AIRecommendation {
  id?: string;
  type: 'workout' | 'recipe' | 'dashboard';
  title: string;
  description: string;
  content: any;
  personalizedFor: string[];
}

export interface PersonalizedWorkout {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: string;
  category: string;
  exercises: {
    name: string;
    duration?: string;
    reps?: string;
    sets?: string;
    description: string;
    targetMuscles: string[];
  }[];
  benefits: string[];
  equipment: string[];
  calories: number;
}

export interface PersonalizedRecipe {
  id: string;
  title: string;
  description: string;
  prepTime: string;
  calories: number;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  dietaryType: 'vegetarian' | 'non-vegetarian' | 'vegan';
  tags: string[];
  ingredients: string[];
  steps: string[];
  nutritionFacts: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
}

export interface DashboardInsights {
  personalizedTip: string;
  recommendedAction: string;
  progressAnalysis: string;
  motivationalMessage: string;
}

class AIService {
  private apiKey: string | null = null;
  private baseURL: string = '';

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY ||
      import.meta.env.VITE_GEMINI_API_KEY ||
      import.meta.env.VITE_DEEPSEEK_API_KEY ||
      null;

    if (import.meta.env.VITE_OPENAI_API_KEY) {
      this.baseURL = 'https://api.openai.com/v1';
    } else if (import.meta.env.VITE_GEMINI_API_KEY) {
      this.baseURL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
    } else if (import.meta.env.VITE_DEEPSEEK_API_KEY) {
      this.baseURL = 'https://api.deepseek.com/v1';
    }
  }

  private isConfigured(): boolean {
    return this.apiKey !== null;
  }

  private async makeRequest(messages: any[], maxTokens: number = 1000, modelOverride?: string): Promise<string> {
    if (!this.apiKey) {
      console.warn("AI Service running in DEMO MODE (No API Key).");
      await new Promise(resolve => setTimeout(resolve, 1500));

      const lastMessage = messages[messages.length - 1].content;
      if (typeof lastMessage === 'string' && lastMessage.includes('recipe')) return JSON.stringify(this.getFallbackRecipes({} as any));
      if (typeof lastMessage === 'string' && lastMessage.includes('workout')) return JSON.stringify(this.getFallbackWorkouts({} as any));
      return "I am F.I.C.E. Since no API key is configured, I am running in demo mode.";
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
          model: modelOverride || (import.meta.env.VITE_OPENAI_API_KEY ? 'gpt-3.5-turbo' : 'deepseek-chat'),
          messages,
          max_tokens: maxTokens,
          temperature: 0.7,
        }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('AI API Error:', error);
      throw new Error(`Failed to get AI response: ${error}`);
    }
  }

  // Public generic chat method
  async chat(messages: any[]): Promise<string> {
    return this.makeRequest(messages, 1500);
  }

  async generatePersonalizedWorkouts(userData: UserData, count: number = 3): Promise<PersonalizedWorkout[]> {
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

  async generatePersonalizedRecipes(userData: UserData, count: number = 6, ingredients?: string): Promise<PersonalizedRecipe[]> {
    console.log("Delegating to Agentic Engine for Nutrition...");
    try {
      const result = await agenticEngine.runWorkflow(userData, 'generate_meal');
      if (!result) throw new Error("Agentic Engine returned null");

      return [{
        id: result.id || `ai-recipe-${Date.now()}`,
        title: result.title || "Chef's Special",
        description: result.description || "Macronutrient matched meal.",
        prepTime: "20 mins",
        calories: result.calories || 500,
        category: "lunch",
        dietaryType: "non-vegetarian",
        tags: ["Agentic Choice", "Bio-Availabile"],
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
    // Keep legacy or upgrade later
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
      exercises: [],
      benefits: ['Movement'],
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
    if (import.meta.env.VITE_DEEPSEEK_API_KEY) return { configured: true, provider: 'DeepSeek' };
    return { configured: false, provider: null };
  }
}

export const aiService = new AIService();
export default aiService;