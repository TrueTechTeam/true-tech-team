import styles from './StartLeaguePage.module.scss';

const benefits = [
  {
    icon: '\u2705',
    title: 'Proven Model',
    description: 'Join a tested franchise system with support at every step.',
  },
  {
    icon: '\uD83D\uDEE0\uFE0F',
    title: 'Full Support',
    description: 'Marketing materials, operational playbooks, and ongoing guidance.',
  },
  {
    icon: '\uD83C\uDF1F',
    title: 'Community Impact',
    description: 'Build a thriving sports community in your area.',
  },
];

const steps = [
  {
    number: 1,
    title: 'Apply',
    description: 'Submit your interest and tell us about your city.',
  },
  {
    number: 2,
    title: 'Training',
    description: 'Complete our comprehensive league management program.',
  },
  {
    number: 3,
    title: 'Launch',
    description: 'Set up your first season with our team by your side.',
  },
  {
    number: 4,
    title: 'Grow',
    description: 'Expand sports and seasons as your community grows.',
  },
];

export function StartLeaguePage() {
  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.container}>
          <h1 className={styles.title}>Start a HotMess League</h1>
          <p className={styles.subtitle}>Bring HotMess Sports to Your City!</p>
        </div>
      </section>

      {/* Benefits Section */}
      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Why Partner With Us</h2>
          <div className={styles.benefitsGrid}>
            {benefits.map((benefit) => (
              <div key={benefit.title} className={styles.benefitCard}>
                <span className={styles.benefitIcon}>{benefit.icon}</span>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>How It Works</h2>
          <div className={styles.stepsTimeline}>
            {steps.map((step) => (
              <div key={step.number} className={styles.timelineStep}>
                <div className={styles.timelineNumber}>
                  <span>{step.number}</span>
                </div>
                <div className={styles.timelineContent}>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <h2>Interested in Starting a League?</h2>
          <p>
            We&apos;d love to hear from you. Reach out and let&apos;s talk about bringing HotMess
            Sports to your city.
          </p>
          <a href="mailto:grant@hotmesssports.com" className={styles.ctaButton}>
            Contact Us: grant@hotmesssports.com
          </a>
        </div>
      </section>
    </div>
  );
}
