import { Link, useParams } from 'react-router-dom';
import styles from './RulesPage.module.scss';

const sports = [
  { name: 'Kickball', slug: 'kickball', icon: '⚽' },
  { name: 'Volleyball', slug: 'volleyball', icon: '🏐' },
  { name: 'Pickleball', slug: 'pickleball', icon: '🏓' },
  { name: 'Basketball', slug: 'basketball', icon: '🏀' },
  { name: 'Cornhole', slug: 'cornhole', icon: '🎯' },
  { name: 'Bowling', slug: 'bowling', icon: '🎳' },
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
            <span className={styles.icon}>{sport.icon}</span>
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
            <Link key={sport.slug} to={`/rules/${sport.slug}`} className={styles.ruleCard}>
              <span className={styles.cardIcon}>{sport.icon}</span>
              <span className={styles.cardName}>{sport.name}</span>
              <span className={styles.cardAction}>View Rules →</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
