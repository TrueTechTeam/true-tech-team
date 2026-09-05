import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../../../lib/supabase/server';
import { mapApplicationRow, type UpdateApplicationPayload } from '@true-tech-team/job-search';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('job_search_applications')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ application: mapApplicationRow(data as Record<string, unknown>) });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: UpdateApplicationPayload;
  try {
    payload = (await request.json()) as UpdateApplicationPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Build update object — only include fields that were provided
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const update: Record<string, any> = {};
  if ('status' in payload) {
    update['status'] = payload.status;
  }
  if ('appliedDate' in payload) {
    update['applied_date'] = payload.appliedDate;
  }
  if ('confirmationLink' in payload) {
    update['confirmation_link'] = payload.confirmationLink;
  }
  if ('contactPerson' in payload) {
    update['contact_person'] = payload.contactPerson;
  }
  if ('salary' in payload) {
    update['salary'] = payload.salary;
  }
  if ('interviewDate' in payload) {
    update['interview_date'] = payload.interviewDate;
  }
  if ('notes' in payload) {
    update['notes'] = payload.notes;
  }
  if ('removed' in payload) {
    update['removed'] = payload.removed;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('job_search_applications')
    .update(update)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ application: mapApplicationRow(data as Record<string, unknown>) });
}
