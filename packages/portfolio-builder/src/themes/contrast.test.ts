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
 * Pairs that do NOT meet 4.5:1 today, recorded rather than exempted.
 *
 * `plum`'s neutral family is `neutral`, whose ramp runs about two steps lighter than every other
 * neutral family - `neutral-700` is #999 where `stone-700` is #6e665c. In dark mode that is
 * harmless (the dark builder reads 300/50), but in light mode secondary text lands on #999 over
 * a near-white canvas: 2.67:1. `rose-gold` hit the same palette quirk and was moved off
 * `neutral`; doing that to `plum` is a colour change, and which colour gives way is a product
 * decision, not this test's. So the measurement is pinned here instead of hidden.
 *
 * Each entry asserts the pair STILL fails. Correcting the colour therefore turns this test red
 * and forces the entry to be deleted - the register cannot rot into a silent exemption.
 */
const KNOWN_FAILURES: ReadonlySet<string> = new Set([
  'plum/light: textSecondary on backgroundPrimary',
]);

function keyOf(preset: ThemePreset, fg: ColorKey, bg: ColorKey): string {
  return `${preset.id}/${preset.mode}: ${fg} on ${bg}`;
}

/**
 * Audited across all 40 presets - both modes of all 20 styles - not just the 20 default-mode
 * ones. Light/dark is a user-selectable axis, so the mode a style was not originally authored in
 * is just as reachable as the one it was; auditing only the defaults would leave half the
 * reachable presets unmeasured, which is the exact blind spot the two bugs this audit was written
 * for came through.
 */
describe('theme preset contrast (WCAG AA 4.5:1)', () => {
  it('audits both modes of every style', () => {
    expect(ALL_THEME_PRESETS).toHaveLength(40);
  });

  for (const preset of ALL_THEME_PRESETS) {
    for (const [fg, bg] of PAIRS) {
      const key = keyOf(preset, fg, bg);
      const known = KNOWN_FAILURES.has(key);

      it(`${key}${known ? ' (known failure)' : ''}`, () => {
        const colors = preset.overrides.colors ?? {};
        const fgValue = colors[fg];
        const bgValue = colors[bg];
        if (!fgValue || !bgValue) {
          throw new Error(
            `${key} cannot be measured - ${!fgValue ? fg : bg} is not defined by the preset`
          );
        }
        const ratio = contrastRatio(fgValue, bgValue);
        const measured = `${fg} (${fgValue}) on ${bg} (${bgValue}) measured ${ratio.toFixed(2)}:1`;

        if (known) {
          expect(
            ratio,
            `${key}: ${measured} - this pair is in KNOWN_FAILURES but now PASSES. If the colour was fixed, delete its entry from KNOWN_FAILURES.`
          ).toBeLessThan(4.5);
          return;
        }

        expect(ratio, `${key}: ${measured}, needs 4.5:1`).toBeGreaterThanOrEqual(4.5);
      });
    }
  }

  it('has no stale entries in KNOWN_FAILURES', () => {
    const audited = new Set(
      ALL_THEME_PRESETS.flatMap((preset) => PAIRS.map(([fg, bg]) => keyOf(preset, fg, bg)))
    );
    const stale = [...KNOWN_FAILURES].filter((key) => !audited.has(key));
    expect(stale, `KNOWN_FAILURES names pairs that are not audited: ${stale.join(', ')}`).toEqual(
      []
    );
  });
});
