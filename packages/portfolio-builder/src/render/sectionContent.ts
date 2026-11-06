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

export function hasSectionContent(schema: PropertySchema, props: Record<string, unknown>): boolean {
  return schema.some((field) => {
    if (TITLE_KEYS.has(field.key)) {
      return false;
    }
    const value = props[field.key];
    switch (field.type) {
      case 'list':
        return Array.isArray(value) && value.length > 0;
      case 'text':
      case 'textarea':
      case 'image':
        return typeof value === 'string' && value.trim().length > 0;
      default:
        return false;
    }
  });
}
