import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';
import { declarations, readScss } from '../testSupport/scss';

// The page measure (width cap, centring, gutter) is declared twice, on purpose: `.inner` for every
// ordinary section, and the header's `.content` one level deeper, so a hero's background can bleed
// edge to edge while its text keeps the same measure. Each file has its own test, but nothing tied
// the two together, so changing one side would silently stop the hero text lining up with every
// other section. jsdom cannot compute layout, so this reads both .module.scss sources and asserts
// the measure declarations are equivalent, base rule and desktop override alike.
const section = readScss(resolve(__dirname, './Section.module.scss'));
const header = readScss(resolve(__dirname, '../sections/header/HeaderSection.module.scss'));

const MEASURE = ['box-sizing', 'width', 'max-width', 'margin-inline', 'padding-inline'] as const;
const DESKTOP = '(width >= 769px)';

function measure(body: string): Record<string, string | undefined> {
  const d = declarations(body);
  return Object.fromEntries(MEASURE.map((p) => [p, d[p]]));
}

describe('page measure', () => {
  const inner = measure(section.rule('.inner'));
  const content = measure(header.rule('.content'));

  it('is actually declared on both sides (so equality cannot be two empty objects)', () => {
    for (const p of MEASURE) {
      expect(inner[p], `.inner ${p}`).toBeDefined();
      expect(content[p], `.content ${p}`).toBeDefined();
    }
  });

  it('is the same in the section wrapper and the hero content', () => {
    expect(content).toEqual(inner);
  });

  it('widens the gutter identically on desktop', () => {
    const innerDesktop = declarations(section.mediaRule(DESKTOP, '.inner'));
    const contentDesktop = declarations(header.mediaRule(DESKTOP, '.content'));
    expect(innerDesktop['padding-inline'], '.inner desktop gutter').toBeDefined();
    expect(contentDesktop['padding-inline']).toBe(innerDesktop['padding-inline']);
  });
});
