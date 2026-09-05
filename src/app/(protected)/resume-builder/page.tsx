import { ResumeBuilderHome, composeTargetJobDescription } from '@true-tech-team/job-search';
import styles from './resume-builder.module.scss';

export const metadata = { title: 'Resume Builder' };

interface ResumeBuilderPageProps {
  // Set when arriving from a job's "Generate Resume" action with no primary
  // resume yet (see JobSearchOverview's handleGenerateResume) — seeds the
  // target job description so the user can build their base resume with
  // this job in mind.
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function ResumeBuilderPage({ searchParams }: ResumeBuilderPageProps) {
  const params = await searchParams;
  const seedTargetJobDescription = composeTargetJobDescription(
    params.jobTitle,
    params.company,
    params.jobDescription
  );

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <ResumeBuilderHome seedTargetJobDescription={seedTargetJobDescription} />
      </div>
    </main>
  );
}
