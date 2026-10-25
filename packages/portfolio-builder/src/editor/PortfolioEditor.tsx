'use client';

import { useEffect, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Button, Dialog } from '@true-tech-team/react-components';
import { loadPortfolioPage, savePortfolioPage } from '../pages/crud';
import { recordToPage } from '../pages/mapping';
import type { PortfolioPage } from '../schema/types';
import { ThemeDropdown } from '../themes/ThemeDropdown';
import { THEME_PRESETS } from '../themes/presets';
import { resolveEffectiveTheme } from '../themes/resolveTheme';
import { themeStyleVars } from '../themes/themeStyleVars';
import { PortfolioPreviewFrame } from '../preview/PortfolioPreviewFrame';
import { PageRenderer } from '../render/PageRenderer';
import styles from './PortfolioEditor.module.scss';

export interface PortfolioEditorProps {
  pageId: string;
  userId: string;
  supabase: SupabaseClient;
}

type LoadState = 'loading' | 'ready' | 'missing' | 'error';

export function PortfolioEditor({ pageId, userId, supabase }: PortfolioEditorProps) {
  const [page, setPage] = useState<PortfolioPage | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [showPreview, setShowPreview] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoadState('loading');
    loadPortfolioPage(supabase, pageId)
      .then((record) => {
        if (cancelled) {
          return;
        }
        // RLS intentionally allows reading PUBLISHED rows regardless of owner (for the public
        // route), so a record can resolve successfully yet belong to someone else - treat that
        // the same as "not found" rather than silently loading their content.
        if (!record || record.userId !== userId) {
          setLoadState('missing');
          return;
        }
        setPage(recordToPage(record));
        setLoadState('ready');
      })
      .catch(() => {
        if (!cancelled) {
          setLoadState('error');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [supabase, pageId, userId]);

  if (loadState === 'loading') {
    return <p>Loading…</p>;
  }

  if (loadState === 'missing') {
    return (
      <div className={styles.stateMessage}>
        <p>This page doesn&apos;t exist or you don&apos;t have access to it.</p>
        <Link href="/portfolio-builder">Back to Portfolio Builder</Link>
      </div>
    );
  }

  if (loadState === 'error') {
    return (
      <div className={styles.stateMessage}>
        <p>Couldn&apos;t load this page. Please try again.</p>
      </div>
    );
  }

  if (!page) {
    return <p>Loading…</p>;
  }

  function handleThemeSelect(themeId: string) {
    setPage((current) => (current ? { ...current, themeId, themeOverride: undefined } : current));
    setSaveState('idle');
    setSaveError(null);
  }

  async function handleSave() {
    if (!page) {
      return;
    }
    setSaveState('saving');
    setSaveError(null);
    try {
      await savePortfolioPage(supabase, userId, page, pageId);
      setSaveState('saved');
    } catch (err) {
      setSaveState('error');
      setSaveError(err instanceof Error ? err.message : 'Failed to save');
    }
  }

  return (
    <div className={styles.editorRoot}>
      <div className={styles.editorHeader}>
        <div className={styles.editorHeaderTitle}>
          <h2>{page.title}</h2>
          <ThemeDropdown
            presets={THEME_PRESETS}
            selectedId={page.themeId ?? THEME_PRESETS[0]?.id}
            onSelect={handleThemeSelect}
          />
        </div>
        <div className={styles.editorHeaderActions}>
          <Button type="button" onClick={() => setShowPreview(true)}>
            Preview
          </Button>
          <Button type="button" onClick={handleSave} disabled={saveState === 'saving'}>
            Save
          </Button>
          {saveState === 'saved' && <span className={styles.saveStatus}>Saved</span>}
          {saveState === 'error' && saveError && (
            <span className={styles.saveStatusError}>{saveError}</span>
          )}
        </div>
      </div>
      {/* Read-only until sub-project 2 builds the section editor on top of this shell. */}
      <div
        className={styles.canvas}
        data-testid="canvas-background"
        style={themeStyleVars(resolveEffectiveTheme(page))}
      >
        <PageRenderer page={page} />
      </div>
      <Dialog
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="Preview"
        size="full"
      >
        {page && <PortfolioPreviewFrame page={page} style={{ height: '75vh' }} />}
      </Dialog>
    </div>
  );
}
