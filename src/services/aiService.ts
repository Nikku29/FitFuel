// ============================================================================
// AI Service (Supabase-compatible, no Firebase Functions)
// ============================================================================

import {
  UserProfileSchema,
  WorkoutPlanSchema,
  type UserProfile,
  type WorkoutPlan,
} from '@/types/schema';

// These functions now use the AgenticEngine directly instead of Firebase Cloud Functions
import { agenticEngine } from './AgenticEngine';
import { nutritionScanner } from './vision/nutritionScanner';
import { AI_CONFIG } from '@/config/aiConfig';

export async function generateWorkoutPlan(profile: UserProfile): Promise<WorkoutPlan> {
  const validatedProfile = UserProfileSchema.parse(profile);
  // Use AgenticEngine instead of Firebase Cloud Functions
  const result = await agenticEngine.runWorkflow(validatedProfile as any, 'generate_workout');
  return WorkoutPlanSchema.parse(result);
}

export async function generateMealPlan(profile: UserProfile): Promise<WorkoutPlan> {
  const validatedProfile = UserProfileSchema.parse(profile);
  const result = await agenticEngine.runWorkflow(validatedProfile as any, 'generate_meal');
  return WorkoutPlanSchema.parse(result);
}

export const aiService = {
  generateWorkoutPlan,
  generateMealPlan,
  chat: async (messages: any[]): Promise<string> => {
    try {
      const result = await agenticEngine.runWorkflow(
        {} as any,
        'chat',
        { chatMessages: messages }
      );
      return typeof result === 'string' ? result : JSON.stringify(result);
    } catch (error) {
      console.error("aiService.chat error:", error);
      return "I encountered an error. Please try again.";
    }
  },
  getConfigurationStatus: () => {
    return { configured: !!import.meta.env.VITE_OPENROUTER_API_KEY };
  },
  generateDashboardInsights: async (userData: any, progressData: any) => {
    return await agenticEngine.runWorkflow(userData, 'update_dashboard', { progressData });
  },
  analyzeFoodImage: async (imageSrc: string) => {
    return await nutritionScanner.scanFood(imageSrc);
  },
  generateFromNaturalLanguage: async (userData: any, query: string, type: 'workout' | 'recipe', mode: string, uid?: string) => {
    const intent = type === 'workout' ? 'generate_workout' : 'generate_meal';
    const result = await agenticEngine.runWorkflow(userData, intent, { customPrompt: query });
    return [result];
  },
  generateWeeklyPlan: async (userData: any, userId?: string) => {
    return await agenticEngine.runWorkflow(userData, 'generate_workout', { mode: 'weekly' });
  }
};

export default aiService;
