import { Link } from 'react-router-dom';
import styles from './WelcomePage.module.scss';

export function WelcomePage() {
  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.container}>
          <h1 className={styles.heroTitle}>
            Play. Compete. <span className={styles.highlight}>Connect.</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Join the most fun recreational sports leagues in your city. From kickball to pickleball,
            we&apos;ve got a sport for everyone.
          </p>
          <div className={styles.heroCta}>
            <Link to="/cities" className={styles.primaryButton}>
              Find Your City
            </Link>
            <Link to="/about" className={styles.secondaryButton}>
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Sports Section */}
      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Our Sports</h2>
          <p className={styles.sectionSubtitle}>
            We offer a variety of recreational sports for all skill levels
          </p>
          <div className={styles.sportsGrid}>
            {sports.map((sport) => (
              <Link
                key={sport.name}
                to={`/sports/${sport.slug}`}
                className={styles.sportCard}
                style={{ '--sport-color': sport.color } as React.CSSProperties}
              >
                <span className={styles.sportIcon}>{sport.icon}</span>
                <span className={styles.sportName}>{sport.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Why Hotmess Sports?</h2>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>🏆</span>
              <h3>Organized Leagues</h3>
              <p>Professionally managed seasons with scheduled games and tournaments.</p>
            </div>
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>👥</span>
              <h3>Meet New People</h3>
              <p>Join as a free agent or bring your own team. Make friends while playing.</p>
            </div>
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>🎉</span>
              <h3>Social Events</h3>
              <p>Post-game hangouts, end-of-season parties, and more.</p>
            </div>
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>📱</span>
              <h3>Easy Scheduling</h3>
              <p>View schedules, scores, and standings right from your phone.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <h2>Ready to Play?</h2>
          <p>Find a league in your city and sign up today!</p>
          <Link to="/cities" className={styles.primaryButton}>
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
}

const sports = [
  { name: 'Kickball', slug: 'kickball', icon: '⚽', color: '#ef4444' },
  { name: 'Volleyball', slug: 'volleyball', icon: '🏐', color: '#f97316' },
  { name: 'Pickleball', slug: 'pickleball', icon: '🏓', color: '#22c55e' },
  { name: 'Basketball', slug: 'basketball', icon: '🏀', color: '#f59e0b' },
  { name: 'Cornhole', slug: 'cornhole', icon: '🎯', color: '#8b5cf6' },
  { name: 'Bowling', slug: 'bowling', icon: '🎳', color: '#06b6d4' },
];
