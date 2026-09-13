'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Card, Button, Input } from '@true-tech-team/react-components';
import { savePortfolioPage, checkSlugAvailable } from '../pages/crud';
import type { PortfolioPageRecord } from '../pages/types';
import styles from './PortfolioEditor.module.scss';

export interface PortfolioPagesListProps {
  pages: PortfolioPageRecord[];
  userId: string;
  supabase: SupabaseClient;
  onCreated?: (record: PortfolioPageRecord) => void;
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function PortfolioPagesList({
  pages,
  userId,
  supabase,
  onCreated,
}: PortfolioPagesListProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreate() {
    setError(null);
    setIsSubmitting(true);
    try {
      const available = await checkSlugAvailable(supabase, slug);
      if (!available) {
        setError('That slug is already taken. Please choose a different one.');
        return;
      }
      const record = await savePortfolioPage(supabase, userId, {
        schemaVersion: 1,
        slug,
        title,
        templateId: 'blank',
        showNav: true,
        sections: [{ id: crypto.randomUUID(), name: 'Main', showInNav: false, rows: [] }],
      });
      onCreated?.(record);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create page');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.pagesList}>
      {pages.map((page) => (
        <Card key={page.id} padding="sm">
          <Link href={`/portfolio-builder/edit/${page.id}`}>{page.title}</Link>
          <span className={styles.statusBadge}>{page.published ? 'Published' : 'Draft'}</span>
        </Card>
      ))}

      {!isCreating && (
        <Button type="button" onClick={() => setIsCreating(true)}>
          New Page
        </Button>
      )}

      {isCreating && (
        <div className={styles.createForm}>
          <Input
            id="new-page-title"
            label="Title"
            value={title}
            onChange={(event) => {
              const value = event.target.value;
              setTitle(value);
              setSlug(slugify(value));
            }}
          />
          <Input
            id="new-page-slug"
            label="Slug"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
          />
          {error && <p className={styles.errorText}>{error}</p>}
          <Button
            type="button"
            onClick={handleCreate}
            disabled={isSubmitting || !title.trim() || !slug.trim()}
          >
            Create
          </Button>
        </div>
      )}
    </div>
  );
}
