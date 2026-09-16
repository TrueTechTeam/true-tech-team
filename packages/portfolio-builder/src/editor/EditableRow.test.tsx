import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { DndProvider, useDraggable } from '@true-tech-team/react-components';
import { EditableRow } from './EditableRow';
import type { GridItem, PortfolioPage, PageSection, SectionRow } from '../schema/types';

// PointerEvent is polyfilled globally in vitest.setup.ts (jsdom has no native constructor) so
// ResizeEdge's real pointer handlers receive real clientX values here, same as in
// DraggableGridItem.test.tsx.

function makePage(row: SectionRow): { page: PortfolioPage; section: PageSection } {
  const section: PageSection = { id: 'sec1', name: 'Body', showInNav: false, rows: [row] };
  const page: PortfolioPage = {
    schemaVersion: 1,
    slug: 'test',
    title: 'Test',
    templateId: 'default',
    showNav: true,
    sections: [section],
  };
  return { page, section };
}

function mockRect(
  element: Element,
  rect: { left: number; right: number; top: number; bottom: number }
) {
  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
    ...rect,
    x: rect.left,
    y: rect.top,
    width: rect.right - rect.left,
    height: rect.bottom - rect.top,
    toJSON: () => ({}),
  } as DOMRect);
}

/** jsdom does not compute real layout, so `clientWidth`/`getComputedStyle` need explicit mocking
 * to give EditableRow's own column-width measurement (`(clientWidth - 11 * gapPx) / 12`) a known,
 * assertable result in tests. */
function mockColumnWidth(rowElement: HTMLElement, columnWidthPx: number, gapPx = 16) {
  Object.defineProperty(rowElement, 'clientWidth', {
    value: Math.round(columnWidthPx * 12 + 11 * gapPx),
    configurable: true,
  });
  vi.spyOn(window, 'getComputedStyle').mockReturnValue({
    columnGap: `${gapPx}px`,
  } as CSSStyleDeclaration);
}

// React 19's automatic batching defers the state update from `dragover` (which schedules
// EditableRow's `insertion` state) to a microtask rather than flushing it before this synchronous
// test function returns control. Without `act()`, the immediately-following `drop` dispatch would
// run against the PRE-dragover render (a stale `handleDrop` closure that still sees
// `insertion === null`), silently no-op-ing the insert. `fireEvent.*` wraps its dispatch in
// `act()` for exactly this reason; these two helpers dispatch a manually-constructed `DragEvent`
// (needed for `clientX`/`clientY`, which `fireEvent.dragOver`/`drop` also now support via the
// DragEvent polyfill, but the manual construction here matches the geometry-driven intent of
// these tests) so they need the same `act()` wrapping applied explicitly.
function dispatchDragOver(target: Element, clientX: number, clientY: number) {
  const event = new DragEvent('dragover', {
    bubbles: true,
    cancelable: true,
    clientX,
    clientY,
    dataTransfer: new DataTransfer(),
  });
  act(() => {
    target.dispatchEvent(event);
  });
}

function dispatchDrop(target: Element, clientX: number, clientY: number) {
  const dataTransfer = new DataTransfer();
  const event = new DragEvent('drop', {
    bubbles: true,
    cancelable: true,
    clientX,
    clientY,
    dataTransfer,
  });
  act(() => {
    target.dispatchEvent(event);
  });
}

/** Stands in for a Palette entry so tests can populate DndContext's `active` without rendering
 * the real Palette component - fires a real dragstart through the library's own useDraggable
 * listener, exactly like a real palette card would. */
function FakePaletteSource({ componentType }: { componentType: string }) {
  const { setNodeRef, attributes, listeners } = useDraggable({
    id: `palette:${componentType}`,
    data: { type: 'palette-item', componentType },
  });
  return <div ref={setNodeRef} {...attributes} {...listeners} data-testid="fake-palette-source" />;
}

describe('EditableRow', () => {
  it('renders each item in the row and marks its root with data-row-id', () => {
    const row: SectionRow = {
      id: 'row1',
      items: [{ id: 'item1', component: 'heading', span: 12, props: { text: 'Hi' } }],
    };
    const { page, section } = makePage(row);
    render(
      <DndProvider>
        <EditableRow
          page={page}
          section={section}
          row={row}
          rowIndex={0}
          onPageChange={vi.fn()}
          selectedItemId={null}
          onSelectItem={vi.fn()}
        />
      </DndProvider>
    );
    expect(screen.getByText('Hi')).toBeInTheDocument();
    expect(screen.getByTestId(row.id)).toHaveAttribute('data-row-id', 'row1');
  });

  it('inserts a dropped palette item into the row at the boundary nearest the pointer', () => {
    const row: SectionRow = {
      id: 'row1',
      items: [
        { id: 'item1', component: 'heading', span: 4, props: { text: 'A' } },
        { id: 'item2', component: 'heading', span: 4, props: { text: 'B' } },
      ],
    };
    const { page, section } = makePage(row);
    const onPageChange = vi.fn();
    render(
      <DndProvider>
        <FakePaletteSource componentType="badge" />
        <EditableRow
          page={page}
          section={section}
          row={row}
          rowIndex={0}
          onPageChange={onPageChange}
          selectedItemId={null}
          onSelectItem={vi.fn()}
        />
      </DndProvider>
    );

    const rowElement = screen.getByTestId('row1');
    mockRect(rowElement, { left: 0, right: 632, top: 0, bottom: 80 });
    mockRect(screen.getByTestId('grid-item-item1'), { left: 0, right: 300, top: 0, bottom: 80 });
    mockRect(screen.getByTestId('grid-item-item2'), { left: 316, right: 632, top: 0, bottom: 80 });

    fireEvent.dragStart(screen.getByTestId('fake-palette-source'));
    // Midway between item1's right edge (300) and item2's left edge (316) is 308 - clearly the
    // boundary between them (index 1), and clientY=40 sits in the row's middle 60% (16-64 of an
    // 80px-tall row), so this is squarely an in-row insert, not a new-row-above/below case.
    dispatchDragOver(rowElement, 308, 40);
    dispatchDrop(rowElement, 308, 40);

    expect(onPageChange).toHaveBeenCalledWith(
      expect.objectContaining({
        sections: [
          expect.objectContaining({
            rows: [
              expect.objectContaining({
                items: [
                  expect.objectContaining({ id: 'item1' }),
                  expect.objectContaining({ component: 'badge', span: 2 }),
                  expect.objectContaining({ id: 'item2' }),
                ],
              }),
            ],
          }),
        ],
      })
    );
  });

  it('inserts a new row above the current one when dropped near its top edge', () => {
    const row: SectionRow = {
      id: 'row1',
      items: [{ id: 'item1', component: 'heading', span: 6, props: { text: 'Hi' } }],
    };
    const { page, section } = makePage(row);
    const onPageChange = vi.fn();
    render(
      <DndProvider>
        <FakePaletteSource componentType="badge" />
        <EditableRow
          page={page}
          section={section}
          row={row}
          rowIndex={0}
          onPageChange={onPageChange}
          selectedItemId={null}
          onSelectItem={vi.fn()}
        />
      </DndProvider>
    );

    const rowElement = screen.getByTestId('row1');
    mockRect(rowElement, { left: 0, right: 632, top: 0, bottom: 80 });
    mockRect(screen.getByTestId('grid-item-item1'), { left: 0, right: 632, top: 0, bottom: 80 });

    fireEvent.dragStart(screen.getByTestId('fake-palette-source'));
    // clientY=10 is within the top 20% of an 80px-tall row (below 16px), so this resolves to
    // new-row-above rather than an in-row insert.
    dispatchDragOver(rowElement, 100, 10);
    dispatchDrop(rowElement, 100, 10);

    expect(onPageChange).toHaveBeenCalledWith(
      expect.objectContaining({
        sections: [
          expect.objectContaining({
            rows: [
              expect.objectContaining({ items: [expect.objectContaining({ component: 'badge' })] }),
              expect.objectContaining({ id: 'row1' }),
            ],
          }),
        ],
      })
    );
  });

  it("resizes an item against the row's free capacity when it has no neighbor on that side", () => {
    const row: SectionRow = {
      id: 'row1',
      items: [{ id: 'item1', component: 'heading', span: 6, props: { text: 'Hi' } }],
    };
    const { page, section } = makePage(row);
    const onPageChange = vi.fn();
    render(
      <DndProvider>
        <EditableRow
          page={page}
          section={section}
          row={row}
          rowIndex={0}
          onPageChange={onPageChange}
          selectedItemId={null}
          onSelectItem={vi.fn()}
        />
      </DndProvider>
    );
    const rowElement = screen.getByTestId('row1');
    mockColumnWidth(rowElement, 80);
    const rightEdge = screen.getByLabelText('Resize right edge');
    fireEvent.pointerDown(rightEdge, { clientX: 0 });
    // 800px / 80px column width rounds to 10 columns of growth, i.e. item1 alone (the row's only
    // item) would reach span 16 if unclamped - deliberately chosen well past 12 so this test
    // actually distinguishes the correct ceiling (12, since nothing else occupies the row) from a
    // double-counted one (item.span + remaining = 18), which would wrongly let it reach 16.
    fireEvent.pointerMove(window, { clientX: 800 });
    fireEvent.pointerUp(window);
    // item1 is the row's only item (6/12 used, 6 free) - growing its right edge with no right
    // neighbor draws from free row capacity, clamped at 12 total.
    expect(onPageChange).toHaveBeenCalledWith(
      expect.objectContaining({
        sections: [
          expect.objectContaining({
            rows: [
              expect.objectContaining({
                items: [expect.objectContaining({ id: 'item1', span: 12 })],
              }),
            ],
          }),
        ],
      })
    );
  });

  it('trades width symmetrically with a right neighbor when resizing a shared boundary', () => {
    const row: SectionRow = {
      id: 'row1',
      items: [
        { id: 'item1', component: 'heading', span: 6, props: { text: 'A' } },
        { id: 'item2', component: 'heading', span: 6, props: { text: 'B' } },
      ],
    };
    const { page, section } = makePage(row);
    const onPageChange = vi.fn();
    render(
      <DndProvider>
        <EditableRow
          page={page}
          section={section}
          row={row}
          rowIndex={0}
          onPageChange={onPageChange}
          selectedItemId={null}
          onSelectItem={vi.fn()}
        />
      </DndProvider>
    );
    mockColumnWidth(screen.getByTestId('row1'), 80);
    const item1RightEdge = screen.getAllByLabelText('Resize right edge')[0];
    fireEvent.pointerDown(item1RightEdge, { clientX: 0 });
    fireEvent.pointerMove(window, { clientX: 160 });
    fireEvent.pointerUp(window);
    // item1 grows by 2 (160px / 80px column width, rounded), item2 shrinks by 2 - their combined
    // span (12) is unchanged, matching the spec's symmetric-trade rule.
    const finalPage = onPageChange.mock.calls[onPageChange.mock.calls.length - 1][0];
    const finalItems = finalPage.sections[0].rows[0].items;
    expect(finalItems.find((item: GridItem) => item.id === 'item1').span).toBe(8);
    expect(finalItems.find((item: GridItem) => item.id === 'item2').span).toBe(4);
  });
});
