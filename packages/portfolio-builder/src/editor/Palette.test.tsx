import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DndProvider } from '@true-tech-team/react-components';
import { Palette } from './Palette';
import { COMPONENT_TYPES } from '../schema/types';

const ARRAY_PROP_TYPES = ['carousel', 'tabs', 'truncatedList'];

// `useDraggable` (used by every Palette entry) calls the library's `useDndContext` internally,
// which throws when rendered outside a `DndProvider`. In the real app, piece 5's
// `PageDragDropContainer` supplies this provider around both `Palette` and the canvas; these
// standalone tests supply an equivalent minimal wrapper.
function renderPalette() {
  return render(
    <DndProvider>
      <Palette />
    </DndProvider>
  );
}

describe('Palette', () => {
  it('renders exactly the 22 non-array-prop component types', () => {
    renderPalette();
    const expectedCount = COMPONENT_TYPES.filter((t) => !ARRAY_PROP_TYPES.includes(t)).length;
    expect(screen.getAllByRole('button')).toHaveLength(expectedCount);
  });

  it('does not render entries for array-prop component types', () => {
    renderPalette();
    for (const type of ARRAY_PROP_TYPES) {
      expect(screen.queryByText(new RegExp(type, 'i'))).not.toBeInTheDocument();
    }
  });

  it('groups entries under Interactive and Display headings', () => {
    renderPalette();
    expect(screen.getByText('Interactive')).toBeInTheDocument();
    expect(screen.getByText('Display')).toBeInTheDocument();
  });

  it('renders known entries with an accessible label matching their name', () => {
    renderPalette();
    expect(screen.getByText('Heading')).toBeInTheDocument();
    expect(screen.getByText('Button')).toBeInTheDocument();
  });
});
