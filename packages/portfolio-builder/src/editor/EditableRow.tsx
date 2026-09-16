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
  | { kind: 'in-row'; index: number; offset: number }
  | { kind: 'new-row-above' | 'new-row-below' }
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

export function EditableRow({
  page,
  section,
  row,
  rowIndex,
  onPageChange,
  selectedItemId,
  onSelectItem,
}: EditableRowProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef(new Map<string, HTMLElement>());
  const [insertion, setInsertion] = useState<InsertionState>(null);
  const [resizePreview, setResizePreview] = useState<ResizePreview | null>(null);
  // Starts at the pre-mount fallback (1) and is only ever written from `useLayoutEffect`/event
  // handlers below, never read from the DOM during render - see the comment on
  // `handleRowPointerDownCapture` for why a render-time DOM read here would be both a React purity
  // violation and, for the FIRST resize gesture specifically, actually wrong.
  const [columnWidth, setColumnWidth] = useState(1);
  // ResizeEdge's pointerdown/pointerup handlers are captured once, at gesture start, so they never
  // see later re-renders' fresh `resizePreview` state - handleResizeEnd reads this ref (always
  // current) instead of the stale `resizePreview` closure variable it would otherwise see.
  const resizePreviewRef = useRef<ResizePreview | null>(null);

  const { setNodeRef, active, attributes, listeners } = useDroppable({
    id: `row:${row.id}`,
    data: { type: 'row', sectionId: section.id, rowId: row.id },
    accepts: ['palette-item', 'grid-item'],
  });

  function measureColumnWidth(): number {
    const rowElement = rootRef.current;
    if (!rowElement) {
      return 1;
    }
    const gapPx = parseFloat(getComputedStyle(rowElement).columnGap || '0');
    return (rowElement.clientWidth - 11 * gapPx) / 12;
  }

  // Measure once after mount (`rootRef.current` is only attached post-commit, so this can't run
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
      return { kind: 'new-row-above' };
    }
    if (relativeY > 1 - NEW_ROW_BAND) {
      return { kind: 'new-row-below' };
    }
    const itemRects = row.items
      .map((item) => itemRefs.current.get(item.id)?.getBoundingClientRect())
      .filter((rect): rect is DOMRect => Boolean(rect));
    const boundary = nearestBoundary(event.clientX, itemRects, 'x');
    if (!boundary) {
      return null;
    }
    return { kind: 'in-row', index: boundary.index, offset: boundary.position - rowRect.left };
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
      <div className={grid.row} style={rowAlignmentStyle(row)}>
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
              if (preview.neighborId && preview.neighborSpan !== undefined) {
                next = updateItemSpan(next, preview.neighborId, preview.neighborSpan);
              }
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
            onPageChange(next);
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
                  data-selected={selectedItemId === item.id}
                  role="button"
                  tabIndex={0}
                  onClick={(event) => {
                    event.stopPropagation();
                    onSelectItem(item.id);
                  }}
                >
                  <ItemRenderer item={item} />
                </div>
              </DraggableGridItem>
            </div>
          );
        })}
      </div>
      {insertion?.kind === 'in-row' && (
        <InsertionLine orientation="vertical" offset={insertion.offset} />
      )}
      {insertion?.kind === 'new-row-above' && <InsertionLine orientation="horizontal" offset={0} />}
      {insertion?.kind === 'new-row-below' && (
        <InsertionLine
          orientation="horizontal"
          offset={rootRef.current?.getBoundingClientRect().height ?? 0}
        />
      )}
    </div>
  );
}
