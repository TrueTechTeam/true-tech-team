import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import { mapJobRow } from '@true-tech-team/job-search';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const workType = searchParams.get('workType');
  const minMatchScore = searchParams.get('minMatchScore');

  let query = supabase.from('job_search_jobs').select('*').eq('user_id', user.id);

  if (status === 'suggested' || status === 'applied' || status === 'dismissed') {
    query = query.eq('status', status);
  }
  if (workType) {
    query = query.eq('work_type', workType);
  }
  if (minMatchScore) {
    const score = parseInt(minMatchScore, 10);
    if (!isNaN(score)) {
      query = query.gte('match_score', score);
    }
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const jobs = (data ?? []).map((row) => mapJobRow(row as Record<string, unknown>));

  // Not a column on job_search_jobs — one extra bulk lookup (not N+1) against
  // resume_documents to tell the table which jobs already have a tailored
  // resume, so it can offer "View Generated Resume" instead of "Generate
  // Resume".
  const jobIds = jobs.map((j) => j.id);
  if (jobIds.length > 0) {
    const { data: tailoredDocs } = await supabase
      .from('resume_documents')
      .select('id, job_search_job_id')
      .in('job_search_job_id', jobIds);

    const tailoredByJobId = new Map(
      (tailoredDocs ?? []).map((d) => [d.job_search_job_id as string, d.id as string])
    );
    for (const job of jobs) {
      job.tailoredResumeId = tailoredByJobId.get(job.id) ?? null;
    }
  }

  return NextResponse.json({ jobs });
}
