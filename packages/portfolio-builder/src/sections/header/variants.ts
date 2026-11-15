/**
 * The header's layout variants. Kept in a module of its own, with no imports, so both the
 * React-free `meta.ts` (for the editor's select options) and the `'use client'` component (for
 * the fallback check) read one list. `schema/clientBoundary.test.ts` guards that `meta.ts` never
 * reaches a component.
 */
export const HEADER_VARIANTS = [
  'split',
  'imageBleed',
  'outcome',
  'place',
  'proof',
  'plain',
] as const;

export type HeaderVariant = (typeof HEADER_VARIANTS)[number];

export const HEADER_VARIANT_LABELS: Record<HeaderVariant, string> = {
  split: 'Split',
  imageBleed: 'Image bleed',
  outcome: 'Outcome',
  place: 'Place',
  proof: 'Proof',
  plain: 'Plain',
};

/** The variant a header renders when `variant` is missing or not one of `HEADER_VARIANTS`. */
export const DEFAULT_HEADER_VARIANT: HeaderVariant = 'plain';

export function readHeaderVariant(value: unknown): HeaderVariant {
  return typeof value === 'string' && (HEADER_VARIANTS as readonly string[]).includes(value)
    ? (value as HeaderVariant)
    : DEFAULT_HEADER_VARIANT;
}
