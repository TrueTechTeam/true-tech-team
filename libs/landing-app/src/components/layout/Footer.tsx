'use client';

import styles from './Footer.module.scss';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <p className={styles.copyright}>
          © {currentYear} True Tech Team. All rights reserved.
        </p>
        <div className={styles.links}>
          <a
            href="https://github.com/true-tech-team"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <a
            href="http://localhost:6006"
            target="_blank"
            rel="noopener noreferrer"
          >
            Storybook
          </a>
        </div>
      </div>
    </footer>
  );
}
