'use client';

import type { SectionComponentProps } from '../types';
import { isSafeHref } from '../safeHref';
import { readRecordList } from '../readProps';
import styles from './ContactSection.module.scss';

interface ContactLink {
  label: string;
  href: string;
}

/**
 * Builds `mailto:` / `tel:` from a stored value and gates the CONSTRUCTED href. The stored value
 * is whatever a user typed, not a validated address, so it is never trusted as a link target on
 * its own. Returns `undefined` when there is nothing usable to link.
 */
function contactHref(scheme: 'mailto' | 'tel', value: unknown): ContactLink | undefined {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return undefined;
  }
  const trimmed = value.trim();
  const href = `${scheme}:${trimmed}`;
  return isSafeHref(href) ? { label: trimmed, href } : undefined;
}

/** Reads the `links` list; an entry without a label or with an unsafe href is dropped. */
function readLinks(value: unknown): ContactLink[] {
  return readRecordList(value).flatMap((entry): ContactLink[] => {
    const label = entry['label'];
    const href = entry['href'];
    if (typeof label !== 'string' || label.trim().length === 0) {
      return [];
    }
    if (typeof href !== 'string' || !isSafeHref(href)) {
      return [];
    }
    return [{ label, href: href.trim() }];
  });
}

export function ContactSection({ section }: SectionComponentProps) {
  const heading = typeof section.props['heading'] === 'string' ? section.props['heading'] : '';
  const intro = typeof section.props['intro'] === 'string' ? section.props['intro'] : '';
  const email = contactHref('mailto', section.props['email']);
  const phone = contactHref('tel', section.props['phone']);
  const links = readLinks(section.props['links']);
  const hasContacts = email !== undefined || phone !== undefined || links.length > 0;

  return (
    <div className={styles.contact}>
      {heading.length > 0 && <h2 className={styles.heading}>{heading}</h2>}
      {intro.length > 0 && <p className={styles.intro}>{intro}</p>}
      {hasContacts && (
        <ul className={styles.list}>
          {email && (
            <li>
              <a className={styles.link} href={email.href}>
                {email.label}
              </a>
            </li>
          )}
          {phone && (
            <li>
              <a className={styles.link} href={phone.href}>
                {phone.label}
              </a>
            </li>
          )}
          {links.map((link, index) => (
            // eslint-disable-next-line react/no-array-index-key -- link entries have no stable id in stored data; position is their identity and a reorder replaces the whole array
            <li key={`${link.href}-${index}`}>
              <a className={styles.link} href={link.href}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
