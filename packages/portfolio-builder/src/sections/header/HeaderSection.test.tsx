import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeaderSection } from './HeaderSection';
import type { PageSection, PortfolioPage } from '../../schema/types';

function makeHeader(props: Record<string, unknown>): PageSection {
  return { id: 'hdr', type: 'header', name: 'Intro', showInNav: true, props };
}

function renderHeader(section: PageSection) {
  const page: PortfolioPage = {
    schemaVersion: 2,
    slug: 's',
    title: 'Justin True',
    templateId: 'default',
    sections: [section],
  };
  return render(<HeaderSection section={section} page={page} anchors={new Map()} />);
}

describe('HeaderSection', () => {
  it('renders the heading and subheading', () => {
    renderHeader(makeHeader({ heading: 'Hello there', subheading: 'I build things' }));
    expect(screen.getByRole('heading', { name: 'Hello there' })).toBeInTheDocument();
    expect(screen.getByText('I build things')).toBeInTheDocument();
  });

  it('renders one button per ctas entry', () => {
    renderHeader(
      makeHeader({
        heading: 'Hi',
        ctas: [
          { label: 'Email me', href: 'mailto:a@b.c', variant: 'primary' },
          { label: 'My work', href: '#work', variant: 'secondary' },
        ],
      })
    );
    expect(screen.getByRole('link', { name: 'Email me' })).toHaveAttribute('href', 'mailto:a@b.c');
    expect(screen.getByRole('link', { name: 'My work' })).toHaveAttribute('href', '#work');
  });

  // Review Focus 1
  it('falls back to the page title when heading is missing', () => {
    renderHeader(makeHeader({}));
    expect(screen.getByRole('heading', { name: 'Justin True' })).toBeInTheDocument();
  });

  // Review Focus 4
  it('skips malformed ctas entries and still renders the valid ones', () => {
    renderHeader(
      makeHeader({
        heading: 'Hi',
        ctas: ['not-an-object', { href: '#no-label' }, { label: 'Good', href: '#good' }],
      })
    );
    expect(screen.getByRole('link', { name: 'Good' })).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });

  it('renders no buttons when ctas is absent or not an array', () => {
    renderHeader(makeHeader({ heading: 'Hi', ctas: 'nope' }));
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });

  it.each([
    'javascript:alert(1)',
    'JaVaScRiPt:alert(1)',
    '  javascript:alert(1)',
    '\njavascript:alert(1)',
    'java\tscript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox(1)',
    '//evil.example',
    'relative/path',
  ])('drops an unsafe href (%j) but still renders a valid sibling', (href) => {
    renderHeader(
      makeHeader({
        heading: 'Hi',
        ctas: [
          { label: 'Bad', href },
          { label: 'Good', href: '#good' },
        ],
      })
    );
    expect(screen.queryByRole('link', { name: 'Bad' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Good' })).toHaveAttribute('href', '#good');
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });

  it.each([
    'https://a.example/x',
    'http://a.example',
    'mailto:a@b.c',
    'tel:+15551234',
    '#work',
    '/about',
  ])('keeps an allowed href (%s)', (href) => {
    renderHeader(makeHeader({ heading: 'Hi', ctas: [{ label: 'Ok', href }] }));
    expect(screen.getByRole('link', { name: 'Ok' })).toHaveAttribute('href', href);
  });

  it('renders an allowed href with surrounding whitespace trimmed', () => {
    renderHeader(
      makeHeader({ heading: 'Hi', ctas: [{ label: 'Ok', href: '  https://a.example/x \t' }] })
    );
    expect(screen.getByRole('link', { name: 'Ok' })).toHaveAttribute('href', 'https://a.example/x');
  });

  it('renders two identical ctas without key collisions', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    renderHeader(
      makeHeader({
        heading: 'Hi',
        ctas: [
          { label: 'Same', href: '#a' },
          { label: 'Same', href: '#a' },
        ],
      })
    );
    expect(screen.getAllByRole('link', { name: 'Same' })).toHaveLength(2);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  // This asserts only that the backgroundImage prop reaches the style - NOT that it is quoted.
  // jsdom normalises an unquoted url(...) to the quoted form on read-back, so no rendered-style
  // assertion here can tell the two code paths apart. The quoting is pinned by pure string
  // assertions in ../cssUrl.test.ts, which is where backgroundImageValue lives.
  it('wires the backgroundImage prop into the element style', () => {
    const { container } = renderHeader(
      makeHeader({ heading: 'Hi', backgroundImage: 'https://x.example/a.png' })
    );
    const node = container.firstElementChild as HTMLElement;
    expect(node.style.backgroundImage).toBe('url("https://x.example/a.png")');
  });
});
