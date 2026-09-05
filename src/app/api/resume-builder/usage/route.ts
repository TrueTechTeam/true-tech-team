import { type NextRequest, NextResponse } from 'next/server';
import { getAppUsage } from '@true-tech-team/project-gateway';
import { createClient } from '../../../../lib/supabase/server';
import { checkAppAccess, JOB_SEARCH_PERMISSION_SLUG } from '../../../../lib/auth/appAccess';

const PERMISSION_SLUG = JOB_SEARCH_PERMISSION_SLUG;

const SLOT_TO_USAGE_SLUG: Record<string, string> = {
  fill: 'resume-builder-fill',
  critique: 'resume-builder-critique',
  customize: 'resume-builder-customize',
};

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const slot = searchParams.get('slot');
  const usageSlug = slot ? SLOT_TO_USAGE_SLUG[slot] : undefined;

  if (!usageSlug) {
    return NextResponse.json(
      { error: 'slot must be one of "fill", "critique", or "customize"' },
      { status: 400 }
    );
  }

  // Permission check — admin bypasses explicit grant
  const { isAdmin, hasAccess } = await checkAppAccess(supabase, user.id, PERMISSION_SLUG);
  if (!hasAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const usage = await getAppUsage(supabase, user.id, usageSlug, isAdmin);

  return NextResponse.json(usage);
}
