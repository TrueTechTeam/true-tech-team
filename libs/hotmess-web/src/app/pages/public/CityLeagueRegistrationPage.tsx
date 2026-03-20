import { Link, useParams } from 'react-router-dom';
import { useCities, useSports, useSeasons, useLeagues } from '../../../hooks/useSupabaseQuery';
import { getSportImage, getCityImage } from '../../../config/images';
import { SportIcon } from '../../../components/SportIcons';
import styles from './CityLeagueRegistrationPage.module.scss';

export function CityLeagueRegistrationPage() {
  const { citySlug, sportSlug } = useParams();
  const { data: cities } = useCities();
  const { data: sports } = useSports();
  const { data: leagues } = useLeagues();
  const { data: seasons } = useSeasons();

  const city = cities?.find(
    (c) => c.slug === citySlug || c.name.toLowerCase().replace(/\s+/g, '-') === citySlug
  );
  const sport = sports?.find(
    (s) => s.name.toLowerCase().replace(/\s+/g, '-') === sportSlug
  );

  if (!city || !sport) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <p className={styles.notFound}>
            {!city ? 'City' : 'Sport'} not found.{' '}
            <Link to="/cities" className={styles.link}>Browse all cities</Link>
          </p>
        </div>
      </div>
    );
  }

  const league = leagues?.find(
    (l) => l.city_id === city.id && l.sports?.name === sport.name
  );

  const leagueSeasons = league
    ? seasons?.filter((s) => s.league_id === league.id) || []
    : [];

  const openSeason = leagueSeasons.find((s) => s.status === 'registration');
  const config = sport.config as Record<string, unknown>;

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero} style={{ backgroundImage: `url(${getSportImage(sportSlug || '')})` }}>
        <div className={styles.heroOverlay}>
          <div className={styles.container}>
            <nav className={styles.breadcrumbs}>
              <Link to="/" className={styles.crumb}>Home</Link>
              <span className={styles.separator}>/</span>
              <Link to="/cities" className={styles.crumb}>Cities</Link>
              <span className={styles.separator}>/</span>
              <Link to={`/cities/${citySlug}`} className={styles.crumb}>{city.name}</Link>
              <span className={styles.separator}>/</span>
              <span className={styles.crumbCurrent}>{sport.name}</span>
            </nav>
            <div className={styles.heroContent}>
              <SportIcon slug={sportSlug || ''} size={48} className={styles.heroIcon} />
              <div>
                <h1 className={styles.heroTitle}>{sport.name}</h1>
                <p className={styles.heroLocation}>{city.name}, {city.state}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.contentGrid}>
          {/* Main Content */}
          <div className={styles.main}>
            {/* Open Season Card */}
            {openSeason ? (
              <div className={styles.seasonCard}>
                <div className={styles.seasonHeader}>
                  <span className={styles.badgeOpen}>Registration Open</span>
                  <h2 className={styles.seasonName}>{openSeason.name}</h2>
                </div>
                <div className={styles.seasonDetails}>
                  <div className={styles.seasonDetail}>
                    <span className={styles.detailLabel}>Season Starts</span>
                    <span className={styles.detailValue}>
                      {new Date(openSeason.season_start_date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className={styles.seasonDetail}>
                    <span className={styles.detailLabel}>Season Ends</span>
                    <span className={styles.detailValue}>
                      {new Date(openSeason.season_end_date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className={styles.seasonDetail}>
                    <span className={styles.detailLabel}>Cost</span>
                    <span className={styles.detailValue}>$50 - $75 per player</span>
                  </div>
                </div>
                <a
                  href="https://hotmesssports.sportngin.com/registertoplay"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.registerButton}
                >
                  Register Now
                </a>
              </div>
            ) : (
              <div className={styles.seasonCard}>
                <h2 className={styles.seasonName}>No Open Registration</h2>
                <p className={styles.placeholder}>
                  Registration for {sport.name} in {city.name} is not currently open.
                  Check back soon or browse other leagues.
                </p>
                <Link to="/register" className={styles.registerButton}>
                  Browse All Registrations
                </Link>
              </div>
            )}

            {/* What to Expect */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>What to Expect</h2>
              <div className={styles.expectGrid}>
                <div className={styles.expectCard}>
                  <span className={styles.expectIcon}>📅</span>
                  <h3>Game Day</h3>
                  <p>Games are played weekly on weeknight evenings. Each game lasts about {(config.gameDurationMinutes as number) || 50} minutes.</p>
                </div>
                <div className={styles.expectCard}>
                  <span className={styles.expectIcon}>👥</span>
                  <h3>Teams</h3>
                  <p>Teams have {(config.teamSize as number) || 8} players. Join with friends or sign up as a free agent — we&apos;ll find you a team!</p>
                </div>
                <div className={styles.expectCard}>
                  <span className={styles.expectIcon}>🍻</span>
                  <h3>Social Scene</h3>
                  <p>Post-game hangouts at local sponsor bars. End-of-season tournaments and parties included.</p>
                </div>
                <div className={styles.expectCard}>
                  <span className={styles.expectIcon}>🏆</span>
                  <h3>Season Format</h3>
                  <p>8-10 week regular season followed by a single-elimination playoff tournament. All skill levels welcome.</p>
                </div>
              </div>
            </section>

            {/* About the Sport */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>About {sport.name}</h2>
              <p className={styles.description}>{sport.description}</p>
              <Link to={`/rules/${sportSlug}`} className={styles.link}>
                View Official Rules &rarr;
              </Link>
            </section>
          </div>

          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarCard}>
              <img
                src={getCityImage(citySlug || '')}
                alt={city.name}
                className={styles.sidebarImage}
              />
              <h3>{city.name}, {city.state}</h3>
              <Link to={`/cities/${citySlug}`} className={styles.link}>
                View all sports in {city.name} &rarr;
              </Link>
            </div>

            <div className={styles.sidebarCard}>
              <h3>Quick Facts</h3>
              <ul className={styles.factsList}>
                <li><strong>Team Size:</strong> {config.teamSize as number || 'Varies'} players</li>
                <li><strong>Game Length:</strong> {config.gameDurationMinutes as number || 50} min</li>
                <li><strong>Cost:</strong> $50 - $75 / season</li>
                <li><strong>Skill Level:</strong> All levels</li>
                <li><strong>Free Agents:</strong> Welcome!</li>
              </ul>
            </div>

            <div className={styles.sidebarCard}>
              <h3>Questions?</h3>
              <p className={styles.contactText}>
                Email us at{' '}
                <a href="mailto:grant@hotmesssports.com" className={styles.link}>
                  grant@hotmesssports.com
                </a>
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
