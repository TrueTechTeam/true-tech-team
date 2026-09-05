import type { ResumeData } from '../../lib/types';
import { formatDateRange } from '../shared/resumeDataHelpers';
import styles from './Template.module.scss';

interface TemplateProps {
  data: ResumeData;
}

// 13 — Startup Modern Casual: friendly, rounded containers, warm accent
// color, and rounded "chip" styling for individual skill items instead of
// a plain comma list. Skill items are still sourced straight from
// `group.items` (not `skillGroupLine`, which is comma-joined-string
// oriented) so each item can render as its own chip.
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
                {index > 0 && <span className={styles.separator}>·</span>}
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
                <span className={styles.skillCategory}>{group.category}</span>
                <div className={styles.chipRow}>
                  {group.items.map((item, _) => (
                    <span key={`${item}`} className={styles.chip}>
                      {item}
                    </span>
                  ))}
                </div>
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
                <div className={styles.experienceHeaderLine}>
                  <span className={styles.role}>{entry.role}</span>
                  <span className={styles.dates}>
                    {formatDateRange(entry.startDate, entry.endDate)}
                  </span>
                </div>
                <div className={styles.experienceHeaderLine}>
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

      {education.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Education</h2>
          {education.map((entry, _) => (
            <div key={`${entry.school}`} className={styles.educationEntry}>
              <div className={styles.experienceHeaderLine}>
                <span className={styles.role}>{entry.degree}</span>
                <span className={styles.dates}>
                  {formatDateRange(entry.startDate, entry.endDate)}
                </span>
              </div>
              <div className={styles.experienceHeaderLine}>
                <span className={styles.company}>{entry.school}</span>
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
              <li key={`${cert.title}`}>
                <span className={styles.certTitle}>{cert.title}</span>
                {cert.issuer && <span> — {cert.issuer}</span>}
                {cert.date && <span className={styles.certDate}> ({cert.date})</span>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
