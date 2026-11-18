import { beforeEach, describe, expect, it, vi } from 'vitest';

type Fixture = {
  user: { id: string; email: string | null } | null;
  roles: unknown[];
  perms: { app_slug: string }[];
};
let fixture: Fixture;

function fakeClient() {
  return {
    auth: { getUser: vi.fn(async () => ({ data: { user: fixture.user }, error: null })) },
    from: (table: string) => ({
      select: () => ({
        eq: async () => ({
          data: table === 'user_roles' ? fixture.roles : fixture.perms,
          error: null,
        }),
      }),
    }),
  };
}

const { createClientForRequest } = vi.hoisted(() => ({ createClientForRequest: vi.fn() }));
vi.mock('../../../../lib/supabase/request', () => ({ createClientForRequest }));

import { GET } from './route';

const call = () =>
  GET(new Request('http://localhost/api/recipes/me', { headers: { Authorization: 'Bearer t' } }));

describe('GET /api/recipes/me', () => {
  beforeEach(() => {
    fixture = { user: { id: 'u1', email: 'cook@example.com' }, roles: [], perms: [] };
    createClientForRequest.mockImplementation(async () => fakeClient());
  });

  it('returns 401 JSON when there is no user', async () => {
    fixture.user = null;
    const res = await call();
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'Unauthorized' });
  });

  it('grants AI access to a user with the recipe-agent permission', async () => {
    fixture.perms = [{ app_slug: 'recipe-agent' }];
    expect(await (await call()).json()).toEqual({
      userId: 'u1',
      email: 'cook@example.com',
      isAdmin: false,
      aiAccess: true,
    });
  });

  it('grants AI access to an admin without a permission row', async () => {
    fixture.roles = [{ role: 'admin' }];
    expect(await (await call()).json()).toMatchObject({ isAdmin: true, aiAccess: true });
  });

  it('denies AI access to a user with neither', async () => {
    fixture.perms = [{ app_slug: 'job-search' }];
    expect(await (await call()).json()).toMatchObject({ isAdmin: false, aiAccess: false });
  });
});
