'use client';

import { useState } from 'react';
import { Button, IconButton } from '@true-tech-team/react-components';
import { ConfirmDialog } from '@true-tech-team/dashboard-kit';
import { getSectionTypeMeta } from '../sections/meta';
import type { PageSection } from '../schema/types';
import { ReorderableList } from './ReorderableList';
import styles from './SectionList.module.scss';

export interface SectionListProps {
  sections: PageSection[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** Moves a section one place toward the start (`-1`) or the end (`1`). */
  onMove: (id: string, delta: -1 | 1) => void;
  onRemove: (id: string) => void;
  onAddClick: () => void;
}

export function SectionList({
  sections,
  selectedId,
  onSelect,
  onMove,
  onRemove,
  onAddClick,
}: SectionListProps) {
  const [pendingRemoval, setPendingRemoval] = useState<PageSection | null>(null);

  function handleConfirmRemove() {
    if (pendingRemoval) {
      onRemove(pendingRemoval.id);
    }
    setPendingRemoval(null);
  }

  // A drag can travel several places at once, but the editor only exposes one-place moves. Each
  // step is applied to the latest page (the editor updates through a functional setState), so
  // replaying them lands the section exactly where it was dropped.
  function handleReorder(_next: PageSection[], move: { id: string; from: number; to: number }) {
    const delta = move.to > move.from ? 1 : -1;
    for (let step = 0; step < Math.abs(move.to - move.from); step++) {
      onMove(move.id, delta);
    }
  }

  return (
    <div className={styles.list}>
      <h3 className={styles.heading}>Sections</h3>

      {sections.length === 0 && (
        <p className={styles.empty}>No sections yet. Add one to get started.</p>
      )}

      {sections.length > 0 && (
        <ReorderableList
          items={sections}
          label="Sections"
          getId={(section) => section.id}
          // Position is added to the handle's name by the list; the section name alone keeps two
          // sections that share a name distinguishable only by that position, which is by design
          // (anchors de-duplicate with -2/-3 suffixes).
          getLabel={(section) => section.name}
          onReorder={handleReorder}
          renderItem={(section, { handle, index, isDragging, isOver }) => {
            const position = index + 1;
            const meta = getSectionTypeMeta(section.type);
            const classes = [
              styles.row,
              section.id === selectedId ? styles.rowSelected : '',
              isDragging ? styles.rowDragging : '',
              isOver ? styles.rowOver : '',
            ]
              .filter(Boolean)
              .join(' ');
            return (
              <div className={classes}>
                {handle}
                <button
                  type="button"
                  className={styles.rowButton}
                  // Position-prefixed so the name stays unique when two sections share a name.
                  aria-label={`${position}. ${section.name}`}
                  aria-current={section.id === selectedId ? 'true' : undefined}
                  onClick={() => onSelect(section.id)}
                >
                  <span className={styles.rowName}>{section.name}</span>
                  <span className={styles.rowType}>{meta?.label ?? 'Unknown section type'}</span>
                </button>
                <span className={styles.rowControls}>
                  <IconButton
                    icon="delete"
                    size="sm"
                    aria-label={`Remove ${section.name} (section ${position})`}
                    onClick={() => setPendingRemoval(section)}
                  />
                </span>
              </div>
            );
          }}
        />
      )}

      <Button type="button" variant="ghost" startIcon="plus" onClick={onAddClick}>
        Add Section
      </Button>

      {pendingRemoval && (
        <ConfirmDialog
          title="Remove section"
          message={`Remove "${pendingRemoval.name}"? Its content will be lost when you save.`}
          confirmLabel="Remove"
          cancelLabel="Cancel"
          danger
          onConfirm={handleConfirmRemove}
          onCancel={() => setPendingRemoval(null)}
        />
      )}
    </div>
  );
}
