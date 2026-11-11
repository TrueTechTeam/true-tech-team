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
