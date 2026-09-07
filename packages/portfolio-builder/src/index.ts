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
export { ThemePicker } from './themes/ThemePicker';
export type { ThemePickerProps } from './themes/ThemePicker';

export type { PortfolioAsset } from './assets/types';
export { uploadPortfolioAsset, deletePortfolioAsset, listPortfolioAssets } from './assets/upload';

export type { PortfolioPageRecord } from './pages/types';
export {
  savePortfolioPage,
  loadPortfolioPage,
  listPortfolioPages,
  deletePortfolioPage,
  setPortfolioPagePublished,
  checkSlugAvailable,
} from './pages/crud';

export { PortfolioPreviewReceiver } from './preview/PortfolioPreviewReceiver';
export { resolveEffectiveTheme } from './themes/resolveTheme';
export { PREVIEW_READY_MESSAGE, PREVIEW_UPDATE_MESSAGE } from './preview/messages';
export type { PreviewReadyMessage, PreviewUpdateMessage } from './preview/messages';
export { PortfolioPreviewFrame } from './preview/PortfolioPreviewFrame';
export type { PortfolioPreviewFrameProps } from './preview/PortfolioPreviewFrame';
