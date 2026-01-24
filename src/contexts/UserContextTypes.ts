
import { User as FirebaseUser } from 'firebase/auth';

export type FitnessGoal = 'Weight Loss' | 'Muscle Gain' | 'General Fitness' | 'Endurance' | '';
export type DietaryPreference = 'Veg' | 'Non-Veg' | 'Vegan' | 'Eggetarian' | 'Other' | '';
export type ActivityLevel = 'Beginner' | 'Intermediate' | 'Advanced' | '';
export type Gender = 'Male' | 'Female' | 'Other' | '';

export interface UserData {
  name: string;
  age: number | null;
  gender: Gender;
  location: string;
  weight: number | null;
  height: number | null;
  dietaryPreference: DietaryPreference;
  fitnessGoal: FitnessGoal;
  activityLevel: ActivityLevel;
  onboardingComplete: boolean;
  lastLogin: Date | null;
  allergies?: string;
  medicalConditions?: string;
  activityRestrictions?: string;
  bodyType?: 'Ectomorph' | 'Mesomorph' | 'Endomorph' | string;
  tier: 'FREE' | 'PRO';
  credits: number;
}

export interface UserProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  gender: string | null;
  dob: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  location: string | null;
  diet_preference: string | null;
  fitness_level: string | null;
  fitness_goal: string | null;
  allergies: string | null;
  medical_conditions: string | null;
  activity_restrictions: string | null;
  tier: 'FREE' | 'PRO';
  credits: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface UserContextProps {
  userData: UserData;
  updateUserData: (data: Partial<UserData>) => void;
  isLoading: boolean;
  clearUserData: () => void;
  user: FirebaseUser | null;
  profile: UserProfile | null;
  session: { user: FirebaseUser } | null;
}

export const initialUserData: UserData = {
  name: '',
  age: null,
  gender: '',
  location: '',
  weight: null,
  height: null,
  dietaryPreference: '',
  fitnessGoal: '',
  activityLevel: '',
  onboardingComplete: false,
  lastLogin: null,
  allergies: '',
  medicalConditions: '',
  activityRestrictions: '',
  bodyType: '',
  tier: 'FREE',
  credits: 0
};
