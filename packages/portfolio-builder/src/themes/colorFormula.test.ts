import { describe, it, expect } from 'vitest';
import { buildLightPreset, buildDarkPreset } from './colorFormula';

describe('buildLightPreset', () => {
  it('builds var() color references using the light-mode shade formula', () => {
    const preset = buildLightPreset('slate', 'Slate', 'blue', 'slate', 'slate');
    expect(preset.id).toBe('slate');
    expect(preset.name).toBe('Slate');
    expect(preset.mode).toBe('light');
    expect(preset.overrides.colors?.primary).toBe('var(--color-blue-500)');
    expect(preset.overrides.colors?.primaryHover).toBe('var(--color-blue-600)');
    expect(preset.overrides.colors?.primaryActive).toBe('var(--color-blue-700)');
    expect(preset.overrides.colors?.secondary).toBe('var(--color-slate-500)');
    expect(preset.overrides.colors?.secondaryHover).toBe('var(--color-slate-600)');
    expect(preset.overrides.colors?.secondaryActive).toBe('var(--color-slate-700)');
    expect(preset.overrides.colors?.backgroundPrimary).toBe('var(--color-slate-50)');
    expect(preset.overrides.colors?.backgroundSecondary).toBe('var(--color-slate-100)');
    expect(preset.overrides.colors?.backgroundTertiary).toBe('var(--color-slate-200)');
    expect(preset.overrides.colors?.surfacePrimary).toBe('var(--color-slate-50)');
    expect(preset.overrides.colors?.surfaceSecondary).toBe('var(--color-slate-100)');
    expect(preset.overrides.colors?.surfaceElevated).toBe('var(--color-slate-50)');
    expect(preset.overrides.colors?.textPrimary).toBe('var(--color-slate-900)');
    expect(preset.overrides.colors?.textSecondary).toBe('var(--color-slate-600)');
    expect(preset.overrides.colors?.textTertiary).toBe('var(--color-slate-400)');
    expect(preset.overrides.colors?.borderPrimary).toBe('var(--color-slate-200)');
    expect(preset.overrides.colors?.borderSecondary).toBe('var(--color-slate-300)');
  });

  it('does not set a mode field inside overrides', () => {
    const preset = buildLightPreset('slate', 'Slate', 'blue', 'slate', 'slate');
    expect(preset.overrides).not.toHaveProperty('mode');
  });
});

describe('buildDarkPreset', () => {
  it('builds var() color references using the dark-mode shade formula', () => {
    const preset = buildDarkPreset('midnight', 'Midnight', 'blue', 'indigo', 'slate');
    expect(preset.mode).toBe('dark');
    expect(preset.overrides.colors?.primary).toBe('var(--color-blue-400)');
    expect(preset.overrides.colors?.primaryHover).toBe('var(--color-blue-300)');
    expect(preset.overrides.colors?.primaryActive).toBe('var(--color-blue-200)');
    expect(preset.overrides.colors?.secondary).toBe('var(--color-indigo-400)');
    expect(preset.overrides.colors?.backgroundPrimary).toBe('var(--color-slate-900)');
    expect(preset.overrides.colors?.backgroundSecondary).toBe('var(--color-slate-800)');
    expect(preset.overrides.colors?.backgroundTertiary).toBe('var(--color-slate-700)');
    expect(preset.overrides.colors?.surfacePrimary).toBe('var(--color-slate-800)');
    expect(preset.overrides.colors?.surfaceSecondary).toBe('var(--color-slate-700)');
    expect(preset.overrides.colors?.surfaceElevated).toBe('var(--color-slate-700)');
    expect(preset.overrides.colors?.textPrimary).toBe('var(--color-slate-50)');
    expect(preset.overrides.colors?.textSecondary).toBe('var(--color-slate-300)');
    expect(preset.overrides.colors?.textTertiary).toBe('var(--color-slate-500)');
    expect(preset.overrides.colors?.borderPrimary).toBe('var(--color-slate-700)');
    expect(preset.overrides.colors?.borderSecondary).toBe('var(--color-slate-600)');
  });
});
