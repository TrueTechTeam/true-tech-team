'use client';

import type { SectionComponentProps } from '../types';
import { isSafeHref } from '../safeHref';
import { backgroundImageValue } from '../cssUrl';
import styles from './HeaderSection.module.scss';

interface Cta {
  /** Unique among siblings even when two entries are identical. */
  key: string;
  label: string;
  href: string;
  variant: 'primary' | 'secondary';
}

/**
 * `props.ctas` comes from a `list` property field, so its entries are only as well-formed as
 * whatever wrote them (a template, the sub-project-2 editor, or hand-edited JSON). Drop entries
 * that are not usable rather than letting one bad row blank the whole page.
 */
function readCtas(value: unknown): Cta[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const seen = new Map<string, number>();
  return value.flatMap((entry): Cta[] => {
    if (typeof entry !== 'object' || entry === null) {
      return [];
    }
    const candidate = entry as Record<string, unknown>;
    if (typeof candidate.label !== 'string' || candidate.label.length === 0) {
      return [];
    }
    if (typeof candidate.href !== 'string' || !isSafeHref(candidate.href)) {
      return [];
    }
    const variant = candidate.variant === 'secondary' ? 'secondary' : 'primary';
    const href = candidate.href.trim();
    const base = `${candidate.label}-${href}`;
    const occurrence = seen.get(base) ?? 0;
    seen.set(base, occurrence + 1);
    return [{ key: `${base}-${occurrence}`, label: candidate.label, href, variant }];
  });
}

export function HeaderSection({ section, page }: SectionComponentProps) {
  const heading =
    typeof section.props.heading === 'string' && section.props.heading.trim().length > 0
      ? section.props.heading
      : page.title;
  const subheading =
    typeof section.props.subheading === 'string' ? section.props.subheading : undefined;
  const backgroundImage =
    typeof section.props.backgroundImage === 'string' && section.props.backgroundImage.length > 0
      ? section.props.backgroundImage
      : undefined;
  const align = section.props.align === 'center' ? 'center' : 'left';
  const ctas = readCtas(section.props.ctas);

  return (
    <div
      className={align === 'center' ? styles.headerCenter : styles.header}
      style={
        backgroundImage ? { backgroundImage: backgroundImageValue(backgroundImage) } : undefined
      }
    >
      <div className={styles.content}>
        <h1 className={styles.heading}>{heading}</h1>
        {subheading && <p className={styles.subheading}>{subheading}</p>}
        {ctas.length > 0 && (
          <div className={styles.ctas}>
            {ctas.map((cta) => (
              <a
                key={cta.key}
                className={cta.variant === 'secondary' ? styles.ctaSecondary : styles.cta}
                href={cta.href}
              >
                {cta.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
