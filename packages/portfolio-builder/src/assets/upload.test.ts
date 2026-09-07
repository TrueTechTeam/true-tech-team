import { describe, it, expect, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { uploadPortfolioAsset, deletePortfolioAsset, listPortfolioAssets } from './upload';

function makeFile(name: string, type: string, sizeBytes: number): File {
  return new File([new Uint8Array(sizeBytes)], name, { type });
}

interface QueryResult {
  data: unknown;
  error: unknown;
}

function createQueryBuilder(result: QueryResult) {
  const builder: Record<string, unknown> = {
    select: vi.fn(() => builder),
    insert: vi.fn(() => builder),
    delete: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(() => builder),
    single: vi.fn(() => Promise.resolve(result)),
    then: (resolve: (value: QueryResult) => void) => Promise.resolve(result).then(resolve),
  };
  return builder;
}

function createMockSupabase(options: { tableResult: QueryResult; uploadError?: Error | null }) {
  const uploadMock = vi
    .fn()
    .mockResolvedValue({ data: { path: 'x' }, error: options.uploadError ?? null });
  const removeMock = vi.fn().mockResolvedValue({ data: null, error: null });
  const getPublicUrlMock = vi
    .fn()
    .mockReturnValue({ data: { publicUrl: 'https://example.com/asset.jpg' } });
  const storageFromMock = vi.fn().mockReturnValue({
    upload: uploadMock,
    remove: removeMock,
    getPublicUrl: getPublicUrlMock,
  });

  const tableFromMock = vi.fn(() => createQueryBuilder(options.tableResult));

  const supabase = {
    storage: { from: storageFromMock },
    from: tableFromMock,
  } as unknown as SupabaseClient;

  return { supabase, uploadMock, removeMock, getPublicUrlMock, tableFromMock };
}

const validRow = {
  id: 'asset-1',
  user_id: 'user-1',
  storage_path: 'user-1/asset-1-photo.jpg',
  original_filename: 'photo.jpg',
  mime_type: 'image/jpeg',
  size_bytes: 1000,
  kind: 'image' as const,
  created_at: '2026-01-01T00:00:00Z',
};

describe('uploadPortfolioAsset', () => {
  it('uploads a valid image and returns the asset with a public URL', async () => {
    const { supabase } = createMockSupabase({ tableResult: { data: validRow, error: null } });
    const file = makeFile('photo.jpg', 'image/jpeg', 1000);

    const asset = await uploadPortfolioAsset(supabase, 'user-1', file);

    expect(asset.kind).toBe('image');
    expect(asset.publicUrl).toBe('https://example.com/asset.jpg');
    expect(asset.originalFilename).toBe('photo.jpg');
  });

  it('rejects an unsupported file type without calling storage', async () => {
    const { supabase, uploadMock } = createMockSupabase({
      tableResult: { data: validRow, error: null },
    });
    const file = makeFile('archive.zip', 'application/zip', 1000);

    await expect(uploadPortfolioAsset(supabase, 'user-1', file)).rejects.toThrow(
      /Unsupported file type/
    );
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it('rejects an image over the 5MB limit without calling storage', async () => {
    const { supabase, uploadMock } = createMockSupabase({
      tableResult: { data: validRow, error: null },
    });
    const file = makeFile('huge.jpg', 'image/jpeg', 6 * 1024 * 1024);

    await expect(uploadPortfolioAsset(supabase, 'user-1', file)).rejects.toThrow(/exceeds/);
    expect(uploadMock).not.toHaveBeenCalled();
  });

  it('deletes the orphaned storage object if the metadata insert fails', async () => {
    const { supabase, removeMock } = createMockSupabase({
      tableResult: { data: null, error: new Error('insert failed') },
    });
    const file = makeFile('photo.jpg', 'image/jpeg', 1000);

    await expect(uploadPortfolioAsset(supabase, 'user-1', file)).rejects.toThrow('insert failed');
    expect(removeMock).toHaveBeenCalledTimes(1);
    const [paths] = removeMock.mock.calls[0] as [string[]];
    expect(paths).toHaveLength(1);
    expect(paths[0]).toMatch(/^user-1\//);
  });
});

describe('deletePortfolioAsset', () => {
  it('deletes the DB row then the storage object', async () => {
    const { supabase, removeMock } = createMockSupabase({
      tableResult: { data: { storage_path: 'user-1/asset-1-photo.jpg' }, error: null },
    });

    await deletePortfolioAsset(supabase, 'asset-1');

    expect(removeMock).toHaveBeenCalledWith(['user-1/asset-1-photo.jpg']);
  });
});

describe('listPortfolioAssets', () => {
  it('returns every asset for the given user with a public URL', async () => {
    const { supabase } = createMockSupabase({ tableResult: { data: [validRow], error: null } });

    const assets = await listPortfolioAssets(supabase, 'user-1');

    expect(assets).toHaveLength(1);
    expect(assets[0].publicUrl).toBe('https://example.com/asset.jpg');
  });
});
