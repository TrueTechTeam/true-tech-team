import { describe, it, expect } from 'vitest';
import { THEME_PRESETS } from './presets';
import { contrastRatio } from './contrastHelpers';
import type { ThemePreset } from './types';

type ColorKey = keyof NonNullable<ThemePreset['overrides']['colors']>;

// The library has no `textOnSecondary` token (only text-on-primary/error/info/success/warning),
// and nothing in the builder paints text on --theme-secondary, so that pair is not audited.
// borderSecondary vs backgroundPrimary is a decorative separator, exempt (COLOR-6).
const PAIRS: ReadonlyArray<readonly [ColorKey, ColorKey]> = [
  ['textOnPrimary', 'primary'],
  ['textPrimary', 'backgroundPrimary'],
  ['textPrimary', 'surfacePrimary'],
  ['textSecondary', 'backgroundPrimary'],
];

describe('theme preset contrast (WCAG AA 4.5:1)', () => {
  for (const preset of THEME_PRESETS) {
    for (const [fg, bg] of PAIRS) {
      it(`${preset.id}: ${fg} on ${bg}`, () => {
        const colors = preset.overrides.colors ?? {};
        const fgValue = colors[fg];
        const bgValue = colors[bg];
        if (!fgValue || !bgValue) {
          throw new Error(
            `${preset.id}: ${fg} on ${bg} cannot be measured - ${!fgValue ? fg : bg} is not defined by the preset`
          );
        }
        const ratio = contrastRatio(fgValue, bgValue);
        expect(
          ratio,
          `${preset.id}: ${fg} (${fgValue}) on ${bg} (${bgValue}) measured ${ratio.toFixed(2)}:1, needs 4.5:1`
        ).toBeGreaterThanOrEqual(4.5);
      });
    }
  }
});
