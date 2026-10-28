import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { useSectionEditor } from './useSectionEditor';
import * as crud from '../pages/crud';
import { CURRENT_SCHEMA_VERSION, PRE_PIVOT_SCHEMA_VERSION } from '../schema/types';
import type { PortfolioPageRecord } from '../pages/types';

const fakeSupabase = {} as SupabaseClient;

function makeRecord(overrides: Partial<PortfolioPageRecord> = {}): PortfolioPageRecord {
  return {
    id: 'page-1',
    userId: 'user-1',
    slug: 'jtrue',
    title: 'Justin True',
    templateId: 'default',
    published: false,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    sections: [
      { id: 'sec-nav', type: 'navbar', name: 'Home', showInNav: false, props: { brand: 'JT' } },
      {
        id: 'sec-header',
        type: 'header',
        name: 'Intro',
        showInNav: true,
        props: { heading: 'Hi' },
      },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function renderEditor() {
  return renderHook(() =>
    useSectionEditor({ pageId: 'page-1', userId: 'user-1', supabase: fakeSupabase })
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useSectionEditor — loading', () => {
  it('loads the page and reports ready', async () => {
    vi.spyOn(crud, 'loadPortfolioPage').mockResolvedValue(makeRecord());
    const { result } = renderEditor();
    await waitFor(() => expect(result.current.loadState).toBe('ready'));
    expect(result.current.page?.title).toBe('Justin True');
    expect(result.current.published).toBe(false);
  });

  it('reports missing when the record does not exist', async () => {
    vi.spyOn(crud, 'loadPortfolioPage').mockResolvedValue(null);
    const { result } = renderEditor();
    await waitFor(() => expect(result.current.loadState).toBe('missing'));
  });

  it('reports missing when the record belongs to someone else', async () => {
    vi.spyOn(crud, 'loadPortfolioPage').mockResolvedValue(makeRecord({ userId: 'someone-else' }));
    const { result } = renderEditor();
    await waitFor(() => expect(result.current.loadState).toBe('missing'));
  });

  it('reports error when loading throws', async () => {
    vi.spyOn(crud, 'loadPortfolioPage').mockRejectedValue(new Error('network'));
    const { result } = renderEditor();
    await waitFor(() => expect(result.current.loadState).toBe('error'));
  });

  it('reports outdated for a pre-pivot page', async () => {
    vi.spyOn(crud, 'loadPortfolioPage').mockResolvedValue(
      makeRecord({ schemaVersion: PRE_PIVOT_SCHEMA_VERSION })
    );
    const { result } = renderEditor();
    await waitFor(() => expect(result.current.loadState).toBe('outdated'));
  });

  it('reports outdated for a record with no stored schemaVersion', async () => {
    vi.spyOn(crud, 'loadPortfolioPage').mockResolvedValue(makeRecord({ schemaVersion: undefined }));
    const { result } = renderEditor();
    await waitFor(() => expect(result.current.loadState).toBe('outdated'));
  });
});

describe('useSectionEditor — editing', () => {
  async function readyEditor() {
    vi.spyOn(crud, 'loadPortfolioPage').mockResolvedValue(makeRecord());
    const rendered = renderEditor();
    await waitFor(() => expect(rendered.result.current.loadState).toBe('ready'));
    return rendered;
  }

  it('starts clean and with nothing selected', async () => {
    const { result } = await readyEditor();
    expect(result.current.isDirty).toBe(false);
    expect(result.current.selectedSectionId).toBeNull();
    expect(result.current.selectedSection).toBeNull();
  });

  it('selects a section and exposes it', async () => {
    const { result } = await readyEditor();
    act(() => result.current.select('sec-header'));
    expect(result.current.selectedSectionId).toBe('sec-header');
    expect(result.current.selectedSection?.name).toBe('Intro');
  });

  it('selecting alone does not make the page dirty', async () => {
    const { result } = await readyEditor();
    act(() => result.current.select('sec-header'));
    expect(result.current.isDirty).toBe(false);
  });

  it('adds a section, selects it, and becomes dirty', async () => {
    const { result } = await readyEditor();
    act(() => result.current.addSection('header'));
    expect(result.current.page?.sections).toHaveLength(3);
    expect(result.current.selectedSectionId).toBe(result.current.page?.sections[2]?.id);
    expect(result.current.isDirty).toBe(true);
  });

  it('does not become dirty when adding a barred singleton', async () => {
    const { result } = await readyEditor();
    act(() => result.current.addSection('navbar'));
    expect(result.current.page?.sections).toHaveLength(2);
    expect(result.current.isDirty).toBe(false);
  });

  it('removes a section and becomes dirty', async () => {
    const { result } = await readyEditor();
    act(() => result.current.removeSection('sec-header'));
    expect(result.current.page?.sections).toHaveLength(1);
    expect(result.current.isDirty).toBe(true);
  });

  it('clears the selection when the selected section is removed', async () => {
    const { result } = await readyEditor();
    act(() => result.current.select('sec-header'));
    act(() => result.current.removeSection('sec-header'));
    expect(result.current.selectedSectionId).toBeNull();
    expect(result.current.selectedSection).toBeNull();
  });

  it('keeps the selection when a different section is removed', async () => {
    const { result } = await readyEditor();
    act(() => result.current.select('sec-header'));
    act(() => result.current.removeSection('sec-nav'));
    expect(result.current.selectedSectionId).toBe('sec-header');
  });

  it('does not become dirty or change anything when removing an absent id', async () => {
    const { result } = await readyEditor();
    act(() => result.current.select('sec-header'));
    const before = result.current.page;
    act(() => result.current.removeSection('nonexistent'));
    expect(result.current.isDirty).toBe(false);
    expect(result.current.page?.sections.map((s) => s.id)).toEqual(['sec-nav', 'sec-header']);
    expect(result.current.page).toBe(before);
    expect(result.current.selectedSectionId).toBe('sec-header');
  });

  it('moves a section and becomes dirty', async () => {
    const { result } = await readyEditor();
    act(() => result.current.moveSection('sec-header', -1));
    expect(result.current.page?.sections.map((s) => s.id)).toEqual(['sec-header', 'sec-nav']);
    expect(result.current.isDirty).toBe(true);
  });

  it('does not become dirty on a no-op move', async () => {
    const { result } = await readyEditor();
    act(() => result.current.moveSection('sec-nav', -1));
    expect(result.current.isDirty).toBe(false);
  });

  it('updates the selected section props', async () => {
    const { result } = await readyEditor();
    act(() => result.current.select('sec-header'));
    act(() => result.current.updateSelectedProps({ heading: 'Changed' }));
    expect(result.current.selectedSection?.props).toEqual({ heading: 'Changed' });
    expect(result.current.isDirty).toBe(true);
  });

  it('updates the selected section meta', async () => {
    const { result } = await readyEditor();
    act(() => result.current.select('sec-header'));
    act(() => result.current.updateSelectedMeta({ name: 'About' }));
    expect(result.current.selectedSection?.name).toBe('About');
    expect(result.current.isDirty).toBe(true);
  });

  it('ignores a props update when nothing is selected', async () => {
    const { result } = await readyEditor();
    act(() => result.current.updateSelectedProps({ heading: 'Changed' }));
    expect(result.current.isDirty).toBe(false);
  });

  it('sets the page title and the theme', async () => {
    const { result } = await readyEditor();
    act(() => result.current.setTitle('Renamed'));
    expect(result.current.page?.title).toBe('Renamed');
    act(() => result.current.selectTheme('coral-reef'));
    expect(result.current.page?.themeId).toBe('coral-reef');
    expect(result.current.isDirty).toBe(true);
  });

  it('clears any theme override when a preset is chosen', async () => {
    const { result } = await readyEditor();
    act(() => result.current.selectTheme('coral-reef'));
    expect(result.current.page?.themeOverride).toBeUndefined();
  });
});

describe('useSectionEditor — saving', () => {
  async function readyEditor() {
    vi.spyOn(crud, 'loadPortfolioPage').mockResolvedValue(makeRecord());
    const rendered = renderEditor();
    await waitFor(() => expect(rendered.result.current.loadState).toBe('ready'));
    return rendered;
  }

  it('saves and clears the dirty flag', async () => {
    const { result } = await readyEditor();
    const save = vi.spyOn(crud, 'savePortfolioPage').mockResolvedValue(makeRecord());
    act(() => result.current.setTitle('Renamed'));
    await act(async () => {
      await result.current.save();
    });
    expect(save).toHaveBeenCalled();
    expect(result.current.isDirty).toBe(false);
    expect(result.current.saveState).toBe('saved');
  });

  it('surfaces a save failure', async () => {
    const { result } = await readyEditor();
    vi.spyOn(crud, 'savePortfolioPage').mockRejectedValue(new Error('Slug taken'));
    act(() => result.current.setTitle('Renamed'));
    await act(async () => {
      await result.current.save();
    });
    expect(result.current.saveState).toBe('error');
    expect(result.current.saveError).toBe('Slug taken');
    expect(result.current.isDirty).toBe(true);
  });

  // Review Focus 4
  it('reports validation errors and does not call Supabase when the page is invalid', async () => {
    vi.spyOn(crud, 'loadPortfolioPage').mockResolvedValue(
      makeRecord({
        sections: [
          {
            id: 'sec-header',
            type: 'header',
            name: 'Intro',
            showInNav: true,
            // `heading` is required by the header schema, and `ctas` is a required-shaped list.
            props: { heading: '', subheading: '', backgroundImage: '', align: 'left', ctas: [] },
          },
        ],
      })
    );
    const rendered = renderEditor();
    await waitFor(() => expect(rendered.result.current.loadState).toBe('ready'));
    const save = vi.spyOn(crud, 'savePortfolioPage').mockResolvedValue(makeRecord());

    await act(async () => {
      await rendered.result.current.save();
    });

    expect(save).not.toHaveBeenCalled();
    expect(rendered.result.current.validationErrors.length).toBeGreaterThan(0);
    expect(rendered.result.current.saveState).toBe('error');
  });

  it('stays dirty when the page is edited while a save is in flight', async () => {
    const { result } = await readyEditor();
    let resolveSave: (r: PortfolioPageRecord) => void = () => {};
    vi.spyOn(crud, 'savePortfolioPage').mockReturnValue(
      new Promise((resolve) => {
        resolveSave = resolve;
      })
    );
    act(() => result.current.setTitle('First'));
    let pending: Promise<void> = Promise.resolve();
    act(() => {
      pending = result.current.save();
    });
    act(() => result.current.setTitle('Second'));
    await act(async () => {
      resolveSave(makeRecord());
      await pending;
    });
    expect(result.current.saveState).toBe('saved');
    expect(result.current.isDirty).toBe(true);
    expect(result.current.page?.title).toBe('Second');
  });

  it('clears validation errors after a successful save', async () => {
    const { result } = await readyEditor();
    vi.spyOn(crud, 'savePortfolioPage').mockResolvedValue(makeRecord());
    await act(async () => {
      await result.current.save();
    });
    expect(result.current.validationErrors).toEqual([]);
  });
});

describe('useSectionEditor — publishing', () => {
  async function readyEditor() {
    vi.spyOn(crud, 'loadPortfolioPage').mockResolvedValue(makeRecord());
    const rendered = renderEditor();
    await waitFor(() => expect(rendered.result.current.loadState).toBe('ready'));
    return rendered;
  }

  it('publishes and reflects the new state', async () => {
    const { result } = await readyEditor();
    const publish = vi
      .spyOn(crud, 'setPortfolioPagePublished')
      .mockResolvedValue(makeRecord({ published: true }));
    await act(async () => {
      await result.current.setPublished(true);
    });
    expect(publish).toHaveBeenCalledWith(fakeSupabase, 'page-1', true);
    expect(result.current.published).toBe(true);
    expect(result.current.publishError).toBeNull();
  });

  it('leaves the published state unchanged and reports the error on failure', async () => {
    const { result } = await readyEditor();
    vi.spyOn(crud, 'setPortfolioPagePublished').mockRejectedValue(new Error('RLS denied'));
    await act(async () => {
      await result.current.setPublished(true);
    });
    expect(result.current.published).toBe(false);
    expect(result.current.publishError).toBe('RLS denied');
  });
});

describe('useSectionEditor — unsaved-changes warning', () => {
  it('registers a beforeunload listener only while dirty', async () => {
    vi.spyOn(crud, 'loadPortfolioPage').mockResolvedValue(makeRecord());
    const add = vi.spyOn(window, 'addEventListener');
    const remove = vi.spyOn(window, 'removeEventListener');
    const { result } = renderEditor();
    await waitFor(() => expect(result.current.loadState).toBe('ready'));

    expect(add.mock.calls.filter(([name]) => name === 'beforeunload')).toHaveLength(0);

    act(() => result.current.setTitle('Renamed'));
    expect(add.mock.calls.filter(([name]) => name === 'beforeunload').length).toBeGreaterThan(0);

    vi.spyOn(crud, 'savePortfolioPage').mockResolvedValue(makeRecord());
    await act(async () => {
      await result.current.save();
    });
    expect(remove.mock.calls.filter(([name]) => name === 'beforeunload').length).toBeGreaterThan(0);
  });
});
