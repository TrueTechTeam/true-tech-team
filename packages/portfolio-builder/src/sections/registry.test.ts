import { describe, it, expect } from 'vitest';
import { SECTION_TYPES } from '../schema/types';
import { SECTION_REGISTRY, getSectionTypeEntry } from './registry';
import { validateSectionProps } from '../schema/validate';

describe('SECTION_REGISTRY', () => {
  it('has an entry for every declared section type', () => {
    expect(Object.keys(SECTION_REGISTRY).sort()).toEqual([...SECTION_TYPES].sort());
  });

  it('gives every entry a label, a min-height, and a component', () => {
    Object.entries(SECTION_REGISTRY).forEach(([type, entry]) => {
      expect(entry.label, `${type} label`).toBeTruthy();
      expect(entry.minHeight, `${type} minHeight`).toBeTruthy();
      expect(typeof entry.component, `${type} component`).toBe('function');
    });
  });

  it("validates every entry's defaultProps against its own propertySchema", () => {
    Object.entries(SECTION_REGISTRY).forEach(([type, entry]) => {
      const errors = validateSectionProps(entry.defaultProps, entry.propertySchema, type);
      expect(errors, `${type} defaultProps: ${errors.join('; ')}`).toEqual([]);
    });
  });

  it('resolves known types and rejects unknown ones', () => {
    expect(getSectionTypeEntry('navbar')).toBe(SECTION_REGISTRY.navbar);
    expect(getSectionTypeEntry('not-a-section')).toBeUndefined();
  });
});
