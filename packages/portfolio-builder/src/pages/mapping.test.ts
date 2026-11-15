import { describe, it, expect } from 'vitest';
import { mapRowToRecord, pageToColumns, recordToPage, type PortfolioPageRow } from './mapping';
import type { PortfolioPage } from '../schema/types';
import type { PortfolioPageRecord } from './types';

const section = {
  id: 'sec-nav',
  type: 'navbar' as const,
  name: 'Home',
  showInNav: false,
  props: { brand: 'JT', sticky: true },
};

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
      data: { schemaVersion: 2, sections: [section] },
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
      schemaVersion: 2,
      sections: [section],
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
  });
});

describe('schemaVersion persistence', () => {
  const baseRow: PortfolioPageRow = {
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

  it('reads the stored schemaVersion rather than assuming the current one', () => {
    const record = mapRowToRecord({ ...baseRow, data: { schemaVersion: 3, sections: [] } });
    expect(record.schemaVersion).toBe(3);
    expect(recordToPage(record).schemaVersion).toBe(3);
  });

  it('marks a row with no stored schemaVersion as pre-pivot (1), not as current', () => {
    const record = mapRowToRecord({ ...baseRow, data: { sections: [] } });
    expect(record.schemaVersion).toBe(1);
    expect(recordToPage(record).schemaVersion).toBe(1);
  });

  it('round-trips a page through pageToColumns and back', () => {
    const page: PortfolioPage = {
      schemaVersion: 2,
      slug: 'jtrue',
      title: 'Justin True',
      templateId: 'developer-01',
      sections: [section],
    };
    const columns = pageToColumns('user-1', page);
    const record = mapRowToRecord({ ...baseRow, data: columns.data });
    expect(recordToPage(record).schemaVersion).toBe(2);
  });
});

describe('themeMode persistence', () => {
  const baseRow: PortfolioPageRow = {
    id: 'page-1',
    user_id: 'user-1',
    slug: 'jtrue',
    title: 'Justin True',
    template_id: 'developer-01',
    theme_id: 'midnight',
    published: false,
    data: {},
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  };

  const page: PortfolioPage = {
    schemaVersion: 2,
    slug: 'jtrue',
    title: 'Justin True',
    templateId: 'developer-01',
    themeId: 'midnight',
    sections: [section],
  };

  it('stores the mode inside the data blob, not as a column', () => {
    const columns = pageToColumns('user-1', { ...page, themeMode: 'light' });
    expect(columns.data.themeMode).toBe('light');
    // theme_id is the only theme column; a mode column would need a migration.
    expect(Object.keys(columns)).toEqual([
      'user_id',
      'slug',
      'title',
      'template_id',
      'theme_id',
      'data',
    ]);
  });

  it('reads the stored mode back off the data blob', () => {
    const record = mapRowToRecord({ ...baseRow, data: { schemaVersion: 2, themeMode: 'light' } });
    expect(record.themeMode).toBe('light');
    expect(recordToPage(record).themeMode).toBe('light');
  });

  it('round-trips a page that stores a mode', () => {
    const withMode: PortfolioPage = { ...page, themeMode: 'light' };
    const columns = pageToColumns('user-1', withMode);
    const record = mapRowToRecord({ ...baseRow, data: columns.data });
    expect(recordToPage(record)).toEqual(withMode);
  });

  // The headline requirement: an existing row has no themeMode, and must come back out of the
  // mapping exactly as it went in - no mode invented, none dropped.
  it('round-trips a row with no themeMode unchanged', () => {
    const row: PortfolioPageRow = {
      ...baseRow,
      data: { schemaVersion: 2, sections: [section] },
    };

    const record = mapRowToRecord(row);
    expect(record.themeMode).toBeUndefined();

    const roundTripped = recordToPage(record);
    expect(roundTripped.themeMode).toBeUndefined();
    expect('themeMode' in roundTripped).toBe(true);

    const columns = pageToColumns('user-1', roundTripped);
    expect(columns.data.themeMode).toBeUndefined();
    expect(columns.data).toEqual(row.data);
    expect(mapRowToRecord({ ...row, data: columns.data })).toEqual(record);
  });

  // An absent mode means "the style's default"; writing a concrete mode here would freeze
  // today's default into the row and make a later change to that default invisible.
  it('does not invent a mode for a row that has none', () => {
    const record = mapRowToRecord({ ...baseRow, data: { schemaVersion: 2, sections: [] } });
    expect(record.themeMode).toBeUndefined();
    expect(pageToColumns('user-1', recordToPage(record)).data.themeMode).toBeUndefined();
  });

  // The mapping is a passthrough, not a validator: `resolveEffectiveMode` is the single place
  // that decides what a junk value means, so a hand-edited row survives the trip intact.
  it('passes a junk stored mode through without throwing', () => {
    const data = { schemaVersion: 2, themeMode: 'sideways' as unknown as 'light', sections: [] };
    const record = mapRowToRecord({ ...baseRow, data });
    expect(record.themeMode).toBe('sideways');
    expect(recordToPage(record).themeMode).toBe('sideways');
  });
});

describe('pageToColumns', () => {
  it('splits a PortfolioPage into real columns and a data blob', () => {
    const page: PortfolioPage = {
      schemaVersion: 2,
      slug: 'jtrue',
      title: 'Justin True',
      templateId: 'developer-01',
      themeId: 'slate',
      sections: [section],
    };

    const columns = pageToColumns('user-1', page);

    expect(columns).toEqual({
      user_id: 'user-1',
      slug: 'jtrue',
      title: 'Justin True',
      template_id: 'developer-01',
      theme_id: 'slate',
      data: { schemaVersion: 2, sections: [section], themeOverride: undefined },
    });
  });

  it('stores theme_id as null when the page has none', () => {
    const page: PortfolioPage = {
      schemaVersion: 2,
      slug: 'jtrue',
      title: 'Justin True',
      templateId: 'developer-01',
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
      schemaVersion: 2,
      sections: [section],
      themeOverride: { colors: { primary: 'var(--color-blue-500)' } },
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-02T00:00:00Z',
    };

    expect(recordToPage(record)).toEqual({
      schemaVersion: 2,
      slug: 'jtrue',
      title: 'Justin True',
      templateId: 'developer-01',
      themeId: 'slate',
      themeOverride: { colors: { primary: 'var(--color-blue-500)' } },
      sections: [section],
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
      schemaVersion: 2,
      sections: [],
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    };

    const page = recordToPage(record);
    expect(page.themeId).toBeUndefined();
    expect(page.themeOverride).toBeUndefined();
  });
});
