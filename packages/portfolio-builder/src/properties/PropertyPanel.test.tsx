import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { SupabaseClient } from '@supabase/supabase-js';
import * as assets from '../assets/upload';
import { PropertyPanel } from './PropertyPanel';
import type { SelectedItem } from './types';

const fakeSupabase = {} as SupabaseClient;

function renderPanel(
  item: SelectedItem,
  overrides: Partial<Parameters<typeof PropertyPanel>[0]> = {}
) {
  const onPropsChange = vi.fn();
  const onSpanChange = vi.fn();
  const { rerender, unmount } = render(
    <PropertyPanel
      item={item}
      onPropsChange={onPropsChange}
      onSpanChange={onSpanChange}
      supabase={fakeSupabase}
      userId="user-1"
      {...overrides}
    />
  );
  return {
    onPropsChange,
    onSpanChange,
    unmount,
    rerender: (nextItem: SelectedItem, nextOverrides: typeof overrides = overrides) =>
      rerender(
        <PropertyPanel
          item={nextItem}
          onPropsChange={onPropsChange}
          onSpanChange={onSpanChange}
          supabase={fakeSupabase}
          userId="user-1"
          {...nextOverrides}
        />
      ),
  };
}

describe('PropertyPanel', () => {
  it('renders the universal Width field seeded from span', () => {
    renderPanel({ componentType: 'heading', props: { text: 'Hi' }, span: 6 });
    expect(screen.getByLabelText('Width')).toHaveValue(6);
  });

  it('calls onSpanChange with a clamped value when Width changes', () => {
    const { onSpanChange } = renderPanel({
      componentType: 'heading',
      props: { text: 'Hi' },
      span: 6,
    });
    fireEvent.change(screen.getByLabelText('Width'), { target: { value: '15' } });
    expect(onSpanChange).toHaveBeenCalledWith(12);
  });

  it('renders schema fields for a schema-having component type, seeded from props', () => {
    renderPanel({
      componentType: 'heading',
      props: { text: 'Hello', level: 2, align: 'left' },
      span: 6,
    });
    expect(screen.getByLabelText(/^Text/)).toHaveValue('Hello');
  });

  it('calls onPropsChange with the full updated props object on a text field change', () => {
    const { onPropsChange } = renderPanel({
      componentType: 'heading',
      props: { text: 'Hello', level: 2, align: 'left' },
      span: 6,
    });
    fireEvent.change(screen.getByLabelText(/^Text/), { target: { value: 'Updated' } });
    expect(onPropsChange).toHaveBeenCalledWith({ text: 'Updated', level: 2, align: 'left' });
  });

  it('shows the fallback message for a schema-less component type', () => {
    renderPanel({ componentType: 'carousel', props: { slides: [] }, span: 12 });
    expect(
      screen.getByText("Properties for this component aren't editable yet.")
    ).toBeInTheDocument();
  });

  it('still renders the universal Width field for a schema-less component type', () => {
    renderPanel({ componentType: 'carousel', props: { slides: [] }, span: 12 });
    expect(screen.getByLabelText('Width')).toHaveValue(12);
  });

  it('shows a validation error when a required field is cleared', () => {
    renderPanel({
      componentType: 'heading',
      props: { text: 'Hello', level: 2, align: 'left' },
      span: 6,
    });
    fireEvent.change(screen.getByLabelText(/^Text/), { target: { value: '' } });
    expect(screen.getByText('text is required and must be a string')).toBeInTheDocument();
  });

  it('shows an unclaimed validation error (matching no field key) in the error summary', () => {
    vi.spyOn(assets, 'listPortfolioAssets').mockResolvedValue([]);
    renderPanel({
      componentType: 'avatar',
      props: {},
      span: 6,
    });
    fireEvent.change(screen.getByLabelText(/^Alt text/), { target: { value: 'New alt' } });
    expect(screen.getByText('either src or initials is required')).toBeInTheDocument();
  });

  it('does not reset errors just because the item prop changes in place (the parent is responsible for keying PropertyPanel by selection so React remounts on an actual selection change)', () => {
    const { rerender } = renderPanel({
      componentType: 'heading',
      props: { text: 'Hello', level: 2, align: 'left' },
      span: 6,
    });
    fireEvent.change(screen.getByLabelText(/^Text/), { target: { value: '' } });
    expect(screen.getByText('text is required and must be a string')).toBeInTheDocument();

    // A prop-only rerender (no remount) must NOT wipe errors - if it did, every render caused by
    // a fresh `item` object reference (as `PortfolioEditor` produces on every render) would
    // silently clear validation errors moments after they were set. Resetting on an actual
    // selection change is handled by the parent unmounting/remounting this component (e.g. via a
    // `key={selectedItemId}` prop), not by an effect inside PropertyPanel.
    rerender({
      componentType: 'heading',
      props: { text: 'Different item', level: 2, align: 'left' },
      span: 6,
    });
    expect(screen.getByText('text is required and must be a string')).toBeInTheDocument();
  });

  it('clears errors on remount, simulating the parent keying PropertyPanel by selection', () => {
    const { unmount } = renderPanel({
      componentType: 'heading',
      props: { text: 'Hello', level: 2, align: 'left' },
      span: 6,
    });
    fireEvent.change(screen.getByLabelText(/^Text/), { target: { value: '' } });
    expect(screen.getByText('text is required and must be a string')).toBeInTheDocument();
    unmount();

    renderPanel({
      componentType: 'heading',
      props: { text: 'Different item', level: 2, align: 'left' },
      span: 6,
    });
    expect(screen.queryByText('text is required and must be a string')).not.toBeInTheDocument();
  });
});
