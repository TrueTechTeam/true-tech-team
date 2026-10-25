import { describe, it, expect } from 'vitest';
import { SECTION_TYPES } from '../schema/types';
import { SECTION_META, getSectionTypeMeta } from './meta';
import { SECTION_REGISTRY, getSectionTypeEntry } from './registry';
import { validateSectionProps } from '../schema/validate';

describe('SECTION_META', () => {
  it('has metadata for every declared section type', () => {
    expect(Object.keys(SECTION_META).sort()).toEqual([...SECTION_TYPES].sort());
  });

  it('gives every type a label and a min-height', () => {
    Object.entries(SECTION_META).forEach(([type, meta]) => {
      expect(meta.label, `${type} label`).toBeTruthy();
      expect(meta.minHeight, `${type} minHeight`).toBeTruthy();
    });
  });

  it("validates every type's defaultProps against its own propertySchema", () => {
    Object.entries(SECTION_META).forEach(([type, meta]) => {
      const errors = validateSectionProps(meta.defaultProps, meta.propertySchema, type);
      expect(errors, `${type} defaultProps: ${errors.join('; ')}`).toEqual([]);
    });
  });

  it('resolves known types and rejects unknown ones', () => {
    expect(getSectionTypeMeta('navbar')).toBe(SECTION_META.navbar);
    expect(getSectionTypeMeta('not-a-section')).toBeUndefined();
  });

  // The navbar is page chrome: `position: sticky` only works if it is NOT wrapped in the
  // section shell, so this flag is load-bearing rather than cosmetic.
  it('marks the navbar as page chrome', () => {
    expect(SECTION_META.navbar.chrome).toBe(true);
  });
});

describe('SECTION_REGISTRY', () => {
  it('has an entry for every declared section type', () => {
    expect(Object.keys(SECTION_REGISTRY).sort()).toEqual([...SECTION_TYPES].sort());
  });

  it('joins each component to its metadata', () => {
    Object.entries(SECTION_REGISTRY).forEach(([type, entry]) => {
      expect(typeof entry.component, `${type} component`).toBe('function');
      expect(entry.label, `${type} label`).toBe(
        SECTION_META[type as keyof typeof SECTION_META].label
      );
      expect(entry.minHeight, `${type} minHeight`).toBe(
        SECTION_META[type as keyof typeof SECTION_META].minHeight
      );
      expect(entry.chrome, `${type} chrome`).toBe(
        SECTION_META[type as keyof typeof SECTION_META].chrome
      );
    });
  });

  it('resolves known types and rejects unknown ones', () => {
    expect(getSectionTypeEntry('navbar')).toBe(SECTION_REGISTRY.navbar);
    expect(getSectionTypeEntry('not-a-section')).toBeUndefined();
  });
});
