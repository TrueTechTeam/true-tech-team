'use client';

import type { MouseEvent } from 'react';
import { SectionRenderer } from '../render/SectionRenderer';
import { sectionAnchors } from '../render/anchors';
import { resolveEffectiveTheme } from '../themes/resolveTheme';
import { themeStyleVars } from '../themes/themeStyleVars';
import type { PortfolioPage } from '../schema/types';
import styles from './EditorCanvas.module.scss';

export interface EditorCanvasProps {
  page: PortfolioPage;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/**
 * The live, selectable preview.
 *
 * Iterates `page.sections` and renders each `SectionRenderer` itself rather than calling
 * `PageRenderer`, so the public render path stays server-renderable and free of editor concerns.
 * See the design doc 4.1 - the handful of duplicated iteration lines is deliberate, and
 * `EditorCanvas.test.tsx` pins the invariant.
 */
export function EditorCanvas({ page, selectedId, onSelect }: EditorCanvasProps) {
  const anchors = sectionAnchors(page.sections);

  function handleSectionClick(event: MouseEvent<HTMLDivElement>, id: string) {
    // The canvas is a preview, not a live page: a click on a CTA or a nav link selects the
    // section instead of navigating away from the editor. This runs in the capture phase and
    // stops propagation so a section's own handler (e.g. the navbar's history.pushState) never
    // runs and cannot rewrite the editor's URL or history.
    event.preventDefault();
    event.stopPropagation();
    onSelect(id);
  }

  return (
    <div
      className={styles.canvas}
      data-testid="canvas-background"
      style={themeStyleVars(resolveEffectiveTheme(page))}
    >
      {page.sections.length === 0 && (
        <p className={styles.empty}>Nothing here yet. Add a section to get started.</p>
      )}
      {page.sections.map((section) => (
        <div
          key={section.id}
          className={styles.section}
          data-testid={`canvas-section-${section.id}`}
          data-selected={section.id === selectedId ? 'true' : undefined}
          onClickCapture={(event) => handleSectionClick(event, section.id)}
        >
          <SectionRenderer section={section} page={page} anchors={anchors} />
        </div>
      ))}
    </div>
  );
}
