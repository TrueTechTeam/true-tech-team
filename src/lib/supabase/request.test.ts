import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createSupabaseClient, cookieClient, createCookieClient } = vi.hoisted(() => {
  const cookieClient = { kind: 'cookie' };
  return {
    cookieClient,
    createSupabaseClient: vi.fn((_url: string, _key: string, opts: unknown) => {
      const getUser = vi.fn(async (jwt?: string) => ({
        data: { user: jwt ? { id: jwt } : null },
        error: null,
      }));
      return { kind: 'bearer', opts, auth: { getUser }, rawGetUser: getUser };
    }),
    createCookieClient: vi.fn(async () => cookieClient),
  };
});

vi.mock('@supabase/supabase-js', () => ({ createClient: createSupabaseClient }));
vi.mock('./server', () => ({ createClient: createCookieClient }));

import { createClientForRequest } from './request';

const req = (authorization?: string) =>
  new Request(
    'http://localhost/api/recipes/me',
    authorization ? { headers: { Authorization: authorization } } : {}
  );

describe('createClientForRequest', () => {
  beforeEach(() => {
    createSupabaseClient.mockClear();
    createCookieClient.mockClear();
  });

  it('builds a bearer client from the Authorization header and never reads cookies', async () => {
    const client = (await createClientForRequest(req('Bearer abc'))) as unknown as {
      kind: string;
      opts: any;
    };
    expect(client.kind).toBe('bearer');
    expect(client.opts.global.headers.Authorization).toBe('Bearer abc');
    expect(client.opts.auth).toEqual({ persistSession: false, autoRefreshToken: false });
    expect(createCookieClient).not.toHaveBeenCalled();
  });

  it('makes a bare auth.getUser() verify the bearer token', async () => {
    const client = (await createClientForRequest(req('Bearer abc'))) as unknown as {
      auth: { getUser: () => Promise<any> };
      rawGetUser: any;
    };
    const { data } = await client.auth.getUser();
    expect(client.rawGetUser).toHaveBeenCalledWith('abc');
    expect(data.user).toEqual({ id: 'abc' });
  });

  it('yields no user from a malformed header', async () => {
    const client = (await createClientForRequest(req('Basic xyz'))) as unknown as {
      auth: { getUser: () => Promise<any> };
    };
    expect((await client.auth.getUser()).data.user).toBeNull();
  });

  it('uses the cookie client when there is no Authorization header', async () => {
    expect(await createClientForRequest(req())).toBe(cookieClient);
  });

  it('does not fall back to cookies for a malformed Authorization header', async () => {
    for (const header of ['Basic xyz', 'Bearer', 'Bearer ']) {
      const client = (await createClientForRequest(req(header))) as unknown as { kind: string };
      expect(client.kind).toBe('bearer');
    }
    expect(createCookieClient).not.toHaveBeenCalled();
  });
});
