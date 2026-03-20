import { Link, useParams } from 'react-router-dom';
import { SportIcon } from '../../../components/SportIcons';
import styles from './RulesPage.module.scss';

const sports = [
  { name: 'Kickball', slug: 'kickball', color: '#ef4444' },
  { name: 'Dodgeball', slug: 'dodgeball', color: '#f43f5e' },
  { name: 'Bowling', slug: 'bowling', color: '#06b6d4' },
  { name: 'Indoor Volleyball', slug: 'indoor-volleyball', color: '#f97316' },
  { name: 'Sand Volleyball', slug: 'sand-volleyball', color: '#eab308' },
  { name: 'Grass Volleyball', slug: 'grass-volleyball', color: '#84cc16' },
  { name: 'Cornhole', slug: 'cornhole', color: '#8b5cf6' },
  { name: 'Pickleball', slug: 'pickleball', color: '#22c55e' },
  { name: 'Basketball', slug: 'basketball', color: '#f59e0b' },
  { name: 'Flag Football', slug: 'flag-football', color: '#3b82f6' },
  { name: 'Tennis', slug: 'tennis', color: '#14b8a6' },
  { name: 'Beer Pong', slug: 'beer-pong', color: '#dc2626' },
];

export function RulesPage() {
  const { sportSlug } = useParams();

  if (sportSlug) {
    const sport = sports.find((s) => s.slug === sportSlug);
    if (!sport) {
      return <div className={styles.page}>Sport not found</div>;
    }

    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <Link to="/rules" className={styles.backLink}>
            ← All Rulebooks
          </Link>
          <div className={styles.header}>
            <span className={styles.icon}>
              <SportIcon slug={sport.slug} size={48} />
            </span>
            <h1 className={styles.title}>{sport.name} Rules</h1>
          </div>

          <div className={styles.rulebookContainer}>
            <p className={styles.placeholder}>
              The official rulebook for {sport.name} will be displayed here.
            </p>
            <button className={styles.downloadButton}>Download PDF Rulebook</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Rulebooks</h1>
        <p className={styles.subtitle}>Official rules for all Hotmess Sports leagues</p>
        <div className={styles.rulesGrid}>
          {sports.map((sport) => (
            <Link
              key={sport.slug}
              to={`/rules/${sport.slug}`}
              className={styles.ruleCard}
              style={{ '--sport-color': sport.color } as React.CSSProperties}
            >
              <span className={styles.cardIcon}>
                <SportIcon slug={sport.slug} size={40} />
              </span>
              <span className={styles.cardName}>{sport.name}</span>
              <span className={styles.cardAction}>View Rules →</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
