import { redirect } from 'next/navigation';
import { Badge } from '@true-tech-team/ui-components';
import { createClient } from '../../../lib/supabase/server';
import { getUserPermissions, getProfile } from '../../../lib/auth/permissions';
import AdminPanel from './AdminPanel';
import styles from './dashboard.module.scss';
import Footer from '../../../components/layout/Footer';
import Header from '../../../components/layout/Header';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const [permissions, profile] = await Promise.all([
    getUserPermissions(user.id),
    getProfile(user.id),
  ]);

  const displayName =
    profile?.firstName || profile?.lastName
      ? `${profile.firstName} ${profile.lastName}`.trim()
      : (user.email ?? 'User');

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.welcome}>
            <h1>Welcome, {displayName}!</h1>
            <Badge variant="success">Member</Badge>
            {permissions.isAdmin && <Badge variant="warning">Admin</Badge>}
          </div>

          <div className={styles.content}>
            {/* Open tools — available to all authenticated users */}
            <div className={styles.card}>
              <h2>Tools &amp; Services</h2>
              <p>Available to all members.</p>
              <ul className={styles.list}>
                <li>UI Components Library (Storybook)</li>
                <li>Project showcase</li>
                <li>Team directory</li>
              </ul>
            </div>

            {/* Restricted tools — shown only if the user has been granted access */}
            {permissions.appAccess.includes('analytics') && (
              <div className={styles.card}>
                <h2>Analytics</h2>
                <p>Project analytics and usage metrics.</p>
              </div>
            )}

            {permissions.appAccess.includes('internal-tools') && (
              <div className={styles.card}>
                <h2>Internal Tools</h2>
                <p>Internal team tooling and utilities.</p>
              </div>
            )}

            {permissions.appAccess.includes('beta-features') && (
              <div className={styles.card}>
                <h2>Beta Features</h2>
                <p>Early access to features in development.</p>
              </div>
            )}

            {/* Admin panel — manage users and access grants */}
            {permissions.isAdmin && <AdminPanel currentUserId={user.id} />}

            <div className={styles.card}>
              <h2>Account</h2>
              <p className={styles.info}>
                Signed in as <strong>{user.email}</strong>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
