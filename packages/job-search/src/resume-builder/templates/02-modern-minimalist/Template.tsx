import type { ResumeData, ResumeProfile } from '../../lib/types';
import { formatDateRange, skillGroupLine } from '../shared/resumeDataHelpers';
import styles from './Template.module.scss';

// 02-modern-minimalist — Modern Minimalist
// Single column, generous whitespace, understated sans-serif with light-gray
// secondary text and thin rules in place of heavy borders. No strong color
// accents beyond the name.

function buildContactLine(profile: ResumeProfile): string {
  return [profile.phone, profile.email, profile.location, profile.linkedin, profile.website]
    .filter(Boolean)
    .join('  ·  ');
}

export default function Template({ data }: { data: ResumeData }) {
  const { profile, summary, skills, experience, education, certifications } = data;
  const contactLine = buildContactLine(profile);

  return (
    <div className={styles.resume}>
      <header className={styles.header}>
        <h1 className={styles.name}>{profile.name}</h1>
        <p className={styles.jobTitle}>{profile.title}</p>
        {contactLine && <p className={styles.contact}>{contactLine}</p>}
      </header>

      {summary && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Professional Summary</h2>
          <p className={styles.summary}>{summary}</p>
        </section>
      )}

      {skills.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Technical Skills</h2>
          <ul className={styles.skillList}>
            {skills.map((group, _) => (
              <li key={`${group.category}`} className={styles.skillRow}>
                <span className={styles.skillCategory}>{group.category}</span>
                <span className={styles.skillItems}>{skillGroupLine(group)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {experience.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Professional Experience</h2>
          {experience.map((entry, _) => (
            <div key={`${entry.company}-${entry.role}`} className={styles.experienceEntry}>
              <div className={styles.experienceHeader}>
                <div className={styles.experienceHeading}>
                  <span className={styles.role}>{entry.role}</span>
                  <span className={styles.company}>{entry.company}</span>
                </div>
                <div className={styles.experienceMeta}>
                  <span className={styles.dates}>
                    {formatDateRange(entry.startDate, entry.endDate)}
                  </span>
                  <span className={styles.location}>{entry.location}</span>
                </div>
              </div>
              {entry.bullets.length > 0 && (
                <ul className={styles.bullets}>
                  {entry.bullets.map((bullet, _) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {education.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Education</h2>
          {education.map((entry, _) => (
            <div key={`${entry.school}`} className={styles.educationEntry}>
              <div className={styles.educationHeading}>
                <span className={styles.degree}>{entry.degree}</span>
                <span className={styles.school}>{entry.school}</span>
              </div>
              <div className={styles.educationMeta}>
                <span className={styles.dates}>
                  {formatDateRange(entry.startDate, entry.endDate)}
                </span>
                {entry.location && <span className={styles.location}>{entry.location}</span>}
              </div>
            </div>
          ))}
        </section>
      )}

      {certifications && certifications.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Certifications</h2>
          <ul className={styles.certList}>
            {certifications.map((cert, _) => (
              <li key={`${cert.title}`} className={styles.certEntry}>
                <span className={styles.certTitle}>{cert.title}</span>
                <span className={styles.certIssuer}>{cert.issuer}</span>
                {cert.date && <span className={styles.certDate}>{cert.date}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
