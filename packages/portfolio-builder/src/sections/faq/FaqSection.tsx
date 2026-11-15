'use client';

import { AccordionItem } from '../../components/wrappers/expand';
import type { SectionComponentProps } from '../types';
import { readHeading, readRecordList, readText } from '../readProps';
import styles from './FaqSection.module.scss';

interface FaqEntry {
  question: string;
  answer: string;
}

/** An entry without a question has no accordion header and is skipped. */
function readFaq(value: unknown): FaqEntry[] {
  return readRecordList(value).flatMap((entry): FaqEntry[] => {
    const question = readText(entry['question']);
    if (question.trim().length === 0) {
      return [];
    }
    return [{ question, answer: readText(entry['answer']) }];
  });
}

export function FaqSection({ section }: SectionComponentProps) {
  const heading = readHeading(section.props);
  const entries = readFaq(section.props['items']);

  return (
    <div className={styles.faq}>
      {heading.length > 0 && <h2 className={styles.heading}>{heading}</h2>}
      {entries.length === 0 ? (
        <p className={styles.empty}>No questions yet.</p>
      ) : (
        <div className={styles.list}>
          {entries.map((entry, index) => (
            // eslint-disable-next-line react/no-array-index-key -- FAQ entries have no stable id in stored data; position is their identity and a reorder replaces the whole array
            <div key={`${entry.question}-${index}`} className={styles.item}>
              {/* Only the first entry rests open. The editor canvas is inert, so a fully collapsed
                  accordion could never be expanded there and would show only questions; one open
                  pair is enough to read as an FAQ. Opening every entry would carry through to the
                  published page, where all-expanded is not an FAQ. */}
              <AccordionItem
                header={entry.question}
                body={entry.answer}
                defaultOpen={index === 0}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
