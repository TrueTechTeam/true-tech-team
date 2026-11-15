import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// jsdom has no layout engine and does not load SCSS modules, so a test cannot observe what a
// declaration does. Tests that guard a CSS effect therefore read the .module.scss source and assert
// the declaration itself. These helpers are deliberately strict: a rule is matched by its EXACT
// selector at the start of a line (so `.inner` never matches `.innerBleed`, nor `.section`
// `.section[data-first]`), and works on both LF and CRLF checkouts.

const escapeRe = (s: string): string => s.replace(/[.:()[\]>*+~^$|\\/]/g, '\\$&');

export interface ScssSource {
  /** The raw file text. */
  source: string;
  /** Concatenated bodies of every top-level rule whose selector is exactly `selector`. */
  rule(selector: string): string;
  /** Body of `selector` inside `@media <query> { ... }`, exact selector. Empty if absent. */
  mediaRule(query: string, selector: string): string;
}

export function readScss(absolutePath: string): ScssSource {
  const source = readFileSync(resolve(absolutePath), 'utf8');
  return {
    source,
    rule(selector) {
      const re = new RegExp(String.raw`(?:^|\n)${escapeRe(selector)}\s*\{([^}]*)\}`, 'g');
      return [...source.matchAll(re)].map((m) => m[1]).join(' ');
    },
    mediaRule(query, selector) {
      const bodies: string[] = [];
      const open = new RegExp(String.raw`(?:^|\n)@media ${escapeRe(query)}\s*\{`, 'g');
      for (const m of source.matchAll(open)) {
        // Brace-match to the end of this @media block, so a rule is only found INSIDE it.
        const start = (m.index ?? 0) + m[0].length;
        let depth = 1;
        let end = start;
        while (end < source.length && depth > 0) {
          if (source[end] === '{') {
            depth++;
          } else if (source[end] === '}') {
            depth--;
          }
          end++;
        }
        const block = source.slice(start, end - 1);
        const inner = new RegExp(
          String.raw`(?:^|\n)[ \t]*${escapeRe(selector)}\s*\{([^}]*)\}`,
          'g'
        );
        for (const r of block.matchAll(inner)) {
          bodies.push(r[1] ?? '');
        }
      }
      return bodies.join(' ');
    },
  };
}

/** `a: b; c: d` -> { a: 'b', c: 'd' }, whitespace-normalised. Later declarations win, as in CSS. */
export function declarations(body: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of body.split(';')) {
    const i = part.indexOf(':');
    if (i === -1) {
      continue;
    }
    out[part.slice(0, i).trim()] = part
      .slice(i + 1)
      .trim()
      .replace(/\s+/g, ' ');
  }
  return out;
}
