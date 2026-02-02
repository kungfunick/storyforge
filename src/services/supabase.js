/**
 * Supabase Client
 * @module services/supabase
 * @description Initializes and exports Supabase client
 * 
 * Follows Dependency Inversion Principle:
 * - Services depend on this abstraction, not concrete implementation
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase credentials not found. Running in local storage mode.'
  );
}

/**
 * Supabase client instance
 * @type {import('@supabase/supabase-js').SupabaseClient|null}
 */
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

/**
 * Checks if Supabase is configured
 * @returns {boolean} Whether Supabase is available
 */
export function isSupabaseConfigured() {
  return supabase !== null;
}
