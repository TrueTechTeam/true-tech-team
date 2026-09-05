import type { ResumeData, ResumeProfile } from '../../lib/types';
import { formatDateRange, skillGroupLine } from '../shared/resumeDataHelpers';
import styles from './Template.module.scss';

// 03-two-column-sidebar — Two-Column Sidebar
//
// ⚠ ATS caveat: some applicant-tracking-system parsers read multi-column
// layouts out of visual order (e.g. reading across both columns row-by-row
// instead of down one column then the other), which can scramble skills,
// contact details, and education relative to the summary/experience text.
// Offer this template as a design-forward option, not the safe default —
// that's `01-classic-ats`.
//
// DOM structure: a full-width <header> carries name + title only. Contact
// details, Skills, and Education live in the left <aside> sidebar (per this
// template's spec); Summary, Experience, and Certifications live in the
// main column. This is a deliberate deviation from the other templates'
// header (which folds the contact line in with name/title) — here the
// contact line renders inside the sidebar instead, since the spec calls out
// "skills/contact/education" as the sidebar's explicit contents.
//
// The two-column grid is intentionally kept at print time too (not
// collapsed to single-column) — that's the whole point of this template,
// and @page margins still frame it correctly.

function buildContactLine(profile: ResumeProfile): string {
  return [profile.phone, profile.email, profile.location, profile.linkedin, profile.website]
    .filter(Boolean)
    .join(' | ');
}

export default function Template({ data }: { data: ResumeData }) {
  const { profile, summary, skills, experience, education, certifications } = data;
  const contactLine = buildContactLine(profile);

  return (
    <div className={styles.resume}>
      <header className={styles.header}>
        <h1 className={styles.name}>{profile.name}</h1>
        <p className={styles.jobTitle}>{profile.title}</p>
      </header>

      <div className={styles.body}>
        <aside className={styles.sidebar}>
          {contactLine && (
            <section className={styles.sidebarSection}>
              <h2 className={styles.sidebarTitle}>Contact</h2>
              <p className={styles.contact}>{contactLine}</p>
            </section>
          )}

          {skills.length > 0 && (
            <section className={styles.sidebarSection}>
              <h2 className={styles.sidebarTitle}>Technical Skills</h2>
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

          {education.length > 0 && (
            <section className={styles.sidebarSection}>
              <h2 className={styles.sidebarTitle}>Education</h2>
              {education.map((entry, _) => (
                <div key={`${entry.school}`} className={styles.educationEntry}>
                  <div className={styles.school}>{entry.school}</div>
                  <div className={styles.degree}>{entry.degree}</div>
                  <div className={styles.educationMeta}>
                    {entry.location && <span>{entry.location}</span>}
                    <span>{formatDateRange(entry.startDate, entry.endDate)}</span>
                  </div>
                </div>
              ))}
            </section>
          )}
        </aside>

        <main className={styles.main}>
          {summary && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Professional Summary</h2>
              <p className={styles.summary}>{summary}</p>
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
        </main>
      </div>
    </div>
  );
}
