import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ListField } from './ListField';
import type { PropertyField } from './types';

const fakeSupabase = {} as SupabaseClient;

const ctasField: PropertyField = {
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

function renderField(
  field: PropertyField,
  value: unknown,
  onChange = vi.fn<(next: Array<Record<string, unknown>>) => void>()
) {
  const result = render(
    <ListField
      field={field}
      value={value}
      onChange={onChange}
      supabase={fakeSupabase}
      userId="user-1"
    />
  );
  return { ...result, onChange };
}

describe('ListField', () => {
  it('renders the field label', () => {
    renderField(ctasField, []);
    expect(screen.getByText('Buttons')).toBeInTheDocument();
  });

  it('renders one sub-form per entry, numbered from the item label', () => {
    renderField(ctasField, [{ label: 'One' }, { label: 'Two' }]);
    expect(screen.getByText('Button 1')).toBeInTheDocument();
    expect(screen.getByText('Button 2')).toBeInTheDocument();
  });

  it('renders the item schema fields for an entry', () => {
    renderField(ctasField, [{ label: 'One', href: '/a' }]);
    expect(screen.getByDisplayValue('One')).toBeInTheDocument();
    expect(screen.getByDisplayValue('/a')).toBeInTheDocument();
  });

  it('adds an empty entry via a button named from itemLabel', () => {
    const { onChange } = renderField(ctasField, []);
    fireEvent.click(screen.getByRole('button', { name: 'Add Button' }));
    expect(onChange).toHaveBeenCalledWith([{}]);
  });

  it('falls back to "Item" when itemLabel is absent', () => {
    const field: PropertyField = { ...ctasField, itemLabel: undefined };
    renderField(field, []);
    expect(screen.getByRole('button', { name: 'Add Item' })).toBeInTheDocument();
  });

  it('hides the add control once maxItems is reached', () => {
    renderField(ctasField, [{ label: 'One' }, { label: 'Two' }]);
    expect(screen.queryByRole('button', { name: 'Add Button' })).not.toBeInTheDocument();
  });

  it('shows the add control below maxItems', () => {
    renderField(ctasField, [{ label: 'One' }]);
    expect(screen.getByRole('button', { name: 'Add Button' })).toBeInTheDocument();
  });

  it('removes the addressed entry', () => {
    const { onChange } = renderField(ctasField, [{ label: 'One' }, { label: 'Two' }]);
    fireEvent.click(screen.getByRole('button', { name: 'Remove Button 1' }));
    expect(onChange).toHaveBeenCalledWith([{ label: 'Two' }]);
  });

  it('moves an entry up', () => {
    const { onChange } = renderField(ctasField, [{ label: 'One' }, { label: 'Two' }]);
    fireEvent.click(screen.getByRole('button', { name: 'Move Button 2 up' }));
    expect(onChange).toHaveBeenCalledWith([{ label: 'Two' }, { label: 'One' }]);
  });

  it('moves an entry down', () => {
    const { onChange } = renderField(ctasField, [{ label: 'One' }, { label: 'Two' }]);
    fireEvent.click(screen.getByRole('button', { name: 'Move Button 1 down' }));
    expect(onChange).toHaveBeenCalledWith([{ label: 'Two' }, { label: 'One' }]);
  });

  it('disables move-up on the first entry and move-down on the last', () => {
    renderField(ctasField, [{ label: 'One' }, { label: 'Two' }]);
    expect(screen.getByRole('button', { name: 'Move Button 1 up' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Move Button 2 down' })).toBeDisabled();
  });

  it('propagates an edit inside an entry without disturbing its siblings', () => {
    const { onChange } = renderField(ctasField, [{ label: 'One' }, { label: 'Two' }]);
    fireEvent.change(screen.getAllByLabelText(/^Label/)[0] as HTMLElement, {
      target: { value: 'Changed' },
    });
    expect(onChange).toHaveBeenCalledWith([{ label: 'Changed' }, { label: 'Two' }]);
  });

  // Review Focus 1
  it.each([
    ['null', null],
    ['undefined', undefined],
    ['a string', 'not a list'],
    ['an object', { nope: true }],
    ['a number', 7],
  ])('reads %s as an empty list instead of throwing', (_label, value) => {
    expect(() => renderField(ctasField, value)).not.toThrow();
    expect(screen.queryByText('Button 1')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Button' })).toBeInTheDocument();
  });

  it('skips a non-object entry rather than rendering a broken sub-form', () => {
    renderField(ctasField, [{ label: 'One' }, 'garbage']);
    expect(screen.getByText('Button 1')).toBeInTheDocument();
    expect(screen.queryByText('Button 2')).not.toBeInTheDocument();
  });

  it('renders nothing for a list nested inside an itemSchema', () => {
    const nested: PropertyField = {
      key: 'outer',
      label: 'Outer',
      type: 'list',
      itemLabel: 'Outer',
      itemSchema: [
        { key: 'label', label: 'Label', type: 'text' },
        {
          key: 'inner',
          label: 'Inner List',
          type: 'list',
          itemLabel: 'Inner',
          itemSchema: [{ key: 'x', label: 'X', type: 'text' }],
        },
      ],
    };
    renderField(nested, [{ label: 'One' }]);
    expect(screen.getByLabelText('Label')).toBeInTheDocument();
    expect(screen.queryByText('Inner List')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add Inner' })).not.toBeInTheDocument();
  });

  it('renders nothing at all when itemSchema is missing', () => {
    const field: PropertyField = { ...ctasField, itemSchema: undefined };
    const { container } = renderField(field, []);
    expect(container).toBeEmptyDOMElement();
  });
});
