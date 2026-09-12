import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DndProvider } from '@true-tech-team/react-components';
import { DraggableGridItem } from './DraggableGridItem';
import type { GridItem } from '../schema/types';

function fixtureItem(): GridItem {
  return { id: 'item1', component: 'heading', span: 6, props: { text: 'Hi' } };
}

// `useDraggable` (used internally here) calls the library's `useDndContext`, which throws when
// rendered outside a `DndProvider`. In the real app, piece 5's `PageDragDropContainer` supplies
// this provider around the whole canvas; these standalone tests supply an equivalent minimal
// wrapper.
function renderItem(children = <p>Content</p>) {
  return render(
    <DndProvider>
      <DraggableGridItem sectionId="sec1" rowId="row1" index={0} item={fixtureItem()}>
        {children}
      </DraggableGridItem>
    </DndProvider>
  );
}

describe('DraggableGridItem', () => {
  it('renders its children', () => {
    renderItem();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders a drag handle', () => {
    renderItem();
    expect(screen.getByRole('button', { name: /drag/i })).toBeInTheDocument();
  });

  it('marks the wrapping element as draggable', () => {
    const { container } = renderItem();
    expect(container.querySelector('[draggable="true"]')).toBeInTheDocument();
  });
});
