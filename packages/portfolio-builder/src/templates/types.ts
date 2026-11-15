import type { SectionBackground, SectionType } from '../schema/types';

/**
 * One section a template seeds.
 *
 * `props` is merged OVER the section type's own `defaultProps` rather than replacing them, so a
 * template states only what it overrides. That keeps templates short and stops them going stale
 * when a section type gains a new property.
 */
export interface TemplateSection {
  type: SectionType;
  name: string;
  showInNav: boolean;
  background?: SectionBackground;
  props?: Record<string, unknown>;
}

/**
 * A starting point for a new page: a theme plus an outline of named sections.
 *
 * Deliberately React-free. This is plain data and must stay importable from anywhere, for the same
 * reason section metadata does.
 */
export interface TemplateDefinition {
  /** Stored on the page as `templateId`. Stable — never rename a shipped id. */
  id: string;
  /** Card title in the picker. */
  label: string;
  /** One sentence shown under the selected card. */
  description: string;
  /** A `THEME_PRESETS` id; becomes the page's initial `themeId`. */
  themeId: string;
  sections: TemplateSection[];
}
