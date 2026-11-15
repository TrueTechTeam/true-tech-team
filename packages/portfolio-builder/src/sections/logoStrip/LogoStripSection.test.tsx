import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LogoStripSection } from './LogoStripSection';
import { backgroundImageValue } from '../cssUrl';
import type { PageSection, PortfolioPage } from '../../schema/types';

vi.mock('../cssUrl', async () => {
  const actual = await vi.importActual<{ backgroundImageValue: (url: string) => string }>(
    '../cssUrl'
  );
  return { ...actual, backgroundImageValue: vi.fn(actual.backgroundImageValue) };
});

function renderStrip(props: Record<string, unknown>) {
  const section: PageSection = {
    id: 'l',
    type: 'logoStrip',
    name: 'Logos',
    showInNav: true,
    props,
  };
  const page: PortfolioPage = {
    schemaVersion: 2,
    slug: 's',
    title: 'Justin True',
    templateId: 'default',
    sections: [section],
  };
  return render(<LogoStripSection section={section} page={page} anchors={new Map()} />);
}

const A = { image: 'https://x/a.png', alt: 'Acme', href: 'https://acme.example' };
const B = { image: 'https://x/b.png', alt: 'Bolt' };

describe('LogoStripSection', () => {
  it('renders the heading', () => {
    renderStrip({ heading: 'Trusted by', items: [A] });
    expect(screen.getByRole('heading', { level: 2, name: 'Trusted by' })).toBeInTheDocument();
  });

  it('omits an empty heading', () => {
    renderStrip({ heading: '', items: [A] });
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('renders one logo per valid entry, named by its alt text', () => {
    renderStrip({ items: [A, B] });
    expect(screen.getAllByRole('img')).toHaveLength(2);
    expect(screen.getByRole('img', { name: 'Acme' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Bolt' })).toBeInTheDocument();
  });

  it('wraps a logo with a safe href in a link', () => {
    renderStrip({ items: [A] });
    expect(screen.getByRole('link', { name: 'Acme' })).toHaveAttribute(
      'href',
      'https://acme.example'
    );
  });

  it('renders a logo without an href unlinked', () => {
    renderStrip({ items: [B] });
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Bolt' })).toBeInTheDocument();
  });

  it.each([
    'javascript:alert(1)',
    ' javascript:alert(1)',
    'JaVaScRiPt:alert(1)',
    'java\tscript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    '//evil.example',
  ])('never makes an unsafe href live, but still shows the logo: %j', (href) => {
    renderStrip({ items: [{ ...B, href }] });
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(document.querySelector('a')).toBeNull();
    expect(screen.getByRole('img', { name: 'Bolt' })).toBeInTheDocument();
  });

  it.each([5, null, '', '   '])('renders unlinked for href = %j', (href) => {
    renderStrip({ items: [{ ...B, href }] });
    expect(document.querySelector('a')).toBeNull();
  });

  it.each([null, 'x', {}, 7, undefined])('renders the empty state for items = %j', (items) => {
    expect(() => renderStrip({ items })).not.toThrow();
    expect(screen.getByText('No logos yet.')).toBeInTheDocument();
    expect(screen.queryAllByRole('img')).toHaveLength(0);
  });

  it('skips non-object entries', () => {
    renderStrip({ items: [A, null, 'x', 7, [A], B] });
    expect(screen.getAllByRole('img')).toHaveLength(2);
  });

  it('skips an entry with no image', () => {
    renderStrip({
      items: [{ image: '', alt: 'blank' }, { alt: 'missing' }, { image: 5, alt: 'num' }, B],
    });
    expect(screen.getAllByRole('img')).toHaveLength(1);
    expect(screen.queryByRole('img', { name: 'blank' })).not.toBeInTheDocument();
  });

  it('builds the background through backgroundImageValue, which quotes the URL', () => {
    const tricky = 'https://x/a (1).png';
    vi.mocked(backgroundImageValue).mockClear();
    renderStrip({ items: [{ image: tricky, alt: 'tricky' }] });
    expect(backgroundImageValue).toHaveBeenCalledWith(tricky);
    // Asserted on the helper's return, not the rendered style: jsdom normalises url() on read-back.
    expect(backgroundImageValue(tricky)).toBe('url("https://x/a (1).png")');
  });

  it('applies the helper output as the logo background', () => {
    vi.mocked(backgroundImageValue).mockReturnValueOnce('url("sentinel")');
    renderStrip({ items: [B] });
    expect(screen.getByRole('img')).toHaveStyle({ backgroundImage: 'url("sentinel")' });
  });
});
