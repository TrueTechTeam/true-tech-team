'use client';

import type { SectionComponentProps } from '../types';
import styles from './HeaderSection.module.scss';

interface Cta {
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
  return value.flatMap((entry): Cta[] => {
    if (typeof entry !== 'object' || entry === null) {
      return [];
    }
    const candidate = entry as Record<string, unknown>;
    if (typeof candidate.label !== 'string' || candidate.label.length === 0) {
      return [];
    }
    if (typeof candidate.href !== 'string' || candidate.href.length === 0) {
      return [];
    }
    const variant = candidate.variant === 'secondary' ? 'secondary' : 'primary';
    return [{ label: candidate.label, href: candidate.href, variant }];
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
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : undefined}
    >
      <h1 className={styles.heading}>{heading}</h1>
      {subheading && <p className={styles.subheading}>{subheading}</p>}
      {ctas.length > 0 && (
        <div className={styles.ctas}>
          {ctas.map((cta) => (
            <a
              key={`${cta.label}-${cta.href}`}
              className={cta.variant === 'secondary' ? styles.ctaSecondary : styles.cta}
              href={cta.href}
            >
              {cta.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
