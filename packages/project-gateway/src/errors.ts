import type { SupabaseClient } from '@supabase/supabase-js';

// Writes to app_error_events so a failure can be diagnosed with a SQL query
// instead of relying on ephemeral platform function logs. Never throws —
// a logging failure must not break the caller's actual error handling, so
// on failure this just falls back to console.error and swallows the rest.
export async function logAppError(
  supabase: SupabaseClient,
  userId: string | null,
  appSlug: string,
  message: string,
  context?: Record<string, unknown>
): Promise<void> {
  const { error } = await supabase.from('app_error_events').insert({
    user_id: userId,
    app_slug: appSlug,
    message,
    context: context ?? null,
  });

  if (error) {
    console.error(`[project-gateway] failed to log app error for ${appSlug}:`, error);
  }
}
