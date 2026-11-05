import { getThemePreset } from './presets';
import type { PortfolioPage } from '../schema/types';
import type { ThemeMode, ThemeOverride } from '@true-tech-team/react-components';

export function resolveEffectiveTheme(page: PortfolioPage): ThemeOverride | undefined {
  if (page.themeOverride) {
    return page.themeOverride;
  }
  if (page.themeId) {
    return getThemePreset(page.themeId)?.overrides;
  }
  return undefined;
}

/**
 * The light/dark mode a page should render in.
 *
 * Only a preset carries a mode - a `themeOverride` is colours alone - so the preset named by
 * `themeId` decides it even when an override replaces those colours. With no resolvable preset
 * the answer is `light`, which is the library's own default mode.
 */
export function resolveEffectiveMode(page: PortfolioPage): ThemeMode {
  if (!page.themeId) {
    return 'light';
  }
  return getThemePreset(page.themeId)?.mode ?? 'light';
}
