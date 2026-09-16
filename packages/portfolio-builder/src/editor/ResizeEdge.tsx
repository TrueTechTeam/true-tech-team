'use client';

import { useRef } from 'react';
import styles from './ResizeEdge.module.scss';

export interface ResizeEdgeProps {
  side: 'left' | 'right';
  columnWidth: number;
  onResize: (deltaColumns: number) => void;
  onResizeEnd: () => void;
}

/**
 * Dragging a *left* edge leftward grows the item; dragging a *right* edge rightward grows it -
 * opposite signs for the same "outward" pointer movement.
 */
export function computeEffectiveDelta(side: 'left' | 'right', rawDeltaColumns: number): number {
  return side === 'right' ? rawDeltaColumns : -rawDeltaColumns;
}

export function ResizeEdge({ side, columnWidth, onResize, onResizeEnd }: ResizeEdgeProps) {
  const startXRef = useRef(0);

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    event.stopPropagation();
    event.preventDefault();
    startXRef.current = event.clientX;

    function handleMove(moveEvent: PointerEvent) {
      const rawDeltaColumns = Math.round((moveEvent.clientX - startXRef.current) / columnWidth);
      onResize(computeEffectiveDelta(side, rawDeltaColumns));
    }
    function handleUp() {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      onResizeEnd();
    }
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
  }

  const sideClass = side === 'left' ? styles.left : styles.right;

  return (
    <div
      className={`${styles.edge} ${sideClass}`}
      onPointerDown={handlePointerDown}
      role="separator"
      aria-orientation="vertical"
      aria-label={`Resize ${side} edge`}
    />
  );
}
