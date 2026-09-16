'use client';

import { useDraggable } from '@true-tech-team/react-components';
import type { GridItem } from '../schema/types';
import { ResizeEdge } from './ResizeEdge';
import styles from './editor.module.scss';

export interface DraggableGridItemProps {
  sectionId: string;
  rowId: string;
  index: number;
  item: GridItem;
  columnWidth: number;
  onResize: (side: 'left' | 'right', effectiveDelta: number) => void;
  onResizeEnd: () => void;
  children: React.ReactNode;
}

export function DraggableGridItem({
  sectionId,
  rowId,
  index,
  item,
  columnWidth,
  onResize,
  onResizeEnd,
  children,
}: DraggableGridItemProps) {
  const { setNodeRef, attributes, listeners, isDragging } = useDraggable({
    id: item.id,
    data: { type: 'grid-item', sectionId, rowId, index },
  });

  // `useDraggable`'s `attributes` also carry `role="button"` and `tabIndex={0}`. Deliberately
  // dropped here: `EditableRow` renders its own `role="button" tabIndex={0}` click-to-select
  // wrapper INSIDE this box, and ARIA prohibits nesting interactive roles (it also produced two
  // tab stops per item). The inner wrapper is the single accessible control; this box keeps only
  // the native-drag attributes it actually needs.
  const dragAttributes = {
    draggable: attributes.draggable,
    'aria-grabbed': attributes['aria-grabbed'],
    'data-dragging': attributes['data-dragging'],
  };

  return (
    <div
      ref={setNodeRef}
      {...dragAttributes}
      {...listeners}
      className={isDragging ? styles.gridItemDragging : styles.gridItem}
      aria-label={`Drag ${item.component}`}
    >
      <ResizeEdge
        side="left"
        columnWidth={columnWidth}
        onResize={(delta) => onResize('left', delta)}
        onResizeEnd={onResizeEnd}
      />
      {children}
      <ResizeEdge
        side="right"
        columnWidth={columnWidth}
        onResize={(delta) => onResize('right', delta)}
        onResizeEnd={onResizeEnd}
      />
    </div>
  );
}
