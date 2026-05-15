// ============================================================================
// Progress Tracker (Supabase implementation)
// ============================================================================

import { supabase } from '@/integrations/supabase/client';
import { getNutritionLogs } from '@/integrations/firebase/firestore';

export interface UserProgressData {
    workoutsCompleted: number;
    weeksActive: number;
    lastWorkoutDate?: string;
    lastWorkoutDifficulty?: string;
    averageCaloriesBurned?: number;
    weightChange?: number;
    strengthImprovements?: Record<string, any>;
    lastWorkoutExercises?: string[];
    /** Dashboard-style stats for AI meal/workout regeneration */
    caloriesConsumedThisWeek?: number;
    dailyCalorieTarget?: number;
    avgCaloriesConsumedPerDay?: number;
}

export class ProgressTracker {
    /**
     * Fetch user progress data for AI adaptation
     */
    static async getUserProgress(userId: string): Promise<UserProgressData> {
        try {
            // Get daily logs for workout stats
            const { data: dailyLogs, error: logsError } = await supabase
                .from('daily_logs')
                .select('*')
                .eq('user_id', userId);

            if (logsError) throw logsError;

            let workoutsCompleted = 0;
            let totalCalories = 0;
            let lastWorkoutDate: string | undefined;
            const workoutDates: Date[] = [];

            (dailyLogs || []).forEach((log: any) => {
                if (log.workouts_completed) {
                    workoutsCompleted += log.workouts_completed;
                    if (log.calories_burned) {
                        totalCalories += log.calories_burned;
                    }
                    const dayStr = log.date;
                    if (dayStr) {
                        const date = new Date(dayStr);
                        if (!isNaN(date.getTime())) {
                            workoutDates.push(date);
                            if (!lastWorkoutDate || dayStr > lastWorkoutDate) {
                                lastWorkoutDate = dayStr;
                            }
                        }
                    }
                }
            });

            // Calculate weeks active
            const weeksActive = workoutDates.length > 0
                ? Math.ceil((new Date().getTime() - Math.min(...workoutDates.map(d => d.getTime()))) / (1000 * 60 * 60 * 24 * 7))
                : 0;

            // Get last workout plan details
            let lastWorkoutDifficulty: string | undefined;
            let lastWorkoutExercises: string[] | undefined;

            const { data: plans } = await supabase
                .from('workout_plans')
                .select('days, difficulty')
                .eq('user_id', userId)
                .eq('status', 'active')
                .order('created_at', { ascending: false })
                .limit(1);

            if (plans && plans.length > 0) {
                const planData = plans[0];
                const days = planData.days as any[];
                if (days && Array.isArray(days)) {
                    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                    const todayWorkout = days.find((d: any) => d.day === today) || days[0];
                    if (todayWorkout) {
                        lastWorkoutDifficulty = todayWorkout.difficulty || planData.difficulty;
                        lastWorkoutExercises = todayWorkout.exercises?.map((e: any) => e.name) || [];
                    }
                }
            }

            // Get nutrition logs for the week
            const since = new Date();
            since.setDate(since.getDate() - 7);
            const { logs: nutrLogs } = await getNutritionLogs(userId, { since, limit: 500 });
            const caloriesConsumedThisWeek = nutrLogs.reduce((acc, n) => acc + (n.calories || 0), 0);
            const uniqueDays = new Set(nutrLogs.map((n: any) => new Date(n.date).toISOString().split('T')[0])).size;
            const avgCaloriesConsumedPerDay = uniqueDays > 0 ? Math.round(caloriesConsumedThisWeek / uniqueDays) : undefined;

            return {
                workoutsCompleted,
                weeksActive: Math.max(weeksActive, Math.ceil(workoutsCompleted / 5)),
                lastWorkoutDate,
                lastWorkoutDifficulty,
                averageCaloriesBurned: workoutsCompleted > 0 ? Math.round(totalCalories / workoutsCompleted) : undefined,
                weightChange: undefined,
                lastWorkoutExercises,
                caloriesConsumedThisWeek,
                avgCaloriesConsumedPerDay
            };
        } catch (error) {
            console.error('Error fetching user progress:', error);
            return {
                workoutsCompleted: 0,
                weeksActive: 0
            };
        }
    }

    /**
     * Record workout completion for progress tracking
     */
    static async recordWorkoutCompletion(
        userId: string,
        workoutData: {
            exercises: any[];
            caloriesBurned: number;
            difficulty?: string;
            duration?: number;
        }
    ): Promise<void> {
        try {
            console.log(`[ProgressTracker] Workout completed: ${workoutData.exercises.length} exercises, ${workoutData.caloriesBurned} kcal`);
        } catch (error) {
            console.error('Error recording workout completion:', error);
        }
    }
}
