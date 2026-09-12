'use client';

import { DndProvider, type DragEndEvent, type DragData } from '@true-tech-team/react-components';
import { isComponentType, type PortfolioPage, type GridItem } from '../schema/types';
import { getRegistryEntry } from '../components/registry';
import {
  getRowRemainingCapacity,
  insertItemInRow,
  insertItemInNewRow,
  moveItem,
  moveItemToNewRow,
} from '../layout/transforms';
import type { DropZoneData } from './DropZone';

export interface PageDragDropContainerProps {
  page: PortfolioPage;
  onPageChange: (page: PortfolioPage) => void;
  children: React.ReactNode;
}

interface PaletteDragData {
  type: 'palette-item';
  componentType: string;
}

interface GridItemDragData {
  type: 'grid-item';
  sectionId: string;
  rowId: string;
  index: number;
}

type RowGapData = Extract<DropZoneData, { type: 'row-gap' }>;
type NewRowGapData = Extract<DropZoneData, { type: 'new-row-gap' }>;

// The library types `active.data`/`over.data` as the loose `DragData` shape (`{ id, type?,
// index?, [key: string]: unknown }`) since `DndProvider` has no way to know what shape any given
// consumer attaches. These guards narrow that back to the specific shapes this container's own
// draggables/drop-zones attach (see Palette.tsx, DraggableGridItem.tsx, DropZone.tsx).
function isPaletteDragData(data: DragData): data is DragData & PaletteDragData {
  return data.type === 'palette-item' && typeof data.componentType === 'string';
}

function isGridItemDragData(data: DragData): data is DragData & GridItemDragData {
  return (
    data.type === 'grid-item' &&
    typeof data.sectionId === 'string' &&
    typeof data.rowId === 'string' &&
    typeof data.index === 'number'
  );
}

function isRowGapData(data: DragData): data is DragData & RowGapData {
  return (
    data.type === 'row-gap' &&
    typeof data.sectionId === 'string' &&
    typeof data.rowId === 'string' &&
    typeof data.index === 'number'
  );
}

function isNewRowGapData(data: DragData): data is DragData & NewRowGapData {
  return (
    data.type === 'new-row-gap' &&
    typeof data.sectionId === 'string' &&
    typeof data.index === 'number'
  );
}

function findRow(page: PortfolioPage, sectionId: string, rowId: string) {
  const section = page.sections.find((s) => s.id === sectionId);
  return section?.rows.find((r) => r.id === rowId);
}

export function PageDragDropContainer({
  page,
  onPageChange,
  children,
}: PageDragDropContainerProps) {
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) {
      return;
    }

    const activeData = active.data;
    const overData = over.data;

    try {
      if (isPaletteDragData(activeData)) {
        if (!isComponentType(activeData.componentType)) {
          return;
        }
        const componentType = activeData.componentType;
        const entry = getRegistryEntry(componentType);
        const defaultProps = entry?.defaultProps ?? {};

        if (isRowGapData(overData)) {
          const row = findRow(page, overData.sectionId, overData.rowId);
          if (!row) {
            return;
          }
          const span = getRowRemainingCapacity(row);
          if (span < 1) {
            // The row has no room at all. In normal operation this DropZone should already be
            // `disabled` and never render (piece 5's responsibility), so reaching this means the
            // drop happened anyway — reject it silently rather than inserting a degenerate
            // zero-span item. Unlike the capacity mismatches below (which indicate an actual bug
            // in whatever renders DropZones), a full row is an ordinary state to be in, so this
            // is not logged as an error.
            return;
          }
          const newItem: GridItem = {
            id: crypto.randomUUID(),
            component: componentType,
            span,
            props: defaultProps,
          };
          onPageChange(
            insertItemInRow(page, overData.sectionId, overData.rowId, overData.index, newItem)
          );
          return;
        }

        if (isNewRowGapData(overData)) {
          const newItem: GridItem = {
            id: crypto.randomUUID(),
            component: componentType,
            span: 12,
            props: defaultProps,
          };
          onPageChange(insertItemInNewRow(page, overData.sectionId, overData.index, newItem));
          return;
        }

        return;
      }

      if (isGridItemDragData(activeData)) {
        if (isRowGapData(overData)) {
          onPageChange(
            moveItem(page, active.id, overData.sectionId, overData.rowId, overData.index)
          );
          return;
        }

        if (isNewRowGapData(overData)) {
          onPageChange(moveItemToNewRow(page, active.id, overData.sectionId, overData.index));
          return;
        }
      }
    } catch (error) {
      // The row-capacity guard in the transform functions should never fire in practice — the
      // DropZone rendering this drop target should already be `disabled` for a row at full
      // capacity (piece 5's responsibility). If it does fire, fail safe (no page change) rather
      // than corrupt page data, and surface the bug loudly during development.
      console.error('Drag-and-drop operation rejected:', error);
    }
  }

  return <DndProvider onDragEnd={handleDragEnd}>{children}</DndProvider>;
}
