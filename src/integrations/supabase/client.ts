import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database types (to be generated from Supabase)
export type Database = {
  public: {
    Tables: {
      nutrition_logs: {
        Row: {
          id: string;
          user_id: string;
          food_name: string;
          calories: number;
          macros: {
            protein: number;
            carbs: number;
            fat: number;
          } | null;
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
          date: string;
          image_url: string | null;
          portion_size: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          food_name: string;
          calories: number;
          macros?: {
            protein: number;
            carbs: number;
            fat: number;
          } | null;
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
          date: string;
          image_url?: string | null;
          portion_size?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          food_name?: string;
          calories?: number;
          macros?: {
            protein: number;
            carbs: number;
            fat: number;
          } | null;
          meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
          date?: string;
          image_url?: string | null;
          portion_size?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      workout_logs: {
        Row: {
          id: string;
          user_id: string;
          workout_title: string;
          duration: number;
          calories_burned: number;
          exercises: Array<{
            name: string;
            sets: number;
            reps: number;
            weight?: number;
          }>;
          date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          workout_title: string;
          duration: number;
          calories_burned?: number;
          exercises: Array<{
            name: string;
            sets: number;
            reps: number;
            weight?: number;
          }>;
          date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          workout_title?: string;
          duration?: number;
          calories_burned?: number;
          exercises?: Array<{
            name: string;
            sets: number;
            reps: number;
            weight?: number;
          }>;
          date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_progress: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          weight: number;
          measurements: {
            chest?: number;
            waist?: number;
            hips?: number;
            arms?: number;
            thighs?: number;
          } | null;
          goals: {
            target_weight?: number;
            target_date?: string;
            weekly_workouts?: number;
          } | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
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
          } | null;
          goals?: {
            target_weight?: number;
            target_date?: string;
            weekly_workouts?: number;
          } | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          weight?: number;
          measurements?: {
            chest?: number;
            waist?: number;
            hips?: number;
            arms?: number;
            thighs?: number;
          } | null;
          goals?: {
            target_weight?: number;
            target_date?: string;
            weekly_workouts?: number;
          } | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};