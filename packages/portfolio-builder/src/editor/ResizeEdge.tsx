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
    // `columnWidth` comes from a live DOM measurement in `EditableRow`. If that measurement failed
    // (0) or produced a garbage value (NaN/Infinity), every delta computed from it would be
    // non-finite and would eventually be written into `item.span` as `NaN` - which survives schema
    // validation, serializes to `null`, and makes the saved page unloadable. Refuse to start the
    // gesture at all instead: a bad measurement degrades to "resize does nothing".
    if (!Number.isFinite(columnWidth) || columnWidth <= 0) {
      return;
    }
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
