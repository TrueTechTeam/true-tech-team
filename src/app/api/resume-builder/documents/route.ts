import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import { mapDocumentRow, type CreateDocumentPayload } from '@true-tech-team/job-search';

// Each user has at most one primary resume (source_document_id IS NULL —
// see supabase/009_resume_builder_single_primary.sql). Tailored per-job
// copies (source_document_id set) are read individually by id via
// documents/[id]/route.ts instead, not listed here.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('resume_documents')
    .select('*')
    .eq('user_id', user.id)
    .is('source_document_id', null)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    document: data ? mapDocumentRow(data as Record<string, unknown>) : null,
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

  let payload: CreateDocumentPayload;
  try {
    payload = (await request.json()) as CreateDocumentPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!payload.name?.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }
  if (!payload.templateId?.trim()) {
    return NextResponse.json({ error: 'templateId is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('resume_documents')
    .insert({
      user_id: user.id,
      name: payload.name.trim(),
      template_id: payload.templateId.trim(),
      data: payload.data ?? {},
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { document: mapDocumentRow(data as Record<string, unknown>) },
    { status: 201 }
  );
}
