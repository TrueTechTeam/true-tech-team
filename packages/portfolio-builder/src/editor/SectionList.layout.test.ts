import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';
import { declarations, readScss } from '../testSupport/scss';

// The component tests prove the `chevron` class reaches the button; they cannot prove the class
// does anything. The library's ghost IconButton paints a disabled button as a FILLED box (higher
// contrast than an enabled one), and this rule is what reverses that. jsdom does not load the
// stylesheet, so assert the declarations in the source.
const scss = readScss(resolve(__dirname, './SectionList.module.scss'));

describe('SectionList.module.scss disabled chevron', () => {
  it('drops the fill and fades a disabled chevron rather than boxing it', () => {
    const d = declarations(scss.rule('button.chevron:disabled'));
    expect(d['background-color']).toBe('transparent');
    expect(d['opacity']).toBe('0.4');
  });

  it('wins on specificity, not !important', () => {
    expect(scss.rule('button.chevron:disabled')).not.toMatch(/!important/);
  });
});
