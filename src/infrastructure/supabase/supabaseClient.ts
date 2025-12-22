import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Client Configuration
 * Initializes the Supabase client with environment variables
 */

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Validate that required environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing required Supabase environment variables. ' +
    'Please ensure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY are set.'
  );
}

/**
 * Initialize Supabase client
 * This client is used for all database, authentication, and storage operations
 */
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

/**
 * Supabase Auth Client
 * Exported for authentication-related operations
 */
export const supabaseAuth = supabaseClient.auth;

/**
 * Supabase Database Client
 * Exported for database operations
 */
export const supabaseDB = supabaseClient;

/**
 * Supabase Storage Client
 * Exported for storage/file operations
 */
export const supabaseStorage = supabaseClient.storage;

/**
 * Get current user session
 * @returns Current user session or null
 */
export const getCurrentSession = async () => {
  try {
    const { data, error } = await supabaseAuth.getSession();
    if (error) throw error;
    return data.session;
  } catch (error) {
    console.error('Error fetching current session:', error);
    return null;
  }
};

/**
 * Get current authenticated user
 * @returns Current authenticated user or null
 */
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabaseAuth.getUser();
    if (error) throw error;
    return data.user;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
};

export default supabaseClient;
