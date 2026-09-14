'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { SupabaseClient } from '@supabase/supabase-js';
import { AdaptiveGrid, Badge, Button, Card, Dialog, Input } from '@true-tech-team/react-components';
import { savePortfolioPage } from '../pages/crud';
import { generateUniqueSlug, slugify } from '../pages/slug';
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

  const previewPages = useMemo(
    () => new Map(pages.map((page) => [page.id, recordToPage(page)])),
    [pages]
  );

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
      const buildPage = (slug: string) => ({
        schemaVersion: 1 as const,
        slug,
        title: title.trim(),
        templateId: 'blank',
        showNav: true,
        sections: [{ id: crypto.randomUUID(), name: 'Main', showInNav: false, rows: [] }],
      });

      const slug = await generateUniqueSlug(supabase, title);
      let record: PortfolioPageRecord;
      try {
        record = await savePortfolioPage(supabase, userId, buildPage(slug));
      } catch (err) {
        // generateUniqueSlug's availability check is RLS-scoped (see its own doc
        // comment) - it can look available here even when another user's
        // unpublished page already holds it, since `slug` is unique table-wide.
        // Retry once with a forced suffix before giving up - there is no slug
        // field in this UI for the user to fix themselves.
        if (err instanceof Error && err.message.includes('already taken')) {
          const base = slugify(title) || 'page';
          const suffix = crypto.randomUUID().replace(/-/g, '').slice(0, 6);
          record = await savePortfolioPage(supabase, userId, buildPage(`${base}-${suffix}`));
        } else {
          throw err;
        }
      }
      handleCloseDialog();
      onCreated?.(record);
    } catch (err) {
      setError(
        err instanceof Error && err.message.includes('already taken')
          ? 'That page URL is already taken. Please try again.'
          : err instanceof Error
            ? err.message
            : 'Failed to create page'
      );
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
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- previewPages is built from this exact pages array, so page.id is always present
                    page={previewPages.get(page.id)!}
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
