import { describe, it, expect } from 'vitest';
import { themeStyleVars } from './themeStyleVars';

describe('themeStyleVars', () => {
  it('converts each color entry into a kebab-case --theme-* custom property', () => {
    const result = themeStyleVars({
      colors: {
        primary: 'var(--color-blue-500)',
        backgroundPrimary: 'var(--color-slate-50)',
        primaryHover: 'var(--color-blue-600)',
      },
    });
    expect(result).toEqual({
      '--theme-primary': 'var(--color-blue-500)',
      '--theme-background-primary': 'var(--color-slate-50)',
      '--theme-primary-hover': 'var(--color-blue-600)',
    });
  });

  it('skips falsy color values', () => {
    const result = themeStyleVars({ colors: { primary: 'var(--color-blue-500)', secondary: '' } });
    expect(result).toEqual({ '--theme-primary': 'var(--color-blue-500)' });
  });

  it('returns an empty object when theme is undefined', () => {
    expect(themeStyleVars(undefined)).toEqual({});
  });

  it('returns an empty object when theme has no colors', () => {
    expect(themeStyleVars({})).toEqual({});
  });
});
