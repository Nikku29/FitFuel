// ============================================================================
// Shared types for database models
// ============================================================================

export interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
  gender?: string;
  dob?: string;
  height_cm?: number;
  weight_kg?: number;
  body_type?: 'Ectomorph' | 'Mesomorph' | 'Endomorph' | string;
  location?: string;
  diet_preference?: string;
  fitness_level?: string;
  fitness_goal?: string;
  allergies?: string;
  medical_conditions?: string;
  activity_restrictions?: string;
  tier?: 'FREE' | 'PRO';
  credits?: number;
  onboarding_completed?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AnonymousSession {
  id: string;
  session_token: string;
  height_cm?: number;
  weight_kg?: number;
  age?: number;
  gender?: string;
  body_type?: 'Ectomorph' | 'Mesomorph' | 'Endomorph' | string;
  location?: string;
  diet_preference?: string;
  fitness_level?: string;
  fitness_goal?: string;
  allergies?: string;
  medical_conditions?: string;
  activity_restrictions?: string;
  expires_at: string; // ISO string (was Date in Firebase version)
  created_at: string;
}
