import { redirect } from 'next/navigation';
import { createClient } from '../../../lib/supabase/server';
import { getUserPermissions, getProfile } from '../../../lib/auth/permissions';
import AdminPanel from './AdminPanel';
import MembershipBadges from './MembershipBadges';
import OpenAppButton from './OpenAppButton';
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
            <MembershipBadges isAdmin={permissions.isAdmin} />
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

            {/* Recipe Agent — shown if admin or explicitly granted */}
            {(permissions.isAdmin || permissions.appAccess.includes('recipe-agent')) && (
              <div className={styles.card}>
                <h2>Recipe AI Agent</h2>
                <p>
                  Search for recipes with AI — filters by your dietary profile, saves favorites, and
                  tracks what you&apos;ve tried.
                </p>
                <OpenAppButton href="/recipes" />
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
