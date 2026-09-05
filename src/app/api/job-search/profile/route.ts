import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import { mapProfileRow, type JobSearchProfilePayload } from '@true-tech-team/job-search';

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('job_search_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    profile: data ? mapProfileRow(data as Record<string, unknown>) : null,
  });
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: JobSearchProfilePayload;
  try {
    payload = (await request.json()) as JobSearchProfilePayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('job_search_profiles')
    .upsert(
      {
        user_id: user.id,
        full_name: payload.fullName ?? null,
        title: payload.title ?? null,
        phone: payload.phone ?? null,
        email: payload.email ?? null,
        location: payload.location ?? null,
        linkedin_url: payload.linkedinUrl ?? null,
        blog_url: payload.blogUrl ?? null,
        target_title: payload.targetTitle ?? null,
        industry: payload.industry ?? null,
        org_types: payload.orgTypes ?? [],
        dream_companies: payload.dreamCompanies ?? null,
        priorities: payload.priorities ?? [],
        search_location: payload.searchLocation ?? null,
        work_type: payload.workType ?? 'any',
        willing_to_relocate: payload.willingToRelocate ?? false,
        salary_min: payload.salaryMin ?? null,
        salary_max: payload.salaryMax ?? null,
        experience_level: payload.experienceLevel ?? 'mid',
        skills_focus: payload.skillsFocus ?? null,
        exciting_work: payload.excitingWork ?? null,
        ideal_workday: payload.idealWorkday ?? null,
        career_goal: payload.careerGoal ?? null,
        avoid_types: payload.avoidTypes ?? null,
        open_prompt: payload.openPrompt ?? null,
      },
      { onConflict: 'user_id' }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile: mapProfileRow(data as Record<string, unknown>) });
}
