import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';
import { createClient as createCookieClient } from './server';

const BEARER = /^Bearer\s+(\S+)$/i;

/**
 * Supabase client for an API route that serves both the website (cookies) and the mobile app
 * (`Authorization: Bearer <access token>`).
 *
 * - Any Authorization header → a stateless client acting as that token's user. A malformed header
 *   never falls back to cookies: it yields a client with no user, so the route answers 401.
 * - No Authorization header → the usual cookie client.
 *
 * `auth.getUser()` with no argument verifies the bearer token, so routes keep one code path.
 */
export async function createClientForRequest(request: Request): Promise<SupabaseClient> {
  const header = request.headers.get('authorization');
  if (header === null) {
    return await createCookieClient();
  }

  const token = BEARER.exec(header.trim())?.[1] ?? '';
  const client = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );
  const getUser = client.auth.getUser.bind(client.auth);
  client.auth.getUser = (jwt?: string) => getUser(jwt ?? token);
  return client;
}
