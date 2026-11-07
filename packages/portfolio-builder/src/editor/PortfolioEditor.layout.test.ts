import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';
import { declarations, readScss } from '../testSupport/scss';

// jsdom computes no layout, so it cannot show the editor fitting the viewport. The behaviour comes
// entirely from a handful of declarations, so these tests read PortfolioEditor.module.scss and
// assert them. The browser-level proof is the Playwright "editor fits the viewport" test, which is
// not part of `npm test`; this is what stops the declarations regressing between e2e runs.
const scss = readScss(resolve(__dirname, './PortfolioEditor.module.scss'));
const WIDE = '(width > 1100px)';

describe('PortfolioEditor.module.scss viewport fit', () => {
  const body = declarations(scss.mediaRule(WIDE, ':global(body):has(.editorRoot)'));

  it('turns the body into a viewport-high flex column while the editor is mounted', () => {
    expect(body['display']).toBe('flex');
    expect(body['flex-direction']).toBe('column');
    expect(body['height']).toBe('100dvh');
    expect(body['overflow']).toBe('hidden');
  });

  it('applies that only to a body that contains the editor, and only where the panes sit side by side', () => {
    // Unconditional (outside the media query) would pin every page's body, or the stacked layout.
    expect(scss.rule(':global(body):has(.editorRoot)')).toBe('');
  });

  it('lets the editor take the remaining height and shrink below its content', () => {
    // `min-height: 0` is what lets a flex child shrink under its content so the panes, not the
    // page, do the scrolling; `flex: 1 1 0` hands it whatever the app chrome leaves.
    expect(declarations(scss.rule('.editorRoot'))['min-height']).toBe('0');
    expect(declarations(scss.mediaRule(WIDE, '.editorRoot'))['flex']).toBe('1 1 0');
  });

  it('keeps the same chain shrinkable down to the scrolling panes', () => {
    const workspace = declarations(scss.rule('.workspace'));
    expect(workspace['min-height']).toBe('0');
    expect(workspace['flex']).toBe('1 1 auto');
    expect(declarations(scss.mediaRule(WIDE, '.workspace'))['grid-template-rows']).toBe(
      'minmax(0, 1fr)'
    );
    expect(scss.source).toMatch(
      /\.sidebar,\s*\.formPanel\s*\{[^}]*overflow-y:\s*auto;[^}]*min-height:\s*0;/
    );
  });
});
