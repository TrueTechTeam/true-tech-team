'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Icon, Button, Dialog } from '@true-tech-team/react-components';
import { loadPortfolioPage, savePortfolioPage } from '../pages/crud';
import { recordToPage } from '../pages/mapping';
import type { PortfolioPage, GridItem } from '../schema/types';
import { collapsedSpans } from '../grid/responsive';
import { rowAlignmentStyle } from '../grid/rowStyle';
import {
  getRowRemainingCapacity,
  removeItem,
  updateItemProps,
  updateItemSpan,
} from '../layout/transforms';
import { ItemRenderer } from '../render/ItemRenderer';
import { PropertyPanel } from '../properties/PropertyPanel';
import type { SelectedItem } from '../properties/types';
import { ThemeDropdown } from '../themes/ThemeDropdown';
import { THEME_PRESETS } from '../themes/presets';
import { resolveEffectiveTheme } from '../themes/resolveTheme';
import { themeStyleVars } from '../themes/themeStyleVars';
import { PortfolioPreviewFrame } from '../preview/PortfolioPreviewFrame';
import { Palette } from './Palette';
import { DraggableGridItem } from './DraggableGridItem';
import { DropZone } from './DropZone';
import { PageDragDropContainer } from './PageDragDropContainer';
import grid from '../grid/Grid.module.scss';
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

  function handleItemKeyDown(event: React.KeyboardEvent<HTMLDivElement>, itemId: string) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setSelectedItemId(itemId);
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
          <div
            className={styles.canvas}
            data-testid="canvas-background"
            style={themeStyleVars(resolveEffectiveTheme(page))}
            onClick={() => setSelectedItemId(null)}
          >
            {page.sections.map((section) => (
              <div key={section.id}>
                <DropZone
                  id={`new-row-gap:${section.id}:0`}
                  data={{ type: 'new-row-gap', sectionId: section.id, index: 0 }}
                  label={`Add a new row at the start of ${section.name}`}
                />
                {section.rows.length === 0 && (
                  <p className={styles.emptyState}>Drag a component here to get started</p>
                )}
                {section.rows.map((row, rowIndex) => (
                  <div key={row.id}>
                    <div className={grid.row} style={rowAlignmentStyle(row)}>
                      {row.items.map((item, index) => {
                        const spans = collapsedSpans(item.span);
                        const spanStyle = {
                          '--span-desktop': String(spans.desktop),
                          '--span-tablet': String(spans.tablet),
                          '--span-mobile': String(spans.mobile),
                        } as CSSProperties;
                        return (
                          <div key={item.id} className={grid.item} style={spanStyle}>
                            <DraggableGridItem
                              sectionId={section.id}
                              rowId={row.id}
                              index={index}
                              item={item}
                              columnWidth={12}
                              onResize={() => {}}
                              onResizeEnd={() => {}}
                            >
                              <div
                                className={styles.selectableItem}
                                data-selected={selectedItemId === item.id}
                                role="button"
                                tabIndex={0}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setSelectedItemId(item.id);
                                }}
                                onKeyDown={(event) => handleItemKeyDown(event, item.id)}
                              >
                                <ItemRenderer item={item} />
                              </div>
                            </DraggableGridItem>
                          </div>
                        );
                      })}
                      <DropZone
                        id={`row-gap:${section.id}:${row.id}:${row.items.length}`}
                        data={{
                          type: 'row-gap',
                          sectionId: section.id,
                          rowId: row.id,
                          index: row.items.length,
                        }}
                        disabled={getRowRemainingCapacity(row) < 1}
                        label="Drop here to add to this row"
                      />
                    </div>
                    <DropZone
                      id={`new-row-gap:${section.id}:${rowIndex + 1}`}
                      data={{ type: 'new-row-gap', sectionId: section.id, index: rowIndex + 1 }}
                      label={`Add a new row after this one in ${section.name}`}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
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
