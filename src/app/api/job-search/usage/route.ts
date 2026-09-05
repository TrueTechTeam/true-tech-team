import { NextResponse } from 'next/server';
import { getAppUsage } from '@true-tech-team/project-gateway';
import { createClient } from '../../../../lib/supabase/server';
import { checkAppAccess, JOB_SEARCH_PERMISSION_SLUG } from '../../../../lib/auth/appAccess';

const APP_SLUG = JOB_SEARCH_PERMISSION_SLUG;

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { isAdmin, hasAccess } = await checkAppAccess(supabase, user.id, APP_SLUG);
  if (!hasAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const usage = await getAppUsage(supabase, user.id, APP_SLUG, isAdmin);

  return NextResponse.json(usage);
}
