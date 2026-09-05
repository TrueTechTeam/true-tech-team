import type { ReactNode } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getAppUsage } from './usage';

export interface ProjectGateProps {
  supabase: SupabaseClient;
  userId: string;
  appSlug: string;
  // Caller resolves this (e.g. permissions.isAdmin || permissions.appAccess.includes(appSlug))
  // — the gateway only owns the usage-limit check, not the permission model itself.
  hasAccess: boolean;
  // Admins bypass usage limits entirely (but still need hasAccess, resolved
  // the same way above).
  isAdmin?: boolean;
  children: ReactNode;
  accessDeniedFallback?: ReactNode;
  limitReachedFallback?: ReactNode;
}

const defaultAccessDenied = <p>You don&apos;t have access to this app.</p>;
const defaultLimitReached = <p>You&apos;ve reached your usage limit for this app.</p>;

// Wraps a mounted project: gates on permission first, then on usage limit.
// Async server component — render it directly as JSX inside a Server Component.
export async function ProjectGate({
  supabase,
  userId,
  appSlug,
  hasAccess,
  isAdmin = false,
  children,
  accessDeniedFallback = defaultAccessDenied,
  limitReachedFallback = defaultLimitReached,
}: ProjectGateProps) {
  if (!hasAccess) {
    return accessDeniedFallback;
  }

  const usage = await getAppUsage(supabase, userId, appSlug, isAdmin);
  if (!usage.allowed) {
    return limitReachedFallback;
  }

  return children;
}
