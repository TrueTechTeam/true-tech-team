'use client';

import { useEffect, useRef, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Icon, Button, Dialog, useDroppable } from '@true-tech-team/react-components';
import { loadPortfolioPage, savePortfolioPage } from '../pages/crud';
import { recordToPage } from '../pages/mapping';
import { isComponentType, type PortfolioPage, type GridItem } from '../schema/types';
import { getRegistryEntry } from '../components/registry';
import {
  insertItemInNewRow,
  removeItem,
  updateItemProps,
  updateItemSpan,
} from '../layout/transforms';
import { nearestBoundary } from '../layout/nearestBoundary';
import { PropertyPanel } from '../properties/PropertyPanel';
import type { SelectedItem } from '../properties/types';
import { ThemeDropdown } from '../themes/ThemeDropdown';
import { THEME_PRESETS } from '../themes/presets';
import { resolveEffectiveTheme } from '../themes/resolveTheme';
import { themeStyleVars } from '../themes/themeStyleVars';
import { PortfolioPreviewFrame } from '../preview/PortfolioPreviewFrame';
import { Palette } from './Palette';
import { EditableRow } from './EditableRow';
import { InsertionLine } from './InsertionLine';
import { PageDragDropContainer } from './PageDragDropContainer';
import styles from './PortfolioEditor.module.scss';

export interface PortfolioEditorProps {
  pageId: string;
  userId: string;
  supabase: SupabaseClient;
}

type LoadState = 'loading' | 'ready' | 'missing' | 'error';

/** Finds the `GridItem` matching `itemId` anywhere in `page`, or `undefined` if not found. */
export function findSelectedItem(page: PortfolioPage, itemId: string | null): GridItem | undefined {
  if (!itemId) {
    return undefined;
  }
  for (const section of page.sections) {
    for (const row of section.rows) {
      const item = row.items.find((candidate) => candidate.id === itemId);
      if (item) {
        return item;
      }
    }
  }
  return undefined;
}

export function PortfolioEditor({ pageId, userId, supabase }: PortfolioEditorProps) {
  const [page, setPage] = useState<PortfolioPage | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
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
        // RLS intentionally allows reading PUBLISHED rows regardless of owner (for a future
        // public route), so a record can resolve successfully yet belong to someone else -
        // treat that the same as "not found" rather than silently loading their content.
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

  /** Applies a page mutation and marks the page as having unsaved changes again. */
  function updatePage(updater: (current: PortfolioPage) => PortfolioPage) {
    setPage((current) => (current ? updater(current) : current));
    setSaveState('idle');
    setSaveError(null);
  }

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

  const selectedGridItem = findSelectedItem(page, selectedItemId);
  const selectedItem: SelectedItem | undefined = selectedGridItem
    ? {
        componentType: selectedGridItem.component,
        props: selectedGridItem.props,
        span: selectedGridItem.span,
      }
    : undefined;

  function handlePropsChange(newProps: Record<string, unknown>) {
    if (!selectedItemId) {
      return;
    }
    updatePage((current) => updateItemProps(current, selectedItemId, newProps));
  }

  function handleSpanChange(newSpan: number) {
    if (!selectedItemId) {
      return;
    }
    updatePage((current) => updateItemSpan(current, selectedItemId, newSpan));
  }

  function handleDelete() {
    if (!selectedItemId) {
      return;
    }
    updatePage((current) => removeItem(current, selectedItemId));
    setSelectedItemId(null);
  }

  function handleThemeSelect(themeId: string) {
    updatePage((current) => ({ ...current, themeId, themeOverride: undefined }));
  }

  function handlePageChange(next: PortfolioPage) {
    setPage(next);
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
      <PageDragDropContainer page={page} onPageChange={handlePageChange}>
        <div className={styles.editorLayout}>
          <div className={styles.leftColumn}>
            <Palette />
          </div>
          <PortfolioCanvas
            page={page}
            selectedItemId={selectedItemId}
            onSelectItem={setSelectedItemId}
            onPageChange={handlePageChange}
          />
          <div className={styles.sidePanel}>
            {selectedItem && selectedItemId ? (
              <>
                <div className={styles.sidePanelHeader}>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={handleDelete}
                    aria-label="Delete selected item"
                  >
                    <Icon name="delete" size="sm" />
                    Delete
                  </Button>
                </div>
                <PropertyPanel
                  key={selectedItemId}
                  item={selectedItem}
                  onPropsChange={handlePropsChange}
                  onSpanChange={handleSpanChange}
                  supabase={supabase}
                  userId={userId}
                />
              </>
            ) : (
              <p className={styles.sidePanelPlaceholder}>Select an item to edit its properties</p>
            )}
          </div>
        </div>
      </PageDragDropContainer>
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

// `useDroppable` reads drag context from `DndProvider` (rendered by `PageDragDropContainer`),
// which is a CHILD of `PortfolioEditor`'s own return - so the tier-3 canvas-level droppable can't
// be a hook call inside `PortfolioEditor` itself (it would run before that provider exists in the
// tree). It lives in this separate component instead, rendered as a descendant of
// `PageDragDropContainer` alongside the palette and side panel.
function PortfolioCanvas({
  page,
  selectedItemId,
  onSelectItem,
  onPageChange,
}: {
  page: PortfolioPage;
  selectedItemId: string | null;
  onSelectItem: (itemId: string | null) => void;
  onPageChange: (page: PortfolioPage) => void;
}) {
  const [canvasInsertion, setCanvasInsertion] = useState<{
    sectionId: string;
    offset: number;
  } | null>(null);
  const sectionRefs = useRef(new Map<string, HTMLElement>());

  const {
    setNodeRef: setCanvasDropRef,
    active,
    attributes: canvasAttrs,
    listeners: canvasListeners,
  } = useDroppable({
    id: 'canvas',
    accepts: ['palette-item', 'grid-item'],
  });

  function handleCanvasDragOver(event: React.DragEvent<HTMLDivElement>) {
    canvasListeners.onDragOver(event);
    event.preventDefault();
    const sectionRects = page.sections
      .map((s) => ({ id: s.id, rect: sectionRefs.current.get(s.id)?.getBoundingClientRect() }))
      .filter((entry): entry is { id: string; rect: DOMRect } => Boolean(entry.rect));
    if (sectionRects.length === 0) {
      return;
    }
    const boundary = nearestBoundary(
      event.clientY,
      sectionRects.map((entry) => entry.rect),
      'y'
    );
    if (!boundary) {
      return;
    }
    const targetSection = sectionRects[Math.min(boundary.index, sectionRects.length - 1)];
    setCanvasInsertion({ sectionId: targetSection.id, offset: boundary.position });
  }

  function handleCanvasDrop(event: React.DragEvent<HTMLDivElement>) {
    canvasListeners.onDrop(event);
    event.preventDefault();
    const current = canvasInsertion;
    setCanvasInsertion(null);
    if (!active || !current) {
      return;
    }
    const targetSection = page.sections.find((s) => s.id === current.sectionId);
    if (!targetSection) {
      return;
    }
    const data = active.data;
    if (
      data.type === 'palette-item' &&
      typeof data.componentType === 'string' &&
      isComponentType(data.componentType)
    ) {
      const entry = getRegistryEntry(data.componentType);
      const newItem = {
        id: crypto.randomUUID(),
        component: data.componentType,
        span: Math.min(entry?.defaultWidth ?? 12, 12),
        props: { ...(entry?.defaultProps ?? {}) },
      };
      onPageChange(insertItemInNewRow(page, targetSection.id, targetSection.rows.length, newItem));
    }
  }

  return (
    <div
      ref={setCanvasDropRef}
      {...canvasAttrs}
      className={styles.canvas}
      data-testid="canvas-background"
      data-drag-active={active ? 'true' : undefined}
      style={themeStyleVars(resolveEffectiveTheme(page))}
      onClick={() => onSelectItem(null)}
      onDragOver={handleCanvasDragOver}
      onDrop={handleCanvasDrop}
    >
      {page.sections.map((section) => (
        <div
          key={section.id}
          ref={(node) => {
            if (node) {
              sectionRefs.current.set(section.id, node);
            } else {
              sectionRefs.current.delete(section.id);
            }
          }}
          style={{ position: 'relative' }}
        >
          {section.rows.length === 0 && (
            <SectionEmptyDropTarget
              sectionId={section.id}
              page={page}
              onPageChange={onPageChange}
            />
          )}
          {section.rows.map((row, rowIndex) => (
            <EditableRow
              key={row.id}
              page={page}
              section={section}
              row={row}
              rowIndex={rowIndex}
              onPageChange={onPageChange}
              selectedItemId={selectedItemId}
              onSelectItem={onSelectItem}
            />
          ))}
          {canvasInsertion?.sectionId === section.id && (
            <InsertionLine
              orientation="horizontal"
              offset={
                canvasInsertion.offset -
                (sectionRefs.current.get(section.id)?.getBoundingClientRect().top ?? 0)
              }
            />
          )}
        </div>
      ))}
    </div>
  );
}

function SectionEmptyDropTarget({
  sectionId,
  page,
  onPageChange,
}: {
  sectionId: string;
  page: PortfolioPage;
  onPageChange: (page: PortfolioPage) => void;
}) {
  const { setNodeRef, active, attributes, listeners } = useDroppable({
    id: `section-empty:${sectionId}`,
    accepts: ['palette-item', 'grid-item'],
  });

  function handleDrop(event: React.DragEvent<HTMLParagraphElement>) {
    listeners.onDrop(event);
    event.preventDefault();
    event.stopPropagation();
    if (!active) {
      return;
    }
    const data = active.data;
    if (
      data.type === 'palette-item' &&
      typeof data.componentType === 'string' &&
      isComponentType(data.componentType)
    ) {
      const entry = getRegistryEntry(data.componentType);
      const newItem = {
        id: crypto.randomUUID(),
        component: data.componentType,
        span: Math.min(entry?.defaultWidth ?? 12, 12),
        props: { ...(entry?.defaultProps ?? {}) },
      };
      onPageChange(insertItemInNewRow(page, sectionId, 0, newItem));
    }
  }

  return (
    <p
      ref={setNodeRef}
      {...attributes}
      onDragOver={(event) => {
        listeners.onDragOver(event);
        event.preventDefault();
        event.stopPropagation();
      }}
      onDrop={handleDrop}
      className={styles.emptyState}
    >
      Drag a component here to get started
    </p>
  );
}
