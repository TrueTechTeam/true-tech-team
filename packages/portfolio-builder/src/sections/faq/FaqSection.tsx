'use client';

import { AccordionItem } from '../../components/wrappers/expand';
import type { SectionComponentProps } from '../types';
import { readRecordList } from '../readProps';
import styles from './FaqSection.module.scss';

interface FaqEntry {
  question: string;
  answer: string;
}

/** An entry without a question has no accordion header and is skipped. */
function readFaq(value: unknown): FaqEntry[] {
  return readRecordList(value).flatMap((entry): FaqEntry[] => {
    const question = typeof entry['question'] === 'string' ? entry['question'] : '';
    if (question.trim().length === 0) {
      return [];
    }
    return [{ question, answer: typeof entry['answer'] === 'string' ? entry['answer'] : '' }];
  });
}

export function FaqSection({ section }: SectionComponentProps) {
  const heading = typeof section.props['heading'] === 'string' ? section.props['heading'] : '';
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
              {/* Open by default on purpose: the editor canvas is inert, so a collapsed accordion
                  could never be expanded there and would show only questions. Still collapsible
                  on the published page. */}
              <AccordionItem header={entry.question} body={entry.answer} defaultOpen />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
