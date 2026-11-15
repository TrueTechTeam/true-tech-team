'use client';

import { Button, Dialog } from '@true-tech-team/react-components';
import { SECTION_TYPES, type PortfolioPage, type SectionType } from '../schema/types';
import { SECTION_META } from '../sections/meta';
import { canAddSectionType } from './sectionTransforms';
import styles from './SectionCatalogDialog.module.scss';

export interface SectionCatalogDialogProps {
  page: PortfolioPage;
  onAdd: (type: SectionType) => void;
  onClose: () => void;
}

export function SectionCatalogDialog({ page, onAdd, onClose }: SectionCatalogDialogProps) {
  return (
    <Dialog
      isOpen
      onClose={onClose}
      title="Add a section"
      actions={
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      }
    >
      <div className={styles.catalog}>
        {SECTION_TYPES.map((type) => {
          const meta = SECTION_META[type];
          const allowed = canAddSectionType(page, type);
          return (
            <button
              key={type}
              type="button"
              className={styles.entry}
              disabled={!allowed}
              onClick={() => onAdd(type)}
            >
              <span className={styles.entryLabel}>{meta.label}</span>
              {!allowed && (
                <span className={styles.entryReason}>
                  Your page already has a {meta.label.toLowerCase()}.
                </span>
              )}
            </button>
          );
        })}
      </div>
    </Dialog>
  );
}
