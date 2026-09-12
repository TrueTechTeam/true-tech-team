import { describe, it, expect } from 'vitest';
import type { PropertyField, PropertySchema, SelectedItem } from './types';

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

  it('accepts a SelectedItem', () => {
    const item: SelectedItem = {
      componentType: 'heading',
      props: { text: 'Hi' },
      span: 6,
    };
    expect(item.span).toBe(6);
  });
});
