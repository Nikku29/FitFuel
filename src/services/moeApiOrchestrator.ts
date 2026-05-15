/**
 * FitFuel - MoE API Orchestration
 * Handles communication between MoE agents and Supabase database
 */

import { supabase } from '@/integrations/supabase/client';
import { MoEValidator, MoEError, MoEErrorType } from './moeErrorHandler';
import { MoEResponse } from './moeOrchestrator';

export interface NutritionLog {
  id?: string;
  user_id: string;
  food_name: string;
  calories: number;
  macros?: {
    protein: number;
    carbs: number;
    fat: number;
  };
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  date: string;
  image_url?: string;
  portion_size?: string;
}

export interface WorkoutLog {
  id?: string;
  user_id: string;
  workout_title: string;
  duration: number; // minutes
  calories_burned: number;
  exercises: Array<{
    name: string;
    sets: number;
    reps: number;
    weight?: number;
  }>;
  date: string;
}

export interface UserProgress {
  id?: string;
  user_id: string;
  date: string;
  weight: number;
  measurements?: {
    chest?: number;
    waist?: number;
    hips?: number;
    arms?: number;
    thighs?: number;
  };
  goals?: {
    target_weight?: number;
    target_date?: string;
    weekly_workouts?: number;
  };
}

class MoEApiOrchestrator {
  // Helper method for error handling
  private async withErrorHandling<T>(
    operation: () => Promise<T>,
    context: { agent?: string; workflowId?: string } = {}
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof MoEError) {
        throw error;
      }

      const moeError = new MoEError(
        MoEErrorType.WORKFLOW_ERROR,
        error instanceof Error ? error.message : 'Unknown error',
        {
          ...context,
          cause: error instanceof Error ? error : undefined
        }
      );

      throw moeError;
    }
  }

  // Nutrition Logs
  async saveNutritionLog(logData: string, userId: string): Promise<NutritionLog> {
    return this.withErrorHandling(async () => {
      // Validate the structured output from MoE
      MoEValidator.validateStructuredOutput(logData, 'nutritionLog');

      const parsedData = JSON.parse(logData);

      const nutritionLog: NutritionLog = {
        user_id: userId,
        food_name: parsedData.food_name,
        calories: parsedData.calories,
        macros: parsedData.macros,
        meal_type: parsedData.meal_type,
        date: parsedData.date || new Date().toISOString().split('T')[0],
        image_url: parsedData.image_url,
        portion_size: parsedData.portion_size
      };

      const { data, error } = await supabase
        .from('nutrition_logs')
        .insert(nutritionLog)
        .select()
        .single();

      if (error) {
        throw new MoEError(
          MoEErrorType.API_ERROR,
          `Failed to save nutrition log: ${error.message}`,
          {
            agent: 'structuring',
            context: { nutritionLog, error },
            cause: error
          }
        );
      }

      return data;
    }, { agent: 'structuring' });
  }

  async getNutritionLogs(userId: string, date?: string): Promise<NutritionLog[]> {
    return this.withErrorHandling(async () => {
      let query = supabase
        .from('nutrition_logs')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (date) {
        query = query.eq('date', date);
      }

      const { data, error } = await query;

      if (error) {
        throw new MoEError(
          MoEErrorType.API_ERROR,
          `Failed to fetch nutrition logs: ${error.message}`,
          { context: { userId, date, error } }
        );
      }

      return data || [];
    });
  }

  // Workout Logs
  async saveWorkoutLog(logData: string, userId: string): Promise<WorkoutLog> {
    return this.withErrorHandling(async () => {
      MoEValidator.validateStructuredOutput(logData, 'workoutLog');

      const parsedData = JSON.parse(logData);

      const workoutLog: WorkoutLog = {
        user_id: userId,
        workout_title: parsedData.workout_title,
        duration: parsedData.duration,
        calories_burned: parsedData.calories_burned || 0,
        exercises: parsedData.exercises,
        date: parsedData.date || new Date().toISOString().split('T')[0]
      };

      const { data, error } = await supabase
        .from('workout_logs')
        .insert(workoutLog)
        .select()
        .single();

      if (error) {
        throw new MoEError(
          MoEErrorType.API_ERROR,
          `Failed to save workout log: ${error.message}`,
          {
            agent: 'structuring',
            context: { workoutLog, error },
            cause: error
          }
        );
      }

      return data;
    }, { agent: 'structuring' });
  }

  async getWorkoutLogs(userId: string, date?: string): Promise<WorkoutLog[]> {
    return this.withErrorHandling(async () => {
      let query = supabase
        .from('workout_logs')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (date) {
        query = query.eq('date', date);
      }

      const { data, error } = await query;

      if (error) {
        throw new MoEError(
          MoEErrorType.API_ERROR,
          `Failed to fetch workout logs: ${error.message}`,
          { context: { userId, date, error } }
        );
      }

      return data || [];
    });
  }

  // User Progress
  async saveUserProgress(progressData: string, userId: string): Promise<UserProgress> {
    return this.withErrorHandling(async () => {
      MoEValidator.validateStructuredOutput(progressData, 'userProgress');

      const parsedData = JSON.parse(progressData);

      const userProgress: UserProgress = {
        user_id: userId,
        date: parsedData.date || new Date().toISOString().split('T')[0],
        weight: parsedData.weight,
        measurements: parsedData.measurements,
        goals: parsedData.goals
      };

      const { data, error } = await supabase
        .from('user_progress')
        .insert(userProgress)
        .select()
        .single();

      if (error) {
        throw new MoEError(
          MoEErrorType.API_ERROR,
          `Failed to save user progress: ${error.message}`,
          {
            agent: 'structuring',
            context: { userProgress, error },
            cause: error
          }
        );
      }

      return data;
    }, { agent: 'structuring' });
  }

  async getUserProgress(userId: string, limit: number = 30): Promise<UserProgress[]> {
    return this.withErrorHandling(async () => {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(limit);

      if (error) {
        throw new MoEError(
          MoEErrorType.API_ERROR,
          `Failed to fetch user progress: ${error.message}`,
          { context: { userId, limit, error } }
        );
      }

      return data || [];
    });
  }

  // Batch operations for MoE workflows
  async processWorkflowResults(
    workflowResults: MoEResponse[],
    userId: string
  ): Promise<{
    nutritionLogs: NutritionLog[];
    workoutLogs: WorkoutLog[];
    userProgress: UserProgress[];
  }> {
    return this.withErrorHandling(async () => {
      const results = {
        nutritionLogs: [] as NutritionLog[],
        workoutLogs: [] as WorkoutLog[],
        userProgress: [] as UserProgress[]
      };

      for (const result of workflowResults) {
        if (result.agent === 'structuring' && result.output && !result.error) {
          try {
            const output = typeof result.output === 'string' ? result.output : JSON.stringify(result.output);

            // Determine data type from content analysis
            if (output.includes('food_name') || output.includes('calories')) {
              const log = await this.saveNutritionLog(output, userId);
              results.nutritionLogs.push(log);
            } else if (output.includes('workout_title') || output.includes('exercises')) {
              const log = await this.saveWorkoutLog(output, userId);
              results.workoutLogs.push(log);
            } else if (output.includes('weight') || output.includes('measurements')) {
              const progress = await this.saveUserProgress(output, userId);
              results.userProgress.push(progress);
            }
          } catch (error) {
            // Log but don't fail the entire workflow
            console.warn('Failed to process individual result:', error);
          }
        }
      }

      return results;
    }, { workflowId: 'batch-processing' });
  }

  // Analytics and insights from MoE data
  async getNutritionInsights(userId: string, days: number = 7): Promise<{
    totalCalories: number;
    averageMacros: { protein: number; carbs: number; fat: number };
    mealDistribution: Record<string, number>;
  }> {
    return this.withErrorHandling(async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: logs, error } = await supabase
        .from('nutrition_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0]);

      if (error) {
        throw new MoEError(
          MoEErrorType.API_ERROR,
          `Failed to fetch nutrition insights: ${error.message}`,
          { context: { userId, days, error } }
        );
      }

      if (!logs || logs.length === 0) {
        return {
          totalCalories: 0,
          averageMacros: { protein: 0, carbs: 0, fat: 0 },
          mealDistribution: {}
        };
      }

      const totalCalories = logs.reduce((sum: number, log: any) => sum + log.calories, 0);
      const mealDistribution: Record<string, number> = {};

      logs.forEach((log: any) => {
        mealDistribution[log.meal_type] = (mealDistribution[log.meal_type] || 0) + 1;
      });

      // Calculate average macros
      const macroTotals = logs.reduce(
        (totals: { protein: number; carbs: number; fat: number }, log: any) => {
          if (log.macros) {
            totals.protein += log.macros.protein || 0;
            totals.carbs += log.macros.carbs || 0;
            totals.fat += log.macros.fat || 0;
          }
          return totals;
        },
        { protein: 0, carbs: 0, fat: 0 }
      );

      const averageMacros = {
        protein: Math.round(macroTotals.protein / logs.length),
        carbs: Math.round(macroTotals.carbs / logs.length),
        fat: Math.round(macroTotals.fat / logs.length)
      };

      return {
        totalCalories,
        averageMacros,
        mealDistribution
      };
    }, { agent: 'analytics' });
  }
}

// Singleton instance
export const moeApiOrchestrator = new MoEApiOrchestrator();

// Convenience functions
export const saveNutritionFromMoE = (moeOutput: string, userId: string) =>
  moeApiOrchestrator.saveNutritionLog(moeOutput, userId);

export const saveWorkoutFromMoE = (moeOutput: string, userId: string) =>
  moeApiOrchestrator.saveWorkoutLog(moeOutput, userId);

export const saveProgressFromMoE = (moeOutput: string, userId: string) =>
  moeApiOrchestrator.saveUserProgress(moeOutput, userId);

export const processMoEWorkflow = (results: MoEResponse[], userId: string) =>
  moeApiOrchestrator.processWorkflowResults(results, userId);