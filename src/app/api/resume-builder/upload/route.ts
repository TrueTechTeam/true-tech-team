import { type NextRequest } from 'next/server';
import { toNdjsonResponse } from '@true-tech-team/agent-kit';
import { getAppUsage, recordAppUsage } from '@true-tech-team/project-gateway';
import { createClient } from '../../../../lib/supabase/server';
import { checkAppAccess, JOB_SEARCH_PERMISSION_SLUG } from '../../../../lib/auth/appAccess';
import { extractTextFromUpload, runResumeFillAgent } from '@true-tech-team/job-search';

const PERMISSION_SLUG = JOB_SEARCH_PERMISSION_SLUG;
const USAGE_SLUG = 'resume-builder-fill';

// Allow up to 60s for the agent to run
export const maxDuration = 60;

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

  // 2b. Usage limit check (shared 1/day quota with fill/route.ts). Admins
  // are unlimited.
  const usage = await getAppUsage(supabase, user.id, USAGE_SLUG, isAdmin);
  if (!usage.allowed) {
    return new Response('Usage limit reached for this period', { status: 429 });
  }

  // 3. Parse the multipart upload
  let file: File;
  try {
    const formData = await request.formData();
    const uploaded = formData.get('file');
    if (!(uploaded instanceof File)) {
      return new Response('Missing file', { status: 400 });
    }
    file = uploaded;
  } catch {
    return new Response('Invalid form data', { status: 400 });
  }

  let extractedText: string;
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    extractedText = await extractTextFromUpload(buffer, file.type);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not read the uploaded file.';
    return new Response(message, { status: 400 });
  }

  if (!extractedText.trim()) {
    return new Response('No text could be extracted from the uploaded file', { status: 400 });
  }

  // 4. Record usage and stream the agent response
  void recordAppUsage(supabase, user.id, USAGE_SLUG);

  const generator = runResumeFillAgent(
    { uploadedText: extractedText },
    process.env.ANTHROPIC_API_KEY ?? ''
  );

  return toNdjsonResponse(generator);
}
