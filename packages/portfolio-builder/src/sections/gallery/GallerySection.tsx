'use client';

import type { CSSProperties } from 'react';
import type { SectionComponentProps } from '../types';
import { backgroundImageValue } from '../cssUrl';
import { readHeading, readRecordList, readText } from '../readProps';
import styles from './GallerySection.module.scss';

interface GalleryImage {
  image: string;
  alt: string;
  caption?: string;
}

/**
 * Reads stored gallery entries defensively. Stored data is untrusted — a hand-edited row or an
 * older client can put anything here — so a non-array reads as empty and an entry without a usable
 * image URL is skipped rather than rendering an empty tile.
 */
function readImages(value: unknown): GalleryImage[] {
  return readRecordList(value).flatMap((entry) => {
    const image = readText(entry['image']);
    if (image.length === 0) {
      return [];
    }
    const caption = readText(entry['caption']);
    return [
      {
        image,
        alt: readText(entry['alt']),
        ...(caption.length > 0 ? { caption } : {}),
      },
    ];
  });
}

export function GallerySection({ section }: SectionComponentProps) {
  const heading = readHeading(section.props);
  const rawColumns = section.props['columns'];
  const columns = rawColumns === 2 || rawColumns === 3 || rawColumns === 4 ? rawColumns : 3;
  const images = readImages(section.props['images']);

  return (
    <div className={styles.gallery}>
      {heading.length > 0 && <h2 className={styles.heading}>{heading}</h2>}
      {images.length === 0 ? (
        <p className={styles.empty}>No images yet.</p>
      ) : (
        <div
          className={styles.grid}
          style={{ '--gallery-columns': String(columns) } as CSSProperties}
        >
          {images.map((entry, index) => (
            // eslint-disable-next-line react/no-array-index-key -- gallery entries have no stable id in stored data; position is their identity and a reorder replaces the whole array
            <figure key={`${entry.image}-${index}`} className={styles.figure}>
              {/* A background image rather than <img> so the 4:3 tile crops consistently.
                  backgroundImageValue quotes and escapes the URL — an unquoted url() breaks on a
                  Supabase storage URL containing ')' or a space. */}
              <div
                className={styles.image}
                role="img"
                aria-label={entry.alt}
                style={{ backgroundImage: backgroundImageValue(entry.image) }}
              />
              {entry.caption && <figcaption className={styles.caption}>{entry.caption}</figcaption>}
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
