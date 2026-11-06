import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';

// jsdom has no layout engine and does not load SCSS modules, so it cannot show that content is
// centred, constrained, or that a divider is skipped on the first section. These tests therefore
// read the .module.scss source and assert the declarations that produce those outcomes.
const source = readFileSync(resolve(__dirname, './Section.module.scss'), 'utf8');

/** Concatenated bodies of every top-level rule whose selector is exactly `selector`. */
function rule(selector: string): string {
  const escaped = selector.replace(/[.:()[\]]/g, '\\$&');
  const re = new RegExp(String.raw`(?:^|\n)${escaped}\s*\{([^}]*)\}`, 'g');
  return [...source.matchAll(re)].map((m) => m[1]).join(' ');
}

describe('Section.module.scss', () => {
  it('constrains and centres the inner content to the page width', () => {
    const inner = rule('.inner');
    expect(inner).toMatch(/max-width:\s*var\(--content-width-page\)/);
    expect(inner).toMatch(/margin-inline:\s*auto/);
    expect(inner).toMatch(/padding-inline:\s*var\(--spacing-md\)/);
  });

  it('widens the gutter on desktop', () => {
    expect(source).toMatch(
      /@media \(width >= 769px\)\s*\{\s*\.inner\s*\{[^}]*padding-inline:\s*var\(--spacing-xl\)/
    );
  });

  it('keeps the section full-bleed: no max-width and no side padding on the band itself', () => {
    const section = rule('.section');
    expect(section).not.toMatch(/max-width/);
    expect(section).toMatch(/padding:\s*var\(--spacing-xxl\) 0/);
    expect(section).toMatch(/width:\s*100%/);
  });

  it('draws the divider only between sections, never above the first', () => {
    // Driven by the explicit data-first signal, not :first-child, because the editor wraps every
    // section in its own element and sibling position says nothing there.
    expect(rule('.section')).toMatch(/border-top:\s*1px solid var\(--theme-border-secondary\)/);
    expect(rule(".section[data-first='true']")).toMatch(/border-top:\s*none/);
    expect(source).not.toMatch(/:first-child/);
  });

  describe('Section.module.scss hero bleed', () => {
    it('has a wrapper that neither caps width nor adds a gutter', () => {
      const bleed = rule('.innerBleed');
      expect(bleed).toMatch(/width:\s*100%/);
      expect(bleed).not.toMatch(/max-width|padding-inline/);
    });
  });
});
