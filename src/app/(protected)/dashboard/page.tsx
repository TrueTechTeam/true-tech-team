import { redirect } from 'next/navigation';
import { createClient } from '../../../lib/supabase/server';
import { getUserPermissions, getProfile } from '../../../lib/auth/permissions';
import { APPS } from '../../../lib/apps/registry';
import MembershipBadges from './MembershipBadges';
import OpenAppButton from './OpenAppButton';
import { AppIcon } from '@true-tech-team/dashboard-kit';
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
            {APPS.map((app) => {
              // Real mini-apps (with a route) are also open to admins; the
              // placeholder flags (analytics/internal-tools/beta-features)
              // have no page yet and are only shown once explicitly granted.
              const hasAccess = app.href
                ? permissions.isAdmin || permissions.appAccess.includes(app.slug)
                : permissions.appAccess.includes(app.slug);

              if (!hasAccess) {
                return null;
              }

              return (
                <div key={app.slug} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <AppIcon icon={app.icon} accent={app.accent} />
                    <h2>{app.label}</h2>
                  </div>
                  <p>{app.description}</p>
                  {app.href && <OpenAppButton href={app.href} />}
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
