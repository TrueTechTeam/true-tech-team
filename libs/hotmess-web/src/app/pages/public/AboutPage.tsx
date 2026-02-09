import styles from './AboutPage.module.scss';

export function AboutPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>About Hotmess Sports</h1>

        <section className={styles.section}>
          <p className={styles.lead}>
            Hotmess Sports is a recreational sports league that operates in multiple cities,
            offering a wide and varying array of organized sports for players of all skill levels.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Our Mission</h2>
          <p>
            We believe that sports should be fun, social, and accessible to everyone. Whether
            you&apos;re a seasoned athlete or just looking to try something new, Hotmess Sports
            provides a welcoming environment where you can play, compete, and make lasting
            friendships.
          </p>
        </section>

        <section className={styles.section}>
          <h2>How It Works</h2>
          <div className={styles.steps}>
            <div className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <h3>Find Your Sport</h3>
              <p>Browse our sports offerings and find the perfect fit for you.</p>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <h3>Sign Up</h3>
              <p>Register as a free agent or create a team with friends.</p>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <h3>Play</h3>
              <p>Show up, have fun, and enjoy the season!</p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Our Team</h2>
          <p>
            Hotmess Sports is run by a dedicated group of sports enthusiasts who are passionate
            about creating great experiences. Each city has local organizers and managers who ensure
            every season runs smoothly.
          </p>
        </section>
      </div>
    </div>
  );
}
