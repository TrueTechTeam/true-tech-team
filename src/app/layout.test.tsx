import { describe, it, expect } from 'vitest';
import { isValidElement, type ReactElement, type ReactNode } from 'react';
import RootLayout, { metadata } from './layout';

/** Every element type in the tree, so a literal <head> cannot hide inside it. */
function elementTypes(node: ReactNode, found: string[] = []): string[] {
  if (Array.isArray(node)) {
    node.forEach((child) => elementTypes(child, found));
    return found;
  }
  if (!isValidElement(node)) {
    return found;
  }
  const element = node as ReactElement<{ children?: ReactNode }>;
  if (typeof element.type === 'string') {
    found.push(element.type);
  }
  elementTypes(element.props.children, found);
  return found;
}

describe('root layout', () => {
  // The app's own title/description/icon, unchanged from the literal <head> this replaced - every
  // route other than a published portfolio still renders exactly these.
  it('declares the app title, description and icon as Next.js metadata', () => {
    expect(metadata).toEqual({
      title: 'True Tech Team - Tech Project Portfolio',
      description: 'Showcasing innovative tech projects and solutions from the True Tech Team',
      icons: { icon: { url: '/logo.svg', type: 'image/svg+xml' } },
    });
  });

  // The whole point of the metadata export: a route-level `generateMetadata` can override the
  // metadata object, but raw <head> children are emitted alongside it and cannot be overridden,
  // which is how the app's description and favicon reached published portfolio pages.
  it('renders no literal <head>, which a route-level generateMetadata could not override', () => {
    const types = elementTypes(RootLayout({ children: null }));

    expect(types).toContain('html');
    expect(types).toContain('body');
    expect(types).not.toContain('head');
    expect(types).not.toContain('title');
    expect(types).not.toContain('meta');
    expect(types).not.toContain('link');
  });

  // The app shell is still pinned to dark for its own routes; only a published portfolio opts out.
  it('still marks the document dark for the app itself', () => {
    const html = RootLayout({ children: null }) as ReactElement<{ 'data-theme'?: string }>;

    expect(html.props['data-theme']).toBe('dark');
  });
});
