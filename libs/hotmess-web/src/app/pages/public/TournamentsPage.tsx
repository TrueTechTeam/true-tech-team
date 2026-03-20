import { ImageCard } from '../../../components/ImageCard/ImageCard';
import { getSportImage } from '../../../config/images';
import {
  type Tournament,
  upcomingTournaments,
  pastTournaments,
} from '../../../mocks/data/tournaments';
import styles from './TournamentsPage.module.scss';

function getStatusLabel(status: Tournament['status']): string {
  switch (status) {
    case 'registration-open':
      return 'Registration Open';
    case 'in-progress':
      return 'In Progress';
    case 'upcoming':
      return 'Coming Soon';
    case 'completed':
      return 'Completed';
    default:
      return status;
  }
}

function getStatusColor(status: Tournament['status']): string {
  switch (status) {
    case 'registration-open':
      return 'var(--color-success)';
    case 'in-progress':
      return 'var(--color-warning)';
    case 'upcoming':
      return 'var(--color-primary)';
    case 'completed':
      return 'var(--text-muted)';
    default:
      return 'var(--text-muted)';
  }
}

export function TournamentsPage() {
  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.container}>
          <h1 className={styles.title}>National Tournaments</h1>
          <p className={styles.subtitle}>
            Compete against teams from across all HotMess cities in our special tournament events.
          </p>
        </div>
      </section>

      {/* Upcoming Tournaments */}
      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Upcoming Tournaments</h2>
          <div className={styles.tournamentsGrid}>
            {upcomingTournaments.map((tournament) => (
              <ImageCard
                key={tournament.id}
                imageUrl={getSportImage(tournament.sportSlug)}
                imageAlt={tournament.sport}
                title={tournament.name}
                subtitle={tournament.location}
                badge={getStatusLabel(tournament.status)}
                badgeColor={getStatusColor(tournament.status)}
              >
                <div className={styles.cardDetails}>
                  <span className={styles.cardDate}>{tournament.date}</span>
                  <span className={styles.cardSport}>{tournament.sport}</span>
                  <span className={styles.cardTeams}>
                    {tournament.teamsRegistered}/{tournament.maxTeams} teams
                  </span>
                </div>
              </ImageCard>
            ))}
          </div>
          {upcomingTournaments.length === 0 && (
            <p className={styles.emptyState}>No upcoming tournaments at this time. Check back soon!</p>
          )}
        </div>
      </section>

      {/* Past Tournaments */}
      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Past Tournaments</h2>
          <div className={styles.tournamentsGrid}>
            {pastTournaments.map((tournament) => (
              <ImageCard
                key={tournament.id}
                imageUrl={getSportImage(tournament.sportSlug)}
                imageAlt={tournament.sport}
                title={tournament.name}
                subtitle={tournament.location}
                badge={getStatusLabel(tournament.status)}
                badgeColor={getStatusColor(tournament.status)}
              >
                <div className={styles.cardDetails}>
                  <span className={styles.cardDate}>{tournament.date}</span>
                  <span className={styles.cardSport}>{tournament.sport}</span>
                  <span className={styles.cardTeams}>
                    {tournament.teamsRegistered}/{tournament.maxTeams} teams
                  </span>
                </div>
              </ImageCard>
            ))}
          </div>
        </div>
      </section>

      {/* How Tournaments Work */}
      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>How Tournaments Work</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <h3>Format</h3>
              <p>
                Most tournaments use a double-elimination or round-robin format depending on the
                sport and number of teams registered.
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3>Eligibility</h3>
              <p>
                Tournaments are open to all registered HotMess Sports players. Some events may
                require a separate registration fee.
              </p>
            </div>
            <div className={styles.infoCard}>
              <h3>Prizes</h3>
              <p>
                Winners receive trophies, bragging rights, and exclusive HotMess merch. Some
                tournaments include cash prizes.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
