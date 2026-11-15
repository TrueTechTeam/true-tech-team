import { redirect } from 'next/navigation';
import { ProjectGate } from '@true-tech-team/project-gateway';
import { createClient } from '../../../lib/supabase/server';
import { getUserPermissions } from '../../../lib/auth/permissions';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import styles from './portfolio-builder.module.scss';

export const metadata = { title: 'Portfolio Builder' };

const APP_SLUG = 'portfolio-builder';

function AccessDeniedPanel() {
  return (
    <main className={styles.accessDenied}>
      <div className={styles.accessDeniedCard}>
        <h2>Access Required</h2>
        <p>
          You don&apos;t have access to Portfolio Builder yet. Ask an admin to grant you the{' '}
          <strong>Portfolio Builder</strong> permission from the dashboard.
        </p>
      </div>
    </main>
  );
}

export default async function PortfolioBuilderLayout({ children }: { children: React.ReactNode }) {
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
      >
        {children}
      </ProjectGate>
      <Footer />
    </>
  );
}
