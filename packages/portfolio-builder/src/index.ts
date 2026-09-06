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
