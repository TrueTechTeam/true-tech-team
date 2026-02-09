import { Outlet, Link } from 'react-router-dom';
import styles from './PublicLayout.module.scss';

export function PublicLayout() {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.container}>
          <Link to="/" className={styles.logo}>
            <span className={styles.logoText}>Hotmess Sports</span>
          </Link>

          <nav className={styles.nav}>
            <Link to="/" className={styles.navLink}>
              Home
            </Link>
            <Link to="/about" className={styles.navLink}>
              About
            </Link>
            <Link to="/cities" className={styles.navLink}>
              Cities
            </Link>
            <Link to="/sports" className={styles.navLink}>
              Sports
            </Link>
            <Link to="/rules" className={styles.navLink}>
              Rules
            </Link>
          </nav>

          <div className={styles.actions}>
            <Link to="/login" className={styles.loginButton}>
              Sign In
            </Link>
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
              <h4>Hotmess Sports</h4>
              <p>Recreational sports leagues in multiple cities.</p>
            </div>
            <div className={styles.footerSection}>
              <h4>Quick Links</h4>
              <Link to="/about">About Us</Link>
              <Link to="/cities">Our Cities</Link>
              <Link to="/sports">Our Sports</Link>
            </div>
            <div className={styles.footerSection}>
              <h4>Connect</h4>
              <a href="mailto:info@hotmesssports.com">Contact Us</a>
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
