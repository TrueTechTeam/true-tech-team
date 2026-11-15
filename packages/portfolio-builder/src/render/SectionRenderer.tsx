import type { PageSection, PortfolioPage, SectionBackground } from '../schema/types';
import { getSectionTypeEntry } from '../sections/registry';
import { hasSectionContent } from './sectionContent';
import styles from './Section.module.scss';

const BACKGROUND_CLASS: Record<SectionBackground, string> = {
  primary: styles.backgroundPrimary,
  secondary: styles.backgroundSecondary,
  tertiary: styles.backgroundTertiary,
  transparent: styles.backgroundTransparent,
};

/**
 * Hero types. A hero is meant to fill the viewport, so it keeps its `minHeight` even when
 * populated, and it paints its own full-width band (background image) and constrains its own
 * content, so the shell must not constrain it.
 */
const HERO_TYPES: ReadonlySet<string> = new Set(['header']);

export interface SectionRendererProps {
  section: PageSection;
  page: PortfolioPage;
  anchors: Map<string, string>;
  /**
   * True for the first section of the page. The divider between sections is drawn on every
   * section but this one. A signal rather than `:first-child` because the editor wraps each
   * section in its own element, so sibling position says nothing there.
   */
  isFirst?: boolean;
}

export function SectionRenderer({ section, page, anchors, isFirst }: SectionRendererProps) {
  const entry = getSectionTypeEntry(section.type);
  if (!entry) {
    // Data written by a newer client, or a pre-pivot (schemaVersion 1) row whose sections have
    // no `type` at all. Render nothing rather than throwing - see Review Focus 5: nothing
    // validates on load today, so a v1 page renders blank. Sub-project 5 owns migrating it.
    return null;
  }
  const SectionComponent = entry.component;
  const content = <SectionComponent section={section} page={page} anchors={anchors} />;

  // Page chrome renders bare, in its normal position among the sections. The shell would clamp
  // a sticky navbar to its own height and nest <header role="banner"> inside a <section
  // role="region">. See `SectionTypeMeta.chrome`.
  if (entry.chrome) {
    return content;
  }

  // `minHeight` is a floor for an empty section; a populated one sizes to its content.
  const reserveHeight =
    HERO_TYPES.has(section.type) || !hasSectionContent(entry.propertySchema, section.props);
  const style = (
    reserveHeight ? { '--section-min-height': entry.minHeight } : {}
  ) as React.CSSProperties;

  return (
    <section
      id={anchors.get(section.id) ?? section.id}
      aria-label={section.name}
      className={`${styles.section} ${BACKGROUND_CLASS[section.background ?? 'transparent']}`}
      data-first={isFirst ? 'true' : undefined}
      style={style}
    >
      <div className={HERO_TYPES.has(section.type) ? styles.innerBleed : styles.inner}>
        {content}
      </div>
    </section>
  );
}
