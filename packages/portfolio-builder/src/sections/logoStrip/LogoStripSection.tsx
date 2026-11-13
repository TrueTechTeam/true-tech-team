'use client';

import type { SectionComponentProps } from '../types';
import { backgroundImageValue } from '../cssUrl';
import { isSafeHref } from '../safeHref';
import { readHeading, readRecordList, readText } from '../readProps';
import styles from './LogoStripSection.module.scss';

interface Logo {
  image: string;
  alt: string;
  /** Present only when the stored href passed `isSafeHref`. */
  href?: string;
}

/**
 * An entry without an image URL is skipped. An unsafe href does not drop the logo, it just renders
 * unlinked: the image is still legitimate content.
 */
function readLogos(value: unknown): Logo[] {
  return readRecordList(value).flatMap((entry): Logo[] => {
    const image = readText(entry['image']);
    if (image.length === 0) {
      return [];
    }
    const rawHref = readText(entry['href']).trim();
    return [
      {
        image,
        alt: readText(entry['alt']),
        ...(rawHref.length > 0 && isSafeHref(rawHref) ? { href: rawHref } : {}),
      },
    ];
  });
}

export function LogoStripSection({ section }: SectionComponentProps) {
  const heading = readHeading(section.props);
  const logos = readLogos(section.props['items']);

  return (
    <div className={styles.strip}>
      {heading.length > 0 && <h2 className={styles.heading}>{heading}</h2>}
      {logos.length === 0 ? (
        <p className={styles.empty}>No logos yet.</p>
      ) : (
        <ul className={styles.list}>
          {logos.map((logo, index) => {
            // backgroundImageValue quotes and escapes the URL; see sections/gallery.
            const mark = (
              <div
                className={styles.logo}
                role="img"
                aria-label={logo.alt}
                style={{ backgroundImage: backgroundImageValue(logo.image) }}
              />
            );
            return (
              // eslint-disable-next-line react/no-array-index-key -- logo entries have no stable id in stored data; position is their identity and a reorder replaces the whole array
              <li key={`${logo.image}-${index}`} className={styles.item}>
                {logo.href ? (
                  <a className={styles.link} href={logo.href}>
                    {mark}
                  </a>
                ) : (
                  mark
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
