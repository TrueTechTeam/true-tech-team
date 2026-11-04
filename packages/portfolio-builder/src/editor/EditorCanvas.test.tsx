import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EditorCanvas } from './EditorCanvas';
import { PageRenderer } from '../render/PageRenderer';
import { CURRENT_SCHEMA_VERSION, type PageSection, type PortfolioPage } from '../schema/types';

// jsdom does not resolve CSS custom properties or load SCSS modules, so a computed-colour
// assertion would pass vacuously. Assert the declaration in the stylesheet source instead.
function ruleBody(scssPath: string, selector: string): string {
  const source = readFileSync(resolve(__dirname, scssPath), 'utf8');
  const escaped = selector.replace('.', '\\.');
  const match = new RegExp(`${escaped}\\s*\\{([^}]*)\\}`).exec(source);
  return match?.[1] ?? '';
}

function makePage(sections: PageSection[]): PortfolioPage {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    slug: 'jtrue',
    title: 'Justin True',
    templateId: 'default',
    sections,
  };
}

const headerWithCta: PageSection = {
  id: 'sec-header',
  type: 'header',
  name: 'Intro',
  showInNav: true,
  props: {
    heading: 'Your name here',
    subheading: '',
    backgroundImage: '',
    align: 'left',
    ctas: [{ label: 'Contact me', href: 'https://example.com', variant: 'primary' }],
  },
};

const navbar: PageSection = {
  id: 'sec-nav',
  type: 'navbar',
  name: 'Home',
  showInNav: false,
  props: { brand: 'JT', sticky: true },
};

function renderCanvas(page: PortfolioPage, selectedId: string | null = null) {
  const onSelect = vi.fn();
  const result = render(<EditorCanvas page={page} selectedId={selectedId} onSelect={onSelect} />);
  return { ...result, onSelect };
}

describe('EditorCanvas', () => {
  it('renders every section through the shared renderer', () => {
    renderCanvas(makePage([navbar, headerWithCta]));
    expect(screen.getByText('JT')).toBeInTheDocument();
    expect(screen.getByText('Your name here')).toBeInTheDocument();
  });

  it('selects a section when its wrapper is clicked', () => {
    const { onSelect } = renderCanvas(makePage([headerWithCta]));
    fireEvent.click(screen.getByTestId('canvas-section-sec-header'));
    expect(onSelect).toHaveBeenCalledWith('sec-header');
  });

  it('selects the section rather than navigating when a CTA inside it is clicked', () => {
    const { onSelect } = renderCanvas(makePage([headerWithCta]));
    const cta = screen.getByRole('link', { name: 'Contact me' });
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    cta.dispatchEvent(event);
    expect(onSelect).toHaveBeenCalledWith('sec-header');
    expect(event.defaultPrevented).toBe(true);
  });

  it('selects without touching the URL or history when a previewed nav link is clicked', () => {
    const { onSelect } = renderCanvas(makePage([navbar, headerWithCta]));
    const hashBefore = window.location.hash;
    const lengthBefore = window.history.length;
    const link = screen.getByRole('link', { name: 'Intro' });
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(event);
    expect(onSelect).toHaveBeenCalledWith('sec-nav');
    expect(window.location.hash).toBe(hashBefore);
    expect(window.history.length).toBe(lengthBefore);
    expect(event.defaultPrevented).toBe(true);
  });

  it('marks the selected section', () => {
    renderCanvas(makePage([navbar, headerWithCta]), 'sec-header');
    expect(screen.getByTestId('canvas-section-sec-header')).toHaveAttribute(
      'data-selected',
      'true'
    );
    expect(screen.getByTestId('canvas-section-sec-nav')).not.toHaveAttribute('data-selected');
  });

  it('does not make the wrapper focusable', () => {
    renderCanvas(makePage([headerWithCta]));
    const wrapper = screen.getByTestId('canvas-section-sec-header');
    expect(wrapper).not.toHaveAttribute('tabindex');
    expect(wrapper).not.toHaveAttribute('role');
  });

  it('applies the page theme as scoped custom properties', () => {
    const page = makePage([headerWithCta]);
    page.themeOverride = { colors: { primary: '#ff0000' } };
    renderCanvas(page);
    expect(screen.getByTestId('canvas-background')).toHaveStyle({ '--theme-primary': '#ff0000' });
  });

  // Review Focus 2
  it('shows an empty state for a page with no sections', () => {
    renderCanvas(makePage([]));
    expect(screen.getByText(/nothing here yet/i)).toBeInTheDocument();
  });

  it('declares its own text colour so content does not inherit the app theme text', () => {
    expect(ruleBody('./EditorCanvas.module.scss', '.canvas')).toMatch(
      /color:\s*var\(--theme-text-primary\)/
    );
  });

  it('still renders its headings under that canvas when the page has no theme', () => {
    // resolveEffectiveTheme(page) is undefined here: no inline vars are set, so legibility rests
    // entirely on the stylesheet colour declaration above plus the global theme variables.
    renderCanvas(makePage([headerWithCta]));
    const canvas = screen.getByTestId('canvas-background');
    expect(canvas.getAttribute('style') ?? '').not.toContain('--theme-');
    expect(canvas).toContainElement(screen.getByText('Your name here'));
  });
});

// Spec 4.1 invariant. This is the only automated thing preventing someone from "simplifying" the
// editor by adding selection props to the server-rendered public render path - the boundary mistake
// that cost a Critical in sub-project 1.
describe('the public render path stays free of editor affordances', () => {
  const page = makePage([navbar, headerWithCta]);

  it('renders no buttons', () => {
    const { container } = render(<PageRenderer page={page} />);
    expect(container.querySelectorAll('button')).toHaveLength(0);
  });

  it('renders no canvas selection wrappers', () => {
    const { container } = render(<PageRenderer page={page} />);
    expect(container.querySelector('[data-testid^="canvas-section-"]')).toBeNull();
    expect(container.querySelector('[data-testid="canvas-background"]')).toBeNull();
  });

  it('renders no selection state attributes', () => {
    const { container } = render(<PageRenderer page={page} />);
    expect(container.querySelector('[data-selected]')).toBeNull();
  });

  it('still renders the real section content, so the assertions above are not vacuous', () => {
    render(<PageRenderer page={page} />);
    expect(screen.getByText('Your name here')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Contact me' })).toBeInTheDocument();
  });

  it('leaves a CTA inside the public page navigable', () => {
    render(<PageRenderer page={page} />);
    const cta = screen.getByRole('link', { name: 'Contact me' });
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    cta.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });
});
