import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useDraggable } from '@true-tech-team/react-components';
import { PageDragDropContainer } from './PageDragDropContainer';
import { DropZone } from './DropZone';
import type { PortfolioPage } from '../schema/types';

function fixturePage(): PortfolioPage {
  return {
    schemaVersion: 1,
    slug: 'test',
    title: 'Test Page',
    templateId: 'test',
    showNav: false,
    sections: [
      {
        id: 'sec1',
        name: 'Section 1',
        showInNav: false,
        rows: [
          {
            id: 'row1',
            items: [{ id: 'item1', component: 'heading', span: 6, props: { text: 'A' } }],
          },
        ],
      },
    ],
  };
}

function PaletteDraggable({ componentType }: { componentType: string }) {
  const { setNodeRef, attributes, listeners } = useDraggable({
    id: `palette:${componentType}`,
    data: { type: 'palette-item', componentType },
  });
  return (
    <button ref={setNodeRef} {...attributes} {...listeners}>
      Drag me
    </button>
  );
}

function GridItemDraggable({
  itemId,
  sectionId = 'sec1',
  rowId = 'row1',
  index = 0,
}: {
  itemId: string;
  sectionId?: string;
  rowId?: string;
  index?: number;
}) {
  const { setNodeRef, attributes, listeners } = useDraggable({
    id: itemId,
    data: { type: 'grid-item', sectionId, rowId, index },
  });
  return (
    <button ref={setNodeRef} {...attributes} {...listeners}>
      Existing item
    </button>
  );
}

// The library's compiled `useDraggable`/`useDroppable` handlers read `event.dataTransfer`
// unconditionally (setData on drag start, dropEffect assignment on drag over) — verified by
// reading `node_modules/@true-tech-team/react-components/index.mjs`. jsdom does not populate
// `dataTransfer` on synthetic drag events by default, so every fired event needs a fake one (the
// same fix Task 4's `DropZone.test.tsx` already needed).
function fakeDataTransfer() {
  return {
    setData: () => {},
    setDragImage: () => {},
    effectAllowed: '',
    dropEffect: '',
  };
}

function drag(source: HTMLElement, target: HTMLElement) {
  const dataTransfer = fakeDataTransfer();
  fireEvent.dragStart(source, { dataTransfer });
  fireEvent.dragEnter(target, { dataTransfer });
  fireEvent.dragOver(target, { dataTransfer });
  fireEvent.drop(target, { dataTransfer });
  fireEvent.dragEnd(source, { dataTransfer });
}

describe('PageDragDropContainer', () => {
  it('inserts a new item with default props when a palette item is dropped on a row-gap', () => {
    const onPageChange = vi.fn();
    render(
      <PageDragDropContainer page={fixturePage()} onPageChange={onPageChange}>
        <PaletteDraggable componentType="badge" />
        <DropZone
          id="gap1"
          data={{ type: 'row-gap', sectionId: 'sec1', rowId: 'row1', index: 1 }}
          label="Drop zone"
        />
      </PageDragDropContainer>
    );

    drag(screen.getByText('Drag me'), screen.getByLabelText('Drop zone'));

    expect(onPageChange).toHaveBeenCalledTimes(1);
    const newPage = onPageChange.mock.calls[0][0];
    expect(newPage.sections[0].rows[0].items).toHaveLength(2);
    expect(newPage.sections[0].rows[0].items[1].component).toBe('badge');
    expect(newPage.sections[0].rows[0].items[1].props).toEqual({ label: 'New' });
    expect(newPage.sections[0].rows[0].items[1].span).toBe(6);
  });

  it('creates a new row when a palette item is dropped on a new-row-gap', () => {
    const onPageChange = vi.fn();
    render(
      <PageDragDropContainer page={fixturePage()} onPageChange={onPageChange}>
        <PaletteDraggable componentType="spacer" />
        <DropZone
          id="newrow1"
          data={{ type: 'new-row-gap', sectionId: 'sec1', index: 1 }}
          label="New row zone"
        />
      </PageDragDropContainer>
    );

    drag(screen.getByText('Drag me'), screen.getByLabelText('New row zone'));

    const newPage = onPageChange.mock.calls[0][0];
    expect(newPage.sections[0].rows).toHaveLength(2);
    expect(newPage.sections[0].rows[1].items[0].component).toBe('spacer');
    expect(newPage.sections[0].rows[1].items[0].span).toBe(12);
  });

  it('moves an existing item to a different row-gap', () => {
    const onPageChange = vi.fn();
    const page = fixturePage();
    // Give row1 a second item so it isn't emptied out (and pruned — `removeItemInternal` drops a
    // row entirely once its last item leaves, per Task 1's transforms) by the move. This keeps
    // the test genuinely exercising a cross-row move rather than a move-plus-row-deletion.
    page.sections[0].rows[0].items.push({ id: 'item2', component: 'text', span: 6, props: {} });
    page.sections[0].rows.push({ id: 'row2', items: [] });
    render(
      <PageDragDropContainer page={page} onPageChange={onPageChange}>
        <GridItemDraggable itemId="item1" />
        <DropZone
          id="gap2"
          data={{ type: 'row-gap', sectionId: 'sec1', rowId: 'row2', index: 0 }}
          label="Target"
        />
      </PageDragDropContainer>
    );

    drag(screen.getByText('Existing item'), screen.getByLabelText('Target'));

    const newPage = onPageChange.mock.calls[0][0];
    expect(newPage.sections[0].rows[0].items.map((i: { id: string }) => i.id)).toEqual(['item2']);
    expect(newPage.sections[0].rows[1].items.map((i: { id: string }) => i.id)).toEqual(['item1']);
  });

  it('moves an existing item onto a new-row-gap', () => {
    const onPageChange = vi.fn();
    render(
      <PageDragDropContainer page={fixturePage()} onPageChange={onPageChange}>
        <GridItemDraggable itemId="item1" />
        <DropZone
          id="newrow2"
          data={{ type: 'new-row-gap', sectionId: 'sec1', index: 1 }}
          label="New row target"
        />
      </PageDragDropContainer>
    );

    drag(screen.getByText('Existing item'), screen.getByLabelText('New row target'));

    const newPage = onPageChange.mock.calls[0][0];
    expect(newPage.sections[0].rows).toHaveLength(1);
    expect(newPage.sections[0].rows[0].items.map((i: { id: string }) => i.id)).toEqual(['item1']);
  });

  it('does not call onPageChange when the drop would overflow the target row capacity', () => {
    const onPageChange = vi.fn();
    const page = fixturePage();
    page.sections[0].rows[0].items[0].span = 12; // row already full
    render(
      <PageDragDropContainer page={page} onPageChange={onPageChange}>
        <PaletteDraggable componentType="badge" />
        <DropZone
          id="gap1"
          data={{ type: 'row-gap', sectionId: 'sec1', rowId: 'row1', index: 1 }}
          label="Full row"
        />
      </PageDragDropContainer>
    );

    // In real usage this DropZone would be `disabled` and never render — this test exercises
    // the container's own defensive catch directly by forcing the drop to happen anyway.
    drag(screen.getByText('Drag me'), screen.getByLabelText('Full row'));

    expect(onPageChange).not.toHaveBeenCalled();
  });

  it('adjusts a forward same-row reorder from the rendered gap index to moveItem convention', () => {
    // Row [item1, item2, item3]. Dragging item1 (its own current index is 0) onto the row-gap
    // rendered between item2 and item3 (rendered index 2) should produce [item2, item1, item3] —
    // not [item2, item3, item1] — because moveItem applies its index after the dragged item has
    // already been filtered out of the row.
    const onPageChange = vi.fn();
    const page = fixturePage();
    page.sections[0].rows[0].items = [
      { id: 'item1', component: 'heading', span: 4, props: { text: 'A' } },
      { id: 'item2', component: 'text', span: 4, props: { text: 'B' } },
      { id: 'item3', component: 'badge', span: 4, props: { label: 'C' } },
    ];
    render(
      <PageDragDropContainer page={page} onPageChange={onPageChange}>
        <GridItemDraggable itemId="item1" index={0} />
        <DropZone
          id="gap3"
          data={{ type: 'row-gap', sectionId: 'sec1', rowId: 'row1', index: 2 }}
          label="Between 2 and 3"
        />
      </PageDragDropContainer>
    );

    drag(screen.getByText('Existing item'), screen.getByLabelText('Between 2 and 3'));

    expect(onPageChange).toHaveBeenCalledTimes(1);
    const newPage = onPageChange.mock.calls[0][0];
    expect(newPage.sections[0].rows[0].items.map((i: { id: string }) => i.id)).toEqual([
      'item2',
      'item1',
      'item3',
    ]);
  });

  it('does not call onPageChange when dragging an existing item whose own span does not fit the target row', () => {
    const onPageChange = vi.fn();
    const page = fixturePage();
    // row1 (target) has only 2 remaining capacity; row2 (source) holds an item with span 6,
    // which cannot fit. This is an ordinary user action, not a bug, so it should silently no-op.
    page.sections[0].rows[0].items = [
      { id: 'item1', component: 'heading', span: 10, props: { text: 'A' } },
    ];
    page.sections[0].rows.push({
      id: 'row2',
      items: [{ id: 'item2', component: 'text', span: 6, props: { text: 'B' } }],
    });
    render(
      <PageDragDropContainer page={page} onPageChange={onPageChange}>
        <GridItemDraggable itemId="item2" sectionId="sec1" rowId="row2" index={0} />
        <DropZone
          id="gap4"
          data={{ type: 'row-gap', sectionId: 'sec1', rowId: 'row1', index: 1 }}
          label="Nearly full row"
        />
      </PageDragDropContainer>
    );

    drag(screen.getByText('Existing item'), screen.getByLabelText('Nearly full row'));

    expect(onPageChange).not.toHaveBeenCalled();
  });

  it('does not call onPageChange when an item is dropped back at its own current position', () => {
    const onPageChange = vi.fn();
    const page = fixturePage();
    page.sections[0].rows[0].items = [
      { id: 'item1', component: 'heading', span: 4, props: { text: 'A' } },
      { id: 'item2', component: 'text', span: 4, props: { text: 'B' } },
    ];
    render(
      <PageDragDropContainer page={page} onPageChange={onPageChange}>
        <GridItemDraggable itemId="item1" index={0} />
        <DropZone
          id="gap5"
          data={{ type: 'row-gap', sectionId: 'sec1', rowId: 'row1', index: 0 }}
          label="Own position"
        />
      </PageDragDropContainer>
    );

    drag(screen.getByText('Existing item'), screen.getByLabelText('Own position'));

    expect(onPageChange).not.toHaveBeenCalled();
  });
});
