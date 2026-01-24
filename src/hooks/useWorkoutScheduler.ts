import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/integrations/firebase/config';
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

                // Construct Static Plan
                const staticPlan = [
                    { day: 'Monday', focus: 'Full Body Hit', ...homeWorkouts[0] },
                    { day: 'Tuesday', focus: 'Cardio Burn', ...workoutData[1] },
                    { day: 'Wednesday', focus: 'Active Recovery', ...workoutData[11] }, // Recovery
                    { day: 'Thursday', focus: 'Upper Body Strength', ...gymWorkouts[0] },
                    { day: 'Friday', focus: 'Lower Body Power', ...workoutData[7] },
                    { day: 'Saturday', focus: 'Core & Mobility', ...workoutData[6] },
                    { day: 'Sunday', focus: 'Rest & Yoga', ...workoutData[10] }
                ];

                setWeekPlan(staticPlan);

                const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                const todayIndex = getDayIndex();
                const todayMatch = staticPlan[todayIndex];
                setTodaysWorkout(todayMatch);

                setLoading(false);
                return;
            }
            // === END GATEKEEPER ===

            setLoading(true);
            setLoadingMessage("Syncing with cloud...");

            try {
                const planRef = doc(db, 'user_plans', user.uid);
                const planSnap = await getDoc(planRef);

                let validPlan = false;
                let currentPlanData = null;

                if (planSnap.exists()) {
                    const data = planSnap.data();
                    const createdAt = data.created_at?.toDate();
                    const now = new Date();

                    const diffTime = Math.abs(now.getTime() - createdAt.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    const hasContent = data.days && Array.isArray(data.days) && data.days.some((d: any) => d.exercises && d.exercises.length > 0);

                    if (diffDays <= 7 && hasContent) {
                        validPlan = true;
                        currentPlanData = data.days;
                        console.log("✅ Valid Weekly Plan Found");
                    } else {
                        console.log("⚠️ Plan Expired, Invalid, or Empty (Regenerating...)");
                    }
                }

                if (!validPlan) {
                    setLoadingMessage("Building your complete weekly routine...");

                    const newWeekPlan = await aiService.generateWeeklyPlan(userData);

                    const hasGeneratedContent = newWeekPlan.some((d: any) => d.exercises && d.exercises.length > 0);

                    if (hasGeneratedContent) {
                        await setDoc(planRef, {
                            userId: user.uid,
                            days: newWeekPlan,
                            created_at: Timestamp.now(),
                            status: 'active'
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
    }, [user, userData?.tier]); // Add tier dependency to re-run if tier changes

    const regenerateToday = async (adjustmentPrompt: string) => {
        if (!todaysWorkout || !user) return;

        setLoading(true);
        setLoadingMessage("Adjusting today's session...");

        try {
            const newSession = await aiService.generateFromNaturalLanguage(
                userData,
                `Adjust this workout: "${todaysWorkout.focus}". Request: ${adjustmentPrompt}. Return valid workout JSON.`,
                'workout',
                'strict_profile'
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
