import { redirect } from 'next/navigation';
import { ProjectGate } from '@true-tech-team/project-gateway';
import { createClient } from '../../../lib/supabase/server';
import { getUserPermissions } from '../../../lib/auth/permissions';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import { JobSearchHeader, JobSearchSearchProvider } from '@true-tech-team/job-search';
import styles from './job-search.module.scss';

export const metadata = { title: 'Job Search' };

const APP_SLUG = 'job-search';

function AccessDeniedPanel() {
  return (
    <main className={styles.accessDenied}>
      <div className={styles.accessDeniedCard}>
        <h2>Access Required</h2>
        <p>
          You don&apos;t have access to Job Search yet. Ask an admin to grant you the{' '}
          <strong>Job Search</strong> permission from the dashboard.
        </p>
      </div>
    </main>
  );
}

function UsageLimitPanel() {
  return (
    <main className={styles.accessDenied}>
      <div className={styles.accessDeniedCard}>
        <h2>Usage Limit Reached</h2>
        <p>
          You&apos;ve reached your daily search limit for Job Search. It resets automatically —
          check back later.
        </p>
      </div>
    </main>
  );
}

export default async function JobSearchLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const permissions = await getUserPermissions(user.id);
  const hasAccess = permissions.isAdmin || permissions.appAccess.includes(APP_SLUG);

  return (
    <>
      <Header />
      <ProjectGate
        supabase={supabase}
        userId={user.id}
        appSlug={APP_SLUG}
        hasAccess={hasAccess}
        isAdmin={permissions.isAdmin}
        accessDeniedFallback={<AccessDeniedPanel />}
        limitReachedFallback={<UsageLimitPanel />}
      >
        <JobSearchSearchProvider>
          <JobSearchHeader />
          {children}
        </JobSearchSearchProvider>
      </ProjectGate>
      <Footer />
    </>
  );
}
