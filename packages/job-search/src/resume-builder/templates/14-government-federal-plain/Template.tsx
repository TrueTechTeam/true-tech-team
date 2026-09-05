import type { ResumeData } from '../../lib/types';
import { formatDateRange, skillGroupLine } from '../shared/resumeDataHelpers';
import styles from './Template.module.scss';

interface TemplateProps {
  data: ResumeData;
}

// 14 — Government/Federal Plain: maximally plain, information-dense,
// grayscale only. Emphasis via bold/underline, not color. Employer,
// location, and dates are written out plainly rather than styled as
// separate visual chips.
export default function Template({ data }: TemplateProps) {
  const { profile, summary, skills, education, certifications } = data;

  const contactParts = [
    profile.phone,
    profile.email,
    profile.location,
    profile.linkedin,
    profile.website,
  ].filter((part): part is string => Boolean(part));

  return (
    <div className={styles.resume}>
      <header className={styles.header}>
        <h1 className={styles.name}>{profile.name}</h1>
        <p className={styles.title}>{profile.title}</p>
        {contactParts.length > 0 && (
          <p className={styles.contact}>
            {contactParts.map((part, index) => (
              <span key={`${part}`}>
                {index > 0 && <span className={styles.separator}> | </span>}
                {part}
              </span>
            ))}
          </p>
        )}
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
          <div className={styles.skillsList}>
            {skills.map((group, _) => (
              <div key={`${group.category}`} className={styles.skillRow}>
                <span className={styles.skillCategory}>{group.category}: </span>
                <span className={styles.skillItems}>{skillGroupLine(group)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {data.experience.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Professional Experience</h2>
          {data.experience.map((entry, _) => (
            <div key={`${entry.company}`} className={styles.experienceEntry}>
              <div className={styles.experienceHeader}>
                <p className={styles.experienceHeaderLine}>
                  <span className={styles.role}>{entry.role}</span>,{' '}
                  <span className={styles.company}>{entry.company}</span>
                  {entry.location && <span> — {entry.location}</span>}
                </p>
                <p className={styles.dates}>{formatDateRange(entry.startDate, entry.endDate)}</p>
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
              <p className={styles.experienceHeaderLine}>
                <span className={styles.role}>{entry.degree}</span>,{' '}
                <span className={styles.company}>{entry.school}</span>
                {entry.location && <span> — {entry.location}</span>}
              </p>
              <p className={styles.dates}>{formatDateRange(entry.startDate, entry.endDate)}</p>
            </div>
          ))}
        </section>
      )}

      {certifications && certifications.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Certifications</h2>
          <ul className={styles.certList}>
            {certifications.map((cert, _) => (
              <li key={`${cert.title}`}>
                <span className={styles.certTitle}>{cert.title}</span>
                {cert.issuer && <span>, {cert.issuer}</span>}
                {cert.date && <span> ({cert.date})</span>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
