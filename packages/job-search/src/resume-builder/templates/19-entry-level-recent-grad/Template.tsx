import type { ResumeData } from '../../lib/types';
import { formatDateRange, skillGroupLine } from '../shared/resumeDataHelpers';
import styles from './Template.module.scss';

interface TemplateProps {
  data: ResumeData;
}

// Entry-Level/Recent-Grad template. Education is rendered BEFORE Experience
// since a recent graduate typically leads with their degree while work
// history is still thin. Skills are also given solid visual weight, since a
// recent grad's relevant skills may outweigh their job history.
export default function Template({ data }: TemplateProps) {
  const { profile, summary, skills, experience, education } = data;
  const certifications = data.certifications ?? [];

  const contact = [
    profile.phone,
    profile.email,
    profile.location,
    profile.linkedin,
    profile.website,
  ]
    .filter(Boolean)
    .join('  |  ');

  return (
    <div className={styles.resume}>
      <header className={styles.header}>
        <h1 className={styles.name}>{profile.name}</h1>
        <p className={styles.title}>{profile.title}</p>
        {contact && <p className={styles.contact}>{contact}</p>}
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
          <div className={styles.skillGrid}>
            {skills.map((group, _) => (
              <div key={`${group.category}`} className={styles.skillRow}>
                <span className={styles.skillCategory}>{group.category}</span>
                <span className={styles.skillItems}>{skillGroupLine(group)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {education.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Education</h2>
          {education.map((entry, _) => (
            <div key={`${entry.school}`} className={styles.educationEntry}>
              <div className={styles.educationRow}>
                <span className={styles.school}>{entry.school}</span>
                <span className={styles.dates}>
                  {formatDateRange(entry.startDate, entry.endDate)}
                </span>
              </div>
              <div className={styles.educationRow}>
                <span className={styles.degree}>{entry.degree}</span>
                {entry.location && <span className={styles.location}>{entry.location}</span>}
              </div>
            </div>
          ))}
        </section>
      )}

      {experience.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Professional Experience</h2>
          {experience.map((entry, _) => (
            <div key={`${entry.company}-${entry.role}`} className={styles.experienceEntry}>
              <div className={styles.experienceHeader}>
                <div className={styles.experienceHeaderRow}>
                  <span className={styles.role}>{entry.role}</span>
                  <span className={styles.dates}>
                    {formatDateRange(entry.startDate, entry.endDate)}
                  </span>
                </div>
                <div className={styles.experienceHeaderRow}>
                  <span className={styles.company}>{entry.company}</span>
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

      {certifications.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Certifications</h2>
          <ul className={styles.certList}>
            {certifications.map((cert, _) => (
              <li key={`${cert.title}`} className={styles.certEntry}>
                <span className={styles.certTitle}>{cert.title}</span>
                <span className={styles.certIssuer}> — {cert.issuer}</span>
                {cert.date && <span className={styles.certDate}> ({cert.date})</span>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
