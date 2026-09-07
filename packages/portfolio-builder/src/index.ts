export const PORTFOLIO_BUILDER_SCHEMA_VERSION = 1;
export type {
  PortfolioPage,
  PageSection,
  SectionRow,
  GridItem,
  ComponentType,
  SectionBackground,
} from './schema/types';
export { COMPONENT_TYPES, isComponentType } from './schema/types';
export { validatePortfolioPage } from './schema/validate';
export type { ValidationResult } from './schema/validate';
export { collapsedSpans } from './grid/responsive';
export type { CollapsedSpans } from './grid/responsive';
export { getRegistryEntry } from './components/registry';
export type { RegistryEntry } from './components/registry';

export { PageRenderer } from './render/PageRenderer';

export { THEME_PRESETS, getThemePreset } from './themes/presets';
export type { ThemePreset } from './themes/types';
