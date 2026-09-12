'use client';

import { useDroppable } from '@true-tech-team/react-components';
import styles from './editor.module.scss';

// `index` is always the insertion point as currently rendered (before any removal) —
// `PageDragDropContainer` handles converting this to whatever internal indexing a transform
// function needs (e.g. `moveItem`'s same-row reorder branch applies its index after the dragged
// item has already been filtered out of the array, which is a different convention).
export type DropZoneData =
  | { type: 'row-gap'; sectionId: string; rowId: string; index: number }
  | { type: 'new-row-gap'; sectionId: string; index: number };

export interface DropZoneProps {
  id: string;
  data: DropZoneData;
  accepts?: string[];
  disabled?: boolean;
  label?: string;
}

export function DropZone({ id, data, accepts, disabled, label = 'Drop here' }: DropZoneProps) {
  const { setNodeRef, isOver, attributes, listeners } = useDroppable({
    id,
    data,
    accepts,
    disabled,
  });

  if (disabled) {
    return null;
  }

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      role="group"
      className={isOver ? styles.dropZoneActive : styles.dropZone}
      aria-label={label}
    />
  );
}
