import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DndProvider, useDraggable } from '@true-tech-team/react-components';
import { DropZone } from './DropZone';

// `useDroppable` (used internally here) calls the library's `useDndContext`, which throws when
// rendered outside a `DndProvider`. In the real app, piece 5's `PageDragDropContainer` supplies
// this provider around the whole canvas; these standalone tests supply an equivalent minimal
// wrapper.

// A minimal drag source used to put the shared `DndProvider` into an "active drag" state. The
// library's `useDroppable` only reports `aria-dropeffect="move"` while a compatible drag is
// actually in progress (verified by reading the compiled hook source) — it is "none" at rest, not
// statically "move" as the task brief's original test assumed.
function DragSource() {
  const { setNodeRef, attributes, listeners } = useDraggable({
    id: 'source1',
    data: { type: 'grid-item' },
  });
  return (
    <div ref={setNodeRef} {...attributes} {...listeners}>
      Drag me
    </div>
  );
}

function fakeDataTransfer() {
  return {
    setData: () => {},
    setDragImage: () => {},
    effectAllowed: '',
    dropEffect: '',
  };
}

describe('DropZone', () => {
  it('renders when not disabled', () => {
    render(
      <DndProvider>
        <DropZone
          id="gap1"
          data={{ type: 'row-gap', sectionId: 'sec1', rowId: 'row1', index: 0 }}
          label="Drop before item"
        />
      </DndProvider>
    );
    expect(screen.getByLabelText('Drop before item')).toBeInTheDocument();
  });

  it('renders nothing when disabled', () => {
    const { container } = render(
      <DndProvider>
        <DropZone
          id="gap1"
          data={{ type: 'row-gap', sectionId: 'sec1', rowId: 'row1', index: 0 }}
          disabled
          label="Drop before item"
        />
      </DndProvider>
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('exposes aria-dropeffect, reflecting whether a compatible drag is active', () => {
    render(
      <DndProvider>
        <DragSource />
        <DropZone
          id="gap1"
          data={{ type: 'new-row-gap', sectionId: 'sec1', index: 0 }}
          label="Drop to create a new row"
        />
      </DndProvider>
    );
    const dropZone = screen.getByLabelText('Drop to create a new row');
    expect(dropZone).toHaveAttribute('aria-dropeffect', 'none');

    fireEvent.dragStart(screen.getByText('Drag me'), { dataTransfer: fakeDataTransfer() });

    expect(dropZone).toHaveAttribute('aria-dropeffect', 'move');
  });
});
