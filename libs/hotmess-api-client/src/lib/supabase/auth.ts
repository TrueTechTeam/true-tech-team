import { getSupabase } from './client';
import type { User, Session } from '@supabase/supabase-js';

/**
 * Get the current authenticated user.
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Get the current session.
 */
export async function getSession(): Promise<Session | null> {
  const supabase = getSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

/**
 * Sign out the current user.
 */
export async function signOut(): Promise<void> {
  const supabase = getSupabase();
  await supabase.auth.signOut();
}

/**
 * Subscribe to auth state changes.
 */
export function onAuthStateChange(callback: (event: string, session: Session | null) => void) {
  const supabase = getSupabase();
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}

/**
 * Sports Engine OAuth sign-in.
 * This initiates the OAuth flow with Sports Engine.
 */
export async function signInWithSportsEngine(redirectTo?: string): Promise<void> {
  const supabase = getSupabase();

  // Note: This requires configuring Sports Engine as an OAuth provider in Supabase
  // For now, we'll use a placeholder. The actual provider name may differ.
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google', // Placeholder - will be replaced with Sports Engine provider
    options: {
      redirectTo: redirectTo || window.location.origin,
    },
  });

  if (error) {
    throw error;
  }
}
