export { CURRENT_SCHEMA_VERSION, PRE_PIVOT_SCHEMA_VERSION } from './schema/types';
export type { PortfolioPage, PageSection, SectionBackground } from './schema/types';
export type { SectionType } from './schema/types';
export { SECTION_TYPES, isSectionType } from './schema/types';
export type { SectionComponentProps, SectionTypeEntry, SectionTypeMeta } from './sections/types';
export { SECTION_META, getSectionTypeMeta } from './sections/meta';
export { SECTION_REGISTRY, getSectionTypeEntry } from './sections/registry';
export { sectionAnchors } from './render/anchors';
export { validatePortfolioPage, validateSectionProps } from './schema/validate';
export type { ValidationResult } from './schema/validate';

export { PageRenderer } from './render/PageRenderer';
export { ThemedPageView } from './render/ThemedPageView';
export type { ThemedPageViewProps } from './render/ThemedPageView';

// THEME_STYLES is the selection list (20 styles); getThemePreset(styleId, mode?) addresses the
// 40 presets behind it. THEME_PRESETS stays at one default-mode preset per style - see presets.ts.
export { THEME_PRESETS, THEME_STYLES, getThemePreset, getThemeStyle } from './themes/presets';
export { THEME_MODES, isThemeMode, type ThemePreset, type ThemeStyle } from './themes/types';
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
export { resolveEffectiveTheme, resolveEffectiveMode } from './themes/resolveTheme';
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
