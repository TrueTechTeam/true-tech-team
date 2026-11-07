import type { ColorFamily, ThemeMode, ThemeOverride } from '@true-tech-team/react-components';

export const THEME_MODES = ['light', 'dark'] as const;

/**
 * Narrows an untrusted value to a `ThemeMode`.
 *
 * The stored mode arrives from the `data` JSONB blob, which TypeScript only *claims* is typed -
 * a hand-edited row can hold anything. Every read path narrows through this rather than trusting
 * the declared type, so a junk value degrades to the style's default instead of reaching the
 * library as an unknown mode.
 */
export function isThemeMode(value: unknown): value is ThemeMode {
  return (THEME_MODES as readonly unknown[]).includes(value);
}

export interface ThemePreset {
  id: string;
  name: string;
  mode: ThemeMode;
  overrides: ThemeOverride;
}

/**
 * A theme identity, declared once.
 *
 * A style is the unit a user picks: an id, a display name and the three colour families the
 * formula derives every token from. Both a light and a dark `ThemePreset` are generated from it
 * (see `presets.ts`), so light/dark is a second, independent axis rather than a separate theme.
 *
 * `defaultMode` is what a page renders in when it stores no mode of its own. It is the mode the
 * style was originally authored in, so every row written before the mode axis existed keeps
 * rendering exactly as it did.
 */
export interface ThemeStyle {
  id: string;
  name: string;
  primaryFamily: ColorFamily;
  secondaryFamily: ColorFamily;
  neutralFamily: ColorFamily;
  defaultMode: ThemeMode;
}
