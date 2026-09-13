import { describe, it, expect, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { PortfolioPage } from '../schema/types';
import type { PortfolioPageRow } from './mapping';
import {
  savePortfolioPage,
  loadPortfolioPage,
  loadPortfolioPageBySlug,
  listPortfolioPages,
  deletePortfolioPage,
  setPortfolioPagePublished,
  checkSlugAvailable,
} from './crud';

interface QueryResult {
  data: unknown;
  error: unknown;
}

function createQueryBuilder(result: QueryResult) {
  const builder: Record<string, unknown> = {
    select: vi.fn(() => builder),
    insert: vi.fn(() => builder),
    update: vi.fn(() => builder),
    delete: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    neq: vi.fn(() => builder),
    order: vi.fn(() => builder),
    single: vi.fn(() => Promise.resolve(result)),
    maybeSingle: vi.fn(() => Promise.resolve(result)),
    then: (resolve: (value: QueryResult) => void) => Promise.resolve(result).then(resolve),
  };
  return builder;
}

function createMockSupabase(options: { tableResult: QueryResult }) {
  const tableFromMock = vi.fn(() => createQueryBuilder(options.tableResult));
  const supabase = { from: tableFromMock } as unknown as SupabaseClient;
  return { supabase, tableFromMock };
}

const validRow: PortfolioPageRow = {
  id: 'page-1',
  user_id: 'user-1',
  slug: 'jtrue',
  title: 'Justin True',
  template_id: 'developer-01',
  theme_id: null,
  published: false,
  data: { showNav: true, sections: [] },
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

const validPage: PortfolioPage = {
  schemaVersion: 1,
  slug: 'jtrue',
  title: 'Justin True',
  templateId: 'developer-01',
  showNav: true,
  sections: [],
};

describe('savePortfolioPage', () => {
  it('inserts a new row when no existingId is given', async () => {
    const { supabase, tableFromMock } = createMockSupabase({
      tableResult: { data: validRow, error: null },
    });

    const record = await savePortfolioPage(supabase, 'user-1', validPage);

    const builder = tableFromMock.mock.results[0].value as {
      insert: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
    expect(builder.insert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'user-1', slug: 'jtrue', template_id: 'developer-01' })
    );
    expect(builder.update).not.toHaveBeenCalled();
    expect(record.id).toBe('page-1');
  });

  it('updates the existing row when existingId is given', async () => {
    const { supabase, tableFromMock } = createMockSupabase({
      tableResult: { data: validRow, error: null },
    });

    await savePortfolioPage(supabase, 'user-1', validPage, 'page-1');

    const builder = tableFromMock.mock.results[0].value as {
      insert: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      eq: ReturnType<typeof vi.fn>;
    };
    expect(builder.update).toHaveBeenCalled();
    expect(builder.insert).not.toHaveBeenCalled();
    expect(builder.eq).toHaveBeenCalledWith('id', 'page-1');
    expect(builder.eq).toHaveBeenCalledWith('user_id', 'user-1');
  });

  it('throws a validation error and never calls supabase when the page is invalid', async () => {
    const { supabase, tableFromMock } = createMockSupabase({
      tableResult: { data: validRow, error: null },
    });
    const invalidPage = { ...validPage, title: '' } as PortfolioPage;

    await expect(savePortfolioPage(supabase, 'user-1', invalidPage)).rejects.toThrow(
      /Invalid portfolio page/
    );
    expect(tableFromMock).not.toHaveBeenCalled();
  });

  it('throws a friendly error when the insert hits a unique-violation on slug', async () => {
    const { supabase } = createMockSupabase({
      tableResult: { data: null, error: { code: '23505', message: 'duplicate key value' } },
    });

    await expect(savePortfolioPage(supabase, 'user-1', validPage)).rejects.toThrow(
      'That slug is already taken. Please choose a different one.'
    );
  });

  it('throws a friendly error when the update hits a unique-violation on slug', async () => {
    const { supabase } = createMockSupabase({
      tableResult: { data: null, error: { code: '23505', message: 'duplicate key value' } },
    });

    await expect(savePortfolioPage(supabase, 'user-1', validPage, 'page-1')).rejects.toThrow(
      'That slug is already taken. Please choose a different one.'
    );
  });
});

describe('loadPortfolioPage', () => {
  it('returns the mapped record when found', async () => {
    const { supabase } = createMockSupabase({ tableResult: { data: validRow, error: null } });
    const record = await loadPortfolioPage(supabase, 'page-1');
    expect(record?.slug).toBe('jtrue');
  });

  it('returns null when not found', async () => {
    const { supabase } = createMockSupabase({ tableResult: { data: null, error: null } });
    const record = await loadPortfolioPage(supabase, 'missing');
    expect(record).toBeNull();
  });
});

describe('listPortfolioPages', () => {
  it('returns every page for the given user', async () => {
    const { supabase } = createMockSupabase({ tableResult: { data: [validRow], error: null } });
    const records = await listPortfolioPages(supabase, 'user-1');
    expect(records).toHaveLength(1);
    expect(records[0].slug).toBe('jtrue');
  });
});

describe('deletePortfolioPage', () => {
  it('succeeds when a row is actually deleted', async () => {
    const { supabase } = createMockSupabase({
      tableResult: { data: [{ id: 'page-1' }], error: null },
    });
    await expect(deletePortfolioPage(supabase, 'page-1')).resolves.toBeUndefined();
  });

  it('throws when RLS silently blocks the delete (zero rows affected)', async () => {
    const { supabase } = createMockSupabase({ tableResult: { data: [], error: null } });
    await expect(deletePortfolioPage(supabase, 'page-1')).rejects.toThrow(
      'Portfolio page could not be deleted'
    );
  });
});

describe('setPortfolioPagePublished', () => {
  it('updates the published flag and returns the mapped record', async () => {
    const { supabase } = createMockSupabase({
      tableResult: { data: { ...validRow, published: true }, error: null },
    });
    const record = await setPortfolioPagePublished(supabase, 'page-1', true);
    expect(record.published).toBe(true);
  });
});

describe('checkSlugAvailable', () => {
  it('returns true when no page has the slug', async () => {
    const { supabase } = createMockSupabase({ tableResult: { data: [], error: null } });
    await expect(checkSlugAvailable(supabase, 'new-slug')).resolves.toBe(true);
  });

  it('returns false when a page already has the slug', async () => {
    const { supabase } = createMockSupabase({
      tableResult: { data: [{ id: 'page-1' }], error: null },
    });
    await expect(checkSlugAvailable(supabase, 'taken-slug')).resolves.toBe(false);
  });

  it('excludes the given page id from the check', async () => {
    const { supabase, tableFromMock } = createMockSupabase({
      tableResult: { data: [], error: null },
    });

    await checkSlugAvailable(supabase, 'my-slug', 'page-1');

    const builder = tableFromMock.mock.results[0].value as { neq: ReturnType<typeof vi.fn> };
    expect(builder.neq).toHaveBeenCalledWith('id', 'page-1');
  });
});

describe('loadPortfolioPageBySlug', () => {
  it('returns the mapped record for a published, matching slug', async () => {
    const { supabase } = createMockSupabase({
      tableResult: { data: { ...validRow, published: true }, error: null },
    });
    const record = await loadPortfolioPageBySlug(supabase, 'jtrue');
    expect(record?.slug).toBe('jtrue');
  });

  it('returns null when no row matches (covers both a nonexistent and an unpublished slug)', async () => {
    const { supabase } = createMockSupabase({ tableResult: { data: null, error: null } });
    const record = await loadPortfolioPageBySlug(supabase, 'missing');
    expect(record).toBeNull();
  });

  it('filters by slug and published=true explicitly, not relying on RLS alone', async () => {
    const { supabase, tableFromMock } = createMockSupabase({
      tableResult: { data: { ...validRow, published: true }, error: null },
    });
    await loadPortfolioPageBySlug(supabase, 'jtrue');
    const builder = tableFromMock.mock.results[0].value as { eq: ReturnType<typeof vi.fn> };
    expect(builder.eq).toHaveBeenCalledWith('slug', 'jtrue');
    expect(builder.eq).toHaveBeenCalledWith('published', true);
  });

  it('propagates a thrown error from the client', async () => {
    const { supabase } = createMockSupabase({
      tableResult: { data: null, error: new Error('network error') },
    });
    await expect(loadPortfolioPageBySlug(supabase, 'jtrue')).rejects.toThrow('network error');
  });
});
