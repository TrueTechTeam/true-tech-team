'use client';

import { useDraggable, DragHandle } from '@true-tech-team/react-components';
import type { GridItem } from '../schema/types';
import styles from './editor.module.scss';

export interface DraggableGridItemProps {
  sectionId: string;
  rowId: string;
  index: number;
  item: GridItem;
  children: React.ReactNode;
}

export function DraggableGridItem({
  sectionId,
  rowId,
  index,
  item,
  children,
}: DraggableGridItemProps) {
  const { setNodeRef, attributes, listeners, isDragging } = useDraggable({
    id: item.id,
    data: { type: 'grid-item', sectionId, rowId, index },
  });

  return (
    <div className={isDragging ? styles.gridItemDragging : styles.gridItem}>
      <DragHandle
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        label={`Drag ${item.component}`}
      />
      {children}
    </div>
  );
}
