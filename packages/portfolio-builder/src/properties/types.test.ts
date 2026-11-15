import { describe, it, expect } from 'vitest';
import type { PropertyField, PropertySchema } from './types';

describe('property types', () => {
  it('accepts a fully-populated PropertyField', () => {
    const field: PropertyField = {
      key: 'align',
      label: 'Alignment',
      type: 'select',
      required: false,
      options: [{ value: 'left', label: 'Left' }],
      optionValueType: 'string',
    };
    expect(field.key).toBe('align');
  });

  it('accepts a PropertySchema array', () => {
    const schema: PropertySchema = [{ key: 'text', label: 'Text', type: 'text', required: true }];
    expect(schema).toHaveLength(1);
  });

  it('accepts a list field carrying a nested item schema', () => {
    const field: PropertyField = {
      key: 'ctas',
      label: 'Buttons',
      type: 'list',
      itemLabel: 'Button',
      maxItems: 2,
      itemSchema: [
        { key: 'label', label: 'Label', type: 'text', required: true },
        { key: 'href', label: 'Link', type: 'text', required: true },
      ],
    };
    expect(field.itemSchema).toHaveLength(2);
    expect(field.maxItems).toBe(2);
  });
});
