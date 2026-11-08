'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  AdaptiveGrid,
  Badge,
  Button,
  Card,
  Dialog,
  Icon,
  Input,
  type ThemeMode,
} from '@true-tech-team/react-components';
import { savePortfolioPage } from '../pages/crud';
import { generateUniqueSlug, slugify } from '../pages/slug';
import { recordToPage } from '../pages/mapping';
import { buildPageFromTemplate } from '../templates/buildPageFromTemplate';
import { getTemplate, TEMPLATE_IDS } from '../templates/registry';
import { getThemeStyle } from '../themes/presets';
import type { PortfolioPageRecord } from '../pages/types';
import { PortfolioPreviewFrame } from '../preview/PortfolioPreviewFrame';
import { TemplatePicker } from './TemplatePicker';
import styles from './PortfolioPagesList.module.scss';

/**
 * The mode a template previews and creates in when the user has not chosen one: its hard-coded
 * style's own `defaultMode`, falling back to light if that style no longer resolves. Same chain as
 * `resolveEffectiveMode`, applied to a page that does not exist yet.
 */
function templateDefaultMode(templateId: string): ThemeMode {
  const themeId = getTemplate(templateId)?.themeId;
  if (!themeId) {
    return 'light';
  }
  return getThemeStyle(themeId)?.defaultMode ?? 'light';
}

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
  const [templateId, setTemplateId] = useState<string>(TEMPLATE_IDS[0] ?? 'blank');
  // null means "whatever the selected template's style defaults to". Kept separate from the
  // resolved value so switching template still moves the default, while an explicit choice is not
  // silently thrown away by that switch.
  const [chosenMode, setChosenMode] = useState<ThemeMode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const themeMode = chosenMode ?? templateDefaultMode(templateId);

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
    setTemplateId(TEMPLATE_IDS[0] ?? 'blank');
    setChosenMode(null);
    setError(null);
  }

  async function handleCreate() {
    setError(null);
    setIsSubmitting(true);
    try {
      const template = getTemplate(templateId) ?? getTemplate(TEMPLATE_IDS[0] ?? 'blank');
      if (!template) {
        setError('No templates are available.');
        return;
      }
      // Always stored explicitly, including when it equals the style's default: the page then
      // keeps the mode the user actually saw in the picker even if a style's default ever moves.
      // Resolved from the template that was really used, not from `templateId`, which can name a
      // template that no longer exists and fall back above.
      const mode = chosenMode ?? templateDefaultMode(template.id);
      const buildPage = (pageSlug: string) => ({
        ...buildPageFromTemplate(template, title.trim(), pageSlug),
        themeMode: mode,
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

      <AdaptiveGrid
        minItemWidth={360}
        maxColumns={4}
        minColumns={1}
        gap={16}
        justifyItems="stretch"
      >
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
        <button
          type="button"
          className={styles.createTile}
          onClick={handleOpenDialog}
          aria-label="Create New Page"
        >
          <Icon name="plus" size="lg" />
          <span>Create New Page</span>
        </button>
      </AdaptiveGrid>

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
        <TemplatePicker
          selectedId={templateId}
          onSelect={setTemplateId}
          mode={themeMode}
          onModeChange={setChosenMode}
        />
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
