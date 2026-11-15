import type { CSSProperties } from 'react';
import type { ThemeOverride } from '@true-tech-team/react-components';

/**
 * Converts a resolved theme's colors into the same `--theme-*` CSS custom
 * properties `GlobalProvider` would set on `document.documentElement` -
 * scoped instead to whatever element this style object is applied to, via
 * normal CSS custom-property inheritance. Lets a subtree preview a page
 * theme without mutating the document root.
 */
export function themeStyleVars(theme: ThemeOverride | undefined): CSSProperties {
  const colors = theme?.colors;
  if (!colors) {
    return {};
  }
  const vars: Record<string, string> = {};
  for (const [key, value] of Object.entries(colors)) {
    if (value) {
      const cssVar = `--theme-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      vars[cssVar] = value;
    }
  }
  return vars as CSSProperties;
}
