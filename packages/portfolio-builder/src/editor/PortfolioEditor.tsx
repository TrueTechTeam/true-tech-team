'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { loadPortfolioPage } from '../pages/crud';
import type { PortfolioPage, GridItem } from '../schema/types';
import { collapsedSpans } from '../grid/responsive';
import { getRowRemainingCapacity } from '../layout/transforms';
import { ItemRenderer } from '../render/ItemRenderer';
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

// `userId` is not yet used by this task's data-loading/canvas/selection core — it's threaded
// through the props now because Tasks 5-7 (save, publish) need it against this same file, and
// `PortfolioPagesListClient`'s call site already has it on hand. Renamed on destructure (rather
// than dropped) to satisfy `@typescript-eslint/no-unused-vars` without narrowing the public prop.
export function PortfolioEditor({ pageId, userId: _userId, supabase }: PortfolioEditorProps) {
  const [page, setPage] = useState<PortfolioPage | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadPortfolioPage(supabase, pageId).then((record) => {
      if (cancelled || !record) {
        return;
      }
      setPage({
        schemaVersion: 1,
        slug: record.slug,
        title: record.title,
        templateId: record.templateId,
        themeId: record.themeId,
        themeOverride: record.themeOverride,
        showNav: record.showNav,
        sections: record.sections,
      });
    });
    return () => {
      cancelled = true;
    };
  }, [supabase, pageId]);

  if (!page) {
    return <p>Loading…</p>;
  }

  return (
    <div className={styles.editorLayout}>
      <div
        className={styles.canvas}
        data-testid="canvas-background"
        onClick={() => setSelectedItemId(null)}
      >
        <PageDragDropContainer page={page} onPageChange={setPage}>
          {page.sections.map((section) => (
            <div key={section.id}>
              <DropZone
                id={`new-row-gap:${section.id}:0`}
                data={{ type: 'new-row-gap', sectionId: section.id, index: 0 }}
                label={`Add a new row at the start of ${section.name}`}
              />
              {section.rows.map((row, rowIndex) => (
                <div key={row.id}>
                  <div className={grid.row}>
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
                          >
                            <div
                              data-selected={selectedItemId === item.id}
                              onClick={(event) => {
                                event.stopPropagation();
                                setSelectedItemId(item.id);
                              }}
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
        </PageDragDropContainer>
      </div>
    </div>
  );
}
