'use client';

import { Button, Checkbox, Dialog, Input } from '@true-tech-team/react-components';
import { ThemeDropdown } from '../themes/ThemeDropdown';
import { THEME_PRESETS } from '../themes/presets';
import type { PortfolioPage } from '../schema/types';
import styles from './PageSettingsDialog.module.scss';

export interface PageSettingsDialogProps {
  page: PortfolioPage;
  published: boolean;
  isDirty: boolean;
  publishError?: string | null;
  onTitleChange: (title: string) => void;
  onThemeSelect: (themeId: string) => void;
  onPublishedChange: (published: boolean) => void;
  onClose: () => void;
}

/**
 * Page-level settings. Performs no I/O: publishing is raised to the composition root, which owns
 * the Supabase call and feeds the outcome back as `published` / `publishError`.
 */
export function PageSettingsDialog({
  page,
  published,
  isDirty,
  publishError,
  onTitleChange,
  onThemeSelect,
  onPublishedChange,
  onClose,
}: PageSettingsDialogProps) {
  const publicUrl = `/p/${page.slug}`;

  return (
    <Dialog
      isOpen
      onClose={onClose}
      title="Page settings"
      actions={
        <Button type="button" onClick={onClose}>
          Done
        </Button>
      }
    >
      <div className={styles.settings}>
        <div className={styles.group}>
          <h3 className={styles.groupHeading}>Details</h3>
          <Input
            id="page-title"
            label="Page title"
            value={page.title}
            onChange={(event) => onTitleChange(event.target.value)}
          />
          {/* Read-only: changing a published page's slug silently breaks every link already
              shared, so it is deliberately not editable here. */}
          <Input id="page-slug" label="Page URL" value={page.slug} readOnly onChange={() => {}} />
          <span className={styles.hint}>
            Your page URL is set from its title when the page is created and can&apos;t be changed.
          </span>
        </div>

        <div className={styles.group}>
          <h3 className={styles.groupHeading}>Theme</h3>
          <ThemeDropdown
            presets={THEME_PRESETS}
            selectedId={page.themeId ?? THEME_PRESETS[0]?.id}
            onSelect={onThemeSelect}
          />
        </div>

        <div className={styles.group}>
          <h3 className={styles.groupHeading}>Publishing</h3>
          <Checkbox
            id="page-published"
            label="Publish this page"
            checked={published}
            disabled={isDirty}
            onChange={(checked) => onPublishedChange(checked)}
          />
          {isDirty && <span className={styles.hint}>Save your changes before publishing.</span>}
          {published && (
            <span className={styles.publicUrl}>
              <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                {publicUrl}
              </a>
            </span>
          )}
          {publishError && <span className={styles.error}>{publishError}</span>}
        </div>
      </div>
    </Dialog>
  );
}
