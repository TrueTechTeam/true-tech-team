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

// These are CSS-declaration assertions, not behavioural ones: jsdom has no layout engine, so
// "the title lines up with the canvas" cannot be observed. What can be pinned is that the header and
// the workspace resolve to the SAME template, which is the only way they can stay aligned.
describe('PortfolioEditor.module.scss chrome', () => {
  const resolveVar = (value: string | undefined): string | undefined => {
    const name = /^var\((--[\w-]+)\)$/.exec(value ?? '')?.[1];
    // Strip comments first: `declarations` would otherwise fold a leading comment into the key.
    const root = scss.rule('.editorRoot').replace(/\/\*[\s\S]*?\*\//g, '');
    return name ? declarations(root)[name] : value;
  };

  it('declares the column template exactly once, and the header and workspace resolve to it', () => {
    expect(scss.source.match(/grid-template-columns:[^;]*\d+px/g)).toBeNull();
    expect(scss.source.match(/--editor-columns:/g)).toHaveLength(1);

    const workspace = resolveVar(declarations(scss.rule('.workspace'))['grid-template-columns']);
    const header = resolveVar(
      declarations(scss.mediaRule(WIDE, '.editorHeader'))['grid-template-columns']
    );
    expect(workspace).toBe('260px minmax(0, 1fr) 520px');
    expect(header).toBe(workspace);
    expect(resolveVar(declarations(scss.mediaRule(WIDE, '.editorHeader'))['column-gap'])).toBe(
      resolveVar(declarations(scss.rule('.workspace'))['gap'])
    );
  });

  it('puts the title/actions wrapper in the canvas column', () => {
    expect(declarations(scss.mediaRule(WIDE, '.editorHeaderCanvas'))['grid-column']).toBe('2');
    expect(declarations(scss.rule('.editorHeaderCanvas'))['justify-content']).toBe('space-between');
  });

  it('gives the header and workspace the same inline inset', () => {
    expect(declarations(scss.rule('.editorHeader'))['padding']).toContain(
      'var(--editor-inline-inset)'
    );
    expect(declarations(scss.rule('.workspace'))['padding']).toContain(
      'var(--editor-inline-inset)'
    );
  });

  it('gives the icon-only back link a real hit area (A11Y-4: at least 44px, floor 24px)', () => {
    // --spacing-xxl is 48px in the library; assert the token on both axes, not a literal.
    const link = declarations(scss.rule('.backLink'));
    expect(link['min-width']).toBe('var(--spacing-xxl)');
    expect(link['min-height']).toBe('var(--spacing-xxl)');
  });

  it('keeps the header a plain flex row below the breakpoint', () => {
    expect(declarations(scss.rule('.editorHeader'))['display']).toBe('flex');
    expect(declarations(scss.rule('.editorHeader'))['grid-template-columns']).toBeUndefined();
  });

  it('gives the side panels the elevated surface and medium padding', () => {
    const panel = declarations(scss.rule('.sidebar,' + '\n' + '.formPanel'));
    expect(panel['padding']).toBe('var(--spacing-md)');
    expect(panel['background']).toBe('var(--theme-surface-elevated)');
    expect(panel['box-shadow']).toBe('var(--theme-shadow-md)');
    expect(panel['border']).toBeUndefined();
  });
});
