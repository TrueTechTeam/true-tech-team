import { Link } from 'react-router-dom';
import { useUpcomingLeagues } from '../../../../hooks/useUpcomingLeagues';
import styles from './UpcomingLeaguesSection.module.scss';

export function UpcomingLeaguesSection() {
  const { data: seasons, loading } = useUpcomingLeagues();

  if (loading || !seasons || seasons.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>Upcoming Leagues</h2>
        <p className={styles.sectionSubtitle}>
          Registration is open! Secure your spot before it fills up.
        </p>
        <div className={styles.grid}>
          {seasons.slice(0, 6).map((season) => {
            const league = season.leagues;
            const startDate = new Date(season.season_start_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div key={season.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.badge}>
                    {season.status === 'registration' ? 'Registration Open' : 'Coming Soon'}
                  </span>
                </div>
                <h3 className={styles.cardTitle}>{season.name}</h3>
                <div className={styles.cardDetails}>
                  {league && (
                    <>
                      <span className={styles.detail}>
                        {league.cities?.name}, {league.cities?.state}
                      </span>
                      <span className={styles.detail}>{league.sports?.name}</span>
                    </>
                  )}
                  <span className={styles.detail}>Starts {startDate}</span>
                </div>
                <Link to="/register" className={styles.cardCta}>
                  Register Now &rarr;
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
