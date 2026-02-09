import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Environment configuration for Supabase.
 */
export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

let supabaseInstance: SupabaseClient | null = null;

/**
 * Initialize the Supabase client.
 * Call this once at app startup.
 */
export function initSupabase(config: SupabaseConfig): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  supabaseInstance = createClient(config.url, config.anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });

  return supabaseInstance;
}

/**
 * Get the Supabase client instance.
 * Throws if not initialized.
 */
export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    throw new Error('Supabase client not initialized. Call initSupabase() first.');
  }
  return supabaseInstance;
}

/**
 * Check if Supabase client is initialized.
 */
export function isSupabaseInitialized(): boolean {
  return supabaseInstance !== null;
}
