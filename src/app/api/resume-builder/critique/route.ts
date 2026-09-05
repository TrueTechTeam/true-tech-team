import { type NextRequest } from 'next/server';
import { toNdjsonResponse, type AgentStreamEvent } from '@true-tech-team/agent-kit';
import { getAppUsage, recordAppUsage } from '@true-tech-team/project-gateway';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '../../../../lib/supabase/server';
import { checkAppAccess, JOB_SEARCH_PERMISSION_SLUG } from '../../../../lib/auth/appAccess';
import {
  runResumeCritiqueAgent,
  type ResumeCritique,
  type ResumeData,
} from '@true-tech-team/job-search';

const PERMISSION_SLUG = JOB_SEARCH_PERMISSION_SLUG;
const USAGE_SLUG = 'resume-builder-critique';

// Allow up to 60s for the agent to run
export const maxDuration = 60;

interface CritiqueRequestBody {
  resumeData?: ResumeData;
  targetJobDescription?: string;
  resumeDocumentId?: string;
}

// Forwards every event from the critique agent unchanged, but on the `result`
// event, fire-and-forget persists the critique to `resume_critiques`. This
// wrapper is necessary because `toNdjsonResponse` fully owns stream
// consumption — there's no other hook point after the stream completes.
async function* withPersistence(
  generator: AsyncGenerator<AgentStreamEvent<ResumeCritique>>,
  supabase: SupabaseClient,
  userId: string,
  resumeDocumentId: string | null,
  targetJobDescription: string | null
): AsyncGenerator<AgentStreamEvent<ResumeCritique>> {
  for await (const event of generator) {
    if (event.type === 'result') {
      void supabase.from('resume_critiques').insert({
        user_id: userId,
        resume_document_id: resumeDocumentId,
        target_job_description: targetJobDescription,
        feedback: event.result,
      });
    }
    yield event;
  }
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

  // 2b. Usage limit check — admins are unlimited
  const usage = await getAppUsage(supabase, user.id, USAGE_SLUG, isAdmin);
  if (!usage.allowed) {
    return new Response('Usage limit reached for this period', { status: 429 });
  }

  // 3. Parse body
  let body: CritiqueRequestBody;
  try {
    body = (await request.json()) as CritiqueRequestBody;
  } catch {
    return new Response('Invalid JSON body', { status: 400 });
  }

  if (!body.resumeData) {
    return new Response('Missing resumeData', { status: 400 });
  }

  // 4. Record usage and stream the agent response, persisting the critique
  // once it lands.
  void recordAppUsage(supabase, user.id, USAGE_SLUG);

  const generator = runResumeCritiqueAgent(
    body.resumeData,
    body.targetJobDescription,
    process.env.ANTHROPIC_API_KEY ?? ''
  );

  const persisted = withPersistence(
    generator,
    supabase,
    user.id,
    body.resumeDocumentId ?? null,
    body.targetJobDescription ?? null
  );

  return toNdjsonResponse(persisted);
}
