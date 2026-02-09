import { Link, useParams } from 'react-router-dom';
import { useCities, useLeagues } from '../../../hooks/useSupabaseQuery';
import styles from './CitiesPage.module.scss';

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

    const cityLeagues = leagues?.filter((l) => l.city_id === city.id) || [];

    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <Link to="/cities" className={styles.backLink}>
            ← All Cities
          </Link>
          <h1 className={styles.title}>
            {city.name}, {city.state}
          </h1>
          <section className={styles.section}>
            <h2>Available Sports</h2>
            <div className={styles.sportsList}>
              {cityLeagues.map((league) => (
                <Link
                  key={league.id}
                  to={`/sports/${league.sports?.name?.toLowerCase()}`}
                  className={styles.sportTag}
                >
                  {league.sports?.name}
                </Link>
              ))}
              {cityLeagues.length === 0 && (
                <p className={styles.placeholder}>No sports available yet.</p>
              )}
            </div>
          </section>
          <section className={styles.section}>
            <h2>Upcoming Seasons</h2>
            <p className={styles.placeholder}>Check back soon for upcoming season information!</p>
          </section>
        </div>
      </div>
    );
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

            return (
              <Link key={city.id} to={`/cities/${slug}`} className={styles.cityCard}>
                <h3 className={styles.cityName}>{city.name}</h3>
                <span className={styles.cityState}>{city.state}</span>
                <div className={styles.citySports}>
                  {cityLeagues.slice(0, 3).map((league) => (
                    <span key={league.id} className={styles.sportBadge}>
                      {league.sports?.name}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
