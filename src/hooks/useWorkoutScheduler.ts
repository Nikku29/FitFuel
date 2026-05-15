// ============================================================================
// Workout Scheduler (Supabase implementation)
// ============================================================================

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { aiService } from '@/services/aiService';
import { UserData } from '@/contexts/UserContextTypes';
import { GatekeeperService } from '@/services/GatekeeperService';
import { workoutData, gymWorkouts, homeWorkouts } from '@/data/workoutData';

export const useWorkoutScheduler = (user: any, userData: UserData | null) => {
    const [todaysWorkout, setTodaysWorkout] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState<string>("Checking schedule...");
    const [weekPlan, setWeekPlan] = useState<any[]>([]);

    const getDayIndex = () => {
        const day = new Date().getDay();
        return day === 0 ? 6 : day - 1;
    };

    useEffect(() => {
        const checkAndGeneratePlan = async () => {
            if (!user || !userData) {
                setLoading(false);
                return;
            }

            // === GATEKEEPER CHECK ===
            if (GatekeeperService.enforceStaticMode(userData)) {
                console.log("🔒 Gatekeeper: Free Tier detected. Serving Static Plan.");
                setLoading(true);
                setLoadingMessage("Loading free workout plan...");

                const staticPlan = [
                    { day: 'Monday', focus: 'Full Body Hit', ...homeWorkouts[0] },
                    { day: 'Tuesday', focus: 'Cardio Burn', ...workoutData[1] },
                    { day: 'Wednesday', focus: 'Active Recovery', ...workoutData[11] },
                    { day: 'Thursday', focus: 'Upper Body Strength', ...gymWorkouts[0] },
                    { day: 'Friday', focus: 'Lower Body Power', ...workoutData[7] },
                    { day: 'Saturday', focus: 'Core & Mobility', ...workoutData[6] },
                    { day: 'Sunday', focus: 'Rest & Yoga', ...workoutData[10] }
                ];

                setWeekPlan(staticPlan);
                const todayIndex = getDayIndex();
                setTodaysWorkout(staticPlan[todayIndex]);
                setLoading(false);
                return;
            }
            // === END GATEKEEPER ===

            setLoading(true);
            setLoadingMessage("Syncing with cloud...");

            try {
                // Check for existing valid plan in Supabase
                const { data: existingPlan, error: planError } = await supabase
                    .from('workout_plans')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('status', 'active')
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                let validPlan = false;
                let currentPlanData = null;

                if (!planError && existingPlan) {
                    const createdAt = new Date(existingPlan.created_at);
                    const now = new Date();
                    const diffTime = Math.abs(now.getTime() - createdAt.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    const days = existingPlan.days as any[];
                    const hasContent = days && Array.isArray(days) && days.some((d: any) => d.exercises && d.exercises.length > 0);

                    if (diffDays <= 7 && hasContent) {
                        validPlan = true;
                        currentPlanData = days;
                        console.log("✅ Valid Weekly Plan Found");
                    } else {
                        console.log("⚠️ Plan Expired, Invalid, or Empty (Regenerating...)");
                    }
                }

                if (!validPlan) {
                    setLoadingMessage("Building your complete weekly routine...");

                    const newWeekPlan = await aiService.generateWeeklyPlan(userData, user.id);
                    const hasGeneratedContent = newWeekPlan.some((d: any) => d.exercises && d.exercises.length > 0);

                    if (hasGeneratedContent) {
                        await supabase
                            .from('workout_plans')
                            .insert({
                                user_id: user.id,
                                title: 'AI Weekly Plan',
                                days: newWeekPlan,
                                status: 'active',
                                is_active: true
                            });
                        currentPlanData = newWeekPlan;
                    } else {
                        console.error("AI Generation returned empty plan. Using fallback without saving.");
                        currentPlanData = newWeekPlan;
                    }
                }

                if (currentPlanData && Array.isArray(currentPlanData) && currentPlanData.length > 0) {
                    setWeekPlan(currentPlanData);

                    const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                    const todayIndex = getDayIndex();
                    const todayMatch = currentPlanData.find((d: any) => d.day === todayName) || currentPlanData[todayIndex] || currentPlanData[0];
                    setTodaysWorkout(todayMatch);
                } else {
                    console.error("Critical: Plan data is null or invalid structure.");
                    setWeekPlan([]);
                    setTodaysWorkout(null);
                }

            } catch (error) {
                console.error("Scheduler Error:", error);
            } finally {
                setLoading(false);
            }
        };

        checkAndGeneratePlan();
    }, [user, userData?.tier]);

    const regenerateToday = async (adjustmentPrompt: string) => {
        if (!todaysWorkout || !user) return;

        setLoading(true);
        setLoadingMessage("Adjusting today's session...");

        try {
            const newSession = await aiService.generateFromNaturalLanguage(
                userData,
                `Adjust this workout: "${todaysWorkout.focus}". Request: ${adjustmentPrompt}. Return valid workout JSON.`,
                'workout',
                'strict_profile',
                user.id
            );

            const safeSession = Array.isArray(newSession) ? newSession[0] : newSession;
            if (!safeSession) throw new Error("AI returned empty session");

            const adjustedDay = {
                ...todaysWorkout,
                focus: (safeSession as any).title,
                exercises: (safeSession as any).exercises,
                trainerNote: (safeSession as any).trainerNote,
                readinessScore: (safeSession as any).readinessScore
            };

            setTodaysWorkout(adjustedDay);

        } catch (e) {
            console.error("Adjustment Failed", e);
        } finally {
            setLoading(false);
        }
    };

    return { todaysWorkout, loading, loadingMessage, regenerateToday };
};
