import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/integrations/firebase/config';
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
            // Get workout completion data
            const logsRef = collection(db, 'users', userId, 'daily_logs');
            const logsSnapshot = await getDocs(logsRef);
            
            let workoutsCompleted = 0;
            let totalCalories = 0;
            let lastWorkoutDate: string | undefined;
            const workoutDates: Date[] = [];
            
            logsSnapshot.forEach((d) => {
                const data = d.data();
                if (data.workouts_completed) {
                    workoutsCompleted += data.workouts_completed;
                    if (data.calories_burned) {
                        totalCalories += data.calories_burned;
                    }
                    const dayStr = d.id;
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
            
            // Get user profile for weight tracking
            const profileRef = doc(db, 'users', userId);
            const profileSnap = await getDoc(profileRef);
            let weightChange: number | undefined;
            
            if (profileSnap.exists()) {
                const profile = profileSnap.data();
                // Try to get weight history (if stored)
                // For now, we'll use a simple approach
                // In production, you'd track weight over time
            }
            
            // Get last workout details if available
            const plansRef = doc(db, 'user_plans', userId);
            const plansSnap = await getDoc(plansRef);
            let lastWorkoutDifficulty: string | undefined;
            let lastWorkoutExercises: string[] | undefined;
            
            if (plansSnap.exists()) {
                const planData = plansSnap.data();
                if (planData.days && Array.isArray(planData.days)) {
                    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                    const todayWorkout = planData.days.find((d: any) => d.day === today) || planData.days[0];
                    if (todayWorkout) {
                        lastWorkoutDifficulty = todayWorkout.difficulty;
                        lastWorkoutExercises = todayWorkout.exercises?.map((e: any) => e.name) || [];
                    }
                }
            }

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
                weightChange,
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
            const today = new Date().toISOString().split('T')[0];
            const logRef = doc(db, 'users', userId, 'daily_logs', today);
            
            // This will be merged with existing data by ActiveWorkoutSession
            // We're just ensuring the structure supports progress tracking
            console.log(`[ProgressTracker] Workout completed: ${workoutData.exercises.length} exercises, ${workoutData.caloriesBurned} kcal`);
        } catch (error) {
            console.error('Error recording workout completion:', error);
        }
    }
}
