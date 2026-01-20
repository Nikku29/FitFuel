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
  created_at?: Date;
  updated_at?: Date;
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
  expires_at: Date;
  created_at: Date;
}
