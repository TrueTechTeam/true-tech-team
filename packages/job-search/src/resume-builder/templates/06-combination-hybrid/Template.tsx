import type { ResumeData, ResumeProfile } from '../../lib/types';
import { formatDateRange, skillGroupLine } from '../shared/resumeDataHelpers';
import styles from './Template.module.scss';

interface TemplateProps {
  data: ResumeData;
}

// Combination/Hybrid: a compact "Core Competencies" skills block sits right
// after the summary, then a full-weight reverse-chronological experience
// section carries equal visual emphasis below it — a balanced 50/50 between
// the functional (skills-first) and chronological (experience-first) styles.

function buildContactLine(profile: ResumeProfile): string {
  return [profile.phone, profile.email, profile.location, profile.linkedin, profile.website]
    .filter((value): value is string => Boolean(value))
    .join('  •  ');
}

export default function Template({ data }: TemplateProps) {
  const contactLine = buildContactLine(data.profile);
  const hasSummary = data.summary.length > 0;
  const hasSkills = data.skills.length > 0;
  const hasExperience = data.experience.length > 0;
  const hasEducation = data.education.length > 0;
  const certifications = data.certifications ?? [];
  const hasCertifications = certifications.length > 0;

  return (
    <div className={styles.resume}>
      <header className={styles.header}>
        <h1 className={styles.name}>{data.profile.name}</h1>
        <p className={styles.title}>{data.profile.title}</p>
        {contactLine.length > 0 && <p className={styles.contact}>{contactLine}</p>}
      </header>

      {hasSummary && (
        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>Professional Summary</h2>
          <p className={styles.summary}>{data.summary}</p>
        </section>
      )}

      {hasSkills && (
        <section className={`${styles.section} ${styles.competencies}`}>
          <h2 className={styles.sectionHeading}>Core Competencies</h2>
          <div className={styles.skillsGrid}>
            {data.skills.map((group) => (
              <div key={group.category} className={styles.skillRow}>
                <span className={styles.skillCategory}>{group.category}</span>
                <span className={styles.skillItems}>{skillGroupLine(group)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {hasExperience && (
        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>Professional Experience</h2>
          {data.experience.map((entry) => (
            <article
              key={`${entry.company}|${entry.role}|${entry.startDate}`}
              className={styles.experienceEntry}
            >
              <div className={styles.experienceHeader}>
                <div className={styles.experienceTitleLine}>
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
              <ul className={styles.bulletList}>
                {entry.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      )}

      {hasEducation && (
        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>Education</h2>
          {data.education.map((entry) => (
            <div key={`${entry.school}|${entry.degree}`} className={styles.educationEntry}>
              <div className={styles.educationLine}>
                <span className={styles.school}>{entry.school}</span>
                <span className={styles.degree}>{entry.degree}</span>
              </div>
              {(entry.location || entry.startDate || entry.endDate) && (
                <div className={styles.educationMeta}>
                  {entry.location && <span className={styles.location}>{entry.location}</span>}
                  <span className={styles.dates}>
                    {formatDateRange(entry.startDate, entry.endDate)}
                  </span>
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {hasCertifications && (
        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>Certifications</h2>
          <ul className={styles.certList}>
            {certifications.map((cert) => (
              <li key={`${cert.title}|${cert.issuer}`} className={styles.certEntry}>
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
