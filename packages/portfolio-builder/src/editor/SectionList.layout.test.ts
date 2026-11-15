import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';
import { declarations, readScss } from '../testSupport/scss';

// Declaration assertions: jsdom has no layout engine and does not load SCSS modules, so what a row
// looks like cannot be observed. The source is read and the declarations that carry the look are
// pinned instead. Tokens only: no literal colours.
const scss = readScss(resolve(__dirname, './SectionList.module.scss'));

describe('SectionList.module.scss rows', () => {
  it('sits on the panel surface and is separated by a bottom rule, not a full border', () => {
    const row = declarations(scss.rule('.row'));
    expect(row['background']).toBe('inherit');
    expect(row['border']).toBe('none');
    expect(row['border-bottom']).toBe('1px solid var(--theme-border-primary)');
    expect(row['border-inline-start']).toBe('var(--spacing-xs) solid transparent');
  });

  it('pads the row from the spacing scale', () => {
    expect(declarations(scss.rule('.row'))['padding']).toBe('var(--spacing-sm) var(--spacing-md)');
  });

  it('marks the selected row with an accent bar and a tint', () => {
    const sel = declarations(scss.rule('.rowSelected'));
    expect(sel['border-inline-start-color']).toBe('var(--theme-primary)');
    expect(sel['background']).toBe('var(--theme-interactive-hover)');
  });

  it('marks the drag-over row with a primary rule and a tint', () => {
    const over = declarations(scss.rule('.rowOver'));
    expect(over['border-bottom-color']).toBe('var(--theme-primary)');
    expect(over['background']).toBe('var(--theme-interactive-hover)');
  });

  it('dims the dragged row and dashes its rule', () => {
    const drag = declarations(scss.rule('.rowDragging'));
    expect(drag['opacity']).toBe('0.5');
    expect(drag['border-bottom-style']).toBe('dashed');
  });
});
