import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './MobileNav.module.scss';

interface NavItem {
  label: string;
  path: string;
}

const PRIMARY_NAV: NavItem[] = [
  { label: 'Home', path: '/' },
  { label: 'Cities', path: '/cities' },
  { label: 'Sports', path: '/sports' },
  { label: 'Register', path: '/register' },
  { label: 'Rules', path: '/rules' },
];

const SECONDARY_NAV: NavItem[] = [
  { label: 'About', path: '/about' },
  { label: 'Tournaments', path: '/tournaments' },
  { label: 'Charity Events', path: '/charity-events' },
  { label: 'HM Classic', path: '/hm-classic' },
  { label: 'Start a League', path: '/start-a-league' },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') {return location.pathname === '/';}
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <button
        className={`${styles.hamburger} ${isOpen ? styles.open : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
      >
        <span className={styles.bar} />
        <span className={styles.bar} />
        <span className={styles.bar} />
      </button>

      {isOpen && <div className={styles.backdrop} onClick={() => setIsOpen(false)} />}

      <nav className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ''}`}>
        <div className={styles.drawerContent}>
          <div className={styles.section}>
            {PRIMARY_NAV.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`${styles.navLink} ${isActive(item.path) ? styles.active : ''}`}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className={styles.divider} />

          <div className={styles.section}>
            {SECONDARY_NAV.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`${styles.navLink} ${styles.secondary} ${isActive(item.path) ? styles.active : ''}`}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className={styles.divider} />

          <div className={styles.section}>
            <Link
              to="/login"
              className={styles.loginButton}
              onClick={() => setIsOpen(false)}
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}
