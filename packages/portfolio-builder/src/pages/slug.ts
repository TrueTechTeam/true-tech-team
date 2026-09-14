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
