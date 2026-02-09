import styles from './AdminPages.module.scss';

export function DashboardPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Dashboard</h1>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>3</span>
          <span className={styles.statLabel}>Active Cities</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>6</span>
          <span className={styles.statLabel}>Sports</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>12</span>
          <span className={styles.statLabel}>Active Seasons</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>248</span>
          <span className={styles.statLabel}>Total Players</span>
        </div>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Recent Activity</h2>
        <div className={styles.activityList}>
          <div className={styles.activityItem}>
            <span className={styles.activityIcon}>📅</span>
            <div className={styles.activityContent}>
              <p>New season created: Miami Kickball Fall 2024</p>
              <span className={styles.activityTime}>2 hours ago</span>
            </div>
          </div>
          <div className={styles.activityItem}>
            <span className={styles.activityIcon}>👥</span>
            <div className={styles.activityContent}>
              <p>5 new team registrations</p>
              <span className={styles.activityTime}>5 hours ago</span>
            </div>
          </div>
          <div className={styles.activityItem}>
            <span className={styles.activityIcon}>🏆</span>
            <div className={styles.activityContent}>
              <p>Tournament bracket generated for Volleyball</p>
              <span className={styles.activityTime}>1 day ago</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
