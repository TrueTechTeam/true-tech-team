import type { SupabaseClient } from '@supabase/supabase-js';
import { checkSlugAvailable } from './crud';

const MAX_ATTEMPTS = 5;

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Generates a URL-safe slug from `title` and confirms it's available, appending a random
 * suffix and retrying (up to `MAX_ATTEMPTS` times) if the base is taken.
 *
 * NOTE: `checkSlugAvailable` is RLS-scoped (see its own doc comment in `./crud`) - it cannot
 * see another user's unpublished row with the same slug. So this function can return a slug
 * that later fails `savePortfolioPage`'s server-side unique constraint anyway. Callers with no
 * slug field of their own (like `PortfolioPagesList`) should catch that failure and retry once
 * with a forced suffix rather than surfacing an unactionable "choose a different slug" error.
 */
export async function generateUniqueSlug(supabase: SupabaseClient, title: string): Promise<string> {
  const base = slugify(title) || 'page';
  if (await checkSlugAvailable(supabase, base)) {
    return base;
  }
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const suffix = crypto.randomUUID().replace(/-/g, '').slice(0, 6);
    const candidate = `${base}-${suffix}`;
    if (await checkSlugAvailable(supabase, candidate)) {
      return candidate;
    }
  }
  throw new Error('Could not generate a unique page URL. Please try a different title.');
}
