'use client';

import type { SectionComponentProps } from '../types';
import { readRecordList } from '../readProps';
import styles from './TimelineSection.module.scss';

interface TimelineEntry {
  period: string;
  title: string;
  body?: string;
}

/**
 * Reads stored timeline entries defensively, preserving their order. An entry without a title has
 * nothing to show and is skipped; a missing period just renders without one.
 */
function readEntries(value: unknown): TimelineEntry[] {
  return readRecordList(value).flatMap((entry): TimelineEntry[] => {
    const title = typeof entry['title'] === 'string' ? entry['title'] : '';
    if (title.trim().length === 0) {
      return [];
    }
    return [
      {
        period: typeof entry['period'] === 'string' ? entry['period'] : '',
        title,
        ...(typeof entry['body'] === 'string' && entry['body'].length > 0
          ? { body: entry['body'] }
          : {}),
      },
    ];
  });
}

export function TimelineSection({ section }: SectionComponentProps) {
  const heading = typeof section.props['heading'] === 'string' ? section.props['heading'] : '';
  const entries = readEntries(section.props['entries']);

  return (
    <div className={styles.timeline}>
      {heading.length > 0 && <h2 className={styles.heading}>{heading}</h2>}
      {entries.length === 0 ? (
        <p className={styles.empty}>No entries yet.</p>
      ) : (
        <ol className={styles.list}>
          {entries.map((entry, index) => (
            // eslint-disable-next-line react/no-array-index-key -- timeline entries have no stable id in stored data; position is their identity and a reorder replaces the whole array
            <li key={`${entry.title}-${index}`} className={styles.entry}>
              {entry.period.length > 0 && <span className={styles.period}>{entry.period}</span>}
              <h3 className={styles.title}>{entry.title}</h3>
              {entry.body && <p className={styles.body}>{entry.body}</p>}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
