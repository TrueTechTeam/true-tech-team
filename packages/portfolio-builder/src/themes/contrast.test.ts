import { describe, it, expect } from 'vitest';
import { ALL_THEME_PRESETS } from './presets';
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

/**
 * Audited across all 40 presets - both modes of all 20 styles - not just the 20 default-mode
 * ones. Light/dark is a user-selectable axis, so the mode a style was not originally authored in
 * is just as reachable as the one it was; auditing only the defaults would leave half the
 * reachable presets unmeasured, which is the exact blind spot the bugs this audit was written for
 * came through.
 *
 * Every preset passes every pair outright. There is deliberately no allowlist, register or
 * expected-failure set here: a style whose families cannot meet 4.5:1 has its FAMILIES changed
 * (that is how `rose-gold` and `plum` both came off the light-running `neutral` ramp), because an
 * exemption list is where a real contrast regression goes to hide.
 */
describe('theme preset contrast (WCAG AA 4.5:1)', () => {
  it('audits both modes of every style', () => {
    expect(ALL_THEME_PRESETS).toHaveLength(40);
  });

  for (const preset of ALL_THEME_PRESETS) {
    for (const [fg, bg] of PAIRS) {
      it(`${preset.id}/${preset.mode}: ${fg} on ${bg}`, () => {
        const colors = preset.overrides.colors ?? {};
        const fgValue = colors[fg];
        const bgValue = colors[bg];
        if (!fgValue || !bgValue) {
          throw new Error(
            `${preset.id}/${preset.mode}: ${fg} on ${bg} cannot be measured - ${!fgValue ? fg : bg} is not defined by the preset`
          );
        }
        const ratio = contrastRatio(fgValue, bgValue);
        expect(
          ratio,
          `${preset.id}/${preset.mode}: ${fg} (${fgValue}) on ${bg} (${bgValue}) measured ${ratio.toFixed(2)}:1, needs 4.5:1`
        ).toBeGreaterThanOrEqual(4.5);
      });
    }
  }
});
