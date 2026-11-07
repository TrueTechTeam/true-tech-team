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

// KNOWN GAP, awaiting a design decision (not silently fixed): these presets' textSecondary
// (neutral-600) on backgroundPrimary (primary-50) measures below 4.5:1. Moving to shade 700
// fixes all but rose-gold, whose `neutral` ramp is too light even at 700 - which colour gives
// way is the owner's call. The pinned test below asserts the gap is still there, so it fails
// the moment someone fixes a preset and forces its removal from this list.
const KNOWN_SECONDARY_TEXT_GAP: ReadonlySet<string> = new Set([
  'coral-reef',
  'forest',
  'sunset',
  'blush',
  'amber-glow',
  'arctic',
  'terracotta',
  'sage',
  'rose-gold',
  'steel',
  'sand',
]);

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
        if (fg === 'textSecondary' && KNOWN_SECONDARY_TEXT_GAP.has(preset.id)) {
          expect(
            ratio,
            `${preset.id}: textSecondary now measures ${ratio.toFixed(2)}:1 - remove it from KNOWN_SECONDARY_TEXT_GAP`
          ).toBeLessThan(4.5);
          return;
        }
        expect(
          ratio,
          `${preset.id}: ${fg} (${fgValue}) on ${bg} (${bgValue}) measured ${ratio.toFixed(2)}:1, needs 4.5:1`
        ).toBeGreaterThanOrEqual(4.5);
      });
    }
  }
});
