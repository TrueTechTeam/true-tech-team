import { NextResponse } from 'next/server';
import { createClientForRequest } from '../../../../lib/supabase/request';

const APP_SLUG = 'recipe-agent';

/** Who is calling and whether they may use the recipe app's AI features. Used by the mobile app. */
export async function GET(request: Request) {
  const supabase = await createClientForRequest(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [{ data: roles }, { data: perms }] = await Promise.all([
    supabase.from('user_roles').select('role').eq('user_id', user.id),
    supabase.from('app_permissions').select('app_slug').eq('user_id', user.id),
  ]);

  const isAdmin = (roles ?? []).length > 0;
  const hasGrant = (perms ?? []).some((p: { app_slug: string }) => p.app_slug === APP_SLUG);

  return NextResponse.json({
    userId: user.id,
    email: user.email ?? null,
    isAdmin,
    aiAccess: isAdmin || hasGrant,
  });
}
