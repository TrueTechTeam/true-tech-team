'use client';

import { Icon } from '@true-tech-team/ui-components';
import styles from './FeaturesSection.module.scss';
import { features } from '../../lib/data/features';

export default function FeaturesSection() {
  return (
    <section id="features" className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>Why Choose Us</h2>
        <p className={styles.subtitle}>
          Modern technologies and best practices for exceptional results
        </p>
        <div className={styles.grid}>
          {features.map((feature) => (
            <div key={feature.id} className={styles.feature}>
              <div className={styles.iconWrapper}>
                <Icon name={feature.icon} size="lg" />
              </div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
