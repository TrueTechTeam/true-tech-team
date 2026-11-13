/**
 * Pure string helper, kept in its own module so importers (notably `render/anchors.ts`) do not
 * transitively pull in `pages/crud.ts` and the Supabase client via `pages/slug.ts`.
 */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
