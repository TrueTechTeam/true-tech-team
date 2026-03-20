import {
  type CharityEvent,
  upcomingCharityEvents,
  pastCharityEvents,
} from '../../../mocks/data/charity-events';
import styles from './CharityEventsPage.module.scss';

const impactStats = [
  { label: 'Events', value: '10+' },
  { label: 'Raised', value: '$5,000+' },
  { label: 'Participants', value: '500+' },
];

function getStatusLabel(status: CharityEvent['status']): string {
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

function getStatusColor(status: CharityEvent['status']): string {
  switch (status) {
    case 'registration-open':
      return styles.statusOpen;
    case 'upcoming':
      return styles.statusUpcoming;
    case 'completed':
      return styles.statusCompleted;
    default:
      return '';
  }
}

export function CharityEventsPage() {
  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.container}>
          <h1 className={styles.title}>Charity Events</h1>
          <p className={styles.subtitle}>Giving Back Through Sports</p>
        </div>
      </section>

      {/* Impact Stats */}
      <section className={styles.statsSection}>
        <div className={styles.container}>
          <div className={styles.statsRow}>
            {impactStats.map((stat) => (
              <div key={stat.label} className={styles.statItem}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Upcoming Events</h2>
          <div className={styles.eventsGrid}>
            {upcomingCharityEvents.map((event) => (
              <div key={event.id} className={styles.eventCard}>
                <div className={styles.eventHeader}>
                  <span className={`${styles.statusBadge} ${getStatusColor(event.status)}`}>
                    {getStatusLabel(event.status)}
                  </span>
                </div>
                <h3 className={styles.eventName}>{event.name}</h3>
                <p className={styles.eventDescription}>{event.description}</p>
                <div className={styles.eventMeta}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Date</span>
                    <span className={styles.metaValue}>{event.date}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Location</span>
                    <span className={styles.metaValue}>{event.location}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Beneficiary</span>
                    <span className={styles.metaValue}>{event.beneficiary}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {upcomingCharityEvents.length === 0 && (
            <p className={styles.emptyState}>
              No upcoming charity events at this time. Check back soon!
            </p>
          )}
        </div>
      </section>

      {/* Past Events */}
      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Past Events</h2>
          <div className={styles.eventsGrid}>
            {pastCharityEvents.map((event) => (
              <div key={event.id} className={styles.eventCard}>
                <div className={styles.eventHeader}>
                  <span className={`${styles.statusBadge} ${getStatusColor(event.status)}`}>
                    {getStatusLabel(event.status)}
                  </span>
                </div>
                <h3 className={styles.eventName}>{event.name}</h3>
                <p className={styles.eventDescription}>{event.description}</p>
                <div className={styles.eventMeta}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Date</span>
                    <span className={styles.metaValue}>{event.date}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Location</span>
                    <span className={styles.metaValue}>{event.location}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Beneficiary</span>
                    <span className={styles.metaValue}>{event.beneficiary}</span>
                  </div>
                </div>
                {(event.raised || event.participants) && (
                  <div className={styles.eventResults}>
                    {event.raised && (
                      <span className={styles.resultBadge}>
                        ${event.raised.toLocaleString()} raised
                      </span>
                    )}
                    {event.participants && (
                      <span className={styles.resultBadge}>
                        {event.participants} participants
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Get Involved CTA */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <h2>Get Involved</h2>
          <p>There are many ways to support our charity initiatives.</p>
          <div className={styles.ctaGrid}>
            <div className={styles.ctaCard}>
              <h3>Volunteer</h3>
              <p>Help run events and make a difference in your community.</p>
            </div>
            <div className={styles.ctaCard}>
              <h3>Sponsor</h3>
              <p>Partner with us to support local causes and get your brand seen.</p>
            </div>
            <div className={styles.ctaCard}>
              <h3>Organize</h3>
              <p>Have a cause in mind? Let us help you plan a charity sports event.</p>
            </div>
          </div>
          <a href="mailto:charity@hotmesssports.com" className={styles.ctaButton}>
            Contact Us: charity@hotmesssports.com
          </a>
        </div>
      </section>
    </div>
  );
}
