'use client';

import { Avatar } from '@true-tech-team/ui-components';
import styles from './TeamSection.module.scss';
import { team } from '../../lib/data/team';

export default function TeamSection() {
  return (
    <section id="team" className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>Meet the Team</h2>
        <p className={styles.subtitle}>The talented individuals behind our success</p>
        <div className={styles.grid}>
          {team.map((member) => (
            <div key={member.id} className={styles.member}>
              <Avatar
                src={member.avatar}
                alt={member.name}
                size="lg"
                fallback={member.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              />
              <h3 className={styles.memberName}>{member.name}</h3>
              <p className={styles.memberRole}>{member.role}</p>
              <p className={styles.memberBio}>{member.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

