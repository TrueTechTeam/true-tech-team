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

describe('getThemePreset', () => {
  it('resolves every declared preset id to itself', () => {
    for (const preset of THEME_PRESETS) {
      expect(getThemePreset(preset.id)).toBe(preset);
    }
  });

  it('returns undefined for an unknown id', () => {
    expect(getThemePreset('not-a-real-id')).toBeUndefined();
  });
});
