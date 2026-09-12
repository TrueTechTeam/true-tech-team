import { describe, it, expect } from 'vitest';
import { getRegistryEntry } from './registry';
import { COMPONENT_TYPES, type ComponentType } from '../schema/types';

const SCHEMA_LESS_TYPES: ComponentType[] = ['carousel', 'tabs', 'truncatedList'];

describe('registry defaultProps', () => {
  it('has no defaultProps for array-prop component types', () => {
    for (const type of SCHEMA_LESS_TYPES) {
      expect(getRegistryEntry(type)?.defaultProps).toBeUndefined();
    }
  });

  it('has defaultProps for every other component type, and each passes its own validator', () => {
    const schemaTypes = COMPONENT_TYPES.filter((type) => !SCHEMA_LESS_TYPES.includes(type));
    for (const type of schemaTypes) {
      const entry = getRegistryEntry(type);
      expect(entry?.defaultProps, `${type} should have defaultProps`).toBeDefined();
      const errors = entry!.validate(entry!.defaultProps!);
      expect(
        errors,
        `${type}'s defaultProps should pass its own validator: ${errors.join(', ')}`
      ).toEqual([]);
    }
  });
});
