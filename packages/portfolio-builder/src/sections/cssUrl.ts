/**
 * CSS `url()` construction for section components.
 *
 * Lives outside any `'use client'` module on purpose. These are pure string helpers with no
 * React dependency, and a server component that dots into an export of a client module gets an
 * RSC Proxy that throws (see `schema/clientBoundary.test.ts` for the guard and the history).
 *
 * Any section rendering a user-supplied image URL into a style must build the declaration with
 * `backgroundImageValue` rather than interpolating the URL itself - an unquoted `url(...)` breaks
 * on a URL containing `)`, whitespace or a quote, which Supabase storage URLs can all contain.
 */

/** Escapes a value for use inside a double-quoted CSS `url("...")`. */
export function cssUrl(value: string): string {
  return value.replace(/[\\"]/g, (char) => `\\${char}`).replace(/[\n\r\f]/g, '');
}

/**
 * Builds a complete, quoted CSS `background-image` value.
 *
 * Returns the whole `url("...")` string rather than just the escaped inner value so the quoting
 * itself is assertable. jsdom normalises an unquoted `url(https://x/a.png)` to the quoted form on
 * read-back, so a test that renders a component and reads `style.backgroundImage` cannot tell the
 * quoted and unquoted code paths apart - it passes either way. Asserting on this function's
 * return value is a pure string comparison that jsdom never touches.
 */
export function backgroundImageValue(url: string): string {
  return `url("${cssUrl(url)}")`;
}
