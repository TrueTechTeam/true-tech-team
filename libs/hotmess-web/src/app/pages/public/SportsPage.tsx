import { Link, useParams } from 'react-router-dom';
import { useSports } from '../../../hooks/useSupabaseQuery';
import { getSportImage } from '../../../config/images';
import { ImageCard } from '../../../components/ImageCard/ImageCard';
import { SportIcon } from '../../../components/SportIcons';
import styles from './SportsPage.module.scss';

const sportColors: Record<string, string> = {
  Kickball: '#ef4444',
  Dodgeball: '#f43f5e',
  Bowling: '#06b6d4',
  'Indoor Volleyball': '#f97316',
  'Sand Volleyball': '#eab308',
  'Grass Volleyball': '#84cc16',
  Cornhole: '#8b5cf6',
  Pickleball: '#22c55e',
  Basketball: '#f59e0b',
  'Flag Football': '#3b82f6',
  Tennis: '#14b8a6',
  'Beer Pong': '#dc2626',
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
    const sport = sports?.find(
      (s) => s.name.toLowerCase().replace(/\s+/g, '-') === sportSlug.toLowerCase()
    );

    if (!sport) {
      return (
        <div className={styles.page}>
          <div className={styles.container}>Sport not found</div>
        </div>
      );
    }

    const config = sport.config as { teamSize?: number; gameDurationMinutes?: number };
    const slug = sport.name.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <Link to="/sports" className={styles.backLink}>
            &larr; All Sports
          </Link>
          <div className={styles.sportHeader}>
            <span className={styles.sportIcon}>
              <SportIcon slug={slug} size={48} />
            </span>
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
            <Link to={`/rules/${slug}`} className={styles.rulesLink}>
              View Official Rulebook &rarr;
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
          {sports?.map((sport) => {
            const slug = sport.name.toLowerCase().replace(/\s+/g, '-');
            return (
              <ImageCard
                key={sport.id}
                href={`/sports/${slug}`}
                imageUrl={getSportImage(slug)}
                imageAlt={sport.name}
                title={sport.name}
                subtitle={sport.description}
                badgeColor={sportColors[sport.name]}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
