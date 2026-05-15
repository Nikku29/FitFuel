
import { getProfile, updateProfile as updateSupabaseProfile } from '@/integrations/firebase/firestore';
import { UserProfile as ContextUserProfile, UserData, FitnessGoal, DietaryPreference, ActivityLevel, Gender } from './UserContextTypes';
import { UserProfile as DbUserProfile } from '@/integrations/firebase/types';
import type { User } from '@supabase/supabase-js';

export const fetchProfile = async (userId: string, setProfile: (profile: ContextUserProfile | null) => void, setUserData: (updater: (prevData: UserData) => UserData) => void) => {
  try {
    const dbProfile = await getProfile(userId);
    
    if (dbProfile) {
      // Convert DB profile to Context profile format
      const contextProfile: ContextUserProfile = {
        id: dbProfile.id,
        username: dbProfile.username || null,
        full_name: dbProfile.full_name || null,
        email: dbProfile.email || null,
        avatar_url: dbProfile.avatar_url || null,
        gender: dbProfile.gender || null,
        dob: dbProfile.dob || null,
        height_cm: dbProfile.height_cm || null,
        weight_kg: dbProfile.weight_kg || null,
        location: dbProfile.location || null,
        diet_preference: dbProfile.diet_preference || null,
        fitness_level: dbProfile.fitness_level || null,
        fitness_goal: dbProfile.fitness_goal || null,
        allergies: dbProfile.allergies || null,
        medical_conditions: dbProfile.medical_conditions || null,
        activity_restrictions: dbProfile.activity_restrictions || null,
        tier: (dbProfile.tier as 'FREE' | 'PRO') || 'FREE',
        credits: dbProfile.credits ?? 0,
        created_at: dbProfile.created_at || null,
        updated_at: dbProfile.updated_at || null,
      };
      
      setProfile(contextProfile);
      setUserData(prevData => ({
        ...prevData,
        name: contextProfile.full_name || prevData.name,
        age: contextProfile.dob ? new Date().getFullYear() - new Date(contextProfile.dob).getFullYear() : prevData.age,
        gender: (contextProfile.gender as Gender) || prevData.gender,
        location: contextProfile.location || prevData.location,
        weight: contextProfile.weight_kg || prevData.weight,
        height: contextProfile.height_cm || prevData.height,
        dietaryPreference: (contextProfile.diet_preference as DietaryPreference) || prevData.dietaryPreference,
        fitnessGoal: (contextProfile.fitness_goal as FitnessGoal) || prevData.fitnessGoal,
        activityLevel: (contextProfile.fitness_level as ActivityLevel) || prevData.activityLevel,
        allergies: contextProfile.allergies || prevData.allergies,
        medicalConditions: contextProfile.medical_conditions || prevData.medicalConditions,
        activityRestrictions: contextProfile.activity_restrictions || prevData.activityRestrictions
      }));
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
  }
};

export const updateUserProfile = async (user: User | null, profile: ContextUserProfile | null, data: Partial<UserData>) => {
  if (!user) return;

  const profileUpdate: Partial<DbUserProfile> = {};
  
  if (data.name !== undefined) profileUpdate.full_name = data.name;
  if (data.gender !== undefined) profileUpdate.gender = data.gender;
  if (data.location !== undefined) profileUpdate.location = data.location;
  if (data.weight !== undefined) profileUpdate.weight_kg = data.weight;
  if (data.height !== undefined) profileUpdate.height_cm = data.height;
  if (data.dietaryPreference !== undefined) profileUpdate.diet_preference = data.dietaryPreference;
  if (data.fitnessGoal !== undefined) profileUpdate.fitness_goal = data.fitnessGoal;
  if (data.activityLevel !== undefined) profileUpdate.fitness_level = data.activityLevel;
  if (data.allergies !== undefined) profileUpdate.allergies = data.allergies;
  if (data.medicalConditions !== undefined) profileUpdate.medical_conditions = data.medicalConditions;
  if (data.activityRestrictions !== undefined) profileUpdate.activity_restrictions = data.activityRestrictions;
  
  if (Object.keys(profileUpdate).length > 0) {
    try {
      const { error } = await updateSupabaseProfile(user.id, profileUpdate);
      if (error) console.error('Error updating profile:', error);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  }
};
