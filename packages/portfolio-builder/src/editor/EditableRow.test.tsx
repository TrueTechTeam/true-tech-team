import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { DndProvider, useDraggable } from '@true-tech-team/react-components';
import { EditableRow } from './EditableRow';
import editorStyles from './editor.module.scss';
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

/**
 * jsdom does not compute real layout, so `clientWidth`/`getComputedStyle` need explicit mocking to
 * give EditableRow's own column-width measurement (`(clientWidth - 11 * gapPx) / 12`) a known,
 * assertable result in tests.
 *
 * Deliberately PER-ELEMENT rather than a blanket `window.getComputedStyle` stub. The gap
 * (`gap: var(--spacing-md)`) lives on the INNER flex row from `Grid.module.scss`; the OUTER
 * droppable wrapper has no gap CSS at all, and a real browser reports `column-gap: normal` for it
 * - which `parseFloat` turns into `NaN` (and `'normal'` is truthy, so a `|| '0'` fallback never
 * fires). Both facts are reproduced here: a blanket stub that returned `'16px'` for every element
 * made measuring the wrong element completely invisible to this suite, which is exactly how the
 * NaN-span bug shipped.
 *
 * Only these two elements are intercepted; every other element falls through to jsdom's real
 * implementation.
 */
function mockColumnWidth(rowId: string, columnWidthPx: number, gapPx = 16) {
  const outer = screen.getByTestId(rowId);
  const inner = screen.getByTestId(`row-inner:${rowId}`);
  Object.defineProperty(inner, 'clientWidth', {
    value: Math.round(columnWidthPx * 12 + 11 * gapPx),
    configurable: true,
  });
  const realGetComputedStyle = window.getComputedStyle.bind(window);
  vi.spyOn(window, 'getComputedStyle').mockImplementation(
    (element: Element, pseudoElement?: string | null) => {
      if (element === inner) {
        return { columnGap: `${gapPx}px` } as CSSStyleDeclaration;
      }
      if (element === outer) {
        return { columnGap: 'normal' } as CSSStyleDeclaration;
      }
      return realGetComputedStyle(element, pseudoElement ?? undefined);
    }
  );
  return { outer, inner };
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

/** The grid-item equivalent of `FakePaletteSource`: stands in for an existing `DraggableGridItem`
 * living in some OTHER row, so a drop can be driven with `active.data.type === 'grid-item'`. */
function FakeGridItemSource({
  itemId,
  sectionId,
  rowId,
  index,
}: {
  itemId: string;
  sectionId: string;
  rowId: string;
  index: number;
}) {
  const { setNodeRef, attributes, listeners } = useDraggable({
    id: itemId,
    data: { type: 'grid-item', sectionId, rowId, index },
  });
  return (
    <div ref={setNodeRef} {...attributes} {...listeners} data-testid="fake-grid-item-source" />
  );
}

describe('EditableRow', () => {
  // `mockColumnWidth` replaces `window.getComputedStyle` for the whole process, so it has to be put
  // back between tests - otherwise one test's per-element stub leaks into the next (the old blanket
  // stub had exactly this problem, silently applying to every later test in the file).
  afterEach(() => {
    vi.restoreAllMocks();
  });

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
    mockColumnWidth('row1', 80);
    const rightEdge = screen.getByLabelText('Resize right edge');
    fireEvent.pointerDown(rightEdge, { clientX: 0 });
    // 800px / 80px column width rounds to 10 columns of growth, i.e. item1 alone (the row's only
    // item) would reach span 16 if unclamped (6 + 10). Correct ceiling is 12 (nothing else occupies
    // the row); a double-counted ceiling (item.span + remaining = 6 + 12 = 18) would NOT clamp this
    // particular delta at all, since 16 < 18 - so the two formulas genuinely disagree here (16 vs
    // 12), unlike a smaller delta that both formulas would clamp identically.
    fireEvent.pointerMove(window, { clientX: 800 });
    // Assert the MID-GESTURE preview here, before `pointerUp` commits it. `updateItemSpan` (called
    // at commit time) applies its own identical 12-column capacity clamp, so the committed value
    // alone can't distinguish the two ceiling formulas - both the correct (12) and double-counted
    // (16, itself still under the buggy ceiling of 18) previews would commit to 12 regardless,
    // masking the bug. The preview computed directly by `handleResize` (reflected here via the
    // rendered `--span-desktop` custom property, never routed through `updateItemSpan`) is the only
    // place the ceiling formula's effect is actually observable pre-commit.
    expect(screen.getByTestId('grid-item-item1').style.getPropertyValue('--span-desktop')).toBe(
      '12'
    );
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
    mockColumnWidth('row1', 80);
    const item1RightEdge = screen.getAllByLabelText('Resize right edge')[0];
    fireEvent.pointerDown(item1RightEdge, { clientX: 0 });
    // Two pointermoves, not one: `effectiveDelta` is always the TOTAL delta since gesture start
    // (ResizeEdge re-measures from its frozen `startXRef`, not incrementally), so `handleResize`
    // must compute `item.span + effectiveDelta` (the stable prop) on every call, not
    // `previewSpan + effectiveDelta` (the just-set preview from the PRIOR call). A single
    // pointermove can't tell these apart, since on the first move `previewSpan === item.span` and
    // both formulas agree. This first move (clientX: 80, effectiveDelta 1) intentionally sets a
    // preview span (7) that differs from item.span (6), so the second move below can expose a
    // buggy implementation that reads from it instead.
    fireEvent.pointerMove(window, { clientX: 80 });
    // Second move, still measured from the SAME gesture start (clientX: 160, effectiveDelta 2).
    // Correct: item.span(6) + 2 = 8. Buggy (previewSpan-based): previewSpan(7 from the first move)
    // + 2 = 9 - double-applying the delta. Asserting 8 below pins the correct formula.
    fireEvent.pointerMove(window, { clientX: 160 });
    fireEvent.pointerUp(window);
    // item1 grows by 2 total (160px / 80px column width, rounded, from gesture start), item2
    // shrinks by 2 - their combined span (12) is unchanged, matching the spec's symmetric-trade
    // rule.
    const finalPage = onPageChange.mock.calls[onPageChange.mock.calls.length - 1][0];
    const finalItems = finalPage.sections[0].rows[0].items;
    expect(finalItems.find((item: GridItem) => item.id === 'item1').span).toBe(8);
    expect(finalItems.find((item: GridItem) => item.id === 'item2').span).toBe(4);
  });

  // C1 regression pin. Fails against the pre-fix code, which measured `getComputedStyle` on the
  // OUTER droppable wrapper: that element has no gap CSS, a real browser reports
  // `column-gap: normal`, `parseFloat('normal')` is NaN, and the NaN rides all the way through
  // ResizeEdge's delta math into `updateItemSpan(page, id, NaN)` - which passes schema validation
  // (`typeof NaN === 'number'`), serializes to `"span": null`, and makes the page unloadable.
  it('measures the column width from the inner flex row, not the outer droppable wrapper', () => {
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
    // Only the INNER row reports a real gap/width here; the outer wrapper reports the
    // `column-gap: normal` a real browser gives it.
    mockColumnWidth('row1', 80);

    fireEvent.pointerDown(screen.getByLabelText('Resize right edge'), { clientX: 0 });
    fireEvent.pointerMove(window, { clientX: 160 });

    // 160px over an 80px column = exactly 2 columns of growth: 6 -> 8. Measuring the wrong element
    // yields NaN here, which renders as "NaN" (or, with the guard, leaves the span at 6).
    const spanDuringDrag = screen
      .getByTestId('grid-item-item1')
      .style.getPropertyValue('--span-desktop');
    expect(spanDuringDrag).toBe('8');

    fireEvent.pointerUp(window);
    const finalPage = onPageChange.mock.calls[onPageChange.mock.calls.length - 1][0];
    const finalSpan = finalPage.sections[0].rows[0].items[0].span;
    expect(finalSpan).toBe(8);
    expect(Number.isFinite(finalSpan)).toBe(true);
  });

  // C1 defense in depth: even if the measurement fails outright, a resize must degrade to
  // "does nothing" rather than writing a non-finite span into page state.
  it('does not resize at all when the column width cannot be measured', () => {
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
    // No `mockColumnWidth` at all: jsdom computes no layout, so the measurement can't succeed.
    fireEvent.pointerDown(screen.getByLabelText('Resize right edge'), { clientX: 0 });
    fireEvent.pointerMove(window, { clientX: 800 });
    fireEvent.pointerUp(window);

    expect(screen.getByTestId('grid-item-item1').style.getPropertyValue('--span-desktop')).toBe(
      '6'
    );
    expect(onPageChange).not.toHaveBeenCalled();
  });

  // I2 regression pin: `data-selected` alone is not enough - the outline only ever renders if the
  // wrapper also carries the class the CSS rule is written against, in a stylesheet this component
  // actually imports.
  it('gives the selected item wrapper the class the selection outline is styled on', () => {
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
          selectedItemId="item1"
          onSelectItem={vi.fn()}
        />
      </DndProvider>
    );
    const wrapper = screen.getByText('Hi').closest('[data-selected]');
    expect(wrapper).toHaveAttribute('data-selected', 'true');
    expect(editorStyles.selectableItem).toBeTruthy();
    expect(wrapper?.className).toContain(editorStyles.selectableItem);
  });

  // I3 regression pin: the item is `role="button" tabIndex={0}`, so a keyboard user must be able
  // to activate it.
  it.each(['Enter', ' '])('selects the item when %s is pressed on it', (key) => {
    const row: SectionRow = {
      id: 'row1',
      items: [{ id: 'item1', component: 'heading', span: 12, props: { text: 'Hi' } }],
    };
    const { page, section } = makePage(row);
    const onSelectItem = vi.fn();
    render(
      <DndProvider>
        <EditableRow
          page={page}
          section={section}
          row={row}
          rowIndex={0}
          onPageChange={vi.fn()}
          selectedItemId={null}
          onSelectItem={onSelectItem}
        />
      </DndProvider>
    );
    const selectable = screen.getByText('Hi').closest('[role="button"]');
    if (!selectable) {
      throw new Error('expected a selectable item wrapper');
    }
    fireEvent.keyDown(selectable, { key });

    expect(onSelectItem).toHaveBeenCalledWith('item1');
    // ...and it must NOT also trip `useDraggable`'s own Enter/Space "pick up for keyboard drag"
    // handler on the ancestor draggable box.
    expect(selectable.closest('[draggable="true"]')).not.toHaveAttribute('data-dragging', 'true');
  });

  it('does not report a page change when a resize gesture ends back where it started', () => {
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
    mockColumnWidth('row1', 80);
    fireEvent.pointerDown(screen.getAllByLabelText('Resize right edge')[0], { clientX: 0 });
    fireEvent.pointerMove(window, { clientX: 240 });
    // Dragged back to the exact starting position - nothing actually changed, so the editor must
    // not be marked dirty (which would flip its "Saved" indicator back to unsaved).
    fireEvent.pointerMove(window, { clientX: 0 });
    fireEvent.pointerUp(window);

    expect(onPageChange).not.toHaveBeenCalled();
  });

  it('silently ignores a grid item dragged into a row without room for its span', () => {
    const targetRow: SectionRow = {
      id: 'row1',
      items: [{ id: 'item1', component: 'heading', span: 12, props: { text: 'Full' } }],
    };
    const sourceRow: SectionRow = {
      id: 'row2',
      items: [{ id: 'item2', component: 'heading', span: 6, props: { text: 'Mover' } }],
    };
    const section: PageSection = {
      id: 'sec1',
      name: 'Body',
      showInNav: false,
      rows: [targetRow, sourceRow],
    };
    const page: PortfolioPage = {
      schemaVersion: 1,
      slug: 'test',
      title: 'Test',
      templateId: 'default',
      showNav: true,
      sections: [section],
    };
    const onPageChange = vi.fn();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <DndProvider>
        <FakeGridItemSource itemId="item2" sectionId="sec1" rowId="row2" index={0} />
        <EditableRow
          page={page}
          section={section}
          row={targetRow}
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

    fireEvent.dragStart(screen.getByTestId('fake-grid-item-source'));
    dispatchDragOver(rowElement, 620, 40);
    dispatchDrop(rowElement, 620, 40);

    // The target row is already full (12/12) and the dragged item's span is 6, so this cannot fit.
    // That is an ordinary user action, not a bug: no page change, and nothing logged as an error.
    expect(onPageChange).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
  });
});
