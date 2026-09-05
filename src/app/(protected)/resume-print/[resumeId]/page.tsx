import { notFound } from 'next/navigation';
import { createClient } from '../../../../lib/supabase/server';
import { mapDocumentRow, getTemplateById } from '@true-tech-team/job-search';
import ResumePreviewFrame from './ResumePreviewFrame';
import styles from '../print.module.scss';

export const metadata = { title: 'Print Resume' };

interface ResumePrintPageProps {
  params: Promise<{ resumeId: string }>;
}

export default async function ResumePrintPage({ params }: ResumePrintPageProps) {
  const { resumeId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The layout already redirects unauthenticated users to /login, but keep
  // this guard so a missing user can never fall through to the query below.
  if (!user) {
    notFound();
  }

  const { data, error } = await supabase
    .from('resume_documents')
    .select('*')
    .eq('id', resumeId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const document = mapDocumentRow(data as Record<string, unknown>);
  const template = getTemplateById(document.templateId);

  if (!template) {
    notFound();
  }

  const TemplateComponent = template.component;
  const fileName = `${document.data.profile.name || 'Resume'}.pdf`;

  return (
    <div className={styles.printPage}>
      <ResumePreviewFrame fileName={fileName}>
        <TemplateComponent data={document.data} />
      </ResumePreviewFrame>
    </div>
  );
}
