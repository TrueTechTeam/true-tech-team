import type { ResumeData, ResumeProfile } from '../../lib/types';
import { formatDateRange, skillGroupLine } from '../shared/resumeDataHelpers';
import styles from './Template.module.scss';

// 05-functional-skills-first — Functional Skills-First
// Skills get outsized visual weight (large category headers, pill-styled
// items) right after the summary and ahead of Experience — good for career
// changers or anyone who wants skills read before chronology. Experience
// still renders every field, just with a visually quieter treatment.
//
// Deviation: skill items render as individual pills built from
// `group.items` rather than the single comma-joined `skillGroupLine(group)`
// string, per this template's explicit "pill/tag-styled spans" spec — a
// flat joined line would fight the pill treatment visually. `skillGroupLine`
// is still used as an `aria-label`/screen-reader-friendly text equivalent on
// the pill row so the same canonical data string a screen reader or a
// simple ATS text-extraction pass would find in other templates is present
// here too, just visually hidden behind the pills.

function buildContactLine(profile: ResumeProfile): string {
  return [profile.phone, profile.email, profile.location, profile.linkedin, profile.website]
    .filter(Boolean)
    .join('  •  ');
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
        <section className={styles.skillsSection}>
          <h2 className={styles.skillsSectionTitle}>Technical Skills</h2>
          <div className={styles.skillGroups}>
            {skills.map((group, _) => (
              <div key={`${group.category}`} className={styles.skillRow}>
                <h3 className={styles.skillCategory}>{group.category}</h3>
                <div className={styles.pillRow} aria-label={skillGroupLine(group)}>
                  {group.items.map((item, _) => (
                    <span key={`${item}`} className={styles.pill}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
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
                  <span className={styles.location}>{entry.location}</span>
                  <span className={styles.dates}>
                    {formatDateRange(entry.startDate, entry.endDate)}
                  </span>
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
                <span className={styles.school}>{entry.school}</span>
                <span className={styles.degree}>{entry.degree}</span>
              </div>
              <div className={styles.educationMeta}>
                {entry.location && <span className={styles.location}>{entry.location}</span>}
                <span className={styles.dates}>
                  {formatDateRange(entry.startDate, entry.endDate)}
                </span>
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
                {' — '}
                <span className={styles.certIssuer}>{cert.issuer}</span>
                {cert.date && <span className={styles.certDate}> ({cert.date})</span>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
