import { Link, useParams } from 'react-router-dom';
import { useCities, useLeagues, useSeasons, useSports } from '../../../hooks/useSupabaseQuery';
import { getCityImage, getSportImage } from '../../../config/images';
import { ImageCard } from '../../../components/ImageCard/ImageCard';
import { SportIcon } from '../../../components/SportIcons';
import styles from './CitiesPage.module.scss';

function CityDetailView({
  city,
  citySlug,
}: {
  city: { id: string; name: string; state: string };
  citySlug: string;
}) {
  const { data: leagues } = useLeagues();
  const { data: seasons } = useSeasons();
  const { data: sports } = useSports();

  const cityLeagues = leagues?.filter((l) => l.city_id === city.id) || [];
  const cityLeagueIds = new Set(cityLeagues.map((l) => l.id));

  // Seasons with open registration for this city
  const openRegistrations =
    seasons?.filter((s) => s.status === 'registration' && cityLeagueIds.has(s.league_id)) || [];

  // Sport IDs that have open registrations
  const openRegSportIds = new Set(
    openRegistrations
      .map((s) => {
        const league = cityLeagues.find((l) => l.id === s.league_id);
        return league?.sport_id;
      })
      .filter(Boolean)
  );

  // Sports available in this city WITHOUT open registrations
  const availableSports = cityLeagues
    .filter((l) => !openRegSportIds.has(l.sport_id))
    .map((l) => {
      const sportSlug = l.sports?.name?.toLowerCase().replace(/\s+/g, '-') || '';
      const sport = sports?.find((s) => s.name.toLowerCase().replace(/\s+/g, '-') === sportSlug);
      return { league: l, sportSlug, sport };
    });

  return (
    <div className={styles.page} style={{ padding: 0 }}>
      {/* Hero Banner */}
      <div
        className={styles.cityHero}
        style={{ backgroundImage: `url(${getCityImage(citySlug)})` }}
      >
        <div className={styles.cityHeroOverlay}>
          <div className={styles.container} style={{ width: '100%' }}>
            <Link to="/cities" className={styles.heroBackLink}>
              &larr; All Cities
            </Link>
            <h1 className={styles.cityHeroTitle}>{city.name}</h1>
            <p className={styles.cityHeroSubtitle}>{city.state}</p>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        {/* League Commissioner */}
        <section className={styles.commissionerSection}>
          <h2 className={styles.sectionHeading}>League Commissioner</h2>
          <div className={styles.commissionerCard}>
            <div className={styles.commissionerInfo}>
              <span className={styles.commissionerName}>Marta Opsasnick</span>
              <span className={styles.commissionerRole}>League Commissioner</span>
            </div>
            <div className={styles.commissionerSocials}>
              <a
                href="mailto:Marta@HotMessSports.com"
                className={styles.socialIcon}
                aria-label="Email Marta"
                title="Marta@HotMessSports.com"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </a>
              <a
                href="https://facebook.com/hotmesssports"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialIcon}
                aria-label="Facebook"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a
                href="https://instagram.com/hotmesssports"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialIcon}
                aria-label="Instagram"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
                </svg>
              </a>
            </div>
          </div>
        </section>

        {/* Open Registrations */}
        {openRegistrations.length > 0 && (
          <section className={styles.registrationSection}>
            <h2 className={styles.sectionHeading}>Open Registration</h2>
            <div className={styles.registrationGrid}>
              {openRegistrations.map((season) => {
                const league = cityLeagues.find((l) => l.id === season.league_id);
                const sportSlug = league?.sports?.name?.toLowerCase().replace(/\s+/g, '-') || '';
                const regEnd = new Date(season.season_start_date);
                const seasonStart = new Date(season.season_start_date);

                return (
                  <Link
                    key={season.id}
                    to={`/cities/${citySlug}/${sportSlug}`}
                    className={styles.registrationCard}
                    style={{
                      backgroundImage: `url(${getSportImage(sportSlug)})`,
                    }}
                  >
                    <div className={styles.registrationCardOverlay}>
                      <span className={styles.regBadge}>Register Now</span>
                      <div className={styles.regContent}>
                        <SportIcon slug={sportSlug} size={28} className={styles.regIcon} />
                        <h3 className={styles.regTitle}>{season.name}</h3>
                        <div className={styles.regDetails}>
                          <span>
                            Starts{' '}
                            {seasonStart.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                          <span className={styles.regDot} />
                          <span>
                            Reg. closes{' '}
                            {regEnd.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Available Sports */}
        {availableSports.length > 0 && (
          <section className={styles.sportsSection}>
            <h2 className={styles.sectionHeading}>Available Sports</h2>
            <div className={styles.sportsGrid}>
              {availableSports.map(({ league, sportSlug, sport }) => (
                <ImageCard
                  key={league.id}
                  href={`/cities/${citySlug}/${sportSlug}`}
                  imageUrl={getSportImage(sportSlug)}
                  imageAlt={league.sports?.name || ''}
                  title={league.sports?.name || ''}
                  subtitle={
                    sport
                      ? `${(sport.config as Record<string, unknown>).teamSize || '?'} per team`
                      : undefined
                  }
                />
              ))}
            </div>
          </section>
        )}

        {cityLeagues.length === 0 && (
          <section className={styles.sportsSection}>
            <h2 className={styles.sectionHeading}>Available Sports</h2>
            <p className={styles.placeholder}>No sports available yet in {city.name}.</p>
          </section>
        )}

        {/* What to Expect */}
        <section className={styles.expectSection}>
          <h2 className={styles.sectionHeading}>What to Expect</h2>
          <div className={styles.expectGrid}>
            <div className={styles.expectCard}>
              <span className={styles.expectEmoji}>📅</span>
              <h3>Game Night</h3>
              <p>Weeknight games with flexible scheduling. Seasons run 8-10 weeks.</p>
            </div>
            <div className={styles.expectCard}>
              <span className={styles.expectEmoji}>👥</span>
              <h3>Join a Team</h3>
              <p>
                Sign up with friends or register as a free agent — we&apos;ll place you on a team.
              </p>
            </div>
            <div className={styles.expectCard}>
              <span className={styles.expectEmoji}>🍻</span>
              <h3>Post-Game Socials</h3>
              <p>Every game night ends at a local sponsor bar. Drink specials included.</p>
            </div>
            <div className={styles.expectCard}>
              <span className={styles.expectEmoji}>🏆</span>
              <h3>Playoffs &amp; Parties</h3>
              <p>End-of-season tournaments, championship games, and awards parties.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export function CitiesPage() {
  const { citySlug } = useParams();
  const { data: cities, loading: citiesLoading } = useCities();
  const { data: leagues } = useLeagues();

  if (citiesLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <p className={styles.placeholder}>Loading cities...</p>
        </div>
      </div>
    );
  }

  if (citySlug) {
    const city = cities?.find((c) => c.name.toLowerCase().replace(/\s+/g, '-') === citySlug);

    if (!city) {
      return (
        <div className={styles.page}>
          <div className={styles.container}>City not found</div>
        </div>
      );
    }

    return <CityDetailView city={city} citySlug={citySlug} />;
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Our Cities</h1>
        <p className={styles.subtitle}>Find Hotmess Sports leagues near you</p>
        <div className={styles.citiesGrid}>
          {cities?.map((city) => {
            const cityLeagues = leagues?.filter((l) => l.city_id === city.id) || [];
            const slug = city.name.toLowerCase().replace(/\s+/g, '-');
            const sportNames = cityLeagues
              .slice(0, 3)
              .map((l) => l.sports?.name)
              .filter(Boolean)
              .join(', ');

            return (
              <ImageCard
                key={city.id}
                href={`/cities/${slug}`}
                imageUrl={getCityImage(slug)}
                imageAlt={`${city.name}, ${city.state}`}
                title={city.name}
                subtitle={sportNames ? `${sportNames} & more` : city.state}
                badge={city.state}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
