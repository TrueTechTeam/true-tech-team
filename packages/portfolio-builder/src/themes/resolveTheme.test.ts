import { describe, it, expect } from 'vitest';
import { resolveEffectiveTheme } from './resolveTheme';
import type { PortfolioPage } from '../schema/types';

function makePage(overrides: Partial<PortfolioPage> = {}): PortfolioPage {
  return {
    schemaVersion: 1,
    slug: 'jtrue',
    title: 'Justin True',
    templateId: 'developer-01',
    showNav: true,
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
