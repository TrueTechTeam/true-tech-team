'use client';

import type { SectionComponentProps } from '../types';
import { readHeading } from '../readProps';
import styles from './RichTextSection.module.scss';

/**
 * Splits prose into paragraphs on blank lines (a line holding only whitespace counts as blank).
 * A single newline stays inside its paragraph; the stylesheet preserves it as a line break.
 */
function readParagraphs(value: unknown): string[] {
  if (typeof value !== 'string') {
    return [];
  }
  return value
    .split(/\r?\n[^\S\r\n]*\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
}

export function RichTextSection({ section }: SectionComponentProps) {
  const heading = readHeading(section.props);
  const paragraphs = readParagraphs(section.props['body']);
  const align = section.props['align'] === 'center' ? 'center' : 'left';

  return (
    <div className={align === 'center' ? styles.richTextCenter : styles.richText}>
      {heading.length > 0 && <h2 className={styles.heading}>{heading}</h2>}
      {paragraphs.map((paragraph, index) => (
        // eslint-disable-next-line react/no-array-index-key -- paragraphs are derived from one string and have no stable id; position is their identity
        <p key={`${index}-${paragraph}`} className={styles.paragraph}>
          {paragraph}
        </p>
      ))}
    </div>
  );
}
