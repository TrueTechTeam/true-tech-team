'use client';

import { useState } from 'react';
import { Dialog, Card, IconButton } from '@true-tech-team/react-components';
import { TEMPLATES, getTemplateById } from './templates/registry';
import { SAMPLE_RESUME_DATA } from './templates/sampleResumeData';
import type { ResumeData } from './lib/types';
import styles from './TemplateDialog.module.scss';

interface TemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentTemplateId: string | null;
  // Previewed inside each template instead of sample data once the user has
  // some real content, so picking a style doubles as seeing your own resume
  // in it. Falls back to sample data until they've entered anything.
  draft: ResumeData;
  onSelect: (templateId: string) => void;
}

function isDraftEmpty(draft: ResumeData): boolean {
  return !draft.profile?.name?.trim() && draft.experience.length === 0;
}

export default function TemplateDialog({
  isOpen,
  onClose,
  currentTemplateId,
  draft,
  onSelect,
}: TemplateDialogProps) {
  const [previewId, setPreviewId] = useState<string | null>(null);
  const previewTemplate = previewId ? getTemplateById(previewId) : undefined;
  const PreviewComponent = previewTemplate?.component;
  const previewData = isDraftEmpty(draft) ? SAMPLE_RESUME_DATA : draft;

  return (
    <>
      <Dialog
        isOpen={isOpen}
        onClose={onClose}
        onOpenChange={(open) => !open && onClose()}
        title="Choose a template"
        size="xl"
      >
        <p className={styles.subheading}>
          Pick the design for your resume. You can change this anytime.
        </p>

        <div className={styles.grid}>
          {TEMPLATES.map((tpl) => {
            const isSelected = tpl.id === currentTemplateId;
            const ThumbComponent = tpl.component;
            return (
              <Card
                key={tpl.id}
                variant="outlined"
                padding="none"
                interactive
                onClick={() => {
                  onSelect(tpl.id);
                  onClose();
                }}
                className={[styles.card, isSelected ? styles.cardSelected : ''].join(' ').trim()}
              >
                <div className={styles.thumbnail}>
                  <div className={styles.thumbnailScale}>
                    <ThumbComponent data={previewData} />
                  </div>
                  <IconButton
                    icon="eye"
                    aria-label={`Preview ${tpl.label}`}
                    size="sm"
                    className={styles.previewButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewId(tpl.id);
                    }}
                  />
                </div>
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{tpl.label}</h3>
                  <p className={styles.cardDescription}>{tpl.description}</p>
                  {tpl.atsWarning && <p className={styles.atsWarning}>* {tpl.atsWarning}</p>}
                </div>
              </Card>
            );
          })}
        </div>
      </Dialog>

      <Dialog
        isOpen={Boolean(previewTemplate)}
        onClose={() => setPreviewId(null)}
        onOpenChange={(open) => !open && setPreviewId(null)}
        title={previewTemplate?.label}
        size="xl"
      >
        {PreviewComponent && (
          <div className={styles.previewSheet}>
            <PreviewComponent data={previewData} />
          </div>
        )}
      </Dialog>
    </>
  );
}
