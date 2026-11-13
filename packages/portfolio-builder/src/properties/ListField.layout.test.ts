import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';
import { declarations, readScss } from '../testSupport/scss';

// jsdom does not load SCSS modules, so the component tests can only show that a class name is
// wired to an element, never what the class does. These read the .module.scss sources and assert
// the declarations that carry the behaviour.
const panel = readScss(resolve(__dirname, './PropertyPanel.module.scss'));

describe('PropertyPanel.module.scss dense panel', () => {
  it('adds no padding of its own, so it does not stack on the list entry padding', () => {
    expect(declarations(panel.rule('.panelDense'))['padding']).toBe('0');
  });

  it('is declared after .panel, so equal specificity resolves in its favour', () => {
    expect(panel.source.indexOf('.panelDense {')).toBeGreaterThan(panel.source.indexOf('.panel {'));
  });
});

// Declaration assertions (jsdom has no layout engine): list entries get the same treatment as the
// section rows in SectionList, so the two draggable lists read as one family.
const entry = readScss(resolve(__dirname, './ListField.module.scss'));

describe('ListField.module.scss entries', () => {
  it('sits on the panel surface with a bottom rule and generous padding', () => {
    const e = declarations(entry.rule('.entry'));
    expect(e['background']).toBe('inherit');
    expect(e['border']).toBe('none');
    expect(e['border-bottom']).toBe('1px solid var(--theme-border-primary)');
    expect(e['border-inline-start']).toBe('var(--spacing-xs) solid transparent');
    expect(e['padding']).toBe('var(--spacing-md)');
  });

  it('marks drag-over with a primary rule and a tint', () => {
    const over = declarations(entry.rule('.entryOver'));
    expect(over['border-bottom-color']).toBe('var(--theme-primary)');
    expect(over['background']).toBe('var(--theme-interactive-hover)');
  });

  it('dims the dragged entry and dashes its rule', () => {
    const drag = declarations(entry.rule('.entryDragging'));
    expect(drag['opacity']).toBe('0.5');
    expect(drag['border-bottom-style']).toBe('dashed');
  });
});
