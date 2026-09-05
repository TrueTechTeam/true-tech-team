import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getAppUsage, recordAppUsage } from '@true-tech-team/project-gateway';
import { toNdjsonResponse } from '@true-tech-team/agent-kit';
import { createClient } from '../../../../lib/supabase/server';
import { checkAppAccess, JOB_SEARCH_PERMISSION_SLUG } from '../../../../lib/auth/appAccess';
import {
  runJobSearchAgent,
  mapProfileRow,
  type JobSearchAgentStreamEvent,
} from '@true-tech-team/job-search';

const APP_SLUG = JOB_SEARCH_PERMISSION_SLUG;

// Allow up to 60s for the agent to run
export const maxDuration = 60;

// Consumes the raw agent-kit generator and, on the `result` event, bulk
// inserts the returned jobs into job_search_jobs before re-yielding the
// event unchanged so the client still receives the full job list.
async function* insertJobsOnResult(
  generator: AsyncGenerator<JobSearchAgentStreamEvent>,
  supabase: SupabaseClient,
  userId: string,
  excludeUrls: string[]
): AsyncGenerator<JobSearchAgentStreamEvent> {
  const excludeSet = new Set(excludeUrls);

  for await (const event of generator) {
    if (event.type === 'result') {
      // Defense in depth — the prompt already asked the agent to exclude
      // these URLs, but dedupe again before writing to the database.
      const jobsToInsert = event.result.jobs.filter(
        (job) => !job.applicationUrl || !excludeSet.has(job.applicationUrl)
      );

      if (jobsToInsert.length > 0) {
        await supabase.from('job_search_jobs').insert(
          jobsToInsert.map((job) => ({
            user_id: userId,
            status: 'suggested',
            title: job.title,
            company: job.company,
            company_website: job.companyWebsite,
            application_url: job.applicationUrl,
            description: job.description,
            location: job.location,
            work_type: job.workType,
            salary: job.salary,
            match_score: job.matchScore,
            match_reason: job.matchReason,
            posted_date: job.postedDate,
          }))
        );
      }
    }

    yield event;
  }
}

export async function POST() {
  // 1. Auth check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // 2. Permission check — admin bypasses explicit grant
  const { isAdmin, hasAccess } = await checkAppAccess(supabase, user.id, APP_SLUG);
  if (!hasAccess) {
    return new Response('Forbidden', { status: 403 });
  }

  // 2b. Usage limit check — admins are unlimited
  const usage = await getAppUsage(supabase, user.id, APP_SLUG, isAdmin);
  if (!usage.allowed) {
    return new Response('Usage limit reached for this period', { status: 429 });
  }

  // 3. Load the job search profile — required, the agent has nothing to
  // search against without it.
  const { data: profileRow } = await supabase
    .from('job_search_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!profileRow) {
    return NextResponse.json(
      { error: 'No job search profile found. Fill out Settings before running a search.' },
      { status: 404 }
    );
  }

  const profile = mapProfileRow(profileRow as Record<string, unknown>);

  // 4. Load already-seen application URLs so the agent (and our own
  // insert step) can dedupe against them.
  const { data: existingJobs } = await supabase
    .from('job_search_jobs')
    .select('application_url')
    .eq('user_id', user.id)
    .not('application_url', 'is', null);

  const excludeUrls = (existingJobs ?? [])
    .map((row) => row['application_url'] as string | null)
    .filter((url): url is string => Boolean(url));

  // 5. Record usage (fire and forget) right before streaming
  void recordAppUsage(supabase, user.id, APP_SLUG);

  // 6. Stream the agent response, inserting suggested jobs as they come in
  const generator = insertJobsOnResult(
    runJobSearchAgent(profile, excludeUrls, process.env.ANTHROPIC_API_KEY ?? ''),
    supabase,
    user.id,
    excludeUrls
  );

  return toNdjsonResponse(generator);
}
