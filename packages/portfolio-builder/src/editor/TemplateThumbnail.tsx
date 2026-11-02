'use client';

import { useMemo } from 'react';
import { PageRenderer } from '../render/PageRenderer';
import { resolveEffectiveTheme } from '../themes/resolveTheme';
import { themeStyleVars } from '../themes/themeStyleVars';
import { buildPageFromTemplate } from '../templates/buildPageFromTemplate';
import type { TemplateDefinition } from '../templates/types';
import styles from './TemplateThumbnail.module.scss';

export interface TemplateThumbnailProps {
  template: TemplateDefinition;
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
 */
export function TemplateThumbnail({ template }: TemplateThumbnailProps) {
  const page = useMemo(
    () => buildPageFromTemplate(template, template.label, 'preview'),
    [template]
  );
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
