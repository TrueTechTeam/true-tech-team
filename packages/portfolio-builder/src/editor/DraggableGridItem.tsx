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

  return (
    <div
      ref={setNodeRef}
      {...attributes}
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
