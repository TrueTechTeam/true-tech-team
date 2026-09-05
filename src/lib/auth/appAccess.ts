import type { SupabaseClient } from '@supabase/supabase-js';

// Job Search and Resume Builder share one access grant — Resume Builder is
// only reachable from within Job Search, so there's no separate permission
// to check. See supabase/008_merge_resume_builder_permission.sql.
export const JOB_SEARCH_PERMISSION_SLUG = 'job-search';

export interface AppAccessResult {
  isAdmin: boolean;
  hasAccess: boolean;
}

// The admin-or-grant check that used to be copy-pasted into every API route
// that needs it. Also hands back isAdmin so callers can pass it straight
// into getAppUsage()'s admin bypass.
export async function checkAppAccess(
  supabase: SupabaseClient,
  userId: string,
  appSlug: string
): Promise<AppAccessResult> {
  const [{ data: perm }, { data: roleRow }] = await Promise.all([
    supabase
      .from('app_permissions')
      .select('id')
      .eq('user_id', userId)
      .eq('app_slug', appSlug)
      .maybeSingle(),
    supabase.from('user_roles').select('role').eq('user_id', userId).maybeSingle(),
  ]);

  const isAdmin = Boolean(roleRow);
  return { isAdmin, hasAccess: isAdmin || Boolean(perm) };
}
