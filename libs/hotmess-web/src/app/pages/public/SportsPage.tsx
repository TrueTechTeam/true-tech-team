import { Link, useParams } from 'react-router-dom';
import { useSports } from '../../../hooks/useSupabaseQuery';
import styles from './SportsPage.module.scss';

const sportIcons: Record<string, string> = {
  Kickball: '⚽',
  Volleyball: '🏐',
  Pickleball: '🏓',
  Basketball: '🏀',
  Cornhole: '🎯',
  Bowling: '🎳',
  Softball: '🥎',
  Soccer: '⚽',
};

const sportColors: Record<string, string> = {
  Kickball: '#ef4444',
  Volleyball: '#f97316',
  Pickleball: '#22c55e',
  Basketball: '#f59e0b',
  Cornhole: '#8b5cf6',
  Bowling: '#06b6d4',
  Softball: '#ec4899',
  Soccer: '#10b981',
};

export function SportsPage() {
  const { sportSlug } = useParams();
  const { data: sports, loading } = useSports();

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <p>Loading sports...</p>
        </div>
      </div>
    );
  }

  if (sportSlug) {
    const sport = sports?.find((s) => s.name.toLowerCase() === sportSlug.toLowerCase());

    if (!sport) {
      return (
        <div className={styles.page}>
          <div className={styles.container}>Sport not found</div>
        </div>
      );
    }

    const config = sport.config as { teamSize?: number; gameDurationMinutes?: number };

    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <Link to="/sports" className={styles.backLink}>
            ← All Sports
          </Link>
          <div className={styles.sportHeader}>
            <span className={styles.sportIcon}>{sportIcons[sport.name] || '🏅'}</span>
            <h1 className={styles.title}>{sport.name}</h1>
          </div>
          <p className={styles.description}>{sport.description}</p>

          <section className={styles.section}>
            <h2>Details</h2>
            <div className={styles.details}>
              {config.teamSize && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Team Size</span>
                  <span className={styles.detailValue}>{config.teamSize} players</span>
                </div>
              )}
              {config.gameDurationMinutes && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Game Duration</span>
                  <span className={styles.detailValue}>{config.gameDurationMinutes} min</span>
                </div>
              )}
            </div>
          </section>

          <section className={styles.section}>
            <h2>Rules</h2>
            <Link to={`/rules/${sport.name.toLowerCase()}`} className={styles.rulesLink}>
              View Official Rulebook →
            </Link>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Our Sports</h1>
        <p className={styles.subtitle}>Find your perfect sport and join a league today</p>
        <div className={styles.sportsGrid}>
          {sports?.map((sport) => (
            <Link
              key={sport.id}
              to={`/sports/${sport.name.toLowerCase()}`}
              className={styles.sportCard}
              style={
                { '--sport-color': sportColors[sport.name] || '#0ea5e9' } as React.CSSProperties
              }
            >
              <span className={styles.cardIcon}>{sportIcons[sport.name] || '🏅'}</span>
              <h3 className={styles.cardName}>{sport.name}</h3>
              <p className={styles.cardDescription}>{sport.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
