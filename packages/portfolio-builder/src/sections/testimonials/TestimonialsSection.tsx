'use client';

import { AvatarItem } from '../../components/wrappers/avatar';
import type { SectionComponentProps } from '../types';
import { readHeading, readRecordList, readText } from '../readProps';
import styles from './TestimonialsSection.module.scss';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  avatar: string;
}

/** An entry without a quote or an author has nothing to attribute and is skipped. */
function readTestimonials(value: unknown): Testimonial[] {
  return readRecordList(value).flatMap((entry): Testimonial[] => {
    const quote = readText(entry['quote']);
    const author = readText(entry['author']);
    if (quote.trim().length === 0 || author.trim().length === 0) {
      return [];
    }
    return [{ quote, author, role: readText(entry['role']), avatar: readText(entry['avatar']) }];
  });
}

export function TestimonialsSection({ section }: SectionComponentProps) {
  const heading = readHeading(section.props);
  const items = readTestimonials(section.props['items']);

  return (
    <div className={styles.testimonials}>
      {heading.length > 0 && <h2 className={styles.heading}>{heading}</h2>}
      {items.length === 0 ? (
        <p className={styles.empty}>No testimonials yet.</p>
      ) : (
        <ul className={styles.grid}>
          {items.map((item, index) => (
            // eslint-disable-next-line react/no-array-index-key -- testimonials have no stable id in stored data; position is their identity and a reorder replaces the whole array
            <li key={`${item.author}-${index}`} className={styles.item}>
              <figure className={styles.figure}>
                <blockquote className={styles.quote}>{item.quote}</blockquote>
                <figcaption className={styles.attribution}>
                  {/* Omitted, not rendered empty, when there is no avatar: no broken image. */}
                  {item.avatar.length > 0 && <AvatarItem src={item.avatar} alt={item.author} />}
                  <span className={styles.who}>
                    <span className={styles.author}>{item.author}</span>
                    {item.role.length > 0 && <span className={styles.role}>{item.role}</span>}
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
