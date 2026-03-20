import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Logo } from '../../components/Logo/Logo';
import { NewsBanner } from '../../components/NewsBanner/NewsBanner';
import { MobileNav } from '../../components/MobileNav/MobileNav';
import { currentAnnouncement } from '../../mocks/data/announcements';
import styles from './PublicLayout.module.scss';

export function PublicLayout() {
  const [bannerDismissed, setBannerDismissed] = useState(
    () => localStorage.getItem(`hotmess_banner_dismissed_${currentAnnouncement.id}`) === 'true'
  );

  const handleDismiss = () => {
    localStorage.setItem(`hotmess_banner_dismissed_${currentAnnouncement.id}`, 'true');
    setBannerDismissed(true);
  };

  return (
    <div className={styles.layout}>
      {!bannerDismissed && currentAnnouncement.dismissible && (
        <NewsBanner
          message={currentAnnouncement.message}
          ctaText={currentAnnouncement.ctaText}
          ctaLink={currentAnnouncement.ctaLink}
          onDismiss={handleDismiss}
        />
      )}

      <header className={styles.header}>
        <div className={styles.container}>
          <Link to="/" className={styles.logo}>
            <Logo size="sm" />
          </Link>

          <nav className={styles.nav}>
            <Link to="/" className={styles.navLink}>
              Home
            </Link>
            <Link to="/cities" className={styles.navLink}>
              Cities
            </Link>
            <Link to="/sports" className={styles.navLink}>
              Sports
            </Link>
            <Link to="/register" className={styles.navLink}>
              Register
            </Link>
            <Link to="/rules" className={styles.navLink}>
              Rules
            </Link>
            <div className={styles.navDropdown}>
              <span className={styles.navLink}>More ▾</span>
              <div className={styles.dropdownMenu}>
                <Link to="/tournaments" className={styles.dropdownItem}>
                  Tournaments
                </Link>
                <Link to="/charity-events" className={styles.dropdownItem}>
                  Charity Events
                </Link>
                <Link to="/hm-classic" className={styles.dropdownItem}>
                  HM Classic
                </Link>
                <Link to="/start-a-league" className={styles.dropdownItem}>
                  Start a League
                </Link>
                <Link to="/about" className={styles.dropdownItem}>
                  About
                </Link>
              </div>
            </div>
          </nav>

          <div className={styles.actions}>
            <Link to="/login" className={styles.loginButton}>
              Sign In
            </Link>
            <MobileNav />
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerContent}>
            <div className={styles.footerSection}>
              <Logo size="sm" />
              <p>Recreational sports leagues in multiple cities.</p>
            </div>
            <div className={styles.footerSection}>
              <h4>Quick Links</h4>
              <Link to="/about">About Us</Link>
              <Link to="/cities">Our Cities</Link>
              <Link to="/sports">Our Sports</Link>
              <Link to="/register">Register to Play</Link>
            </div>
            <div className={styles.footerSection}>
              <h4>Events</h4>
              <Link to="/tournaments">Tournaments</Link>
              <Link to="/charity-events">Charity Events</Link>
              <Link to="/hm-classic">HM Classic</Link>
              <Link to="/start-a-league">Start a League</Link>
            </div>
            <div className={styles.footerSection}>
              <h4>Connect</h4>
              <a href="mailto:grant@hotmesssports.com">Contact Us</a>
              <a
                href="https://instagram.com/hotmesssports"
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </a>
              <a
                href="https://facebook.com/hotmesssports"
                target="_blank"
                rel="noopener noreferrer"
              >
                Facebook
              </a>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p>&copy; {new Date().getFullYear()} Hotmess Sports. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
