import { describe, it, expect } from 'vitest';
import { getRegistryEntry } from './registry';
import { COMPONENT_TYPES } from '../schema/types';

describe('component registry', () => {
  it('has an entry for every declared ComponentType', () => {
    for (const type of COMPONENT_TYPES) {
      expect(getRegistryEntry(type)).toBeDefined();
    }
  });

  it('returns undefined for an unregistered type', () => {
    // @ts-expect-error -- deliberately invalid for the test
    expect(getRegistryEntry('not-a-real-type')).toBeUndefined();
  });

  it('validates props through the matching entry', () => {
    const entry = getRegistryEntry('heading');
    expect(entry?.validate({})).toContain('text is required and must be a string');
    expect(entry?.validate({ text: 'Hi' })).toEqual([]);
  });
});
