import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DndProvider } from '@true-tech-team/react-components';
import { DraggableGridItem } from './DraggableGridItem';
import type { GridItem } from '../schema/types';

// PointerEvent is polyfilled globally in vitest.setup.ts (jsdom has no native constructor), so
// ResizeEdge's real pointer handlers receive real clientX values here.

function makeItem(): GridItem {
  return { id: 'item-1', component: 'heading', span: 6, props: { text: 'Hello' } };
}

describe('DraggableGridItem', () => {
  it('makes the whole item box draggable, with no separate drag handle', () => {
    render(
      <DndProvider onDragEnd={vi.fn()}>
        <DraggableGridItem
          sectionId="sec1"
          rowId="row1"
          index={0}
          item={makeItem()}
          columnWidth={80}
          onResize={vi.fn()}
          onResizeEnd={vi.fn()}
        >
          <span>Hello</span>
        </DraggableGridItem>
      </DndProvider>
    );
    const box = screen.getByLabelText('Drag heading');
    expect(box).toHaveAttribute('draggable', 'true');
    expect(box).toContainElement(screen.getByText('Hello'));
    expect(
      screen.queryByLabelText(/^drag heading$/i, { selector: '[data-drag-handle]' })
    ).not.toBeInTheDocument();
  });

  // ARIA prohibits nesting interactive roles, and `EditableRow` renders its own
  // `role="button" tabIndex={0}` click-to-select wrapper inside this box - so this box must NOT
  // also carry `useDraggable`'s default `role="button"`/`tabIndex={0}` (which would nest two
  // button roles and create two tab stops per grid item).
  it('does not claim button semantics or a tab stop of its own', () => {
    render(
      <DndProvider onDragEnd={vi.fn()}>
        <DraggableGridItem
          sectionId="sec1"
          rowId="row1"
          index={0}
          item={makeItem()}
          columnWidth={80}
          onResize={vi.fn()}
          onResizeEnd={vi.fn()}
        >
          <div role="button" tabIndex={0}>
            Hello
          </div>
        </DraggableGridItem>
      </DndProvider>
    );
    const box = screen.getByLabelText('Drag heading');
    expect(box).not.toHaveAttribute('role');
    expect(box).not.toHaveAttribute('tabindex');
    // Exactly one button role in the subtree: the inner selectable wrapper, not the drag box.
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('renders a resize edge on both the left and right sides', () => {
    render(
      <DndProvider onDragEnd={vi.fn()}>
        <DraggableGridItem
          sectionId="sec1"
          rowId="row1"
          index={0}
          item={makeItem()}
          columnWidth={80}
          onResize={vi.fn()}
          onResizeEnd={vi.fn()}
        >
          <span>Hello</span>
        </DraggableGridItem>
      </DndProvider>
    );
    expect(screen.getByLabelText('Resize left edge')).toBeInTheDocument();
    expect(screen.getByLabelText('Resize right edge')).toBeInTheDocument();
  });

  it('reports a normalized effective delta (accounting for which edge moved) while resizing', () => {
    const onResize = vi.fn();
    render(
      <DndProvider onDragEnd={vi.fn()}>
        <DraggableGridItem
          sectionId="sec1"
          rowId="row1"
          index={0}
          item={makeItem()}
          columnWidth={80}
          onResize={onResize}
          onResizeEnd={vi.fn()}
        >
          <span>Hello</span>
        </DraggableGridItem>
      </DndProvider>
    );
    const rightEdge = screen.getByLabelText('Resize right edge');
    fireEvent.pointerDown(rightEdge, { clientX: 100 });
    fireEvent.pointerMove(window, { clientX: 260 });
    // 160px of rightward movement over an 80px column width rounds to 2 columns of growth.
    expect(onResize).toHaveBeenCalledWith('right', 2);
  });
});
