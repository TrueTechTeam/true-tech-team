import { describe, it, expect } from 'vitest';
import { resolveEffectiveMode, resolveEffectiveTheme } from './resolveTheme';
import type { PortfolioPage } from '../schema/types';

function makePage(overrides: Partial<PortfolioPage> = {}): PortfolioPage {
  return {
    schemaVersion: 2,
    slug: 'jtrue',
    title: 'Justin True',
    templateId: 'developer-01',
    sections: [],
    ...overrides,
  };
}

describe('resolveEffectiveTheme', () => {
  it('returns themeOverride when set, regardless of themeId', () => {
    const page = makePage({
      themeId: 'slate',
      themeOverride: { colors: { primary: 'var(--color-blue-500)' } },
    });
    expect(resolveEffectiveTheme(page)).toEqual({ colors: { primary: 'var(--color-blue-500)' } });
  });

  it('falls back to the resolved preset when only themeId is set', () => {
    const page = makePage({ themeId: 'slate' });
    const result = resolveEffectiveTheme(page);
    expect(result?.colors?.primary).toBe('var(--color-blue-500)');
  });

  it('returns undefined when neither themeId nor themeOverride is set', () => {
    const page = makePage();
    expect(resolveEffectiveTheme(page)).toBeUndefined();
  });

  it('returns undefined when themeId does not match any known preset', () => {
    const page = makePage({ themeId: 'not-a-real-preset' });
    expect(resolveEffectiveTheme(page)).toBeUndefined();
  });
});

describe('resolveEffectiveMode', () => {
  it("returns a light preset's mode", () => {
    expect(resolveEffectiveMode(makePage({ themeId: 'coral-reef' }))).toBe('light');
  });

  it("returns a dark preset's mode", () => {
    expect(resolveEffectiveMode(makePage({ themeId: 'midnight' }))).toBe('dark');
  });

  it('returns light when no themeId is set', () => {
    expect(resolveEffectiveMode(makePage())).toBe('light');
  });

  it('returns light when themeId does not match any known preset', () => {
    expect(resolveEffectiveMode(makePage({ themeId: 'not-a-real-preset' }))).toBe('light');
  });

  // A themeOverride is colours only - it carries no mode - so the preset named by themeId still
  // decides, rather than silently falling back to light and inverting a dark page.
  it("keeps the preset's mode when a themeOverride replaces its colours", () => {
    const page = makePage({
      themeId: 'midnight',
      themeOverride: { colors: { primary: 'var(--color-blue-500)' } },
    });
    expect(resolveEffectiveMode(page)).toBe('dark');
  });
});
