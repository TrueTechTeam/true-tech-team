import { getThemePreset } from './presets';
import type { PortfolioPage } from '../schema/types';
import type { ThemeOverride } from '@true-tech-team/react-components';

export function resolveEffectiveTheme(page: PortfolioPage): ThemeOverride | undefined {
  if (page.themeOverride) {
    return page.themeOverride;
  }
  if (page.themeId) {
    return getThemePreset(page.themeId)?.overrides;
  }
  return undefined;
}
