import type { ThemeOverride } from '@true-tech-team/react-components';

export const SECTION_TYPES = ['navbar', 'header'] as const;

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
  schemaVersion: 2;
  slug: string;
  title: string;
  templateId: string;
  themeId?: string;
  themeOverride?: ThemeOverride;
  sections: PageSection[];
}
