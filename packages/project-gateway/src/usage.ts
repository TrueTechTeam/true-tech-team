import type { SupabaseClient } from '@supabase/supabase-js';
import type { UsagePeriod, UsageStatus } from './types';

function periodStart(period: UsagePeriod): string | null {
  const now = new Date();
  if (period === 'day') {
    return new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    ).toISOString();
  }
  if (period === 'month') {
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
  }
  return null;
}

// Looks up the configured limit for an app (if any) and counts this user's
// usage events within the current period. Apps with no row in
// app_usage_limits are treated as unlimited. Admins bypass limits entirely —
// callers pass their own already-resolved isAdmin flag rather than this
// module knowing anything about the permission model.
export async function getAppUsage(
  supabase: SupabaseClient,
  userId: string,
  appSlug: string,
  isAdmin = false
): Promise<UsageStatus> {
  if (isAdmin) {
    return { appSlug, used: 0, limit: null, remaining: null, allowed: true };
  }

  const { data: limitRow } = await supabase
    .from('app_usage_limits')
    .select('period, max_uses')
    .eq('app_slug', appSlug)
    .maybeSingle();

  if (!limitRow) {
    return { appSlug, used: 0, limit: null, remaining: null, allowed: true };
  }

  const since = periodStart(limitRow.period as UsagePeriod);
  let query = supabase
    .from('app_usage_events')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('app_slug', appSlug);
  if (since) {
    query = query.gte('created_at', since);
  }

  const { count } = await query;
  const used = count ?? 0;
  const limit = limitRow.max_uses as number;

  return {
    appSlug,
    used,
    limit,
    remaining: Math.max(limit - used, 0),
    allowed: used < limit,
  };
}

// Records one unit of usage. Call this at the point where the user actually
// consumes the app's functionality (e.g. an agent run), not on page view.
export async function recordAppUsage(
  supabase: SupabaseClient,
  userId: string,
  appSlug: string
): Promise<void> {
  await supabase.from('app_usage_events').insert({ user_id: userId, app_slug: appSlug });
}
