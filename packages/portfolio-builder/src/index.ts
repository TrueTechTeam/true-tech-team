export const PORTFOLIO_BUILDER_SCHEMA_VERSION = 2;
export type { PortfolioPage, PageSection, SectionBackground } from './schema/types';
export type { SectionType } from './schema/types';
export { SECTION_TYPES, isSectionType } from './schema/types';
export type { SectionComponentProps, SectionTypeEntry } from './sections/types';
export { SECTION_REGISTRY, getSectionTypeEntry } from './sections/registry';
export { sectionAnchors } from './render/anchors';
export { validatePortfolioPage, validateSectionProps } from './schema/validate';
export type { ValidationResult } from './schema/validate';

export { PageRenderer } from './render/PageRenderer';
export { ThemedPageView } from './render/ThemedPageView';
export type { ThemedPageViewProps } from './render/ThemedPageView';

export { THEME_PRESETS, getThemePreset } from './themes/presets';
export type { ThemePreset } from './themes/types';
export { ThemeDropdown } from './themes/ThemeDropdown';
export type { ThemeDropdownProps } from './themes/ThemeDropdown';

export type { PortfolioAsset } from './assets/types';
export { uploadPortfolioAsset, deletePortfolioAsset, listPortfolioAssets } from './assets/upload';

export type { PortfolioPageRecord } from './pages/types';
export {
  savePortfolioPage,
  loadPortfolioPage,
  loadPortfolioPageBySlug,
  listPortfolioPages,
  deletePortfolioPage,
  setPortfolioPagePublished,
  checkSlugAvailable,
} from './pages/crud';
export { recordToPage } from './pages/mapping';
export { slugify, generateUniqueSlug } from './pages/slug';

export { PortfolioPreviewReceiver } from './preview/PortfolioPreviewReceiver';
export { resolveEffectiveTheme } from './themes/resolveTheme';
export {
  PREVIEW_READY_MESSAGE,
  PREVIEW_UPDATE_MESSAGE,
  isPreviewReadyMessage,
  isPreviewUpdateMessage,
} from './preview/messages';
export type { PreviewReadyMessage, PreviewUpdateMessage } from './preview/messages';
export { PortfolioPreviewFrame } from './preview/PortfolioPreviewFrame';
export type { PortfolioPreviewFrameProps } from './preview/PortfolioPreviewFrame';

export type {
  PropertyFieldType,
  PropertyFieldOption,
  PropertyField,
  PropertySchema,
} from './properties/types';
export { PropertyPanel } from './properties/PropertyPanel';
export type { PropertyPanelProps } from './properties/PropertyPanel';
export { ImageField } from './properties/ImageField';
export type { ImageFieldProps } from './properties/ImageField';
export { IconField } from './properties/IconField';
export type { IconFieldProps } from './properties/IconField';

export { PortfolioPagesList } from './editor/PortfolioPagesList';
export type { PortfolioPagesListProps } from './editor/PortfolioPagesList';
export { PortfolioEditor } from './editor/PortfolioEditor';
export type { PortfolioEditorProps } from './editor/PortfolioEditor';
