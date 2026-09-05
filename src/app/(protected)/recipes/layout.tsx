import { redirect } from 'next/navigation';
import { ProjectGate } from '@true-tech-team/project-gateway';
import { createClient } from '../../../lib/supabase/server';
import { getUserPermissions } from '../../../lib/auth/permissions';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import styles from './recipes.module.scss';

export const metadata = { title: 'Recipe AI Agent' };

const APP_SLUG = 'recipe-agent';

function AccessDeniedPanel() {
  return (
    <main className={styles.accessDenied}>
      <div className={styles.accessDeniedCard}>
        <h2>Access Required</h2>
        <p>
          You don&apos;t have access to the Recipe AI Agent yet. Ask an admin to grant you the{' '}
          <strong>Recipe Agent</strong> permission from the dashboard.
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
          You&apos;ve reached your usage limit for the Recipe AI Agent for this period. It resets
          automatically — check back later.
        </p>
      </div>
    </main>
  );
}

export default async function RecipesLayout({ children }: { children: React.ReactNode }) {
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
        accessDeniedFallback={<AccessDeniedPanel />}
        limitReachedFallback={<UsageLimitPanel />}
      >
        {children}
      </ProjectGate>
      <Footer />
    </>
  );
}
