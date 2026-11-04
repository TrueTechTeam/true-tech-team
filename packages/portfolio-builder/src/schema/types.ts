import type { ThemeOverride } from '@true-tech-team/react-components';

export const SECTION_TYPES = [
  'navbar',
  'header',
  'gallery',
  'richText',
  'contact',
  'timeline',
] as const;

/** The schema version this code reads and writes. */
export const CURRENT_SCHEMA_VERSION = 2;

/** Version assigned to a stored row that predates the section-type pivot (no stored version). */
export const PRE_PIVOT_SCHEMA_VERSION = 1;

export type SectionType = (typeof SECTION_TYPES)[number];

export function isSectionType(value: string): value is SectionType {
  return (SECTION_TYPES as readonly string[]).includes(value);
}

export type SectionBackground = 'primary' | 'secondary' | 'tertiary' | 'transparent';

export interface PageSection {
  /** Stable identity, used for reorder/remove. NOT the anchor - see `render/anchors.ts`. */
  id: string;
  type: SectionType;
  /** Nav label and the source of the scroll anchor. */
  name: string;
  showInNav: boolean;
  background?: SectionBackground;
  /** Type-specific configuration and content, shaped by the type's `propertySchema`. */
  props: Record<string, unknown>;
}

export interface PortfolioPage {
  /**
   * Persisted per row. Normally `CURRENT_SCHEMA_VERSION`; a row loaded from the database that
   * predates the pivot carries `PRE_PIVOT_SCHEMA_VERSION` so it stays detectable.
   */
  schemaVersion: number;
  slug: string;
  title: string;
  templateId: string;
  themeId?: string;
  themeOverride?: ThemeOverride;
  sections: PageSection[];
}
