// ============================================================================
// Supabase Auth Layer (replaces Firebase Auth)
// Same function signatures for backwards compatibility
// ============================================================================

import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

export { supabase as auth };

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return { user: data.user, error: null };
  } catch (error: any) {
    return { user: null, error };
  }
};

export const signUp = async (email: string, password: string, displayName?: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: displayName || '',
          name: displayName || '',
        }
      }
    });
    if (error) throw error;
    return { user: data.user, error: null };
  } catch (error: any) {
    return { user: null, error };
  }
};

export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      }
    });
    if (error) throw error;
    // OAuth redirects, so user won't be immediately available
    return { user: null, error: null };
  } catch (error: any) {
    return { user: null, error };
  }
};

export const signInWithGithub = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/`,
      }
    });
    if (error) throw error;
    return { user: null, error: null };
  } catch (error: any) {
    return { user: null, error };
  }
};

export const logOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    return { error };
  }
};

export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    return { error };
  }
};

// Supabase handles email verification automatically via settings
export const sendVerificationEmail = async (_user: User) => {
  // Supabase sends verification emails automatically on signup
  // if email confirmations are enabled in the dashboard
  return { error: null };
};

// Supabase handles session persistence automatically
export const setSessionPersistence = async (_persistent: boolean = true) => {
  // Supabase uses localStorage by default with autoRefreshToken
  return { error: null };
};

// Auth state observer (same API as Firebase's onAuthStateChanged)
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      callback(session?.user ?? null);
    }
  );
  // Return unsubscribe function
  return () => subscription.unsubscribe();
};

// Helper to get current session
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
};

// Helper to get current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

// Re-export types
export type { User, Session };
