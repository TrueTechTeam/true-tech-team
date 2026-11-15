/**
 * Allowlist for user-supplied link targets: http(s), mailto, tel, same-page fragments and
 * site-relative paths. Everything else (javascript:, data:, vbscript:, ...) is rejected.
 *
 * The value is normalised before testing because browsers ignore leading C0 controls and spaces
 * and strip tab/CR/LF anywhere in a URL, so `" javascript:x"` and `"java\tscript:x"` are live.
 * Scheme matching is case-insensitive. `//host` and `/\host` are protocol-relative (off-site),
 * so a lone leading slash is required for the site-relative form.
 *
 * Every section that renders a user-supplied URL as a link target must gate it through this.
 */
const SAFE_HREF = /^(?:https?:|mailto:|tel:|#|\/(?![/\\]))/i;

export function isSafeHref(href: string): boolean {
  // eslint-disable-next-line no-control-regex
  const normalised = href.replace(/[\u0000- \u007f-\u009f]/g, '');
  return SAFE_HREF.test(normalised);
}
