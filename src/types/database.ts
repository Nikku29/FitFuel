/**
 * Database Type Definitions
 * 
 * This file contains TypeScript interfaces for all major database entities
 * used in the FitFuel application.
 */

/**
 * UserProfile Interface
 * Represents a user's profile information and preferences
 */
export interface UserProfile {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  height: number; // in cm
  currentWeight: number; // in kg
  goalWeight: number; // in kg
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'very_active' | 'extra_active';
  dietaryPreferences: string[];
  allergies: string[];
  fitnessGoals: string[];
  createdAt: Date;
  updatedAt: Date;
  profileImageUrl?: string;
  bio?: string;
}

/**
 * GeneratedPlan Interface
 * Represents a fitness and nutrition plan generated for a user
 */
export interface GeneratedPlan {
  id: string;
  userId: string;
  planName: string;
  planType: 'nutrition' | 'workout' | 'combined';
  startDate: Date;
  endDate: Date;
  duration: number; // in days
  description?: string;
  targetCalories?: number; // daily target
  targetMacros?: {
    protein: number; // in grams
    carbohydrates: number; // in grams
    fats: number; // in grams
  };
  exercises: Exercise[];
  mealPlans?: MealPlan[];
  progressMetrics?: ProgressMetric[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

/**
 * MealPlan Interface
 * Represents a meal plan within a generated plan
 */
export interface MealPlan {
  id: string;
  planId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  mealName: string;
  ingredients: string[];
  instructions?: string;
  caloriesEstimate: number;
  macros: {
    protein: number;
    carbohydrates: number;
    fats: number;
  };
  prepTimeMinutes: number;
  cookTimeMinutes: number;
}

/**
 * ProgressMetric Interface
 * Represents progress tracking metrics
 */
export interface ProgressMetric {
  id: string;
  planId: string;
  metricType: 'weight' | 'calories_burned' | 'exercises_completed' | 'distance' | 'duration';
  value: number;
  unit: string;
  recordedAt: Date;
  notes?: string;
}

/**
 * BiometricsRecord Interface
 * Represents a user's biometric measurements at a specific point in time
 */
export interface BiometricsRecord {
  id: string;
  userId: string;
  weight: number; // in kg
  height?: number; // in cm
  bmi?: number;
  bloodPressureSystolic?: number; // in mmHg
  bloodPressureDiastolic?: number; // in mmHg
  heartRate?: number; // in bpm
  bodyFatPercentage?: number;
  muscleMass?: number; // in kg
  waistCircumference?: number; // in cm
  hipCircumference?: number; // in cm
  chestCircumference?: number; // in cm
  caloriesBurned?: number; // daily estimate
  stepsCount?: number;
  sleepHours?: number;
  waterIntakeMl?: number;
  notes?: string;
  recordedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Exercise Interface
 * Represents an exercise within a workout plan
 */
export interface Exercise {
  id: string;
  planId?: string;
  name: string;
  description?: string;
  category: 'cardio' | 'strength' | 'flexibility' | 'balance' | 'sports';
  muscleGroups: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration?: number; // in minutes
  reps?: number;
  sets?: number;
  weight?: number; // in kg
  restPeriod?: number; // in seconds
  caloriesBurned?: number;
  instructions?: string;
  videoUrl?: string;
  imageUrl?: string;
  equipment?: string[];
  isCustom: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Workout Session Interface
 * Represents a completed or in-progress workout session
 */
export interface WorkoutSession {
  id: string;
  userId: string;
  planId?: string;
  exercises: ExerciseLog[];
  startTime: Date;
  endTime?: Date;
  totalDuration: number; // in minutes
  totalCaloriesBurned: number;
  notes?: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ExerciseLog Interface
 * Represents the logged details of a completed exercise
 */
export interface ExerciseLog {
  id: string;
  exerciseId: string;
  sessionId: string;
  repsCompleted?: number;
  setsCompleted?: number;
  weightUsed?: number; // in kg
  durationMinutes?: number;
  caloriesBurned: number;
  difficultyFeeling?: 'easy' | 'moderate' | 'hard';
  notes?: string;
  completedAt: Date;
}
