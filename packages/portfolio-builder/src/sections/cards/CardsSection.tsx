'use client';

import { CardItem } from '../../components/wrappers/card';
import { FlipCardItem } from '../../components/wrappers/expand';
import type { SectionComponentProps } from '../types';
import { readRecordList } from '../readProps';
import styles from './CardsSection.module.scss';

interface CardEntry {
  title: string;
  body: string;
  backText: string;
}

/** An entry without a title has no front face to show and is skipped. */
function readCards(value: unknown): CardEntry[] {
  return readRecordList(value).flatMap((entry): CardEntry[] => {
    const title = typeof entry['title'] === 'string' ? entry['title'] : '';
    if (title.trim().length === 0) {
      return [];
    }
    return [
      {
        title,
        body: typeof entry['body'] === 'string' ? entry['body'] : '',
        backText: typeof entry['backText'] === 'string' ? entry['backText'] : '',
      },
    ];
  });
}

export function CardsSection({ section }: SectionComponentProps) {
  const heading = typeof section.props['heading'] === 'string' ? section.props['heading'] : '';
  const flip = section.props['style'] === 'flip';
  const cards = readCards(section.props['items']);

  return (
    <div className={styles.cards}>
      {heading.length > 0 && <h2 className={styles.heading}>{heading}</h2>}
      {cards.length === 0 ? (
        <p className={styles.empty}>No cards yet.</p>
      ) : (
        <ul className={styles.grid}>
          {cards.map((card, index) => (
            // eslint-disable-next-line react/no-array-index-key -- cards have no stable id in stored data; position is their identity and a reorder replaces the whole array
            <li key={`${card.title}-${index}`} className={styles.item}>
              {flip ? (
                // The editor canvas is inert, so the resting (front) face must carry the title.
                <FlipCardItem frontText={card.title} backText={card.backText || card.body} />
              ) : (
                <CardItem header={card.title} body={card.body} />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
