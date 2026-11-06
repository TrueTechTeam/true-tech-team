'use client';

import { useEffect } from 'react';
import type { ThemeMode } from '@true-tech-team/react-components';

export interface PageThemeModeProps {
  mode: ThemeMode;
}

/**
 * Keeps the document this page owns in the page's own light/dark mode.
 *
 * The library applies a mode by writing `data-theme` on `document.documentElement`, and its
 * `:root[data-theme='dark']` token block only ever matches `<html>` - no nested element can
 * override it. The host app wraps every route in a `GlobalProvider` pinned to dark, and React
 * flushes child effects before parent ones, so the provider a portfolio renders for itself always
 * loses that race: the app's `dark` lands last and forces dark onto a light-themed portfolio.
 *
 * So assert the page's mode, and assert it again if anything replaces it.
 *
 * PRECONDITION: at most one instance per document. Two instances with different modes would each
 * see the other's write as a change to revert and re-write at each other through their observers,
 * without end, hanging the tab. Nothing enforces this, so it is on the caller: render this only
 * from a component that owns the whole document. The two places that do are the published page at
 * `/p/<slug>` and the editor preview, which is only ever loaded inside its own iframe and so has a
 * document of its own; in neither does any other UI share the document.
 *
 * It also deliberately does NOT restore the previous `data-theme` on unmount - only the observer
 * is torn down. That is safe because nothing client-navigates away from a portfolio: the one link
 * to `/p/<slug>` in this app (`PageSettingsDialog`) is an `<a target="_blank">`, so leaving a
 * portfolio is always a full page load that discards the document anyway. Restoring on unmount
 * would be the wrong behaviour for the preview iframe besides, where this component unmounting
 * means a new page is being rendered into the same document.
 */
export function PageThemeMode({ mode }: PageThemeModeProps) {
  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      // Equality check, not an unconditional write: a write of our own would be another mutation
      // record, and re-applying on that would loop forever.
      if (root.getAttribute('data-theme') !== mode) {
        root.setAttribute('data-theme', mode);
      }
    };

    apply();
    const observer = new MutationObserver(apply);
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, [mode]);

  return null;
}
