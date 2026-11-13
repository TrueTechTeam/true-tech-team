'use client';

import type { ReactNode } from 'react';
import type { SectionComponentProps } from '../types';
import { isSafeHref } from '../safeHref';
import { backgroundImageValue } from '../cssUrl';
import { readHeaderVariant } from './variants';
import styles from './HeaderSection.module.scss';

interface Cta {
  /** Unique among siblings even when two entries are identical. */
  key: string;
  label: string;
  href: string;
  variant: 'primary' | 'secondary';
}

interface Stat {
  /** Unique among siblings even when two entries are identical. */
  key: string;
  value: string;
  label: string;
}

/** Matches `maxItems` on the schema, which only the editor enforces. */
const MAX_STATS = 4;

/**
 * Like `readCtas`: drop entries that are not usable instead of letting one blank the page. Also
 * cap the list, because a hand-edited row can exceed the schema's `maxItems` and blow out the
 * layouts.
 */
function readStats(value: unknown): Stat[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const seen = new Map<string, number>();
  return value
    .flatMap((entry): Stat[] => {
      if (typeof entry !== 'object' || entry === null) {
        return [];
      }
      const candidate = entry as Record<string, unknown>;
      const stat = typeof candidate.value === 'number' ? String(candidate.value) : candidate.value;
      if (typeof stat !== 'string' || stat.trim().length === 0) {
        return [];
      }
      if (typeof candidate.label !== 'string' || candidate.label.trim().length === 0) {
        return [];
      }
      const base = `${stat}-${candidate.label}`;
      const occurrence = seen.get(base) ?? 0;
      seen.set(base, occurrence + 1);
      return [{ key: `${base}-${occurrence}`, value: stat, label: candidate.label }];
    })
    .slice(0, MAX_STATS);
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

function StatList({ stats, className }: { stats: Stat[]; className: string }) {
  // A description list: the label is the term, the number its description. CSS shows the number
  // first (column-reverse); assistive tech reads label then value.
  return (
    <dl className={className}>
      {stats.map((stat) => (
        <div key={stat.key} className={styles.stat}>
          <dt className={styles.statLabel}>{stat.label}</dt>
          <dd className={styles.statValue}>{stat.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function CtaButtons({ ctas, forcePrimary }: { ctas: Cta[]; forcePrimary?: boolean }) {
  if (ctas.length === 0) {
    return null;
  }
  return (
    <div className={styles.ctas}>
      {ctas.map((cta) => (
        <a
          key={cta.key}
          className={
            cta.variant === 'secondary' && !forcePrimary ? styles.ctaSecondary : styles.cta
          }
          href={cta.href}
        >
          {cta.label}
        </a>
      ))}
    </div>
  );
}

export function HeaderSection({ section, page }: SectionComponentProps) {
  const variant = readHeaderVariant(section.props.variant);
  const heading =
    typeof section.props.heading === 'string' && section.props.heading.trim().length > 0
      ? section.props.heading
      : page.title;
  const subheading =
    typeof section.props.subheading === 'string' && section.props.subheading.length > 0
      ? section.props.subheading
      : undefined;
  const eyebrow =
    typeof section.props.eyebrow === 'string' && section.props.eyebrow.trim().length > 0
      ? section.props.eyebrow
      : undefined;
  const backgroundImage =
    typeof section.props.backgroundImage === 'string' && section.props.backgroundImage.length > 0
      ? section.props.backgroundImage
      : undefined;
  const align = section.props.align === 'center' ? 'center' : 'left';
  const ctas = readCtas(section.props.ctas);
  const stats = readStats(section.props.stats);

  const bandClasses = [
    styles.band,
    styles[variant],
    variant === 'plain' && align === 'center' ? styles.centered : '',
    backgroundImage ? styles.hasImage : '',
  ]
    .filter(Boolean)
    .join(' ');

  const headingNode = <h1 className={styles.heading}>{heading}</h1>;
  const subheadingNode = subheading && <p className={styles.subheading}>{subheading}</p>;
  const eyebrowNode = eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>;

  // Each variant uses what it needs and ignores the rest: eyebrow (split, outcome, place),
  // stats (split, outcome, proof), and a CTA cap for the two variants that make a single ask.
  let inner: ReactNode;
  switch (variant) {
    case 'split':
      inner = (
        <div className={styles.splitGrid}>
          <div className={styles.stack}>
            {eyebrowNode}
            {headingNode}
            {subheadingNode}
            <CtaButtons ctas={ctas} />
          </div>
          {stats.length > 0 && <StatList stats={stats} className={styles.facts} />}
        </div>
      );
      break;
    case 'imageBleed':
      inner = (
        <>
          {headingNode}
          {subheadingNode}
          <CtaButtons ctas={ctas.slice(0, 1)} />
        </>
      );
      break;
    case 'outcome':
      inner = (
        <>
          {eyebrowNode}
          {headingNode}
          {subheadingNode}
          {stats.length > 0 && <StatList stats={stats} className={styles.outcomeStats} />}
          <CtaButtons ctas={ctas} />
        </>
      );
      break;
    case 'place':
      inner = (
        <>
          {eyebrowNode}
          {headingNode}
          {subheadingNode}
          {ctas.length > 0 && (
            <ul className={styles.workList}>
              {ctas.map((cta) => (
                <li key={cta.key}>
                  <a className={styles.workLink} href={cta.href}>
                    {cta.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </>
      );
      break;
    case 'proof':
      inner = (
        <>
          {headingNode}
          {subheadingNode}
          {stats.length > 0 && <StatList stats={stats.slice(0, 1)} className={styles.proofStat} />}
          <CtaButtons ctas={ctas.slice(0, 1)} forcePrimary />
        </>
      );
      break;
    default:
      inner = (
        <>
          {headingNode}
          {subheadingNode}
          <CtaButtons ctas={ctas} />
        </>
      );
  }

  return (
    <div
      className={bandClasses}
      data-variant={variant}
      style={
        backgroundImage ? { backgroundImage: backgroundImageValue(backgroundImage) } : undefined
      }
    >
      <div className={styles.content}>{inner}</div>
    </div>
  );
}
