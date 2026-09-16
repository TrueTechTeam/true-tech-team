import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DndProvider } from '@true-tech-team/react-components';
import { DraggableGridItem } from './DraggableGridItem';
import type { GridItem } from '../schema/types';

// jsdom does not implement the PointerEvent constructor (a long-standing gap:
// https://github.com/jsdom/jsdom/issues/2527), so `fireEvent.pointerDown`/`pointerMove` fall back
// to a plain `Event` that drops `clientX`. Polyfill a minimal PointerEvent (MouseEvent already
// carries clientX/clientY) so ResizeEdge's real pointer handlers receive the coordinates this
// test asserts on.
if (typeof window.PointerEvent === 'undefined') {
  class PointerEventPolyfill extends MouseEvent {}
  (window as unknown as { PointerEvent: typeof PointerEventPolyfill }).PointerEvent =
    PointerEventPolyfill;
}

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
    const box = screen.getByRole('button', { name: /drag heading/i });
    expect(box).toHaveAttribute('draggable', 'true');
    expect(box).toContainElement(screen.getByText('Hello'));
    expect(
      screen.queryByLabelText(/^drag heading$/i, { selector: '[data-drag-handle]' })
    ).not.toBeInTheDocument();
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
