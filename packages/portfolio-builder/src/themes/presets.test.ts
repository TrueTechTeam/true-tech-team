import { describe, it, expect } from 'vitest';
import { THEME_PRESETS, getThemePreset } from './presets';

describe('THEME_PRESETS', () => {
  it('has exactly 20 presets', () => {
    expect(THEME_PRESETS).toHaveLength(20);
  });

  it('has unique ids', () => {
    const ids = THEME_PRESETS.map((preset) => preset.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has 16 light presets and 4 dark presets', () => {
    const light = THEME_PRESETS.filter((preset) => preset.mode === 'light');
    const dark = THEME_PRESETS.filter((preset) => preset.mode === 'dark');
    expect(light).toHaveLength(16);
    expect(dark).toHaveLength(4);
  });
});

describe('dark presets', () => {
  it('keep the canvas darker than the surface (elevation goes lighter, COLOR-4)', () => {
    const shade = (v?: string) => Number(/-(\d+)\)$/.exec(v ?? '')?.[1]);
    const dark = THEME_PRESETS.filter((preset) => preset.mode === 'dark');
    expect(dark).toHaveLength(4);
    for (const preset of dark) {
      const c = preset.overrides.colors;
      // In a dark ramp a larger shade number is darker.
      expect(shade(c?.backgroundPrimary), preset.id).toBeGreaterThan(shade(c?.surfacePrimary));
    }
  });
});

describe('getThemePreset', () => {
  it('resolves every declared preset id to itself', () => {
    for (const preset of THEME_PRESETS) {
      expect(getThemePreset(preset.id)).toBe(preset);
    }
  });

  it('returns undefined for an unknown id', () => {
    expect(getThemePreset('not-a-real-id')).toBeUndefined();
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
});
