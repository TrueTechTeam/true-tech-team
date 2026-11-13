import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';
import { ALL_THEME_PRESETS } from './presets';
import { contrastRatio } from './contrastHelpers';
import type { ThemePreset } from './types';
import { declarations, readScss } from '../testSupport/scss';

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

// Spec 4.6a. The four pairs above had no entry for "brand colour used as text", which is how an
// outline button labelled --theme-primary on the page background (coral on coral-50, 2.34:1; 15 of
// 20 light styles and 2 of 20 dark ones fail) shipped unmeasured. This pair is read from the
// stylesheet rather than restated here: whatever token `.ctaSecondary` uses for its label is
// mapped to its preset colour and measured against the background the button sits on, so changing
// the label to a colour that fails turns these red. (The button is transparent, so its background
// is the page background; its border is a COLOR-6 boundary and is not text.)
const TOKEN_TO_COLOR: Record<string, ColorKey> = {
  '--theme-primary': 'primary',
  '--theme-text-primary': 'textPrimary',
  '--theme-text-secondary': 'textSecondary',
  '--theme-text-on-primary': 'textOnPrimary',
};

describe('outline button label contrast (spec 4.6a)', () => {
  const scss = readScss(resolve(__dirname, '../sections/header/HeaderSection.module.scss'));
  const outline = declarations(scss.rule('.ctaSecondary'));
  const labelToken = /^var\((--[a-z0-9-]+)\)$/.exec(outline.color ?? '')?.[1] ?? '';

  it('reads a known theme token for the outline label, over a transparent background', () => {
    expect(TOKEN_TO_COLOR[labelToken], `unmapped label colour ${outline.color}`).toBeDefined();
    expect(outline.background).toBe('transparent');
  });

  it('does not use the brand colour as text', () => {
    expect(labelToken).not.toBe('--theme-primary');
  });

  for (const preset of ALL_THEME_PRESETS) {
    it(`${preset.id}/${preset.mode}: outline label on backgroundPrimary`, () => {
      const colors = preset.overrides.colors ?? {};
      const key = TOKEN_TO_COLOR[labelToken];
      const fgValue = key ? colors[key] : undefined;
      const bgValue = colors.backgroundPrimary;
      if (!fgValue || !bgValue) {
        throw new Error(`${preset.id}/${preset.mode}: outline label pair cannot be measured`);
      }
      const ratio = contrastRatio(fgValue, bgValue);
      expect(
        ratio,
        `${preset.id}/${preset.mode}: outline label ${labelToken} (${fgValue}) on backgroundPrimary (${bgValue}) measured ${ratio.toFixed(2)}:1, needs 4.5:1`
      ).toBeGreaterThanOrEqual(4.5);
    });
  }
});
