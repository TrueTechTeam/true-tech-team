'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { SupabaseClient } from '@supabase/supabase-js';
import { AdaptiveGrid, Badge, Button, Card, Dialog, Input } from '@true-tech-team/react-components';
import { savePortfolioPage } from '../pages/crud';
import { generateUniqueSlug } from '../pages/slug';
import { recordToPage } from '../pages/mapping';
import type { PortfolioPageRecord } from '../pages/types';
import { PortfolioPreviewFrame } from '../preview/PortfolioPreviewFrame';
import styles from './PortfolioPagesList.module.scss';

export interface PortfolioPagesListProps {
  pages: PortfolioPageRecord[];
  userId: string;
  supabase: SupabaseClient;
  onCreated?: (record: PortfolioPageRecord) => void;
}

export function PortfolioPagesList({
  pages,
  userId,
  supabase,
  onCreated,
}: PortfolioPagesListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleOpenDialog() {
    setIsDialogOpen(true);
  }

  function handleCloseDialog() {
    setIsDialogOpen(false);
    setTitle('');
    setError(null);
  }

  async function handleCreate() {
    setError(null);
    setIsSubmitting(true);
    try {
      const slug = await generateUniqueSlug(supabase, title);
      const record = await savePortfolioPage(supabase, userId, {
        schemaVersion: 1,
        slug,
        title,
        templateId: 'blank',
        showNav: true,
        sections: [{ id: crypto.randomUUID(), name: 'Main', showInNav: false, rows: [] }],
      });
      handleCloseDialog();
      onCreated?.(record);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create page');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <h2 className={styles.title}>My Pages</h2>
        <Button type="button" onClick={handleOpenDialog}>
          New Page
        </Button>
      </div>

      {pages.length === 0 ? (
        <div className={styles.empty}>
          <p>You haven&apos;t created any portfolio pages yet.</p>
        </div>
      ) : (
        <AdaptiveGrid minItemWidth={280} gap={16}>
          {pages.map((page) => (
            <Link
              key={page.id}
              href={`/portfolio-builder/edit/${page.id}`}
              className={styles.cardLink}
            >
              <Card hoverable padding="none">
                <div className={styles.previewArea}>
                  <PortfolioPreviewFrame
                    page={recordToPage(page)}
                    style={{ pointerEvents: 'none' }}
                  />
                </div>
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{page.title}</h3>
                  <Badge variant={page.published ? 'success' : 'neutral'} size="sm">
                    {page.published ? 'Published' : 'Draft'}
                  </Badge>
                </div>
              </Card>
            </Link>
          ))}
        </AdaptiveGrid>
      )}

      <Dialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        title="New Page"
        actions={
          <>
            <Button type="button" variant="ghost" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreate}
              loading={isSubmitting}
              disabled={isSubmitting || !title.trim()}
            >
              Create
            </Button>
          </>
        }
      >
        <Input
          id="new-page-title"
          label="Title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        {error && <p className={styles.errorText}>{error}</p>}
      </Dialog>
    </div>
  );
}
