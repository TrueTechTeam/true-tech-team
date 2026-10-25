import type { PageSection, PortfolioPage, SectionBackground } from '../schema/types';
import { getSectionTypeEntry } from '../sections/registry';
import styles from './Section.module.scss';

const BACKGROUND_CLASS: Record<SectionBackground, string> = {
  primary: styles.backgroundPrimary,
  secondary: styles.backgroundSecondary,
  tertiary: styles.backgroundTertiary,
  transparent: styles.backgroundTransparent,
};

export interface SectionRendererProps {
  section: PageSection;
  page: PortfolioPage;
  anchors: Map<string, string>;
}

export function SectionRenderer({ section, page, anchors }: SectionRendererProps) {
  const entry = getSectionTypeEntry(section.type);
  if (!entry) {
    // Data written by a newer client, or a pre-pivot (schemaVersion 1) row whose sections have
    // no `type` at all. Render nothing rather than throwing - see Review Focus 5: nothing
    // validates on load today, so a v1 page renders blank. Sub-project 5 owns migrating it.
    return null;
  }
  const SectionComponent = entry.component;
  return (
    <section
      id={anchors.get(section.id) ?? section.id}
      aria-label={section.name}
      className={`${styles.section} ${BACKGROUND_CLASS[section.background ?? 'transparent']}`}
      style={{ '--section-min-height': entry.minHeight } as React.CSSProperties}
    >
      <SectionComponent section={section} page={page} anchors={anchors} />
    </section>
  );
}
