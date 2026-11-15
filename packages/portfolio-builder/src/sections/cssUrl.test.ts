import { describe, it, expect } from 'vitest';
import { cssUrl, backgroundImageValue } from './cssUrl';

describe('cssUrl', () => {
  it('leaves an ordinary URL untouched', () => {
    expect(cssUrl('https://x.example/a.png')).toBe('https://x.example/a.png');
  });

  it('leaves parentheses and spaces untouched - quoting is what makes them safe', () => {
    expect(cssUrl('https://x.example/a (1).png')).toBe('https://x.example/a (1).png');
  });

  it('escapes a double quote so it cannot close the url("...")', () => {
    expect(cssUrl('a"b')).toBe('a\\"b');
  });

  it('escapes a backslash so it cannot escape the closing quote', () => {
    expect(cssUrl('a\\b')).toBe('a\\\\b');
  });

  it('escapes a trailing backslash rather than leaving it to consume the closing quote', () => {
    expect(backgroundImageValue('a\\')).toBe('url("a\\\\")');
  });

  it('strips the CSS newline set, which cannot appear in a quoted url()', () => {
    expect(cssUrl('a\nb')).toBe('ab');
    expect(cssUrl('a\rb')).toBe('ab');
    expect(cssUrl('a\fb')).toBe('ab');
  });
});

describe('backgroundImageValue', () => {
  // These are the assertions that actually pin the quoting. A component test cannot: jsdom
  // normalises an unquoted url(...) to the quoted form on read-back, so reverting the fix in
  // HeaderSection leaves a rendered-style assertion green. Reverting it fails these.
  it('wraps the URL in a quoted url()', () => {
    expect(backgroundImageValue('https://x.example/a.png')).toBe('url("https://x.example/a.png")');
  });

  it('quotes a URL containing parentheses and a space, which unquoted url() cannot hold', () => {
    expect(backgroundImageValue('https://x.example/a (1).png')).toBe(
      'url("https://x.example/a (1).png")'
    );
  });

  it('cannot be broken out of with a quote plus a second declaration', () => {
    expect(backgroundImageValue('a"; color: red; background-image: url("b')).toBe(
      'url("a\\"; color: red; background-image: url(\\"b")'
    );
  });
});
