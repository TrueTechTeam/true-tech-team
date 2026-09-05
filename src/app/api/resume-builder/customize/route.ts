import { type NextRequest } from 'next/server';
import { toNdjsonResponse, type AgentStreamEvent } from '@true-tech-team/agent-kit';
import { getAppUsage, recordAppUsage } from '@true-tech-team/project-gateway';
import { createClient } from '../../../../lib/supabase/server';
import { checkAppAccess, JOB_SEARCH_PERMISSION_SLUG } from '../../../../lib/auth/appAccess';
import {
  runResumeFillAgent,
  composeTargetJobDescription,
  mapDocumentRow,
  type ResumeData,
  type ResumeDocument,
} from '@true-tech-team/job-search';

const PERMISSION_SLUG = JOB_SEARCH_PERMISSION_SLUG;
const USAGE_SLUG = 'resume-builder-customize';

// Allow up to 60s for the agent to run
export const maxDuration = 60;

interface CustomizeRequestBody {
  sourceDocumentId?: string;
  jobId?: string;
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
  let body: CustomizeRequestBody;
  try {
    body = (await request.json()) as CustomizeRequestBody;
  } catch {
    return new Response('Invalid JSON body', { status: 400 });
  }

  if (!body.sourceDocumentId) {
    return new Response('sourceDocumentId is required', { status: 400 });
  }
  if (!body.jobId) {
    return new Response('jobId is required', { status: 400 });
  }

  // 4. Ownership-scoped lookups — the source resume and the job must both
  // belong to this user.
  const [{ data: sourceDoc, error: sourceError }, { data: job, error: jobError }] =
    await Promise.all([
      supabase
        .from('resume_documents')
        .select('*')
        .eq('id', body.sourceDocumentId)
        .eq('user_id', user.id)
        .maybeSingle(),
      supabase
        .from('job_search_jobs')
        .select('id, title, company, description')
        .eq('id', body.jobId)
        .eq('user_id', user.id)
        .maybeSingle(),
    ]);

  if (sourceError) {
    return new Response(sourceError.message, { status: 500 });
  }
  if (jobError) {
    return new Response(jobError.message, { status: 500 });
  }
  if (!sourceDoc) {
    return new Response('Source resume not found', { status: 404 });
  }
  if (!job) {
    return new Response('Job not found', { status: 404 });
  }

  // 5. Record usage and stream the agent response, persisting the tailored
  // result as a new resume document once it lands.
  void recordAppUsage(supabase, user.id, USAGE_SLUG);

  // Reassigned to plain consts so the narrowed (non-null) types survive
  // capture inside the withPersistence closure below.
  const userId = user.id;
  const jobId = job.id as string;
  const jobCompany = job.company as string;

  const targetJobDescription = composeTargetJobDescription(job.title, job.company, job.description);

  const generator = runResumeFillAgent(
    {
      existingDraft: sourceDoc.data as ResumeData,
      targetJobDescription,
    },
    process.env.ANTHROPIC_API_KEY ?? ''
  );

  async function* withPersistence(): AsyncGenerator<AgentStreamEvent<ResumeDocument>> {
    for await (const event of generator) {
      if (event.type === 'result') {
        const { data, error } = await supabase
          .from('resume_documents')
          .insert({
            user_id: userId,
            name: `${sourceDoc.name as string} — ${jobCompany}`,
            template_id: sourceDoc.template_id as string,
            data: event.result,
            source_document_id: sourceDoc.id as string,
            job_search_job_id: jobId,
          })
          .select()
          .single();

        if (error || !data) {
          yield { type: 'error', message: 'Failed to save tailored resume' };
          continue;
        }

        yield { type: 'result', result: mapDocumentRow(data as Record<string, unknown>) };
        continue;
      }
      yield event;
    }
  }

  return toNdjsonResponse(withPersistence());
}
