// Supabase integration - re-exports
export * from './config';
export * from './auth';
export * from './firestore';
export * from './storage';
export * from './types';
export * from './hooks';

// Re-export Supabase user type for convenience
export type { User, Session } from '@supabase/supabase-js';