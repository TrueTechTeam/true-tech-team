/**
 * Defensive readers for stored section props. Stored data is untrusted: a hand-edited row or an
 * older client can put anything in a prop, so every section type reads through these rather than
 * trusting the shape.
 *
 * Client-safe on purpose: no React and no component-library imports, so a section's `meta.ts`
 * (reachable from server code) could use it without tripping `schema/clientBoundary.test.ts`.
 */

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Reads a `list` prop as plain objects: anything that is not an array reads as empty, and
 * non-object entries (null, strings, numbers, nested arrays) are dropped. Per-field coercion
 * stays with each section type.
 */
export function readRecordList(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(isRecord);
}

/** Reads a string prop; anything else (missing, number, null, object) reads as empty. */
export function readText(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

/** Reads the `heading` prop that most section types share, as a string ('' when absent). */
export function readHeading(props: Record<string, unknown>): string {
  return readText(props['heading']);
}
