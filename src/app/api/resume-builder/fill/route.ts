import { type NextRequest } from 'next/server';
import { toNdjsonResponse } from '@true-tech-team/agent-kit';
import { getAppUsage, recordAppUsage } from '@true-tech-team/project-gateway';
import { createClient } from '../../../../lib/supabase/server';
import { checkAppAccess, JOB_SEARCH_PERMISSION_SLUG } from '../../../../lib/auth/appAccess';
import { runResumeFillAgent, type ResumeData } from '@true-tech-team/job-search';

const PERMISSION_SLUG = JOB_SEARCH_PERMISSION_SLUG;
const USAGE_SLUG = 'resume-builder-fill';

// Allow up to 60s for the agent to run
export const maxDuration = 60;

interface FillRequestBody {
  existingDraft?: ResumeData;
  targetJobDescription?: string;
  freeformNotes?: string;
}

export async function POST(request: NextRequest) {
  // 1. Auth check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // 2. Permission check — admin bypasses explicit grant
  const { isAdmin, hasAccess } = await checkAppAccess(supabase, user.id, PERMISSION_SLUG);
  if (!hasAccess) {
    return new Response('Forbidden', { status: 403 });
  }

  // 2b. Usage limit check — same 'resume-builder-fill' slug/quota as
  // upload/route.ts (a user calling this route directly, without ever
  // uploading a file, still consumes the shared 1/day fill quota). Admins
  // are unlimited.
  const usage = await getAppUsage(supabase, user.id, USAGE_SLUG, isAdmin);
  if (!usage.allowed) {
    return new Response('Usage limit reached for this period', { status: 429 });
  }

  // 3. Parse body
  let body: FillRequestBody;
  try {
    body = (await request.json()) as FillRequestBody;
  } catch {
    return new Response('Invalid JSON body', { status: 400 });
  }

  // 4. Record usage and stream the agent response
  void recordAppUsage(supabase, user.id, USAGE_SLUG);

  const generator = runResumeFillAgent(
    {
      existingDraft: body.existingDraft,
      targetJobDescription: body.targetJobDescription,
      freeformNotes: body.freeformNotes,
    },
    process.env.ANTHROPIC_API_KEY ?? ''
  );

  return toNdjsonResponse(generator);
}
