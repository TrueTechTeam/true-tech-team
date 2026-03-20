import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUpcomingLeagues } from '../../../hooks/useUpcomingLeagues';
import { getSportImage } from '../../../config/images';
import { ImageCard } from '../../../components/ImageCard/ImageCard';
import styles from './RegisterPage.module.scss';

const faqs = [
  {
    question: 'How much does it cost?',
    answer: 'League fees vary by city and sport, typically $50-$75 per season.',
  },
  {
    question: 'Can I sign up as a free agent?',
    answer: 'Yes! Sign up as a free agent and we\'ll place you on a team.',
  },
  {
    question: 'What skill level do I need?',
    answer: 'All skill levels welcome! We have divisions for beginners and experienced players.',
  },
  {
    question: 'What do I need to bring?',
    answer: 'Just yourself and athletic shoes. We provide all equipment.',
  },
];

export function RegisterPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { data: openSeasons } = useUpcomingLeagues();

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.container}>
          <h1 className={styles.title}>Register to Play</h1>
          <p className={styles.subtitle}>
            Join the most fun recreational sports leagues around. Sign up as an individual or bring
            your whole crew.
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>How to Get Started</h2>
          <div className={styles.stepsGrid}>
            <div className={styles.stepCard}>
              <span className={styles.stepNumber}>1</span>
              <h3>Find Your City</h3>
              <p>Choose from one of our cities below to see what sports are available near you.</p>
            </div>
            <div className={styles.stepCard}>
              <span className={styles.stepNumber}>2</span>
              <h3>Pick a Sport</h3>
              <p>Browse the available sports and find the one that fits your vibe.</p>
            </div>
            <div className={styles.stepCard}>
              <span className={styles.stepNumber}>3</span>
              <h3>Sign Up</h3>
              <p>Register as a free agent or create a team and get ready to play!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Open Registration Section */}
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

      {/* FAQ Section */}
      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
          <div className={styles.faqList}>
            {faqs.map((faq, index) => (
              <div key={index} className={styles.faqItem}>
                <button
                  className={`${styles.faqQuestion} ${openFaq === index ? styles.faqOpen : ''}`}
                  onClick={() => toggleFaq(index)}
                  type="button"
                >
                  <span>{faq.question}</span>
                  <span className={styles.faqToggle}>{openFaq === index ? '\u2212' : '+'}</span>
                </button>
                {openFaq === index && (
                  <div className={styles.faqAnswer}>
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <h2>Ready to Join the Fun?</h2>
          <p>Find a league in your city and sign up today!</p>
          <Link to="/cities" className={styles.primaryButton}>
            Find Your City
          </Link>
        </div>
      </section>
    </div>
  );
}
