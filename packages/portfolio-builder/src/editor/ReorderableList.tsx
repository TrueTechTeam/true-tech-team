'use client';

import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type DragEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { DragHandle, SortableList } from '@true-tech-team/react-components';
import styles from './ReorderableList.module.scss';

/** What a reorder did, for callers that translate it into something other than an array swap. */
export interface ReorderMove {
  id: string;
  from: number;
  to: number;
}

export interface ReorderableRenderContext {
  /** The drag handle. Place it wherever the row wants its grab affordance. */
  handle: ReactNode;
  index: number;
  /** A pointer drag of THIS row is in flight, or it is picked up from the keyboard. */
  isDragging: boolean;
  /** Another row is being dragged over this one. */
  isOver: boolean;
}

export interface ReorderableListProps<T> {
  items: T[];
  /** Stable across reorders and edits; two rows must never share one. */
  getId: (item: T) => string;
  /** Names the row in the handle's accessible name and in the live announcements. */
  getLabel: (item: T, index: number) => string;
  /** Receives the reordered array, plus what moved. Called for pointer and keyboard moves alike. */
  onReorder: (next: T[], move: ReorderMove) => void;
  renderItem: (item: T, context: ReorderableRenderContext) => ReactNode;
  /** Accessible name of the list itself. */
  label: string;
  gap?: 'sm' | 'md' | 'lg';
}

// SortableList's item type carries an index signature, so the row type must too.
interface Row<T> {
  id: string;
  item: T;
  [key: string]: unknown;
}

interface Grab {
  id: string;
  startIndex: number;
}

const INSTRUCTIONS =
  'Press Space or Enter to pick up, the Up and Down arrow keys to move, Space or Enter to drop, ' +
  'or Escape to cancel.';

function moved<T>(items: T[], from: number, to: number): T[] {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item as T);
  return next;
}

/**
 * A reorderable list whose handle works from the keyboard as well as the pointer.
 *
 * Why this is more than `SortableList`: the library's handle `onKeyDown` handles Space/Enter and
 * Escape and, while picked up, the arrow keys - but only by pointing a DROP TARGET at the DOM
 * sibling of the row's ORIGINAL position. Nothing moves until a drop, the target is not
 * cumulative, nothing is announced, and Escape does not cancel: it drops onto the pending target.
 * That is not a usable keyboard interaction, so this component owns it:
 *
 * - Space/Enter picks up; Space/Enter again drops.
 * - ArrowUp/ArrowDown move the picked-up row one place, live, and keep focus on the handle.
 * - Escape puts the row back where it was picked up.
 * - Each of those is announced in a polite live region.
 *
 * The library's handler is called first for Space/Enter/Escape so its own picked-up styling stays
 * in step. It is deliberately NOT given the arrow keys: it would set a second drop target that its
 * next drop would commit on top of ours, moving the row twice. Pointer dragging is the library's.
 */
export function ReorderableList<T>({
  items,
  getId,
  getLabel,
  onReorder,
  renderItem,
  label,
  gap = 'sm',
}: ReorderableListProps<T>) {
  const hintId = useId();
  const [grabbedId, setGrabbedId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');

  const itemsRef = useRef(items);
  itemsRef.current = items;
  const grabRef = useRef<Grab | null>(null);
  const handleEls = useRef(new Map<string, HTMLElement>());
  const rootRef = useRef<HTMLDivElement>(null);
  // Set while a keyboard move is being committed, so the handle keeps (or regains) focus.
  const refocusId = useRef<string | null>(null);

  const total = items.length;

  // SortableList renders each row as a `tabindex=0` listitem even when a drag handle is in use, and
  // gives it no key handling then. That is an inert extra Tab stop in front of every handle.
  useLayoutEffect(() => {
    rootRef.current
      ?.querySelectorAll('[data-sortable-id]')
      .forEach((row) => row.setAttribute('tabindex', '-1'));
  });

  // The DOM node of a row that moved may be re-inserted, which drops focus. Put it back.
  useLayoutEffect(() => {
    const id = refocusId.current;
    if (id === null) {
      return;
    }
    const handle = handleEls.current.get(id);
    if (handle && document.activeElement !== handle) {
      handle.focus();
    }
    refocusId.current = null;
  }, [items]);

  function nameOf(id: string): { name: string; index: number } | null {
    const index = itemsRef.current.findIndex((item) => getId(item) === id);
    const item = itemsRef.current[index];
    return item === undefined ? null : { name: getLabel(item, index), index };
  }

  function position(index: number): string {
    return `position ${index + 1} of ${total}`;
  }

  /** Moves the row `id` to index `to`. Returns whether anything moved. */
  function moveTo(id: string, to: number): boolean {
    const from = itemsRef.current.findIndex((item) => getId(item) === id);
    if (from === -1 || to < 0 || to >= itemsRef.current.length || from === to) {
      return false;
    }
    refocusId.current = id;
    // Cleared on a timer as well as in the layout effect: a parent that declines the change never
    // re-renders, and a stale flag would swallow the next genuine blur.
    setTimeout(() => {
      refocusId.current = null;
    }, 0);
    onReorder(moved(itemsRef.current, from, to), { id, from, to });
    return true;
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLElement>,
    id: string,
    theirsKeyDown?: (event: KeyboardEvent<HTMLElement>) => void
  ) {
    const grab = grabRef.current;
    const isGrabbed = grab?.id === id;
    const info = nameOf(id);
    if (!info) {
      return;
    }

    if (event.key === ' ' || event.key === 'Enter') {
      theirsKeyDown?.(event);
      event.preventDefault();
      if (isGrabbed) {
        grabRef.current = null;
        setGrabbedId(null);
        setAnnouncement(`${info.name} dropped, ${position(info.index)}.`);
      } else {
        grabRef.current = { id, startIndex: info.index };
        setGrabbedId(id);
        setAnnouncement(`${info.name} picked up, ${position(info.index)}. ${INSTRUCTIONS}`);
      }
      return;
    }

    if (!grab || !isGrabbed) {
      return;
    }

    if (event.key === 'Escape') {
      theirsKeyDown?.(event);
      event.preventDefault();
      event.stopPropagation();
      grabRef.current = null;
      setGrabbedId(null);
      moveTo(id, grab.startIndex);
      setAnnouncement(`Move cancelled. ${info.name} returned to ${position(grab.startIndex)}.`);
      return;
    }

    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      event.stopPropagation();
      const to = info.index + (event.key === 'ArrowUp' ? -1 : 1);
      if (moveTo(id, to)) {
        setAnnouncement(`${info.name} moved to ${position(to)}.`);
      } else {
        setAnnouncement(`${info.name} is already ${to < 0 ? 'first' : 'last'}.`);
      }
    }
  }

  const rows: Row<T>[] = items.map((item) => ({ id: getId(item), item }));

  return (
    <div ref={rootRef} className={styles.root}>
      <SortableList
        items={rows}
        useDragHandle
        gap={gap}
        aria-label={label}
        onReorderComplete={(_next, from, to) => {
          const row = rows[from];
          if (row) {
            // Rebuilt from the CURRENT items rather than the library's copy, so what the caller
            // receives is always derived the same way as a keyboard move.
            onReorder(moved(itemsRef.current, from, to), { id: row.id, from, to });
          }
        }}
        renderItem={(row, { isDragging, isOver, dragHandleProps, index }) => {
          const name = getLabel(row.item, index);
          const grabbed = grabbedId === row.id;
          const handle = (
            <DragHandle
              {...dragHandleProps}
              ref={(el) => {
                if (el) {
                  handleEls.current.set(row.id, el);
                } else {
                  handleEls.current.delete(row.id);
                }
              }}
              className={grabbed ? styles.handleGrabbed : undefined}
              aria-label={`Reorder ${name}, position ${index + 1} of ${total}`}
              aria-describedby={hintId}
              // `aria-grabbed` is deprecated in ARIA 1.1+ and the library sets it regardless.
              // `aria-pressed` is what actually tells a screen reader this row is picked up.
              aria-pressed={grabbed}
              onKeyDown={(event: KeyboardEvent<HTMLElement>) =>
                handleKeyDown(event, row.id, dragHandleProps?.onKeyDown)
              }
              onBlur={() => {
                if (grabRef.current?.id !== row.id || refocusId.current === row.id) {
                  return;
                }
                // Tabbing away drops the row where it is rather than leaving it half-grabbed.
                grabRef.current = null;
                setGrabbedId(null);
                // The library handler ignores its argument; this clears its own picked-up state.
                dragHandleProps?.onDragEnd({} as DragEvent<HTMLElement>);
                setAnnouncement(`${name} dropped.`);
              }}
            />
          );
          return renderItem(row.item, {
            handle,
            index,
            isDragging: isDragging || grabbed,
            isOver,
          });
        }}
      />
      <span id={hintId} className={styles.srOnly}>
        {INSTRUCTIONS}
      </span>
      <div role="status" aria-live="polite" aria-atomic="true" className={styles.srOnly}>
        {announcement}
      </div>
    </div>
  );
}
