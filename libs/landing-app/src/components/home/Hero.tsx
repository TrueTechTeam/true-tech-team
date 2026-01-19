'use client';

import { Button } from '@true-tech-team/ui-components';
import Link from 'next/link';
import styles from './Hero.module.scss';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <h1 className={styles.title}>
          Building Tomorrow's
          <span className={styles.highlight}> Tech Solutions</span>
        </h1>
        <p className={styles.subtitle}>
          A showcase of innovative projects and cutting-edge technology from the
          True Tech Team. Explore our portfolio of modern web applications and
          component libraries.
        </p>
        <div className={styles.actions}>
          <a href="#projects">
            <Button variant="primary" size="lg">
              View Projects
            </Button>
          </a>
          <Link href="/signup">
            <Button variant="outline" size="lg">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
