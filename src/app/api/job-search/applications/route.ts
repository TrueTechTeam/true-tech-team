import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import { mapApplicationRow, type CreateApplicationPayload } from '@true-tech-team/job-search';

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
  const includeRemoved = searchParams.get('includeRemoved') === 'true';

  let query = supabase.from('job_search_applications').select('*').eq('user_id', user.id);

  if (!includeRemoved) {
    query = query.eq('removed', false);
  }
  if (
    status === 'applied' ||
    status === 'phone_screen' ||
    status === 'interview' ||
    status === 'offer' ||
    status === 'rejected' ||
    status === 'withdrawn'
  ) {
    query = query.eq('status', status);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    applications: (data ?? []).map((row) => mapApplicationRow(row as Record<string, unknown>)),
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: CreateApplicationPayload;
  try {
    payload = (await request.json()) as CreateApplicationPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!payload.jobId) {
    return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
  }

  // Ownership check — the job must belong to this user before we let them
  // create an application against it.
  const { data: jobRow, error: jobError } = await supabase
    .from('job_search_jobs')
    .select('id')
    .eq('id', payload.jobId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (jobError) {
    return NextResponse.json({ error: jobError.message }, { status: 500 });
  }
  if (!jobRow) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  const { data, error } = await supabase
    .from('job_search_applications')
    .insert({
      user_id: user.id,
      job_id: payload.jobId,
      applied_date: payload.appliedDate ?? null,
      confirmation_link: payload.confirmationLink ?? null,
      contact_person: payload.contactPerson ?? null,
      salary: payload.salary ?? null,
      notes: payload.notes ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Flip the linked job's status to 'applied' now that an application exists.
  await supabase
    .from('job_search_jobs')
    .update({ status: 'applied' })
    .eq('id', payload.jobId)
    .eq('user_id', user.id);

  return NextResponse.json(
    { application: mapApplicationRow(data as Record<string, unknown>) },
    { status: 201 }
  );
}
