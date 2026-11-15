import { buildLightPreset, buildDarkPreset } from './colorFormula';
import { isThemeMode, type ThemePreset, type ThemeStyle } from './types';
import type { ColorFamily, ThemeMode } from '@true-tech-team/react-components';

function style(
  id: string,
  name: string,
  primaryFamily: ColorFamily,
  secondaryFamily: ColorFamily,
  neutralFamily: ColorFamily,
  defaultMode: ThemeMode
): ThemeStyle {
  return { id, name, primaryFamily, secondaryFamily, neutralFamily, defaultMode };
}

/**
 * The 20 theme styles, each declared once.
 *
 * This is the *selection* list: what the theme dropdown offers and what a page's `themeId` names.
 * Light/dark is a separate axis, so there are 20 rows here and 40 presets behind them - never two
 * rows sharing an id.
 *
 * Ids and names are frozen: a stored `themeId` must keep resolving. `defaultMode` records the
 * mode each style was originally authored in, which is what a page with no stored mode renders.
 */
export const THEME_STYLES: ThemeStyle[] = [
  style('slate', 'Slate', 'blue', 'slate', 'slate', 'light'),
  style('coral-reef', 'Coral Reef', 'coral', 'turquoise', 'stone', 'light'),
  style('forest', 'Forest', 'green', 'brown', 'stone', 'light'),
  style('sunset', 'Sunset', 'orange', 'pink', 'stone', 'light'),
  style('ocean', 'Ocean', 'cyan', 'navy', 'slate', 'light'),
  style('lavender', 'Lavender', 'violet', 'purple', 'gray', 'light'),
  style('blush', 'Blush', 'pink', 'rose', 'stone', 'light'),
  style('mint', 'Mint', 'mint', 'teal', 'gray', 'light'),
  style('amber-glow', 'Amber Glow', 'amber', 'gold', 'stone', 'light'),
  style('arctic', 'Arctic', 'sky', 'cyan', 'zinc', 'light'),
  style('terracotta', 'Terracotta', 'brown', 'coral', 'stone', 'light'),
  style('sage', 'Sage', 'olive', 'green', 'stone', 'light'),
  // Neutral family is `stone`, not `neutral`: `neutral`'s ramp runs two steps light (700 is
  // #999), which failed the secondary-text audit. Do not "restore" it - see contrast.test.ts.
  style('rose-gold', 'Rose Gold', 'rose', 'gold', 'stone', 'light'),
  style('steel', 'Steel', 'gray', 'sky', 'zinc', 'light'),
  style('sand', 'Sand', 'gold', 'brown', 'stone', 'light'),
  style('emerald', 'Emerald', 'emerald', 'teal', 'slate', 'light'),
  style('midnight', 'Midnight', 'blue', 'indigo', 'slate', 'dark'),
  style('charcoal', 'Charcoal', 'amber', 'orange', 'zinc', 'dark'),
  style('indigo-night', 'Indigo Night', 'violet', 'fuchsia', 'slate', 'dark'),
  // Neutral family is `gray`, not `neutral`, for the same reason as `rose-gold` above: on
  // `neutral` this style's LIGHT mode measured 2.67:1 for secondary text (neutral-700 #999 on
  // magenta-50 #fff5fa). `gray` measures 7.93:1 light / 10.84:1 dark - chosen over `zinc` (4.78)
  // and `stone` (5.30, and warm enough to fight the magenta) for the headroom, and because
  // `lavender` already pairs `gray` with this same violet/purple colour region.
  style('plum', 'Plum', 'magenta', 'purple', 'gray', 'dark'),
];

interface StyleEntry {
  style: ThemeStyle;
  presets: Record<ThemeMode, ThemePreset>;
}

const STYLE_ENTRIES: StyleEntry[] = THEME_STYLES.map((entry) => ({
  style: entry,
  presets: {
    light: buildLightPreset(
      entry.id,
      entry.name,
      entry.primaryFamily,
      entry.secondaryFamily,
      entry.neutralFamily
    ),
    dark: buildDarkPreset(
      entry.id,
      entry.name,
      entry.primaryFamily,
      entry.secondaryFamily,
      entry.neutralFamily
    ),
  },
}));

const ENTRIES_BY_ID: ReadonlyMap<string, StyleEntry> = new Map(
  STYLE_ENTRIES.map((entry) => [entry.style.id, entry])
);

/**
 * One preset per style, in that style's default mode - 20 entries, one per `THEME_STYLES` row.
 *
 * Deliberately NOT all 40: this array is keyed by id by every consumer that reads it, and two
 * rows per id would make `find(p => p.id === x)` ambiguous. Address a specific mode with
 * `getThemePreset(styleId, mode)` instead.
 */
export const THEME_PRESETS: ThemePreset[] = STYLE_ENTRIES.map(
  (entry) => entry.presets[entry.style.defaultMode]
);

/**
 * All 40 presets, both modes of every style. Not part of the package's public surface - it exists
 * so the contrast audit can measure every preset a user can actually reach, including the mode
 * each style was not originally authored in.
 */
export const ALL_THEME_PRESETS: ThemePreset[] = STYLE_ENTRIES.flatMap((entry) => [
  entry.presets.light,
  entry.presets.dark,
]);

export function getThemeStyle(styleId: string): ThemeStyle | undefined {
  return ENTRIES_BY_ID.get(styleId)?.style;
}

/**
 * The preset for a style in a given mode.
 *
 * `mode` omitted - or holding anything other than `'light'` / `'dark'`, which a hand-edited row
 * can - means the style's own `defaultMode`. An unknown `styleId` is `undefined`; this never
 * throws, because it sits on the published-page render path.
 */
export function getThemePreset(styleId: string, mode?: ThemeMode): ThemePreset | undefined {
  const entry = ENTRIES_BY_ID.get(styleId);
  if (!entry) {
    return undefined;
  }
  return entry.presets[isThemeMode(mode) ? mode : entry.style.defaultMode];
}
