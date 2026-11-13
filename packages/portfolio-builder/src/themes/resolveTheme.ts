import { getThemePreset, getThemeStyle } from './presets';
import { isThemeMode } from './types';
import type { PortfolioPage } from '../schema/types';
import type { ThemeMode, ThemeOverride } from '@true-tech-team/react-components';

export function resolveEffectiveTheme(page: PortfolioPage): ThemeOverride | undefined {
  if (page.themeOverride) {
    return page.themeOverride;
  }
  if (page.themeId) {
    // The mode picks which of the style's two presets supplies the colours, so it has to be
    // resolved first - otherwise a dark page would be painted with the light preset's tokens.
    return getThemePreset(page.themeId, resolveEffectiveMode(page))?.overrides;
  }
  return undefined;
}

/**
 * The light/dark mode a page should render in.
 *
 * The chain is: the page's own stored mode, else the named style's `defaultMode`, else `light`
 * (the library's own default, used when no style resolves at all).
 *
 * Every link is defensive, because this runs on the published page's pre-paint path and on a
 * blob that TypeScript only claims is typed:
 * - a stored mode that is neither `light` nor `dark` - a hand-edited row - is ignored rather
 *   than forwarded, falling through to the style's default
 * - a `themeId` naming no known style falls through to `light`
 *
 * It therefore never throws. A `themeOverride` is colours alone and carries no mode, so it does
 * not enter this decision: the style named by `themeId` still decides, rather than silently
 * inverting a dark page to light.
 */
export function resolveEffectiveMode(page: PortfolioPage): ThemeMode {
  if (isThemeMode(page.themeMode)) {
    return page.themeMode;
  }
  if (!page.themeId) {
    return 'light';
  }
  return getThemeStyle(page.themeId)?.defaultMode ?? 'light';
}
