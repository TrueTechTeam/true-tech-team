import type { ThemeOverride } from '@true-tech-team/react-components';

export const COMPONENT_TYPES = [
  'heading',
  'text',
  'image',
  'spacer',
  'card',
  'badge',
  'avatar',
  'chip',
  'pill',
  'icon',
  'statusIndicator',
  'progressBar',
  'circularProgress',
  'kpi',
  'countUp',
  'reveal',
  'collapse',
  'flipCard',
  'carousel',
  'overflowText',
  'truncatedList',
  'button',
  'iconButton',
  'accordion',
  'tabs',
] as const;

export type ComponentType = (typeof COMPONENT_TYPES)[number];

export function isComponentType(value: string): value is ComponentType {
  return (COMPONENT_TYPES as readonly string[]).includes(value);
}

export type SectionBackground = 'primary' | 'secondary' | 'tertiary' | 'transparent';

export interface GridItem {
  id: string;
  component: ComponentType;
  span: number;
  props: Record<string, unknown>;
}

export type RowJustify = 'left' | 'center' | 'right' | 'space-between';
export type RowAlign = 'top' | 'center' | 'bottom' | 'stretch';

export interface SectionRow {
  id: string;
  items: GridItem[];
  justify?: RowJustify;
  align?: RowAlign;
}

export interface PageSection {
  id: string;
  name: string;
  showInNav: boolean;
  background?: SectionBackground;
  rows: SectionRow[];
}

export interface PortfolioPage {
  schemaVersion: 1;
  slug: string;
  title: string;
  templateId: string;
  themeId?: string;
  themeOverride?: ThemeOverride;
  showNav: boolean;
  sections: PageSection[];
}
