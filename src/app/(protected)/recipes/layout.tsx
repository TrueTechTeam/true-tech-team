import { redirect } from 'next/navigation';
import { createClient } from '../../../lib/supabase/server';
import { getUserPermissions } from '../../../lib/auth/permissions';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import styles from './recipes.module.scss';

export const metadata = { title: 'Recipe AI Agent' };

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

export default async function RecipesLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const permissions = await getUserPermissions(user.id);
  const hasAccess = permissions.isAdmin || permissions.appAccess.includes('recipe-agent');

  return (
    <>
      <Header />
      {hasAccess ? children : <AccessDeniedPanel />}
      <Footer />
    </>
  );
}
