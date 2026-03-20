import { Link } from 'react-router-dom';
import { useCities } from '../../../hooks/useSupabaseQuery';
import { useUpcomingLeagues } from '../../../hooks/useUpcomingLeagues';
import { getCityImage, getSportImage, tournamentImages } from '../../../config/images';
import { ImageCard } from '../../../components/ImageCard/ImageCard';
import { SportIcon } from '../../../components/SportIcons';
import { upcomingTournaments } from '../../../mocks/data/tournaments';
import { UpcomingLeaguesSection } from './components/UpcomingLeaguesSection';
import styles from './WelcomePage.module.scss';

export function WelcomePage() {
  const { data: cities } = useCities();
  const { data: openSeasons } = useUpcomingLeagues();

  const featuredTournament = upcomingTournaments.find(
    (t) => t.status === 'registration-open'
  );

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
            <Link to="/register" className={styles.primaryButton}>
              Register to Play
            </Link>
            <Link to="/about" className={styles.secondaryButton}>
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* National Tournament Banner */}
      {featuredTournament && (
        <section className={styles.tournamentSection}>
          <div className={styles.container}>
            <Link to="/tournaments" className={styles.tournamentBanner}>
              <img
                src={tournamentImages['hm-winter-classic-2026'] || getSportImage(featuredTournament.sportSlug)}
                alt={featuredTournament.name}
                className={styles.tournamentImage}
              />
              <div className={styles.tournamentOverlay}>
                <span className={styles.tournamentBadge}>Registration Open</span>
                <h2 className={styles.tournamentTitle}>{featuredTournament.name}</h2>
                <p className={styles.tournamentMeta}>
                  {featuredTournament.location} &middot; {featuredTournament.date}
                </p>
                <p className={styles.tournamentDesc}>{featuredTournament.description}</p>
                <span className={styles.tournamentCta}>View Tournament &rarr;</span>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Open Registrations */}
      {openSeasons && openSeasons.length > 0 && (
        <section className={styles.section}>
          <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Open Registration</h2>
            <p className={styles.sectionSubtitle}>
              Spots are filling up fast — register now for upcoming seasons
            </p>
            <div className={styles.registrationGrid}>
              {openSeasons.slice(0, 6).map((season) => {
                const league = season.leagues;
                const sportSlug = league?.sports?.name?.toLowerCase().replace(/\s+/g, '-') || '';
                const citySlug = league?.cities?.name?.toLowerCase().replace(/\s+/g, '-') || '';
                const startDate = new Date(season.season_start_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });

                return (
                  <ImageCard
                    key={season.id}
                    href={`/cities/${citySlug}/${sportSlug}`}
                    imageUrl={getSportImage(sportSlug)}
                    imageAlt={season.name}
                    title={league?.sports?.name || ''}
                    subtitle={`${league?.cities?.name}, ${league?.cities?.state} — Starts ${startDate}`}
                    badge="Open"
                    badgeColor="#22c55e"
                  />
                );
              })}
            </div>
          </div>
        </section>
      )}

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
                <span className={styles.sportIcon}>
                  <SportIcon slug={sport.slug} size={40} />
                </span>
                <span className={styles.sportName}>{sport.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Leagues Section */}
      <UpcomingLeaguesSection />

      {/* Find Your City */}
      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Find Your City</h2>
          <p className={styles.sectionSubtitle}>
            HotMess Sports is growing — find a league near you
          </p>
          <div className={styles.citiesGrid}>
            {cities?.map((city) => {
              const slug = city.slug;
              return (
                <ImageCard
                  key={city.id}
                  href={`/cities/${slug}`}
                  imageUrl={getCityImage(slug)}
                  imageAlt={`${city.name}, ${city.state}`}
                  title={city.name}
                  subtitle={city.state}
                  badge={city.state}
                />
              );
            })}
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
          <Link to="/register" className={styles.primaryButton}>
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
}

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
