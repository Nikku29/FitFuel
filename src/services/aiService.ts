import { WORKOUT_PROMPT, NUTRITION_PROMPT, DASHBOARD_PROMPT } from '@/config/aiPrompts';
import { UserData } from '@/contexts/UserContextTypes';

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
    // Try different API keys in order of preference
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || 
                  import.meta.env.VITE_DEEPSEEK_API_KEY || 
                  null;
    
    if (import.meta.env.VITE_OPENAI_API_KEY) {
      this.baseURL = 'https://api.openai.com/v1';
    } else if (import.meta.env.VITE_DEEPSEEK_API_KEY) {
      this.baseURL = 'https://api.deepseek.com/v1';
    }
  }

  private isConfigured(): boolean {
    return this.apiKey !== null && this.baseURL !== '';
  }

  private async makeRequest(messages: any[], maxTokens: number = 1000): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('AI service not configured. Please add your API key to environment variables.');
    }

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: import.meta.env.VITE_OPENAI_API_KEY ? 'gpt-3.5-turbo' : 'deepseek-chat',
          messages,
          max_tokens: maxTokens,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('AI API Error:', error);
      throw new Error(`Failed to get AI response: ${error}`);
    }
  }

  async generatePersonalizedWorkouts(userData: UserData, count: number = 3): Promise<PersonalizedWorkout[]> {
    const userProfile = this.buildUserProfile(userData);
    
    const messages = [
      { role: 'system', content: WORKOUT_PROMPT },
      { 
        role: 'user', 
        content: `Generate ${count} personalized workout recommendations for this user profile: ${userProfile}. Return as valid JSON array.` 
      }
    ];

    try {
      const response = await this.makeRequest(messages, 2000);
      const workouts = this.parseJSONResponse(response) as PersonalizedWorkout[];
      return workouts.map((workout, index) => ({
        ...workout,
        id: `ai-workout-${Date.now()}-${index}`
      }));
    } catch (error) {
      console.error('Error generating workouts:', error);
      return this.getFallbackWorkouts(userData);
    }
  }

  async generatePersonalizedRecipes(userData: UserData, count: number = 6): Promise<PersonalizedRecipe[]> {
    const userProfile = this.buildUserProfile(userData);
    
    const messages = [
      { role: 'system', content: NUTRITION_PROMPT },
      { 
        role: 'user', 
        content: `Generate ${count} personalized recipe recommendations for this user profile: ${userProfile}. Include variety across breakfast, lunch, dinner, and snacks. Return as valid JSON array.` 
      }
    ];

    try {
      const response = await this.makeRequest(messages, 2500);
      const recipes = this.parseJSONResponse(response) as PersonalizedRecipe[];
      return recipes.map((recipe, index) => ({
        ...recipe,
        id: `ai-recipe-${Date.now()}-${index}`
      }));
    } catch (error) {
      console.error('Error generating recipes:', error);
      return this.getFallbackRecipes(userData);
    }
  }

  async generateDashboardInsights(userData: UserData, progressData: any): Promise<DashboardInsights> {
    const userProfile = this.buildUserProfile(userData);
    const progressSummary = JSON.stringify(progressData);
    
    const messages = [
      { role: 'system', content: DASHBOARD_PROMPT },
      { 
        role: 'user', 
        content: `Generate personalized dashboard insights for this user: ${userProfile}. Their progress data: ${progressSummary}. Return as valid JSON object.` 
      }
    ];

    try {
      const response = await this.makeRequest(messages, 800);
      const insights = this.parseJSONResponse(response) as DashboardInsights;
      return insights;
    } catch (error) {
      console.error('Error generating insights:', error);
      return this.getFallbackInsights(userData);
    }
  }

  private buildUserProfile(userData: UserData): string {
    const profile = {
      goal: userData.fitnessGoal || 'General Fitness',
      level: userData.activityLevel || 'Beginner',
      diet: userData.dietaryPreference || 'No preference',
      age: userData.age || 'Not specified',
      height: userData.height ? `${userData.height}cm` : 'Not specified',
      weight: userData.weight ? `${userData.weight}kg` : 'Not specified',
      experience: userData.experienceLevel || 'Beginner',
      preferences: {
        workoutDuration: userData.preferredWorkoutDuration || '30-45 minutes',
        equipment: userData.availableEquipment || 'Basic home equipment',
        timeOfDay: userData.preferredWorkoutTime || 'Flexible',
      }
    };
    
    return JSON.stringify(profile);
  }

  private parseJSONResponse(response: string): any {
    try {
      // Clean up the response to extract JSON
      let cleanResponse = response.trim();
      
      // Remove markdown code blocks if present
      cleanResponse = cleanResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Find the JSON content
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
    const baseWorkouts = [
      {
        id: `fallback-workout-${Date.now()}-1`,
        title: `${userData.fitnessGoal || 'Fitness'} Starter Routine`,
        description: `A beginner-friendly routine tailored for ${userData.fitnessGoal?.toLowerCase() || 'general fitness'}`,
        duration: '25-30 mins',
        difficulty: userData.activityLevel || 'Beginner',
        category: 'full-body',
        exercises: [
          { name: 'Warm-up', duration: '5 mins', description: 'Light cardio and dynamic stretching', targetMuscles: ['full-body'] },
          { name: 'Bodyweight Squats', reps: '10-15', sets: '3', description: 'Basic squat movement', targetMuscles: ['legs', 'glutes'] },
          { name: 'Push-ups', reps: '5-10', sets: '3', description: 'Modified as needed', targetMuscles: ['chest', 'arms'] },
          { name: 'Plank Hold', duration: '30 seconds', sets: '3', description: 'Core strengthening', targetMuscles: ['core'] },
        ],
        benefits: ['Builds foundation strength', 'Improves mobility', 'Low impact'],
        equipment: ['None required'],
        calories: 150,
      }
    ];

    return baseWorkouts;
  }

  private getFallbackRecipes(userData: UserData): PersonalizedRecipe[] {
    const isVeg = userData.dietaryPreference === 'Veg' || userData.dietaryPreference === 'Vegan';
    
    const baseRecipes = [
      {
        id: `fallback-recipe-${Date.now()}-1`,
        title: isVeg ? 'Protein-Rich Chickpea Bowl' : 'Grilled Chicken Power Bowl',
        description: `Nutritious ${userData.fitnessGoal?.toLowerCase() || 'fitness'} meal`,
        prepTime: '20 mins',
        calories: 450,
        category: 'lunch' as const,
        dietaryType: isVeg ? 'vegetarian' as const : 'non-vegetarian' as const,
        tags: ['high-protein', 'nutrient-dense', 'meal-prep'],
        ingredients: isVeg 
          ? ['Chickpeas', 'Quinoa', 'Spinach', 'Avocado', 'Lemon', 'Olive Oil'] 
          : ['Chicken Breast', 'Brown Rice', 'Broccoli', 'Sweet Potato', 'Herbs'],
        steps: [
          'Prepare your protein source',
          'Cook grains according to package instructions', 
          'Steam or sauté vegetables',
          'Combine all ingredients in a bowl',
          'Season and serve'
        ],
        nutritionFacts: { protein: 35, carbs: 45, fat: 15, fiber: 8 }
      }
    ];

    return baseRecipes;
  }

  private getFallbackInsights(userData: UserData): DashboardInsights {
    return {
      personalizedTip: `Focus on consistency with your ${userData.fitnessGoal?.toLowerCase() || 'fitness'} journey. Small daily actions lead to big results!`,
      recommendedAction: 'Try adding 5 minutes to your next workout session.',
      progressAnalysis: 'You\'re building great habits! Keep up the momentum.',
      motivationalMessage: 'Every workout counts towards your stronger, healthier self!'
    };
  }

  // Check if AI service is available
  isAvailable(): boolean {
    return this.isConfigured();
  }

  // Get configuration status for UI
  getConfigurationStatus(): { configured: boolean; provider: string | null } {
    if (import.meta.env.VITE_OPENAI_API_KEY) {
      return { configured: true, provider: 'OpenAI' };
    } else if (import.meta.env.VITE_DEEPSEEK_API_KEY) {
      return { configured: true, provider: 'DeepSeek' };
    }
    return { configured: false, provider: null };
  }
}

export const aiService = new AIService();
export default aiService;