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

/** A hand-edited row: `data.themeMode` holds something the type says is impossible. */
function pageWithBadMode(overrides: Partial<PortfolioPage> = {}): PortfolioPage {
  return makePage({ ...overrides, themeMode: 'sideways' as unknown as 'light' });
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

  // The colours must come from the preset for the mode the page actually renders in, or a page
  // switched to dark would be painted with the light preset's near-white canvas.
  it('returns the colours of the stored mode, not of the style default', () => {
    const page = makePage({ themeId: 'ocean', themeMode: 'dark' });
    expect(resolveEffectiveTheme(page)?.colors?.primary).toBe('var(--color-cyan-400)');
  });

  it("returns the colours of the style's default mode when the page stores none", () => {
    const page = makePage({ themeId: 'midnight' });
    expect(resolveEffectiveTheme(page)?.colors?.primary).toBe('var(--color-blue-400)');
  });

  it("returns the colours of the style's default mode when the stored mode is junk", () => {
    const page = pageWithBadMode({ themeId: 'midnight' });
    expect(resolveEffectiveTheme(page)?.colors?.primary).toBe('var(--color-blue-400)');
  });

  it('does not throw on a junk stored mode with an unknown themeId', () => {
    const page = pageWithBadMode({ themeId: 'not-a-real-preset' });
    expect(() => resolveEffectiveTheme(page)).not.toThrow();
    expect(resolveEffectiveTheme(page)).toBeUndefined();
  });
});

// The three links of the chain, each isolated so a mutation to one cannot be covered by another.
describe('resolveEffectiveMode fallback chain', () => {
  it('link 1: a stored mode wins over the style default', () => {
    // 'ocean' defaults to light, so a stored 'dark' can only come from the stored value.
    expect(resolveEffectiveMode(makePage({ themeId: 'ocean', themeMode: 'dark' }))).toBe('dark');
    // ...and the mirror, so the test cannot pass by always answering 'dark'.
    expect(resolveEffectiveMode(makePage({ themeId: 'midnight', themeMode: 'light' }))).toBe(
      'light'
    );
  });

  it("link 2: no stored mode falls back to the style's default", () => {
    expect(resolveEffectiveMode(makePage({ themeId: 'midnight' }))).toBe('dark');
    expect(resolveEffectiveMode(makePage({ themeId: 'coral-reef' }))).toBe('light');
  });

  it("link 3: a stored mode that is neither light nor dark falls back to the style's default", () => {
    expect(resolveEffectiveMode(pageWithBadMode({ themeId: 'midnight' }))).toBe('dark');
    expect(resolveEffectiveMode(pageWithBadMode({ themeId: 'coral-reef' }))).toBe('light');
  });
});

describe('resolveEffectiveMode', () => {
  it("returns a light-default style's mode", () => {
    expect(resolveEffectiveMode(makePage({ themeId: 'coral-reef' }))).toBe('light');
  });

  it("returns a dark-default style's mode", () => {
    expect(resolveEffectiveMode(makePage({ themeId: 'midnight' }))).toBe('dark');
  });

  it('returns light when no themeId is set', () => {
    expect(resolveEffectiveMode(makePage())).toBe('light');
  });

  it('returns light when themeId does not match any known preset', () => {
    expect(resolveEffectiveMode(makePage({ themeId: 'not-a-real-preset' }))).toBe('light');
  });

  it('honours a stored mode even when no themeId resolves', () => {
    expect(resolveEffectiveMode(makePage({ themeMode: 'dark' }))).toBe('dark');
    expect(
      resolveEffectiveMode(makePage({ themeId: 'not-a-real-preset', themeMode: 'dark' }))
    ).toBe('dark');
  });

  it('never throws, whatever the stored mode and themeId hold', () => {
    const cases: PortfolioPage[] = [
      pageWithBadMode(),
      pageWithBadMode({ themeId: 'not-a-real-preset' }),
      pageWithBadMode({ themeId: 'plum' }),
      makePage({ themeMode: null as unknown as 'light' }),
      makePage({ themeMode: '' as unknown as 'light' }),
      makePage({ themeMode: 'DARK' as unknown as 'light' }),
      makePage({ themeMode: 0 as unknown as 'light' }),
      makePage({ themeMode: {} as unknown as 'light' }),
    ];
    for (const page of cases) {
      expect(() => resolveEffectiveMode(page)).not.toThrow();
      expect(['light', 'dark']).toContain(resolveEffectiveMode(page));
    }
  });

  // Case matters: 'DARK' is not the library's mode literal, so it must not be accepted.
  it('rejects a near-miss stored mode rather than normalising it', () => {
    const page = makePage({ themeId: 'coral-reef', themeMode: 'DARK' as unknown as 'light' });
    expect(resolveEffectiveMode(page)).toBe('light');
  });

  // A themeOverride is colours only - it carries no mode - so the style named by themeId still
  // decides, rather than silently falling back to light and inverting a dark page.
  it("keeps the style's default mode when a themeOverride replaces its colours", () => {
    const page = makePage({
      themeId: 'midnight',
      themeOverride: { colors: { primary: 'var(--color-blue-500)' } },
    });
    expect(resolveEffectiveMode(page)).toBe('dark');
  });

  it('keeps the stored mode when a themeOverride replaces the colours', () => {
    const page = makePage({
      themeId: 'midnight',
      themeMode: 'light',
      themeOverride: { colors: { primary: 'var(--color-blue-500)' } },
    });
    expect(resolveEffectiveMode(page)).toBe('light');
  });
});
