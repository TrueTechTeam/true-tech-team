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
 * So assert the page's mode, and assert it again if anything replaces it. A portfolio only ever
 * renders as a whole document - the published page at `/p/<slug>`, or the editor preview inside
 * its own iframe - so owning `<html>` here is correct in both, and in neither does any other UI
 * share the document.
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
