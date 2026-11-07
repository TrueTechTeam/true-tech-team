import { buildLightPreset, buildDarkPreset } from './colorFormula';
import type { ThemePreset } from './types';

export const THEME_PRESETS: ThemePreset[] = [
  buildLightPreset('slate', 'Slate', 'blue', 'slate', 'slate'),
  buildLightPreset('coral-reef', 'Coral Reef', 'coral', 'turquoise', 'stone'),
  buildLightPreset('forest', 'Forest', 'green', 'brown', 'stone'),
  buildLightPreset('sunset', 'Sunset', 'orange', 'pink', 'stone'),
  buildLightPreset('ocean', 'Ocean', 'cyan', 'navy', 'slate'),
  buildLightPreset('lavender', 'Lavender', 'violet', 'purple', 'gray'),
  buildLightPreset('blush', 'Blush', 'pink', 'rose', 'stone'),
  buildLightPreset('mint', 'Mint', 'mint', 'teal', 'gray'),
  buildLightPreset('amber-glow', 'Amber Glow', 'amber', 'gold', 'stone'),
  buildLightPreset('arctic', 'Arctic', 'sky', 'cyan', 'zinc'),
  buildLightPreset('terracotta', 'Terracotta', 'brown', 'coral', 'stone'),
  buildLightPreset('sage', 'Sage', 'olive', 'green', 'stone'),
  buildLightPreset('rose-gold', 'Rose Gold', 'rose', 'gold', 'stone'),
  buildLightPreset('steel', 'Steel', 'gray', 'sky', 'zinc'),
  buildLightPreset('sand', 'Sand', 'gold', 'brown', 'stone'),
  buildLightPreset('emerald', 'Emerald', 'emerald', 'teal', 'slate'),
  buildDarkPreset('midnight', 'Midnight', 'blue', 'indigo', 'slate'),
  buildDarkPreset('charcoal', 'Charcoal', 'amber', 'orange', 'zinc'),
  buildDarkPreset('indigo-night', 'Indigo Night', 'violet', 'fuchsia', 'slate'),
  buildDarkPreset('plum', 'Plum', 'magenta', 'purple', 'neutral'),
];

export function getThemePreset(id: string): ThemePreset | undefined {
  return THEME_PRESETS.find((preset) => preset.id === id);
}
