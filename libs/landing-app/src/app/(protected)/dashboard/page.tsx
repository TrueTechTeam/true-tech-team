'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { Badge } from '@true-tech-team/ui-components';
import styles from './dashboard.module.scss';

export default function DashboardPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login');
    },
  });

  if (status === 'loading') {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.welcome}>
            <h1>Welcome, {session?.user?.name}!</h1>
            <Badge variant="success">Logged In</Badge>
          </div>

          <div className={styles.content}>
            <div className={styles.card}>
              <h2>Your Dashboard</h2>
              <p>This is a protected page that requires authentication.</p>
              <p className={styles.info}>
                You are currently logged in as <strong>{session?.user?.email}</strong>
              </p>
            </div>

            <div className={styles.card}>
              <h2>What's Next?</h2>
              <ul className={styles.list}>
                <li>Explore our UI Components Library via Storybook</li>
                <li>Check out the projects showcase on the home page</li>
                <li>Discover the features and capabilities of our stack</li>
                <li>Connect with the team</li>
              </ul>
            </div>

            <div className={styles.card}>
              <h2>Placeholder for Future Features</h2>
              <p>This dashboard will be extended with more features in the future, such as:</p>
              <ul className={styles.list}>
                <li>User profile management</li>
                <li>Project tracking and analytics</li>
                <li>Team collaboration tools</li>
                <li>Notifications and updates</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

