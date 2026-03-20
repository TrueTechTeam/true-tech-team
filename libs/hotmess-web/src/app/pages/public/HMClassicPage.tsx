import { Link } from 'react-router-dom';
import { type HMClassicEvent, nextClassic, pastClassics } from '../../../mocks/data/hm-classic';
import styles from './HMClassicPage.module.scss';

function getStatusLabel(status: HMClassicEvent['status']): string {
  switch (status) {
    case 'registration-open':
      return 'Registration Open';
    case 'upcoming':
      return 'Coming Soon';
    case 'completed':
      return 'Completed';
    default:
      return status;
  }
}

export function HMClassicPage() {
  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.container}>
          <h1 className={styles.title}>The HM Classic</h1>
          <p className={styles.subtitle}>The Ultimate Kickball Tournament</p>
        </div>
      </section>

      {/* What Is It Section */}
      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>What Is The HM Classic?</h2>
          <div className={styles.aboutContent}>
            <p>
              The HM Classic is HotMess Sports&apos; flagship annual event -- a double-elimination
              kickball tournament that brings together teams from every HotMess city for one epic
              day of competition, camaraderie, and chaos.
            </p>
            <p>
              Teams battle through a bracket-style format with the goal of being crowned the
              HM Classic Champion. It&apos;s the biggest event on the HotMess calendar, featuring
              food, drinks, music, and the best kickball talent from across the country.
            </p>
            <div className={styles.formatDetails}>
              <div className={styles.formatItem}>
                <span className={styles.formatLabel}>Format</span>
                <span className={styles.formatValue}>Double Elimination</span>
              </div>
              <div className={styles.formatItem}>
                <span className={styles.formatLabel}>Sport</span>
                <span className={styles.formatValue}>Kickball</span>
              </div>
              <div className={styles.formatItem}>
                <span className={styles.formatLabel}>Frequency</span>
                <span className={styles.formatValue}>Annual</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Next Event Section */}
      {nextClassic && (
        <section className={styles.section}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Next Event</h2>
            <div className={styles.nextEventCard}>
              <div className={styles.nextEventBadge}>{getStatusLabel(nextClassic.status)}</div>
              <h3 className={styles.nextEventName}>{nextClassic.name}</h3>
              <p className={styles.nextEventDescription}>{nextClassic.description}</p>
              <div className={styles.nextEventDetails}>
                <div className={styles.detailBlock}>
                  <span className={styles.detailLabel}>Date</span>
                  <span className={styles.detailValue}>{nextClassic.date}</span>
                </div>
                <div className={styles.detailBlock}>
                  <span className={styles.detailLabel}>Location</span>
                  <span className={styles.detailValue}>{nextClassic.location}</span>
                </div>
                <div className={styles.detailBlock}>
                  <span className={styles.detailLabel}>Teams</span>
                  <span className={styles.detailValue}>
                    {nextClassic.teamsRegistered}/{nextClassic.maxTeams} registered
                  </span>
                </div>
              </div>
              <Link to="/register" className={styles.registerButton}>
                Register Your Team
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Past Highlights */}
      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Past Highlights</h2>
          <div className={styles.pastGrid}>
            {pastClassics.map((event) => (
              <div key={event.id} className={styles.pastCard}>
                <h3 className={styles.pastName}>{event.name}</h3>
                <p className={styles.pastDescription}>{event.description}</p>
                <div className={styles.pastMeta}>
                  <span className={styles.pastDate}>{event.date}</span>
                  <span className={styles.pastLocation}>{event.location}</span>
                </div>
                {event.winner && (
                  <div className={styles.winnerBadge}>
                    Champion: {event.winner}
                  </div>
                )}
                <div className={styles.pastTeams}>
                  {event.teamsRegistered} teams competed
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration CTA */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <h2>Think You&apos;ve Got What It Takes?</h2>
          <p>Assemble your squad and compete for the title of HM Classic Champion.</p>
          <Link to="/register" className={styles.ctaButton}>
            Register Now
          </Link>
        </div>
      </section>
    </div>
  );
}
