// Global type definitions for improved type safety

export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserProfile {
  id: string;
  userId: string;
  displayName?: string;
  bio?: string;
  fitnessGoals?: string[];
  preferredWorkoutTypes?: string[];
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
  height?: number;
  weight?: number;
  age?: number;
  allergies?: string;
  medicalConditions?: string;
  activityRestrictions?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Exercise {
  name: string;
  duration: string;
  description: string;
  instructions?: string[];
  targetMuscles?: string[];
  equipment?: string[];
}

export interface Workout {
  id: number;
  title: string;
  description: string;
  image: string;
  duration: string;
  calories: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  type: string;
  exercises: Exercise[];
  equipment: string[];
  benefits: string[];
}

export interface AnonymousSession {
  id: string;
  sessionData: Record<string, unknown>;
  expiresAt: Date;
  createdAt: Date;
}

export interface Recipe {
  id: number;
  name: string;
  description: string;
  image: string;
  cookTime: string;
  calories: number;
  difficulty: 'easy' | 'medium' | 'hard';
  ingredients: string[];
  instructions: string[];
  nutritionFacts: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
}

export interface AIMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface FormValidationError {
  field: string;
  message: string;
}

export interface APIResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

// Performance monitoring types
export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  url: string;
  userId?: string;
}

export interface WebVital {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB';
  value: number;
  delta: number;
  id: string;
  timestamp: number;
}

// User behavior tracking types
export interface UserAction {
  type: string;
  element?: string;
  page: string;
  timestamp: number;
  userId?: string;
  sessionId: string;
  metadata?: Record<string, unknown>;
}

export interface UserSession {
  sessionId: string;
  startTime: number;
  endTime?: number;
  userId?: string;
  actions: UserAction[];
  pageViews: string[];
  timeOnPage: Record<string, number>;
}

// SEO and meta types
export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  siteName?: string;
}

// Environment and configuration types
export interface EnvironmentConfig {
  isDevelopment: boolean;
  isProduction: boolean;
  apiUrl: string;
  appUrl: string;
}

// Error types
export interface AppError extends Error {
  code?: string;
  statusCode?: number;
  context?: Record<string, unknown>;
}

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingProps extends BaseComponentProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export interface ErrorProps extends BaseComponentProps {
  error?: Error;
  resetError?: () => void;
  message?: string;
}

// Form types
export interface FormFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}

// Image optimization types
export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpg' | 'png';
}

export interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  className?: string;
  loading?: 'lazy' | 'eager';
}