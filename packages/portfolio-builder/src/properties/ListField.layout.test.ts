import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';
import { declarations, readScss } from '../testSupport/scss';

// jsdom does not load SCSS modules, so the component tests can only show that a class name is
// wired to an element, never what the class does. These read the .module.scss sources and assert
// the declarations that carry the behaviour.
const listField = readScss(resolve(__dirname, './ListField.module.scss'));
const panel = readScss(resolve(__dirname, './PropertyPanel.module.scss'));

describe('ListField.module.scss disabled chevron', () => {
  it('drops the fill and fades a disabled chevron rather than boxing it', () => {
    const d = declarations(listField.rule('button.chevron:disabled'));
    expect(d['background-color']).toBe('transparent');
    expect(d['opacity']).toBe('0.4');
  });

  it('wins on specificity, not !important', () => {
    expect(listField.rule('button.chevron:disabled')).not.toMatch(/!important/);
  });
});

describe('ListField.module.scss spacing', () => {
  it('spaces the entry controls from the spacing scale, not a raw length (SPACE-1)', () => {
    expect(declarations(listField.rule('.entryControls'))['gap']).toBe('var(--spacing-xs)');
  });
});

describe('PropertyPanel.module.scss dense panel', () => {
  it('adds no padding of its own, so it does not stack on the list entry padding', () => {
    expect(declarations(panel.rule('.panelDense'))['padding']).toBe('0');
  });

  it('is declared after .panel, so equal specificity resolves in its favour', () => {
    expect(panel.source.indexOf('.panelDense {')).toBeGreaterThan(panel.source.indexOf('.panel {'));
  });
});
