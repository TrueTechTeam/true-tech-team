'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { loadPortfolioPage, savePortfolioPage, setPortfolioPagePublished } from '../pages/crud';
import { recordToPage } from '../pages/mapping';
import { validatePortfolioPage } from '../schema/validate';
import {
  CURRENT_SCHEMA_VERSION,
  type PageSection,
  type PortfolioPage,
  type SectionBackground,
  type SectionType,
} from '../schema/types';
import {
  addSection as addSectionTransform,
  moveSection as moveSectionTransform,
  removeSection as removeSectionTransform,
  updateSectionMeta as updateSectionMetaTransform,
  updateSectionProps as updateSectionPropsTransform,
} from './sectionTransforms';

export type EditorLoadState = 'loading' | 'ready' | 'missing' | 'error' | 'outdated';
export type EditorSaveState = 'idle' | 'saving' | 'saved' | 'error';

export interface UseSectionEditorOptions {
  pageId: string;
  userId: string;
  supabase: SupabaseClient;
}

export interface UseSectionEditorResult {
  loadState: EditorLoadState;
  page: PortfolioPage | null;
  published: boolean;
  selectedSectionId: string | null;
  selectedSection: PageSection | null;
  isDirty: boolean;
  saveState: EditorSaveState;
  saveError: string | null;
  validationErrors: string[];
  publishError: string | null;
  select: (id: string) => void;
  addSection: (type: SectionType) => void;
  removeSection: (id: string) => void;
  moveSection: (id: string, delta: -1 | 1) => void;
  updateSelectedProps: (props: Record<string, unknown>) => void;
  updateSelectedMeta: (patch: {
    name?: string;
    showInNav?: boolean;
    background?: SectionBackground;
  }) => void;
  setTitle: (title: string) => void;
  selectTheme: (themeId: string) => void;
  save: () => Promise<void>;
  setPublished: (published: boolean) => Promise<void>;
}

function messageOf(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function useSectionEditor({
  pageId,
  userId,
  supabase,
}: UseSectionEditorOptions): UseSectionEditorResult {
  const [loadState, setLoadState] = useState<EditorLoadState>('loading');
  const [page, setPage] = useState<PortfolioPage | null>(null);
  const [published, setPublishedState] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [saveState, setSaveState] = useState<EditorSaveState>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [publishError, setPublishError] = useState<string | null>(null);

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
        const loaded = recordToPage(record);
        setPage(loaded);
        setPublishedState(record.published);
        // A pre-pivot row loads fine but can never be saved: `validatePortfolioPage` rejects any
        // version but the current one. Block editing up front rather than letting someone do real
        // work and hit "schemaVersion must be 2" on save. Sub-project 5 owns the conversion.
        setLoadState(loaded.schemaVersion === CURRENT_SCHEMA_VERSION ? 'ready' : 'outdated');
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

  useEffect(() => {
    if (!isDirty) {
      return;
    }
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      // Browsers show their own generic message; assigning returnValue is what triggers it.
      event.returnValue = '';
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  /**
   * Applies a transform and marks the page dirty only if it actually changed. The transforms
   * return the SAME object for a no-op, which is what makes this reference check correct.
   */
  const applyTransform = useCallback((transform: (current: PortfolioPage) => PortfolioPage) => {
    setPage((current) => {
      if (!current) {
        return current;
      }
      const next = transform(current);
      if (next !== current) {
        setIsDirty(true);
        setSaveState('idle');
      }
      return next;
    });
  }, []);

  const select = useCallback((id: string) => setSelectedSectionId(id), []);

  const addSection = useCallback((type: SectionType) => {
    setPage((current) => {
      if (!current) {
        return current;
      }
      const next = addSectionTransform(current, type);
      if (next === current) {
        return current;
      }
      setIsDirty(true);
      setSaveState('idle');
      // Select the new section so it can be edited straight away.
      const added = next.sections[next.sections.length - 1];
      if (added) {
        setSelectedSectionId(added.id);
      }
      return next;
    });
  }, []);

  const removeSection = useCallback((id: string) => {
    setPage((current) => {
      if (!current) {
        return current;
      }
      const next = removeSectionTransform(current, id);
      if (next === current) {
        return current;
      }
      setIsDirty(true);
      setSaveState('idle');
      setSelectedSectionId((selected) => (selected === id ? null : selected));
      return next;
    });
  }, []);

  const moveSection = useCallback(
    (id: string, delta: -1 | 1) => {
      applyTransform((current) => moveSectionTransform(current, id, delta));
    },
    [applyTransform]
  );

  const updateSelectedProps = useCallback(
    (props: Record<string, unknown>) => {
      if (!selectedSectionId) {
        return;
      }
      applyTransform((current) => updateSectionPropsTransform(current, selectedSectionId, props));
    },
    [applyTransform, selectedSectionId]
  );

  const updateSelectedMeta = useCallback(
    (patch: { name?: string; showInNav?: boolean; background?: SectionBackground }) => {
      if (!selectedSectionId) {
        return;
      }
      applyTransform((current) => updateSectionMetaTransform(current, selectedSectionId, patch));
    },
    [applyTransform, selectedSectionId]
  );

  const setTitle = useCallback((title: string) => {
    setPage((current) => (current ? { ...current, title } : current));
    setIsDirty(true);
    setSaveState('idle');
  }, []);

  const selectTheme = useCallback((themeId: string) => {
    // Choosing a preset discards any ad-hoc override, matching the previous editor's behavior.
    setPage((current) => (current ? { ...current, themeId, themeOverride: undefined } : current));
    setIsDirty(true);
    setSaveState('idle');
  }, []);

  const save = useCallback(async () => {
    if (!page) {
      return;
    }
    // Validate locally first: it gives field-level errors and avoids a round trip that
    // `savePortfolioPage` would reject anyway.
    const result = validatePortfolioPage(page);
    if (!result.valid) {
      setValidationErrors(result.errors);
      setSaveState('error');
      setSaveError(null);
      return;
    }
    setValidationErrors([]);
    setSaveState('saving');
    setSaveError(null);
    try {
      const saved = page;
      const record = await savePortfolioPage(supabase, userId, saved, pageId);
      setPublishedState(record.published);
      setPage((current) => {
        // Only clear the dirty flag if nothing was edited while the save was in flight. Every
        // mutation replaces the page object, so reference equality is the test - the same
        // property `applyTransform` relies on. Otherwise a mid-save edit would look clean.
        if (current === saved) {
          setIsDirty(false);
        }
        return current;
      });
      setSaveState('saved');
    } catch (error) {
      setSaveState('error');
      setSaveError(messageOf(error, 'Failed to save'));
    }
  }, [page, supabase, userId, pageId]);

  const setPublished = useCallback(
    async (next: boolean) => {
      setPublishError(null);
      try {
        const record = await setPortfolioPagePublished(supabase, pageId, next);
        setPublishedState(record.published);
      } catch (error) {
        setPublishError(messageOf(error, 'Failed to update publish status'));
      }
    },
    [supabase, pageId]
  );

  const selectedSection = useMemo(
    () => page?.sections.find((section) => section.id === selectedSectionId) ?? null,
    [page, selectedSectionId]
  );

  return {
    loadState,
    page,
    published,
    selectedSectionId,
    selectedSection,
    isDirty,
    saveState,
    saveError,
    // Derived, not stored separately: errors are only meaningful while the failed save they came
    // from is still the latest word. Any edit moves saveState off 'error', which hides them, so the
    // two can never disagree.
    validationErrors: saveState === 'error' ? validationErrors : [],
    publishError,
    select,
    addSection,
    removeSection,
    moveSection,
    updateSelectedProps,
    updateSelectedMeta,
    setTitle,
    selectTheme,
    save,
    setPublished,
  };
}
