'use client';

import { useMemo } from 'react';
import type { ThemeMode } from '@true-tech-team/react-components';
import { PageRenderer } from '../render/PageRenderer';
import { resolveEffectiveTheme } from '../themes/resolveTheme';
import { themeStyleVars } from '../themes/themeStyleVars';
import { buildPageFromTemplate } from '../templates/buildPageFromTemplate';
import type { TemplateDefinition } from '../templates/types';
import styles from './TemplateThumbnail.module.scss';

export interface TemplateThumbnailProps {
  template: TemplateDefinition;
  /**
   * The light/dark mode to preview in. Omitted means the template's style default, which is what
   * `resolveEffectiveMode` falls back to for a page that stores no mode.
   */
  mode?: ThemeMode;
}

/**
 * A live, scaled-down render of a template.
 *
 * Builds the template's real page and renders it through the untouched `PageRenderer` at a fixed
 * virtual viewport (see the scss), shrunk with a CSS transform, so the thumbnail can never drift
 * from the template. Rendered directly rather than in an iframe: six iframes in one dialog would
 * mean six route loads.
 *
 * Inert by construction: `aria-hidden` keeps assistive tech on the card's label, and
 * `pointer-events: none` sends every click to the card button (a nested CTA inside a button is
 * invalid markup).
 *
 * The mode reaches the render through the page itself, not through a second code path: the built
 * page carries `themeMode`, so `resolveEffectiveTheme` picks the style's dark or light preset and
 * `themeStyleVars` emits that preset's `--theme-*` values - exactly what `EditorCanvas` does. A
 * `data-theme` attribute is deliberately NOT set here: the library's mode token block is
 * `:root`-scoped, so it would be inert on a nested element, and writing it on the document would
 * recolour the dialog around the thumbnails.
 */
export function TemplateThumbnail({ template, mode }: TemplateThumbnailProps) {
  const page = useMemo(() => {
    const built = buildPageFromTemplate(template, template.label, 'preview');
    return mode ? { ...built, themeMode: mode } : built;
  }, [template, mode]);
  const themeVars = useMemo(() => themeStyleVars(resolveEffectiveTheme(page)), [page]);

  return (
    <div
      className={styles.frame}
      aria-hidden="true"
      data-testid={`template-thumbnail-${template.id}`}
    >
      <div className={styles.page} style={themeVars} data-testid="template-thumbnail-page">
        <PageRenderer page={page} />
      </div>
    </div>
  );
}
