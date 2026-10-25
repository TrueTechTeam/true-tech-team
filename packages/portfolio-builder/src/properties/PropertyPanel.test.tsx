import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { PropertyPanel, type PropertyPanelProps } from './PropertyPanel';
import type { PropertySchema } from './types';

const fakeSupabase = {} as SupabaseClient;

function renderPanel(
  schema: PropertySchema,
  values: Record<string, unknown>,
  overrides: Partial<PropertyPanelProps> = {}
) {
  const onChange = vi.fn();
  const view = render(
    <PropertyPanel
      schema={schema}
      values={values}
      onChange={onChange}
      supabase={fakeSupabase}
      userId="user-1"
      {...overrides}
    />
  );
  return { onChange, ...view };
}

const headingSchema: PropertySchema = [
  { key: 'text', label: 'Text', type: 'text', required: true },
  { key: 'body', label: 'Body', type: 'textarea' },
  { key: 'size', label: 'Size', type: 'number', min: 1, max: 6 },
  { key: 'visible', label: 'Visible', type: 'boolean' },
  {
    key: 'align',
    label: 'Alignment',
    type: 'select',
    options: [
      { value: 'left', label: 'Left' },
      { value: 'center', label: 'Center' },
    ],
  },
];

describe('PropertyPanel', () => {
  it('renders schema fields seeded from values', () => {
    renderPanel(headingSchema, { text: 'Hello', body: 'Long text', size: 2, visible: true });
    expect(screen.getByLabelText(/^Text/)).toHaveValue('Hello');
    expect(screen.getByLabelText(/^Body/)).toHaveValue('Long text');
    expect(screen.getByLabelText(/^Size/)).toHaveValue(2);
  });

  it('calls onChange with the full updated values object on a text field change', () => {
    const { onChange } = renderPanel(headingSchema, { text: 'Hello', align: 'left' });
    fireEvent.change(screen.getByLabelText(/^Text/), { target: { value: 'Updated' } });
    expect(onChange).toHaveBeenCalledWith({ text: 'Updated', align: 'left' });
  });

  it('calls onChange for a textarea change', () => {
    const { onChange } = renderPanel(headingSchema, { text: 'Hello' });
    fireEvent.change(screen.getByLabelText(/^Body/), { target: { value: 'More' } });
    expect(onChange).toHaveBeenCalledWith({ text: 'Hello', body: 'More' });
  });

  it('does not render a Width field', () => {
    renderPanel(headingSchema, { text: 'Hello' });
    expect(screen.queryByLabelText('Width')).not.toBeInTheDocument();
  });

  it('renders nothing for a list field until its editor exists', () => {
    renderPanel([{ key: 'ctas', label: 'Buttons', type: 'list', itemSchema: [] }], { ctas: [] });
    expect(screen.queryByLabelText('Buttons')).not.toBeInTheDocument();
  });
});
