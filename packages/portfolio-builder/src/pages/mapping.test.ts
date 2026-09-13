import { describe, it, expect } from 'vitest';
import { mapRowToRecord, pageToColumns, recordToPage, type PortfolioPageRow } from './mapping';
import type { PortfolioPage } from '../schema/types';
import type { PortfolioPageRecord } from './types';

describe('mapRowToRecord', () => {
  it('merges real columns with data JSONB contents', () => {
    const row: PortfolioPageRow = {
      id: 'page-1',
      user_id: 'user-1',
      slug: 'jtrue',
      title: 'Justin True',
      template_id: 'developer-01',
      theme_id: 'slate',
      published: false,
      data: { showNav: true, sections: [] },
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-02T00:00:00Z',
    };

    const record = mapRowToRecord(row);

    expect(record).toEqual({
      id: 'page-1',
      userId: 'user-1',
      slug: 'jtrue',
      title: 'Justin True',
      templateId: 'developer-01',
      themeId: 'slate',
      published: false,
      showNav: true,
      sections: [],
      themeOverride: undefined,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-02T00:00:00Z',
    });
  });

  it('defaults theme_id to undefined and sections to an empty array when data is sparse', () => {
    const row: PortfolioPageRow = {
      id: 'page-1',
      user_id: 'user-1',
      slug: 'jtrue',
      title: 'Justin True',
      template_id: 'developer-01',
      theme_id: null,
      published: false,
      data: {},
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    };

    const record = mapRowToRecord(row);

    expect(record.themeId).toBeUndefined();
    expect(record.sections).toEqual([]);
    expect(record.showNav).toBe(true);
  });
});

describe('pageToColumns', () => {
  it('splits a PortfolioPage into real columns and a data blob', () => {
    const page: PortfolioPage = {
      schemaVersion: 1,
      slug: 'jtrue',
      title: 'Justin True',
      templateId: 'developer-01',
      themeId: 'slate',
      showNav: true,
      sections: [],
    };

    const columns = pageToColumns('user-1', page);

    expect(columns).toEqual({
      user_id: 'user-1',
      slug: 'jtrue',
      title: 'Justin True',
      template_id: 'developer-01',
      theme_id: 'slate',
      data: { showNav: true, sections: [], themeOverride: undefined },
    });
  });

  it('stores theme_id as null when the page has none', () => {
    const page: PortfolioPage = {
      schemaVersion: 1,
      slug: 'jtrue',
      title: 'Justin True',
      templateId: 'developer-01',
      showNav: true,
      sections: [],
    };

    const columns = pageToColumns('user-1', page);

    expect(columns.theme_id).toBeNull();
  });
});

describe('recordToPage', () => {
  it('converts a full record into a PortfolioPage with matching fields', () => {
    const record: PortfolioPageRecord = {
      id: 'page-1',
      userId: 'user-1',
      slug: 'jtrue',
      title: 'Justin True',
      templateId: 'developer-01',
      themeId: 'slate',
      published: true,
      showNav: true,
      sections: [],
      themeOverride: { colors: { primary: 'var(--color-blue-500)' } },
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-02T00:00:00Z',
    };

    expect(recordToPage(record)).toEqual({
      schemaVersion: 1,
      slug: 'jtrue',
      title: 'Justin True',
      templateId: 'developer-01',
      themeId: 'slate',
      themeOverride: { colors: { primary: 'var(--color-blue-500)' } },
      showNav: true,
      sections: [],
    });
  });

  it('passes through undefined themeId and themeOverride when the record has none', () => {
    const record: PortfolioPageRecord = {
      id: 'page-1',
      userId: 'user-1',
      slug: 'jtrue',
      title: 'Justin True',
      templateId: 'developer-01',
      published: false,
      showNav: false,
      sections: [],
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    };

    const page = recordToPage(record);
    expect(page.themeId).toBeUndefined();
    expect(page.themeOverride).toBeUndefined();
  });
});
