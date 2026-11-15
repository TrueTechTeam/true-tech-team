import { describe, it, expect } from 'vitest';
import {
  ALL_THEME_PRESETS,
  THEME_PRESETS,
  THEME_STYLES,
  getThemePreset,
  getThemeStyle,
} from './presets';

/** The ids stored on real rows. Frozen: any change here orphans someone's saved page. */
const EXPECTED_IDS = [
  'slate',
  'coral-reef',
  'forest',
  'sunset',
  'ocean',
  'lavender',
  'blush',
  'mint',
  'amber-glow',
  'arctic',
  'terracotta',
  'sage',
  'rose-gold',
  'steel',
  'sand',
  'emerald',
  'midnight',
  'charcoal',
  'indigo-night',
  'plum',
];

const DARK_BY_DEFAULT = ['midnight', 'charcoal', 'indigo-night', 'plum'];

describe('THEME_STYLES', () => {
  it('declares exactly 20 styles', () => {
    expect(THEME_STYLES).toHaveLength(20);
  });

  it('keeps every id that a stored themeId could name, in order', () => {
    expect(THEME_STYLES.map((style) => style.id)).toEqual(EXPECTED_IDS);
  });

  it('has unique ids', () => {
    const ids = THEME_STYLES.map((style) => style.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every style a non-empty display name', () => {
    for (const style of THEME_STYLES) {
      expect(style.name, style.id).not.toBe('');
    }
  });

  it('keeps the display names that were already shown to users', () => {
    expect(getThemeStyle('rose-gold')?.name).toBe('Rose Gold');
    expect(getThemeStyle('indigo-night')?.name).toBe('Indigo Night');
    expect(getThemeStyle('amber-glow')?.name).toBe('Amber Glow');
  });

  it('defaults the four originally-dark styles to dark and all others to light', () => {
    const dark = THEME_STYLES.filter((style) => style.defaultMode === 'dark').map((s) => s.id);
    expect(dark).toEqual(DARK_BY_DEFAULT);
    expect(THEME_STYLES.filter((style) => style.defaultMode === 'light')).toHaveLength(16);
  });

  // Both of these were moved off the `neutral` family because its ramp runs ~2 steps light
  // (neutral-700 is #999) and failed the secondary-text audit. Pinned so a refactor cannot
  // quietly restore it - no style should use `neutral` until that ramp changes.
  it('keeps rose-gold on the stone neutral family', () => {
    expect(getThemeStyle('rose-gold')?.neutralFamily).toBe('stone');
  });

  it('keeps plum on the gray neutral family', () => {
    expect(getThemeStyle('plum')?.neutralFamily).toBe('gray');
  });

  it('puts no style on the light-running neutral family', () => {
    const onNeutral = THEME_STYLES.filter((style) => style.neutralFamily === 'neutral');
    expect(onNeutral.map((style) => style.id)).toEqual([]);
  });
});

describe('THEME_PRESETS', () => {
  // Not 40. This array is keyed by id by everything that reads it, so two rows per id would make
  // lookup-by-id ambiguous - that is why the mode axis is addressed through getThemePreset.
  it('has one default-mode preset per style, 20 in all', () => {
    expect(THEME_PRESETS).toHaveLength(20);
    expect(THEME_PRESETS.map((preset) => preset.id)).toEqual(EXPECTED_IDS);
  });

  it('has unique ids', () => {
    const ids = THEME_PRESETS.map((preset) => preset.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('holds each style in its default mode: 16 light, 4 dark', () => {
    expect(THEME_PRESETS.filter((preset) => preset.mode === 'light')).toHaveLength(16);
    expect(THEME_PRESETS.filter((preset) => preset.mode === 'dark')).toHaveLength(4);
    for (const style of THEME_STYLES) {
      const preset = THEME_PRESETS.find((candidate) => candidate.id === style.id);
      expect(preset?.mode, style.id).toBe(style.defaultMode);
    }
  });
});

describe('ALL_THEME_PRESETS', () => {
  it('generates both modes of every style', () => {
    expect(ALL_THEME_PRESETS).toHaveLength(40);
    for (const style of THEME_STYLES) {
      const forStyle = ALL_THEME_PRESETS.filter((preset) => preset.id === style.id);
      expect(forStyle.map((preset) => preset.mode).sort(), style.id).toEqual(['dark', 'light']);
    }
  });

  it('carries the style name onto both of its presets', () => {
    for (const preset of ALL_THEME_PRESETS) {
      expect(preset.name, `${preset.id}/${preset.mode}`).toBe(getThemeStyle(preset.id)?.name);
    }
  });

  it('gives every preset a textOnPrimary, so no preset can inherit a near-black button label', () => {
    for (const preset of ALL_THEME_PRESETS) {
      expect(preset.overrides.colors?.textOnPrimary, `${preset.id}/${preset.mode}`).toBeDefined();
    }
  });
});

describe('dark presets', () => {
  it('keep the canvas darker than the surface (elevation goes lighter, COLOR-4)', () => {
    const shade = (v?: string) => Number(/-(\d+)\)$/.exec(v ?? '')?.[1]);
    const dark = ALL_THEME_PRESETS.filter((preset) => preset.mode === 'dark');
    expect(dark).toHaveLength(20);
    for (const preset of dark) {
      const c = preset.overrides.colors;
      // In a dark ramp a larger shade number is darker.
      expect(shade(c?.backgroundPrimary), preset.id).toBeGreaterThan(shade(c?.surfacePrimary));
    }
  });
});

describe('getThemeStyle', () => {
  it('resolves every declared style id', () => {
    for (const style of THEME_STYLES) {
      expect(getThemeStyle(style.id)).toBe(style);
    }
  });

  it('returns undefined for an unknown id', () => {
    expect(getThemeStyle('not-a-real-id')).toBeUndefined();
  });
});

describe('getThemePreset', () => {
  it('resolves every declared style id to its default-mode preset when mode is omitted', () => {
    for (const style of THEME_STYLES) {
      const preset = getThemePreset(style.id);
      expect(preset?.id, style.id).toBe(style.id);
      expect(preset?.mode, style.id).toBe(style.defaultMode);
    }
  });

  it('returns the same object the default-mode list holds', () => {
    for (const preset of THEME_PRESETS) {
      expect(getThemePreset(preset.id)).toBe(preset);
    }
  });

  it('returns undefined for an unknown id, in either mode', () => {
    expect(getThemePreset('not-a-real-id')).toBeUndefined();
    expect(getThemePreset('not-a-real-id', 'light')).toBeUndefined();
    expect(getThemePreset('not-a-real-id', 'dark')).toBeUndefined();
  });

  it('serves an explicit mode for every style, including the one it was not authored in', () => {
    for (const style of THEME_STYLES) {
      expect(getThemePreset(style.id, 'light')?.mode, style.id).toBe('light');
      expect(getThemePreset(style.id, 'dark')?.mode, style.id).toBe('dark');
    }
  });

  it('returns a stable object for the same (styleId, mode) rather than rebuilding it', () => {
    expect(getThemePreset('ocean', 'dark')).toBe(getThemePreset('ocean', 'dark'));
  });

  // A hand-edited row can hold anything in `data.themeMode`; the declared type is not a guarantee.
  it('falls back to the default mode when handed a mode that is not light or dark', () => {
    const bad = 'sideways' as unknown as 'light';
    expect(getThemePreset('ocean', bad)?.mode).toBe('light');
    expect(getThemePreset('midnight', bad)?.mode).toBe('dark');
    expect(getThemePreset('ocean', undefined)?.mode).toBe('light');
  });

  it('builds the ocean preset with its documented families', () => {
    const preset = getThemePreset('ocean');
    expect(preset?.overrides.colors?.primary).toBe('var(--color-cyan-500)');
    expect(preset?.overrides.colors?.secondary).toBe('var(--color-navy-500)');
    expect(preset?.overrides.colors?.backgroundPrimary).toBe('var(--color-cyan-50)');
  });

  it('builds the midnight preset (dark) with its documented families', () => {
    const preset = getThemePreset('midnight');
    expect(preset?.mode).toBe('dark');
    expect(preset?.overrides.colors?.primary).toBe('var(--color-blue-400)');
    expect(preset?.overrides.colors?.secondary).toBe('var(--color-indigo-400)');
    expect(preset?.overrides.colors?.backgroundPrimary).toBe('var(--color-slate-900)');
  });

  // The twin generated for a mode the style was never authored in must come out of the same
  // formula as a natively-that-mode preset, not a special case.
  it('builds a light twin of a dark-default style from the light formula', () => {
    const preset = getThemePreset('midnight', 'light');
    expect(preset?.mode).toBe('light');
    expect(preset?.overrides.colors?.primary).toBe('var(--color-blue-500)');
    expect(preset?.overrides.colors?.backgroundPrimary).toBe('var(--color-blue-50)');
    expect(preset?.overrides.colors?.textPrimary).toBe('var(--color-slate-900)');
  });

  it('builds a dark twin of a light-default style from the dark formula', () => {
    const preset = getThemePreset('ocean', 'dark');
    expect(preset?.mode).toBe('dark');
    expect(preset?.overrides.colors?.primary).toBe('var(--color-cyan-400)');
    expect(preset?.overrides.colors?.backgroundPrimary).toBe('var(--color-slate-900)');
    expect(preset?.overrides.colors?.textPrimary).toBe('var(--color-slate-50)');
  });
});
