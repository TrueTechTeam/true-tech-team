import type { ResumeData, ResumeProfile } from '../../lib/types';
import { formatDateRange, skillGroupLine } from '../shared/resumeDataHelpers';
import styles from './Template.module.scss';

interface TemplateProps {
  data: ResumeData;
}

// Academic CV Style: Education is promoted above Experience (academics lead
// with their degrees), typography is formal/serif, and entries are allowed
// to run longer since this style is expected to exceed one page.
// Certifications render as a "Publications & Credentials" block.

function buildContactLine(profile: ResumeProfile): string {
  return [profile.phone, profile.email, profile.location, profile.linkedin, profile.website]
    .filter((value): value is string => Boolean(value))
    .join(' | ');
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
        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>Technical Skills</h2>
          <ul className={styles.skillsList}>
            {data.skills.map((group) => (
              <li key={group.category} className={styles.skillRow}>
                <span className={styles.skillCategory}>{group.category}: </span>
                <span className={styles.skillItems}>{skillGroupLine(group)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {hasEducation && (
        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>Education</h2>
          {data.education.map((entry) => (
            <div key={`${entry.school}|${entry.degree}`} className={styles.educationEntry}>
              <div className={styles.educationLine}>
                <span className={styles.degree}>{entry.degree}</span>
                <span className={styles.dates}>
                  {formatDateRange(entry.startDate, entry.endDate)}
                </span>
              </div>
              <div className={styles.educationMeta}>
                <span className={styles.school}>{entry.school}</span>
                {entry.location && <span className={styles.location}>{entry.location}</span>}
              </div>
            </div>
          ))}
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
                  <span className={styles.dates}>
                    {formatDateRange(entry.startDate, entry.endDate)}
                  </span>
                </div>
                <div className={styles.experienceMeta}>
                  <span className={styles.company}>{entry.company}</span>
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

      {hasCertifications && (
        <section className={styles.section}>
          <h2 className={styles.sectionHeading}>Publications &amp; Credentials</h2>
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
