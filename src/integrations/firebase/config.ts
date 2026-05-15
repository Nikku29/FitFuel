// ============================================================================
// Supabase Configuration (replaces Firebase)
// Re-exports the Supabase client for backwards compatibility
// ============================================================================

import { supabase } from '@/integrations/supabase/client';

// Export supabase client as 'db' for backwards compatibility with code
// that imported { db } from firebase/config
export const db = supabase;

// Export supabase as 'auth' for auth operations
export const auth = supabase.auth;

// Export supabase storage
export const storage = supabase.storage;

// No analytics/performance equivalent needed - can use Supabase built-in
export const analytics = null;
export const performance = null;

export { supabase };
export default supabase;
