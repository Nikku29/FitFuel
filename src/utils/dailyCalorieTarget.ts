import { UserData } from '@/contexts/UserContextTypes';

/**
 * Compute daily calorie target from user profile.
 * Used by Dashboard and AI meal planning.
 */
export function getDailyCalorieTarget(user: UserData | null): { target: number; note: string } {
  if (!user?.weight || !user?.height || !user?.age) {
    return { target: 2000, note: 'Default 2000 kcal. Set weight, height, age in profile for a personal target.' };
  }

  const w = user.weight;
  const h = user.height / 100;
  const age = user.age ?? 30;
  const isMale = (user.gender || '').toLowerCase().startsWith('m');

  // BMR: Mifflin–St Jeor
  let bmr = 10 * w + 6.25 * (h * 100) - 5 * age;
  bmr += isMale ? 5 : -161;

  const level = (user.activityLevel || 'Intermediate').toLowerCase();
  const mult =
    level.includes('beginner') || level.includes('sedentary') ? 1.2 :
    level.includes('intermediate') || level.includes('light') || level.includes('moderate') ? 1.4 :
    level.includes('advanced') || level.includes('active') ? 1.6 : 1.4;

  let tdee = Math.round(bmr * mult);
  const goal = (user.fitnessGoal || '').toLowerCase();

  if (goal.includes('weight loss') || goal.includes('loss')) {
    tdee -= 400;
    return { target: Math.max(1200, tdee), note: 'Weight loss: mild deficit.' };
  }
  if (goal.includes('muscle') || goal.includes('gain')) {
    tdee += 300;
    return { target: tdee, note: 'Muscle gain: slight surplus.' };
  }
  if (goal.includes('endurance')) {
    return { target: tdee, note: 'Maintenance for endurance.' };
  }

  return { target: tdee, note: 'Maintenance.' };
}
