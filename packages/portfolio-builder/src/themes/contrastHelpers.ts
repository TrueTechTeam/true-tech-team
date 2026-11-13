// Test-only: reads the component library's literal palette and computes WCAG 2.x contrast.
// Not exported from the package; imported only by *.test.ts files.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

let palette: Map<string, string> | undefined;

export function loadPalette(): Map<string, string> {
  if (palette) {
    return palette;
  }
  const require = createRequire(import.meta.url);
  const cssPath = require.resolve('@true-tech-team/react-components/index.css');
  const css = readFileSync(cssPath, 'utf8');
  const map = new Map<string, string>();
  for (const match of css.matchAll(/--color-([a-z]+-\d+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/g)) {
    map.set(match[1], match[2].toLowerCase());
  }
  palette = map;
  return map;
}

/** Resolves `var(--color-<family>-<shade>)` or a literal #hex to a #hex string. */
export function resolveColor(value: string): string {
  const hex = /^#[0-9a-fA-F]{3,8}$/.test(value) ? value.toLowerCase() : undefined;
  if (hex) {
    return hex;
  }
  const ref = /^var\(--color-([a-z]+-\d+)\)$/.exec(value);
  const resolved = ref ? loadPalette().get(ref[1]) : undefined;
  if (!resolved) {
    throw new Error(`Cannot resolve colour "${value}" against the library palette`);
  }
  return resolved;
}

function channels(hex: string): [number, number, number] {
  let h = hex.slice(1);
  if (h.length === 3 || h.length === 4) {
    h = [...h].map((c) => c + c).join('');
  }
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}

function luminance(hex: string): number {
  const [r, g, b] = channels(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const la = luminance(resolveColor(a));
  const lb = luminance(resolveColor(b));
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
