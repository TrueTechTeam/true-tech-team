import { describe, it, expect } from 'vitest';
import { isSafeHref } from './safeHref';

describe('isSafeHref', () => {
  it.each([
    'http://example.com',
    'https://example.com/a?b=c',
    'HTTPS://EXAMPLE.COM',
    'mailto:me@example.com',
    'tel:+15551234567',
    '#about',
    '#',
    '/projects',
    '/',
  ])('allows %s', (href) => {
    expect(isSafeHref(href)).toBe(true);
  });

  it.each([
    'javascript:alert(1)',
    'JaVaScRiPt:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox(1)',
    ' javascript:alert(1)',
    'java\tscript:alert(1)',
    'java\nscript:alert(1)',
    '\u0001javascript:alert(1)',
    'java\u0000script:alert(1)',
    '\u0085javascript:alert(1)',
    '//evil.example',
    '/\\evil.example',
    '/\t/evil.example',
    '/\n\\evil.example',
    'example.com',
    'relative/path',
    '',
    '   ',
  ])('rejects %j', (href) => {
    expect(isSafeHref(href)).toBe(false);
  });

  it('rejects the /\\host backslash protocol-relative variant', () => {
    expect(isSafeHref('/\\host')).toBe(false);
  });

  it('normalises before rejecting: "/<tab>/host" collapses to "//host"', () => {
    expect(isSafeHref('/\t/host')).toBe(false);
  });

  it('allows an otherwise-safe href with surrounding whitespace', () => {
    expect(isSafeHref('  https://example.com  ')).toBe(true);
    expect(isSafeHref('\t#about\n')).toBe(true);
  });
});
