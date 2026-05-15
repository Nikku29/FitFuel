// ============================================================================
// User Service (Supabase implementation)
// ============================================================================

import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;

    // Physical Stats
    age?: number;
    gender?: 'Male' | 'Female' | 'Other' | string;
    weight?: number;
    height?: number;

    // Preferences
    location?: string;
    fitnessGoal?: 'Weight Loss' | 'Muscle Gain' | 'Endurance' | 'General Fitness' | string;
    activityLevel?: 'Sedentary' | 'Light' | 'Moderate' | 'Active' | 'Very Active' | string;
    dietaryPreference?: 'Vegetarian' | 'Vegan' | 'Keto' | 'Paleo' | 'None' | string;

    // Metadata
    onboardingCompleted: boolean;
    createdAt: any;
    updatedAt: any;
}

export class UserService {
    /**
     * Creates or updates a user in the profiles table.
     */
    static async syncUser(uid: string, data: Partial<UserProfile>) {
        try {
            const profileData: Record<string, any> = {
                id: uid,
                updated_at: new Date().toISOString()
            };

            if (data.email) profileData.email = data.email;
            if (data.displayName) profileData.full_name = data.displayName;
            if (data.photoURL) profileData.avatar_url = data.photoURL;
            if (data.gender) profileData.gender = data.gender;
            if (data.weight) profileData.weight_kg = data.weight;
            if (data.height) profileData.height_cm = data.height;
            if (data.location) profileData.location = data.location;
            if (data.fitnessGoal) profileData.fitness_goal = data.fitnessGoal;
            if (data.activityLevel) profileData.fitness_level = data.activityLevel;
            if (data.dietaryPreference) profileData.diet_preference = data.dietaryPreference;
            if (data.onboardingCompleted !== undefined) profileData.onboarding_completed = data.onboardingCompleted;

            const { error } = await supabase
                .from('profiles')
                .upsert(profileData, { onConflict: 'id' });

            if (error) throw error;
            return { success: true, error: null };
        } catch (error: any) {
            console.error("UserService Error:", error);
            return { success: false, error };
        }
    }

    static async getUser(uid: string): Promise<UserProfile | null> {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', uid)
                .single();

            if (error || !data) return null;

            return {
                uid: data.id,
                email: data.email,
                displayName: data.full_name,
                photoURL: data.avatar_url,
                gender: data.gender,
                weight: data.weight_kg,
                height: data.height_cm,
                location: data.location,
                fitnessGoal: data.fitness_goal,
                activityLevel: data.fitness_level,
                dietaryPreference: data.diet_preference,
                onboardingCompleted: data.onboarding_completed || false,
                createdAt: data.created_at,
                updatedAt: data.updated_at
            } as UserProfile;
        } catch (error) {
            console.error("UserService Get Error:", error);
            return null;
        }
    }
}
