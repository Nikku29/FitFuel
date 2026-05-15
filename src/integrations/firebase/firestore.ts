// ============================================================================
// Supabase Database Layer (replaces Firestore)
// Same function signatures for backwards compatibility
// ============================================================================

import { supabase } from '@/integrations/supabase/client';
import { UserProfile, AnonymousSession } from './types';

// ============================================================================
// PROFILE OPERATIONS
// ============================================================================

export const getProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      full_name: data.full_name,
      email: data.email,
      username: data.username,
      avatar_url: data.avatar_url,
      dob: data.dob,
      gender: data.gender,
      weight_kg: data.weight_kg,
      height_cm: data.height_cm,
      body_type: data.body_type,
      location: data.location,
      fitness_goal: data.fitness_goal,
      fitness_level: data.fitness_level,
      diet_preference: data.diet_preference,
      allergies: data.allergies,
      medical_conditions: data.medical_conditions,
      activity_restrictions: data.activity_restrictions,
      tier: data.tier,
      credits: data.credits,
      onboarding_completed: data.onboarding_completed,
      created_at: data.created_at,
      updated_at: data.updated_at
    } as UserProfile;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
};

export const createProfile = async (userId: string, profileData: Partial<UserProfile>) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        ...profileData,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error creating profile:', error);
    return { error };
  }
};

export const updateProfile = async (userId: string, profileData: Partial<UserProfile>) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      // If row doesn't exist yet, upsert
      if (error.code === 'PGRST116') {
        return createProfile(userId, profileData);
      }
      throw error;
    }
    return { error: null };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { error };
  }
};

// ============================================================================
// ANONYMOUS SESSION OPERATIONS
// ============================================================================

export const createAnonymousSession = async (sessionData: Omit<AnonymousSession, 'id' | 'created_at'>) => {
  try {
    const { data, error } = await supabase
      .from('anonymous_sessions')
      .insert({
        session_token: sessionData.session_token,
        height_cm: sessionData.height_cm,
        weight_kg: sessionData.weight_kg,
        age: sessionData.age,
        gender: sessionData.gender,
        body_type: sessionData.body_type,
        location: sessionData.location,
        diet_preference: sessionData.diet_preference,
        fitness_level: sessionData.fitness_level,
        fitness_goal: sessionData.fitness_goal,
        allergies: sessionData.allergies,
        medical_conditions: sessionData.medical_conditions,
        activity_restrictions: sessionData.activity_restrictions,
        expires_at: sessionData.expires_at
      })
      .select('id')
      .single();

    if (error) throw error;
    return { id: data?.id || null, error: null };
  } catch (error) {
    console.error('Error creating anonymous session:', error);
    return { id: null, error };
  }
};

export const getAnonymousSession = async (sessionToken: string): Promise<AnonymousSession | null> => {
  try {
    const { data, error } = await supabase
      .from('anonymous_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) return null;
    return data as AnonymousSession;
  } catch (error) {
    console.error('Error fetching anonymous session:', error);
    return null;
  }
};

export const updateAnonymousSession = async (sessionId: string, sessionData: Partial<AnonymousSession>) => {
  try {
    const { error } = await supabase
      .from('anonymous_sessions')
      .update(sessionData)
      .eq('id', sessionId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error updating anonymous session:', error);
    return { error };
  }
};

export const deleteAnonymousSession = async (sessionId: string) => {
  try {
    const { error } = await supabase
      .from('anonymous_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting anonymous session:', error);
    return { error };
  }
};

// ============================================================================
// WORKOUT LOGS
// ============================================================================

export interface WorkoutLog {
  id?: string;
  userId: string;
  workoutId: string;
  workoutTitle: string;
  duration: number;
  caloriesBurned: number;
  exercises: {
    name: string;
    sets?: number;
    reps?: number | string;
    weight?: number;
    duration?: number;
  }[];
  notes?: string;
  rating?: number;
  date: Date;
  created_at?: Date;
}

export const logWorkout = async (workoutLog: Omit<WorkoutLog, 'id' | 'created_at'>) => {
  try {
    const { data, error } = await supabase
      .from('workout_logs')
      .insert({
        user_id: workoutLog.userId,
        workout_id: workoutLog.workoutId,
        workout_title: workoutLog.workoutTitle,
        duration: workoutLog.duration,
        calories_burned: workoutLog.caloriesBurned,
        exercises: workoutLog.exercises,
        notes: workoutLog.notes,
        rating: workoutLog.rating,
        date: workoutLog.date.toISOString()
      })
      .select('id')
      .single();

    if (error) throw error;
    return { id: data?.id || null, error: null };
  } catch (error) {
    console.error('Error logging workout:', error);
    return { id: null, error };
  }
};

export const getUserWorkoutLogs = async (userId: string, limit: number = 50) => {
  try {
    const { data, error } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit);

    if (error) throw error;

    const logs: WorkoutLog[] = (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      workoutId: row.workout_id,
      workoutTitle: row.workout_title,
      duration: row.duration,
      caloriesBurned: row.calories_burned,
      exercises: row.exercises || [],
      notes: row.notes,
      rating: row.rating,
      date: new Date(row.date),
      created_at: row.created_at ? new Date(row.created_at) : undefined
    }));

    return { logs, error: null };
  } catch (error) {
    console.error('Error fetching workout logs:', error);
    return { logs: [], error };
  }
};

// ============================================================================
// WORKOUT PLANS
// ============================================================================

export interface WorkoutPlan {
  id?: string;
  userId: string;
  title: string;
  description?: string;
  workoutIds?: string[];
  exercises?: {
    name: string;
    duration?: string;
    reps?: string;
    sets?: string;
    description: string;
    targetMuscles: string[];
  }[];
  difficulty?: string;
  duration?: string;
  benefits?: string[];
  schedule?: Record<string, string[]>;
  isActive: boolean;
  isFavorite?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export const createWorkoutPlan = async (plan: Omit<WorkoutPlan, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    const { data, error } = await supabase
      .from('workout_plans')
      .insert({
        user_id: plan.userId,
        title: plan.title,
        description: plan.description,
        exercises: plan.exercises || [],
        difficulty: plan.difficulty,
        duration: plan.duration,
        benefits: plan.benefits || [],
        schedule: plan.schedule || {},
        is_active: plan.isActive,
        is_favorite: plan.isFavorite || false
      })
      .select('id')
      .single();

    if (error) throw error;
    return { id: data?.id || null, error: null };
  } catch (error) {
    console.error('Error creating workout plan:', error);
    return { id: null, error };
  }
};

export const getUserWorkoutPlans = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    const plans: WorkoutPlan[] = (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      description: row.description,
      exercises: row.exercises || [],
      difficulty: row.difficulty,
      duration: row.duration,
      benefits: row.benefits || [],
      schedule: row.schedule || {},
      isActive: row.is_active,
      isFavorite: row.is_favorite,
      created_at: row.created_at ? new Date(row.created_at) : undefined,
      updated_at: row.updated_at ? new Date(row.updated_at) : undefined
    }));

    return { plans, error: null };
  } catch (error) {
    console.error('Error fetching workout plans:', error);
    return { plans: [], error };
  }
};

// ============================================================================
// USER FAVORITES
// ============================================================================

export interface UserFavorite {
  id?: string;
  userId: string;
  itemId: string;
  itemType: 'workout' | 'recipe';
  itemTitle: string;
  created_at?: Date;
}

export const addToFavorites = async (favorite: Omit<UserFavorite, 'id' | 'created_at'>) => {
  try {
    const { data, error } = await supabase
      .from('user_favorites')
      .insert({
        user_id: favorite.userId,
        item_id: favorite.itemId,
        item_type: favorite.itemType,
        item_title: favorite.itemTitle
      })
      .select('id')
      .single();

    if (error) throw error;
    return { id: data?.id || null, error: null };
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return { id: null, error };
  }
};

export const removeFromFavorites = async (userId: string, itemId: string, itemType: string) => {
  try {
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('item_id', itemId)
      .eq('item_type', itemType);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return { error };
  }
};

export const getUserFavorites = async (userId: string, itemType?: string) => {
  try {
    let query = supabase
      .from('user_favorites')
      .select('*')
      .eq('user_id', userId);

    if (itemType) {
      query = query.eq('item_type', itemType);
    }

    const { data, error } = await query;

    if (error) throw error;

    const favorites: UserFavorite[] = (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      itemId: row.item_id,
      itemType: row.item_type,
      itemTitle: row.item_title,
      created_at: row.created_at ? new Date(row.created_at) : undefined
    }));

    return { favorites, error: null };
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return { favorites: [], error };
  }
};

// ============================================================================
// USER PROGRESS
// ============================================================================

export interface UserProgress {
  id?: string;
  userId: string;
  date: Date;
  weight?: number;
  bodyFat?: number;
  muscleMass?: number;
  measurements?: {
    chest?: number;
    waist?: number;
    hips?: number;
    arms?: number;
    thighs?: number;
  };
  fitnessMetrics?: {
    restingHeartRate?: number;
    bloodPressure?: string;
    vo2Max?: number;
  };
  goals?: {
    targetWeight?: number;
    targetBodyFat?: number;
    weeklyWorkouts?: number;
  };
  notes?: string;
  created_at?: Date;
}

export const recordProgress = async (progress: Omit<UserProgress, 'id' | 'created_at'>) => {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .insert({
        user_id: progress.userId,
        date: progress.date.toISOString(),
        weight: progress.weight,
        body_fat: progress.bodyFat,
        muscle_mass: progress.muscleMass,
        measurements: progress.measurements || null,
        fitness_metrics: progress.fitnessMetrics || null,
        goals: progress.goals || null,
        notes: progress.notes
      })
      .select('id')
      .single();

    if (error) throw error;
    return { id: data?.id || null, error: null };
  } catch (error) {
    console.error('Error recording progress:', error);
    return { id: null, error };
  }
};

export const getUserProgress = async (userId: string, limit: number = 50) => {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit);

    if (error) throw error;

    const progress: UserProgress[] = (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      date: new Date(row.date),
      weight: row.weight,
      bodyFat: row.body_fat,
      muscleMass: row.muscle_mass,
      measurements: row.measurements,
      fitnessMetrics: row.fitness_metrics,
      goals: row.goals,
      notes: row.notes,
      created_at: row.created_at ? new Date(row.created_at) : undefined
    }));

    return { progress, error: null };
  } catch (error) {
    console.error('Error fetching user progress:', error);
    return { progress: [], error };
  }
};

// ============================================================================
// NUTRITION LOGS
// ============================================================================

export interface NutritionLog {
  id?: string;
  userId: string;
  foodName: string;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
  };
  image?: string;
  mealType?: string;
  date: Date;
  created_at?: Date;
}

export const logNutrition = async (log: Omit<NutritionLog, 'id' | 'created_at'>) => {
  try {
    const { data, error } = await supabase
      .from('nutrition_logs')
      .insert({
        user_id: log.userId,
        food_name: log.foodName,
        calories: log.calories,
        macros: log.macros,
        image_url: log.image,
        meal_type: log.mealType || 'lunch',
        date: log.date.toISOString()
      })
      .select('id')
      .single();

    if (error) throw error;
    return { id: data?.id || null, error: null };
  } catch (error) {
    console.error('Error logging nutrition:', error);
    return { id: null, error };
  }
};

export const getNutritionLogs = async (userId: string, options?: { since?: Date; limit?: number }) => {
  try {
    let query = supabase
      .from('nutrition_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (options?.since) {
      query = query.gte('date', options.since.toISOString());
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    const logs: (NutritionLog & { id: string })[] = (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      foodName: row.food_name,
      calories: row.calories,
      macros: row.macros || { protein: 0, carbs: 0, fat: 0 },
      image: row.image_url,
      mealType: row.meal_type,
      date: new Date(row.date),
      created_at: row.created_at ? new Date(row.created_at) : undefined
    }));

    return { logs, error: null };
  } catch (error) {
    console.error('Error fetching nutrition logs:', error);
    return { logs: [], error };
  }
};

// ============================================================================
// AI RECIPES
// ============================================================================

export const saveAiRecipe = async (userId: string, recipe: any) => {
  try {
    const { data, error } = await supabase
      .from('ai_recipes')
      .insert({
        user_id: userId,
        title: recipe.title,
        description: recipe.description,
        prep_time: recipe.prepTime || recipe.prep_time,
        calories: recipe.calories,
        category: recipe.category,
        dietary_type: recipe.dietaryType || recipe.dietary_type,
        tags: recipe.tags || [],
        ingredients: recipe.ingredients || [],
        steps: recipe.steps || recipe.instructions || [],
        serving_size: recipe.servingSize,
        nutrition_facts: recipe.nutritionFacts,
        chef_note: recipe.chefNote || recipe.agentic_insight,
        source: 'ai_generated'
      })
      .select('id')
      .single();

    if (error) throw error;
    return { id: data?.id || null, error: null };
  } catch (error) {
    console.error('Error saving AI recipe:', error);
    return { id: null, error };
  }
};

// ============================================================================
// AI WORKOUTS
// ============================================================================

export const saveAiWorkout = async (userId: string, workout: any) => {
  try {
    const { data, error } = await supabase
      .from('workout_plans')
      .insert({
        user_id: userId,
        title: workout.title,
        description: workout.description,
        exercises: workout.exercises || [],
        difficulty: workout.difficulty,
        duration: workout.duration,
        benefits: workout.benefits || [],
        source: 'ai_generated'
      })
      .select('id')
      .single();

    if (error) throw error;
    return { id: data?.id || null, error: null };
  } catch (error) {
    console.error('Error saving AI workout:', error);
    return { id: null, error };
  }
};
