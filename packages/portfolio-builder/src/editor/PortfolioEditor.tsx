'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Button, Dialog, Icon } from '@true-tech-team/react-components';
import { PortfolioPreviewFrame } from '../preview/PortfolioPreviewFrame';
import { EditorCanvas } from './EditorCanvas';
import { PageSettingsDialog } from './PageSettingsDialog';
import { SectionCatalogDialog } from './SectionCatalogDialog';
import { SectionFormPanel } from './SectionFormPanel';
import { SectionList } from './SectionList';
import { useSectionEditor } from './useSectionEditor';
import styles from './PortfolioEditor.module.scss';

export interface PortfolioEditorProps {
  pageId: string;
  userId: string;
  supabase: SupabaseClient;
}

export function PortfolioEditor({ pageId, userId, supabase }: PortfolioEditorProps) {
  const editor = useSectionEditor({ pageId, userId, supabase });
  const [showPreview, setShowPreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);

  if (editor.loadState === 'loading') {
    return <p>Loading…</p>;
  }

  if (editor.loadState === 'missing') {
    return (
      <div className={styles.stateMessage}>
        <p>This page doesn&apos;t exist or you don&apos;t have access to it.</p>
        <Link href="/portfolio-builder">Back to Portfolio Builder</Link>
      </div>
    );
  }

  if (editor.loadState === 'error') {
    return (
      <div className={styles.stateMessage}>
        <p>Couldn&apos;t load this page. Please try again.</p>
      </div>
    );
  }

  // A pre-pivot page cannot be saved, so it is not editable. Say so instead of mounting an editor
  // whose Save button can only ever fail. Sub-project 5 owns converting these pages.
  if (editor.loadState === 'outdated') {
    return (
      <div className={styles.stateMessage}>
        <p>
          This page was built with an earlier version of the builder and needs converting before it
          can be edited.
        </p>
        <Link href="/portfolio-builder">Back to Portfolio Builder</Link>
      </div>
    );
  }

  const page = editor.page;
  if (!page) {
    return <p>Loading…</p>;
  }

  return (
    <div className={styles.editorRoot}>
      <div className={styles.editorHeader}>
        {/* The page list is this editor's parent and always a valid destination; history is not. */}
        <Link href="/portfolio-builder" className={styles.backLink} aria-label="Back to pages">
          <Icon name="arrow-left" size="lg" />
        </Link>
        <div className={styles.editorHeaderCanvas}>
          <div className={styles.editorHeaderTitle}>
            <h2>{page.title}</h2>
          </div>
          <div className={styles.editorHeaderActions}>
            <Button type="button" variant="ghost" onClick={() => setShowSettings(true)}>
              Settings
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowPreview(true)}>
              Preview
            </Button>
            <Button
              type="button"
              onClick={() => void editor.save()}
              disabled={editor.saveState === 'saving'}
            >
              Save
            </Button>
            {editor.saveState === 'saved' && <span className={styles.saveStatus}>Saved</span>}
            {editor.saveState === 'error' && editor.saveError && (
              <span className={styles.saveStatusError}>{editor.saveError}</span>
            )}
          </div>
        </div>
      </div>

      {editor.validationErrors.length > 0 && (
        <ul className={styles.validationErrors}>
          {editor.validationErrors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}

      <div className={styles.workspace}>
        <div className={styles.sidebar} data-testid="editor-sidebar">
          <SectionList
            sections={page.sections}
            selectedId={editor.selectedSectionId}
            onSelect={editor.select}
            onMove={editor.moveSection}
            onRemove={editor.removeSection}
            onAddClick={() => setShowCatalog(true)}
          />
        </div>

        <EditorCanvas page={page} selectedId={editor.selectedSectionId} onSelect={editor.select} />

        <div className={styles.formPanel} data-testid="editor-form-panel">
          <SectionFormPanel
            section={editor.selectedSection}
            onMetaChange={editor.updateSelectedMeta}
            onPropsChange={editor.updateSelectedProps}
            supabase={supabase}
            userId={userId}
          />
        </div>
      </div>

      {showCatalog && (
        <SectionCatalogDialog
          page={page}
          onAdd={(type) => {
            editor.addSection(type);
            setShowCatalog(false);
          }}
          onClose={() => setShowCatalog(false)}
        />
      )}

      {showSettings && (
        <PageSettingsDialog
          page={page}
          published={editor.published}
          isDirty={editor.isDirty}
          publishError={editor.publishError}
          onTitleChange={editor.setTitle}
          onThemeSelect={editor.selectTheme}
          onThemeModeSelect={editor.selectThemeMode}
          onPublishedChange={(next) => void editor.setPublished(next)}
          onClose={() => setShowSettings(false)}
        />
      )}

      <Dialog
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="Preview"
        size="full"
      >
        <PortfolioPreviewFrame page={page} style={{ height: '75vh' }} />
      </Dialog>
    </div>
  );
}
