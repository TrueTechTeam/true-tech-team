import { redirect } from 'next/navigation';
import { ProjectGate } from '@true-tech-team/project-gateway';
import { createClient } from '../../../lib/supabase/server';
import { getUserPermissions } from '../../../lib/auth/permissions';
import { JOB_SEARCH_PERMISSION_SLUG } from '../../../lib/auth/appAccess';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import styles from './resume-builder.module.scss';

export const metadata = { title: 'Resume Builder' };

// Resume Builder is only reachable from within Job Search and shares its
// access grant — see supabase/008_merge_resume_builder_permission.sql. The
// page itself isn't usage-limited (only the individual AI actions are, via
// their own resume-builder-{fill,critique,customize} usage slugs), so the
// ProjectGate usage check below stays on the unused 'resume-builder' slug —
// there's no app_usage_limits row for it, so it's a permanent no-op.
const PERMISSION_SLUG = JOB_SEARCH_PERMISSION_SLUG;
const USAGE_GATE_SLUG = 'resume-builder';

function AccessDeniedPanel() {
  return (
    <main className={styles.accessDenied}>
      <div className={styles.accessDeniedCard}>
        <h2>Access Required</h2>
        <p>
          You don&apos;t have access to the Resume Builder yet. Ask an admin to grant you the{' '}
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
          You&apos;ve reached your usage limit for the Resume Builder for this period. It resets
          automatically — check back later.
        </p>
      </div>
    </main>
  );
}

export default async function ResumeBuilderLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const permissions = await getUserPermissions(user.id);
  const hasAccess = permissions.isAdmin || permissions.appAccess.includes(PERMISSION_SLUG);

  return (
    <>
      <Header />
      <ProjectGate
        supabase={supabase}
        userId={user.id}
        appSlug={USAGE_GATE_SLUG}
        hasAccess={hasAccess}
        isAdmin={permissions.isAdmin}
        accessDeniedFallback={<AccessDeniedPanel />}
        limitReachedFallback={<UsageLimitPanel />}
      >
        {children}
      </ProjectGate>
      <Footer />
    </>
  );
}
