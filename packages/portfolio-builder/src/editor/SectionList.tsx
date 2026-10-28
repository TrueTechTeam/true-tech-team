'use client';

import { useState } from 'react';
import { Button, IconButton } from '@true-tech-team/react-components';
import { ConfirmDialog } from '@true-tech-team/dashboard-kit';
import { getSectionTypeMeta } from '../sections/meta';
import type { PageSection } from '../schema/types';
import styles from './SectionList.module.scss';

export interface SectionListProps {
  sections: PageSection[];
  selectedId: string | null;
  onSelect: (id: string) => void;
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

  return (
    <div className={styles.list}>
      <h3 className={styles.heading}>Sections</h3>

      {sections.length === 0 && (
        <p className={styles.empty}>No sections yet. Add one to get started.</p>
      )}

      {sections.map((section, index) => {
        const position = index + 1;
        const meta = getSectionTypeMeta(section.type);
        return (
          <div
            key={section.id}
            className={`${styles.row} ${section.id === selectedId ? styles.rowSelected : ''}`}
          >
            <button
              type="button"
              className={styles.rowButton}
              // Position-prefixed so the name stays unique when two sections share a name, which
              // is allowed by design (anchors de-duplicate with -2/-3 suffixes).
              aria-label={`${position}. ${section.name}`}
              aria-current={section.id === selectedId ? 'true' : undefined}
              onClick={() => onSelect(section.id)}
            >
              <span className={styles.rowName}>{section.name}</span>
              <span className={styles.rowType}>{meta?.label ?? 'Unknown section type'}</span>
            </button>
            <span className={styles.rowControls}>
              <IconButton
                icon="chevron-up"
                size="sm"
                aria-label={`Move ${section.name} up (section ${position})`}
                disabled={index === 0}
                onClick={() => onMove(section.id, -1)}
              />
              <IconButton
                icon="chevron-down"
                size="sm"
                aria-label={`Move ${section.name} down (section ${position})`}
                disabled={index === sections.length - 1}
                onClick={() => onMove(section.id, 1)}
              />
              <IconButton
                icon="delete"
                size="sm"
                aria-label={`Remove ${section.name} (section ${position})`}
                onClick={() => setPendingRemoval(section)}
              />
            </span>
          </div>
        );
      })}

      <Button type="button" variant="ghost" onClick={onAddClick}>
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
