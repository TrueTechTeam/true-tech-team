import type { PropertySchema } from '../properties/types';

/**
 * Whether a section has any content beyond a heading. Server-safe and pure.
 *
 * `minHeight` is a floor for a section with nothing in it yet, so the page does not collapse to a
 * bare heading while it is being built. A populated section sizes to its content instead of
 * reserving height it does not use. CSS cannot tell the two apart, so the shell asks here.
 *
 * Only content-bearing fields count - text, textarea, image and list. Selects, booleans and
 * numbers are settings (alignment, count-up), and `heading`/`subheading` are titling that every
 * template pre-fills, so none of them make a section "populated" on their own.
 */
const TITLE_KEYS = new Set(['heading', 'subheading']);

/** A list entry that could render something: a record with a non-blank string or a number. */
function isRenderableEntry(entry: unknown): boolean {
  if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
    return false;
  }
  return Object.values(entry).some(
    (v) =>
      (typeof v === 'string' && v.trim().length > 0) ||
      (typeof v === 'number' && Number.isFinite(v))
  );
}

export function hasSectionContent(schema: PropertySchema, props: Record<string, unknown>): boolean {
  return schema.some((field) => {
    if (TITLE_KEYS.has(field.key)) {
      return false;
    }
    const value = props[field.key];
    switch (field.type) {
      case 'list':
        return Array.isArray(value) && value.some(isRenderableEntry);
      case 'text':
      case 'textarea':
      case 'image':
        return typeof value === 'string' && value.trim().length > 0;
      default:
        return false;
    }
  });
}
