'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useDroppable, type DragData } from '@true-tech-team/react-components';
import {
  isComponentType,
  type PageSection,
  type PortfolioPage,
  type SectionRow,
  type GridItem,
} from '../schema/types';
import { getRegistryEntry } from '../components/registry';
import {
  getRowRemainingCapacity,
  insertItemInRow,
  insertItemInNewRow,
  moveItem,
  moveItemToNewRow,
  updateItemSpan,
} from '../layout/transforms';
import { nearestBoundary } from '../layout/nearestBoundary';
import { rowAlignmentStyle } from '../grid/rowStyle';
import { collapsedSpans } from '../grid/responsive';
import { ItemRenderer } from '../render/ItemRenderer';
import { DraggableGridItem } from './DraggableGridItem';
import { InsertionLine } from './InsertionLine';
import grid from '../grid/Grid.module.scss';
import styles from './editor.module.scss';

export interface EditableRowProps {
  page: PortfolioPage;
  section: PageSection;
  row: SectionRow;
  rowIndex: number;
  onPageChange: (page: PortfolioPage) => void;
  selectedItemId: string | null;
  onSelectItem: (itemId: string) => void;
}

type InsertionState =
  // `offset` is the insertion line's position within the row root: an X offset for the vertical
  // in-row line, a Y offset for the horizontal new-row lines. Carrying it for ALL three cases (not
  // just `in-row`) is what lets the render read it straight out of state - the new-row-below line
  // used to re-read `getBoundingClientRect().height` during render, a layout read this file
  // deliberately avoids everywhere else (see `columnWidth`'s comment below).
  | { kind: 'in-row'; index: number; offset: number }
  | { kind: 'new-row-above'; offset: number }
  | { kind: 'new-row-below'; offset: number }
  | null;

interface ResizePreview {
  itemId: string;
  span: number;
  neighborId?: string;
  neighborSpan?: number;
}

const NEW_ROW_BAND = 0.2;

function isPaletteData(
  data: DragData
): data is DragData & { type: 'palette-item'; componentType: string } {
  return data.type === 'palette-item' && typeof data.componentType === 'string';
}

function isGridItemData(
  data: DragData
): data is DragData & { type: 'grid-item'; sectionId: string; rowId: string; index: number } {
  return (
    data.type === 'grid-item' &&
    typeof data.sectionId === 'string' &&
    typeof data.rowId === 'string' &&
    typeof data.index === 'number'
  );
}

/** Finds a grid item anywhere in `page` by id. Local (rather than reused from `PortfolioEditor`)
 * to keep `EditableRow` free of an import cycle - `PortfolioEditor` already imports this module. */
function findGridItemById(page: PortfolioPage, itemId: string): GridItem | undefined {
  for (const section of page.sections) {
    for (const row of section.rows) {
      const found = row.items.find((item) => item.id === itemId);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
}

export function EditableRow({
  page,
  section,
  row,
  rowIndex,
  onPageChange,
  selectedItemId,
  onSelectItem,
}: EditableRowProps) {
  // `rootRef` is the OUTER droppable wrapper (the drag-and-drop surface + insertion-line
  // positioning context). `rowInnerRef` is the INNER flex container that actually carries
  // `Grid.module.scss`'s `gap: var(--spacing-md)` and the real content width - column-width
  // measurement must read that one, not the wrapper (which has no gap CSS at all and therefore
  // reports `column-gap: normal` in a real browser).
  const rootRef = useRef<HTMLDivElement | null>(null);
  const rowInnerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef(new Map<string, HTMLElement>());
  const [insertion, setInsertion] = useState<InsertionState>(null);
  const [resizePreview, setResizePreview] = useState<ResizePreview | null>(null);
  // Starts at 0, meaning "not measured yet" (see `measureColumnWidth`'s contract below;
  // `ResizeEdge` refuses to start a gesture on a non-positive width), and is only ever written
  // from `useLayoutEffect`/event handlers below, never read from the DOM during render - see the
  // comment on `handleRowPointerDownCapture` for why a render-time DOM read here would be both a
  // React purity violation and, for the FIRST resize gesture specifically, actually wrong.
  const [columnWidth, setColumnWidth] = useState(0);
  // ResizeEdge's pointerdown/pointerup handlers are captured once, at gesture start, so they never
  // see later re-renders' fresh `resizePreview` state - handleResizeEnd reads this ref (always
  // current) instead of the stale `resizePreview` closure variable it would otherwise see.
  const resizePreviewRef = useRef<ResizePreview | null>(null);

  const { setNodeRef, active, attributes, listeners } = useDroppable({
    id: `row:${row.id}`,
    data: { type: 'row', sectionId: section.id, rowId: row.id },
    accepts: ['palette-item', 'grid-item'],
  });

  /**
   * One column's pixel width, measured off the INNER flex row (`.row` from `Grid.module.scss`) -
   * the element that actually has `gap: var(--spacing-md)` and the row's real content width.
   * Measuring the outer droppable wrapper instead reads `column-gap: normal` in a real browser
   * (`parseFloat('normal')` is `NaN`, and `'normal'` is truthy so a `|| '0'` fallback never fires),
   * which propagates NaN all the way into `updateItemSpan` and corrupts the saved page.
   *
   * Returns `0` for "could not be measured" - callers treat a non-positive width as "don't resize"
   * rather than computing with a garbage number.
   */
  function measureColumnWidth(): number {
    const rowElement = rowInnerRef.current;
    if (!rowElement) {
      return 0;
    }
    const gapPx = parseFloat(getComputedStyle(rowElement).columnGap);
    if (!Number.isFinite(gapPx)) {
      return 0;
    }
    const width = (rowElement.clientWidth - 11 * gapPx) / 12;
    return Number.isFinite(width) && width > 0 ? width : 0;
  }

  // Measure once after mount (`rowInnerRef.current` is only attached post-commit, so this can't run
  // during render - see `measureColumnWidth`'s early-return fallback above). This keeps
  // `columnWidth` reasonably accurate before any interaction; it is NOT what makes resizing
  // correct - see `handleRowPointerDownCapture` below for that.
  useLayoutEffect(() => {
    setColumnWidth(measureColumnWidth());
  }, []);

  // This capture-phase remeasure is the mechanism that actually makes the FIRST resize gesture use
  // an accurate columnWidth - the mount-time effect above is not sufficient on its own. Every
  // `DraggableGridItem`/`ResizeEdge` snapshots its `columnWidth` PROP once, at pointerdown, and
  // reuses that snapshot for the whole gesture (by Task 3 design - ResizeEdge computes delta from a
  // `startXRef` fixed at pointerdown, never re-measuring). If the row's width becomes accurate only
  // via a LATER render (e.g. the mount-effect above, or any other state update), that later,
  // correct value simply arrives too late for a gesture already in progress - ResizeEdge's
  // pointerdown handler already closed over whatever `columnWidth` prop was current when it fired.
  // Native DOM event dispatch is two-pass: capture phase runs root-to-target BEFORE bubble phase
  // reaches the target, in the same synchronous dispatch - so a capture-phase handler on the row
  // (an ancestor of every ResizeEdge) is GUARANTEED to run before ResizeEdge's own bubble-phase
  // onPointerDown, for the very same pointerdown event. Re-measuring here and committing with
  // `flushSync` (forcing the re-render synchronously, before this handler returns and the event
  // continues to the bubble phase) is what gets the fresh value into ResizeEdge's `columnWidth`
  // prop in time for ITS handler to read it. Do not "simplify" this away without preserving that
  // two-pass ordering guarantee - a plain `setColumnWidth` (deferred, batched) would not be applied
  // in time, silently reintroducing the stale-columnWidth-on-first-gesture bug.
  function handleRowPointerDownCapture() {
    const fresh = measureColumnWidth();
    if (fresh !== columnWidth) {
      flushSync(() => setColumnWidth(fresh));
    }
  }

  function computeInsertion(event: React.DragEvent<HTMLDivElement>): InsertionState {
    const rowRect = rootRef.current?.getBoundingClientRect();
    if (!rowRect) {
      return null;
    }
    const relativeY = (event.clientY - rowRect.top) / rowRect.height;
    if (relativeY < NEW_ROW_BAND) {
      return { kind: 'new-row-above', offset: 0 };
    }
    if (relativeY > 1 - NEW_ROW_BAND) {
      return { kind: 'new-row-below', offset: rowRect.height };
    }
    // Keep each item paired with its own rect through the filter. Dropping unmeasured items from a
    // bare rect array would make `boundary.index` index the SURVIVING list while it gets used as a
    // `row.items` insertion index - correct only as long as every ref happens to be attached.
    const measured = row.items
      .map((item) => ({ item, rect: itemRefs.current.get(item.id)?.getBoundingClientRect() }))
      .filter((entry): entry is { item: GridItem; rect: DOMRect } => Boolean(entry.rect));
    const boundary = nearestBoundary(
      event.clientX,
      measured.map((entry) => entry.rect),
      'x'
    );
    if (!boundary) {
      return null;
    }
    // A boundary index of `i` means "before `measured[i]`" (and `measured.length` means "after the
    // last measured item"), so translate it back through the surviving list to the real index of
    // that item in `row.items`.
    const itemAfterBoundary = measured[boundary.index]?.item;
    const index = itemAfterBoundary ? row.items.indexOf(itemAfterBoundary) : row.items.length;
    return { kind: 'in-row', index, offset: boundary.position - rowRect.left };
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    listeners.onDragOver(event);
    event.preventDefault();
    event.stopPropagation();
    setInsertion(computeInsertion(event));
  }

  function handleDragLeave(event: React.DragEvent<HTMLDivElement>) {
    listeners.onDragLeave(event);
    setInsertion(null);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    listeners.onDrop(event);
    event.preventDefault();
    event.stopPropagation();
    const current = insertion;
    setInsertion(null);
    if (!active || !current) {
      return;
    }
    const data = active.data;

    if (isPaletteData(data)) {
      if (!isComponentType(data.componentType)) {
        return;
      }
      const entry = getRegistryEntry(data.componentType);
      const newItem: GridItem = {
        id: crypto.randomUUID(),
        component: data.componentType,
        span: Math.min(entry?.defaultWidth ?? 12, 12),
        props: { ...(entry?.defaultProps ?? {}) },
      };
      try {
        if (current.kind === 'in-row') {
          const remaining = getRowRemainingCapacity(row);
          if (remaining < 1) {
            return;
          }
          newItem.span = Math.min(entry?.defaultWidth ?? 12, remaining);
          onPageChange(insertItemInRow(page, section.id, row.id, current.index, newItem));
        } else {
          const targetIndex = current.kind === 'new-row-above' ? rowIndex : rowIndex + 1;
          onPageChange(insertItemInNewRow(page, section.id, targetIndex, newItem));
        }
      } catch (error) {
        console.error('Drag-and-drop insert rejected:', error);
      }
      return;
    }

    if (isGridItemData(data)) {
      try {
        if (current.kind === 'in-row') {
          const isSameRowReorder = data.sectionId === section.id && data.rowId === row.id;
          let targetIndex = current.index;
          if (isSameRowReorder && current.index > data.index) {
            targetIndex = current.index - 1;
          }
          if (isSameRowReorder && data.index === targetIndex) {
            return;
          }
          if (!isSameRowReorder) {
            const draggedItem = findGridItemById(page, active.id);
            if (!draggedItem || draggedItem.span > getRowRemainingCapacity(row)) {
              // Dragging an existing item whose own span is larger than the target row's
              // remaining capacity is an ordinary user action, not a bug - no-op silently rather
              // than let it fall through to moveItem's throw (which would then be logged as an
              // error below). (Same-row reorders never need this check: the row's total span
              // doesn't change when reordering within itself.)
              return;
            }
          }
          onPageChange(moveItem(page, active.id, section.id, row.id, targetIndex));
        } else {
          const targetIndex = current.kind === 'new-row-above' ? rowIndex : rowIndex + 1;
          onPageChange(moveItemToNewRow(page, active.id, section.id, targetIndex));
        }
      } catch (error) {
        console.error('Drag-and-drop move rejected:', error);
      }
    }
  }

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        rootRef.current = node;
      }}
      {...attributes}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onPointerDownCapture={handleRowPointerDownCapture}
      data-testid={row.id}
      data-row-id={row.id}
      style={{ position: 'relative' }}
    >
      <div
        ref={rowInnerRef}
        className={grid.row}
        style={rowAlignmentStyle(row)}
        data-testid={`row-inner:${row.id}`}
      >
        {row.items.map((item, index) => {
          const effectiveSpan =
            resizePreview?.itemId === item.id
              ? resizePreview.span
              : resizePreview?.neighborId === item.id
                ? (resizePreview.neighborSpan ?? item.span)
                : item.span;
          const spans = collapsedSpans(effectiveSpan);
          const spanStyle = {
            '--span-desktop': String(spans.desktop),
            '--span-tablet': String(spans.tablet),
            '--span-mobile': String(spans.mobile),
          } as React.CSSProperties;

          function handleResize(side: 'left' | 'right', effectiveDelta: number) {
            // Defense in depth against a bad column-width measurement (see `measureColumnWidth`):
            // a non-finite delta must never reach `updateItemSpan`, which happily writes `NaN` into
            // `item.span` (it passes `schema/validate.ts`'s `typeof === 'number'` check, serializes
            // to `null`, and then makes the page unloadable). Degrade to "resize does nothing".
            if (!Number.isFinite(effectiveDelta)) {
              return;
            }
            const neighborIndex = side === 'left' ? index - 1 : index + 1;
            const neighbor = row.items[neighborIndex];
            let preview: ResizePreview;
            if (neighbor) {
              const pairTotal = item.span + neighbor.span;
              const newSpan = Math.min(pairTotal - 1, Math.max(1, item.span + effectiveDelta));
              preview = {
                itemId: item.id,
                span: newSpan,
                neighborId: neighbor.id,
                neighborSpan: pairTotal - newSpan,
              };
            } else {
              // getRowRemainingCapacity(row, item.id) already excludes this item's own span from
              // the "used" total, so it IS the max span this item alone could take (12 minus every
              // OTHER item's span) - adding item.span again would double-count and let the item
              // grow past 12. Matches the exact convention layout/transforms.ts's own
              // updateItemSpan already uses for this same clamp.
              const ceiling = getRowRemainingCapacity(row, item.id);
              const newSpan = Math.min(ceiling, Math.max(1, item.span + effectiveDelta));
              preview = { itemId: item.id, span: newSpan };
            }
            resizePreviewRef.current = preview;
            setResizePreview(preview);
          }

          function handleResizeEnd() {
            const preview = resizePreviewRef.current;
            resizePreviewRef.current = null;
            setResizePreview(null);
            if (!preview) {
              return;
            }
            let next = page;
            const applyItem = () => {
              if (preview.span !== item.span) {
                next = updateItemSpan(next, preview.itemId, preview.span);
              }
            };
            const applyNeighbor = () => {
              if (!preview.neighborId || preview.neighborSpan === undefined) {
                return;
              }
              // `updateItemSpan` rebuilds the page object even when the span it writes is identical
              // to what's already there, so an unchanged neighbor has to be skipped explicitly for
              // the `next !== page` no-op check below to mean anything.
              const neighbor = row.items.find((candidate) => candidate.id === preview.neighborId);
              if (neighbor && neighbor.span === preview.neighborSpan) {
                return;
              }
              next = updateItemSpan(next, preview.neighborId, preview.neighborSpan);
            };
            // updateItemSpan's own clamp is computed against the row's CURRENT (not-yet-updated)
            // spans, so whichever side of the pair is SHRINKING must be applied first to free up
            // capacity - applying the GROWING side first would get silently re-clamped back down
            // since the shrinking neighbor hasn't given up its span yet in that intermediate state.
            if (preview.span > item.span) {
              applyNeighbor();
              applyItem();
            } else {
              applyItem();
              applyNeighbor();
            }
            // A gesture that ends where it started (dragged out and back) produces a preview equal
            // to the current spans, so every `updateItemSpan` above is skipped and `next` is still
            // the same object. Calling `onPageChange` anyway would flip the editor's "Saved"
            // indicator back to unsaved for a no-op gesture.
            if (next !== page) {
              onPageChange(next);
            }
          }

          return (
            <div
              key={item.id}
              className={grid.item}
              style={spanStyle}
              data-testid={`grid-item-${item.id}`}
              ref={(node) => {
                if (node) {
                  itemRefs.current.set(item.id, node);
                } else {
                  itemRefs.current.delete(item.id);
                }
              }}
            >
              <DraggableGridItem
                sectionId={section.id}
                rowId={row.id}
                index={index}
                item={item}
                columnWidth={columnWidth}
                onResize={handleResize}
                onResizeEnd={handleResizeEnd}
              >
                <div
                  className={styles.selectableItem}
                  data-selected={selectedItemId === item.id}
                  role="button"
                  tabIndex={0}
                  onClick={(event) => {
                    event.stopPropagation();
                    onSelectItem(item.id);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      // `useDraggable`'s own `onKeyDown` (spread onto the ancestor
                      // `DraggableGridItem` box) also treats Enter/Space as "pick this item up for
                      // a keyboard drag". Stop the event here so activating the item selects it
                      // instead of starting a phantom drag.
                      event.stopPropagation();
                      onSelectItem(item.id);
                    }
                  }}
                >
                  <ItemRenderer item={item} />
                </div>
              </DraggableGridItem>
            </div>
          );
        })}
      </div>
      {insertion && (
        <InsertionLine
          orientation={insertion.kind === 'in-row' ? 'vertical' : 'horizontal'}
          offset={insertion.offset}
        />
      )}
    </div>
  );
}
