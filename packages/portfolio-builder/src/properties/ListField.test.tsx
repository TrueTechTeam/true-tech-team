import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ListField } from './ListField';
import * as assets from '../assets/upload';
import type { PortfolioAsset } from '../assets/types';
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

  it('marks the entry chevrons with the local class that neutralises the library disabled fill', () => {
    renderField(ctasField, [{ label: 'One' }, { label: 'Two' }]);
    expect(screen.getByRole('button', { name: 'Move Button 1 up' }).className).toMatch(/chevron/);
    expect(screen.getByRole('button', { name: 'Move Button 2 down' }).className).toMatch(/chevron/);
  });

  // Wiring only: that `.panelDense` removes the padding is asserted in ListField.layout.test.ts.
  it('renders each entry body in the dense panel so padding does not stack on the entry padding', () => {
    renderField(ctasField, [{ label: 'One' }]);
    const panel = screen.getByDisplayValue('One').closest('[class*="panel"]');
    expect(panel?.className).toMatch(/panelDense/);
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

  describe('entry id namespacing', () => {
    const two = [{ label: 'One' }, { label: 'Two' }];

    it('gives each entry inputs with distinct ids', () => {
      renderField(ctasField, two);
      const ids = screen.getAllByLabelText(/^Label/).map((el) => el.id);
      expect(ids).toEqual(['ctas-0-label', 'ctas-1-label']);
    });

    it('lets each entry be reached by its own label', () => {
      renderField(ctasField, two);
      expect(screen.getAllByLabelText(/^Label/)).toHaveLength(2);
    });

    it('edits only the second entry when located by its own label', () => {
      const { onChange } = renderField(ctasField, two);
      fireEvent.change(screen.getAllByLabelText(/^Label/)[1] as HTMLElement, {
        target: { value: 'Changed' },
      });
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith([{ label: 'One' }, { label: 'Changed' }]);
    });
  });

  // An async edit (an ImageField upload) can resolve AFTER the user reorders or removes. The real
  // hazard is the STALE CLOSURE held by the pending upload, not a DOM node: React reuses the node
  // at an index key, and that node's handler is refreshed on every render. So these tests start a
  // real upload, hold it pending, change the list, and only then resolve it.
  describe('deferred entry changes', () => {
    const galleryField: PropertyField = {
      key: 'items',
      label: 'Items',
      type: 'list',
      itemLabel: 'Item',
      itemSchema: [{ key: 'src', label: 'Photo', type: 'image' }],
    };

    function renderGallery(
      value: Array<Record<string, unknown>>,
      onChange: (next: Array<Record<string, unknown>>) => void,
      field: PropertyField = galleryField
    ) {
      const ui = (current: Array<Record<string, unknown>>) => (
        <ListField
          field={field}
          value={current}
          onChange={onChange}
          supabase={fakeSupabase}
          userId="user-1"
        />
      );
      const result = render(ui(value));
      return { rerender: (next: Array<Record<string, unknown>>) => result.rerender(ui(next)) };
    }

    function startUpload(inputIndex: number) {
      let resolveUpload!: (asset: PortfolioAsset) => void;
      vi.spyOn(assets, 'uploadPortfolioAsset').mockReturnValue(
        new Promise<PortfolioAsset>((resolve) => {
          resolveUpload = resolve;
        })
      );
      const file = new File(['x'], 'new.png', { type: 'image/png' });
      const inputs = screen.getAllByLabelText('Upload new image');
      fireEvent.change(inputs[inputIndex] as HTMLElement, { target: { files: [file] } });
      return (url: string) => resolveUpload({ id: url, publicUrl: url } as PortfolioAsset);
    }

    beforeEach(() => {
      vi.spyOn(assets, 'listPortfolioAssets').mockResolvedValue([]);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('applies a deferred entry change to the entry it started on, not to its old position', async () => {
      const first = { src: 'first.png' };
      const second = { src: 'second.png' };
      const onChange = vi.fn<(next: Array<Record<string, unknown>>) => void>();
      const { rerender } = renderGallery([first, second], onChange);

      // The upload starts on entry 1 ...
      const finishUpload = startUpload(0);

      // ... the user moves entry 1 down before it resolves ...
      fireEvent.click(screen.getByRole('button', { name: 'Move Item 1 down' }));
      expect(onChange).toHaveBeenCalledWith([second, first]);
      onChange.mockClear();
      rerender([second, first]);

      // ... and then the upload lands. It belongs to 'first', which is now at index 1.
      finishUpload('https://cdn.example.com/uploaded.png');

      await waitFor(() => expect(onChange).toHaveBeenCalled());
      expect(
        onChange.mock.calls[0]?.[0],
        'a deferred edit must not overwrite the entry now at the old index'
      ).toEqual([{ src: 'second.png' }, { src: 'https://cdn.example.com/uploaded.png' }]);
    });

    it('drops a deferred entry change when its entry was removed', async () => {
      const first = { src: 'first.png' };
      const second = { src: 'second.png' };
      const onChange = vi.fn<(next: Array<Record<string, unknown>>) => void>();
      const { rerender } = renderGallery([first, second], onChange);

      const finishUpload = startUpload(0);

      fireEvent.click(screen.getByRole('button', { name: 'Remove Item 1' }));
      onChange.mockClear();
      rerender([second]);

      finishUpload('https://cdn.example.com/uploaded.png');

      // Let the pending upload's continuation run, then assert nothing was written.
      await waitFor(() => expect(assets.uploadPortfolioAsset).toHaveBeenCalled());
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(onChange).not.toHaveBeenCalled();
    });

    // The fixture gap that hid this bug: with one field per entry there is no sibling to edit.
    // PropertyPanel builds every edit as a NEW object, so editing `alt` replaces the entry the
    // pending upload is holding.
    it('applies a deferred upload after a sibling field edit replaced the entry', async () => {
      const imageAltField: PropertyField = {
        key: 'items',
        label: 'Items',
        type: 'list',
        itemLabel: 'Item',
        itemSchema: [
          { key: 'image', label: 'Photo', type: 'image' },
          { key: 'alt', label: 'Alt text', type: 'text', required: true },
        ],
      };
      const first = { image: 'first.png', alt: '' };
      const second = { image: 'second.png', alt: 'Second' };
      const onChange = vi.fn<(next: Array<Record<string, unknown>>) => void>();
      const { rerender } = renderGallery([first, second], onChange, imageAltField);

      const finishUpload = startUpload(0);

      // The user types alt text while the upload is in flight ...
      fireEvent.change(screen.getAllByLabelText(/Alt text/)[0] as HTMLElement, {
        target: { value: 'A lighthouse' },
      });
      const edited = onChange.mock.calls[0]?.[0];
      expect(edited).toEqual([{ image: 'first.png', alt: 'A lighthouse' }, second]);
      onChange.mockClear();
      rerender(edited as Array<Record<string, unknown>>);

      // ... then the upload lands on the entry that edit replaced.
      finishUpload('https://cdn.example.com/uploaded.png');

      await waitFor(() => expect(onChange).toHaveBeenCalled());
      expect(
        onChange.mock.calls[0]?.[0],
        'the URL must land on the same entry as the alt text typed meanwhile'
      ).toEqual([{ image: 'https://cdn.example.com/uploaded.png', alt: 'A lighthouse' }, second]);
    });
  });
});
