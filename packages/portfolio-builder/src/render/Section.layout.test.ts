import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';

// jsdom has no layout engine and does not load SCSS modules, so it cannot show that content is
// centred, constrained, or that a divider is skipped on the first section. These tests therefore
// read the .module.scss source and assert the declarations that produce those outcomes.
const source = readFileSync(resolve(__dirname, './Section.module.scss'), 'utf8');

/** Body of the top-level rule whose selector is exactly `selector`. */
function rule(selector: string): string {
  const escaped = selector.replace(/[.:()]/g, '\\$&');
  return new RegExp(`(?:^|\\n)${escaped}\\s*\\{([^}]*)\\}`).exec(source)?.[1] ?? '';
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
    expect(rule('.section')).not.toMatch(/border-top/);
    expect(rule('.section:not(:first-child)')).toMatch(
      /border-top:\s*1px solid var\(--theme-border-secondary\)/
    );
  });
});
