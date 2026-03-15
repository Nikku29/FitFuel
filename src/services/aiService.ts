import { getFunctions, httpsCallable } from 'firebase/functions';
import app from '@/integrations/firebase/config';
import {
  UserProfileSchema,
  WorkoutPlanSchema,
  type UserProfile,
  type WorkoutPlan,
} from '@/types/schema';

const functions = getFunctions(app, 'us-central1');

interface GeneratePlanRequest {
  profile: UserProfile;
}

export async function generateWorkoutPlan(profile: UserProfile): Promise<WorkoutPlan> {
  // Validate on the client before sending
  const validatedProfile = UserProfileSchema.parse(profile);

  const callable = httpsCallable<GeneratePlanRequest, WorkoutPlan>(functions, 'generateWorkoutPlan');
  const result = await callable({ profile: validatedProfile });

  // Validate the server response as well
  return WorkoutPlanSchema.parse(result.data);
}

export async function generateMealPlan(profile: UserProfile): Promise<WorkoutPlan> {
  // Uses the same schema shape for now; can be replaced with a dedicated MealPlan schema later.
  const validatedProfile = UserProfileSchema.parse(profile);

  const callable = httpsCallable<GeneratePlanRequest, WorkoutPlan>(functions, 'generateMealPlan');
  const result = await callable({ profile: validatedProfile });

  return WorkoutPlanSchema.parse(result.data);
}

// Added default export to fix AIOnboarding.tsx import
import { agenticEngine } from './AgenticEngine';
import { nutritionScanner } from './vision/nutritionScanner';
import { AI_CONFIG } from '@/config/aiConfig';

export const aiService = {
  generateWorkoutPlan,
  generateMealPlan,
  chat: async (messages: any[]): Promise<string> => {
    try {
      const callable = httpsCallable<{messages: any[]}, string>(functions, 'chat');
      const result = await callable({ messages });
      return result.data;
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
    // AgenticEngine returns a single object for these. The UI expects an array [result]
    return [result];
  }
};

export default aiService;
