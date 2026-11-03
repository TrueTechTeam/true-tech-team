import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GallerySection } from './GallerySection';
import { backgroundImageValue } from '../cssUrl';
import type { PageSection, PortfolioPage } from '../../schema/types';

vi.mock('../cssUrl', async () => {
  const actual = await vi.importActual<{ backgroundImageValue: (url: string) => string }>(
    '../cssUrl'
  );
  return { ...actual, backgroundImageValue: vi.fn(actual.backgroundImageValue) };
});

function makeGallery(props: Record<string, unknown>): PageSection {
  return { id: 'gal', type: 'gallery', name: 'Gallery', showInNav: true, props };
}

function renderGallery(props: Record<string, unknown>) {
  const section = makeGallery(props);
  const page: PortfolioPage = {
    schemaVersion: 2,
    slug: 's',
    title: 'Justin True',
    templateId: 'default',
    sections: [section],
  };
  return render(<GallerySection section={section} page={page} anchors={new Map()} />);
}

const A = { image: 'https://x/a.png', alt: 'A map', caption: 'North side' };
const B = { image: 'https://x/b.png', alt: 'A boat' };

describe('GallerySection', () => {
  it('renders the heading', () => {
    renderGallery({ heading: 'Gallery', images: [A] });
    expect(screen.getByRole('heading', { name: 'Gallery' })).toBeInTheDocument();
  });

  it('omits an empty heading', () => {
    renderGallery({ heading: '', images: [A] });
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('renders one image per valid entry', () => {
    renderGallery({ images: [A, B] });
    expect(screen.getAllByRole('img')).toHaveLength(2);
  });

  it('uses the alt text as the accessible name', () => {
    renderGallery({ images: [A, B] });
    expect(screen.getByRole('img', { name: 'A map' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'A boat' })).toBeInTheDocument();
  });

  it('renders a caption only when present', () => {
    renderGallery({ images: [A, B] });
    expect(screen.getByText('North side')).toBeInTheDocument();
    expect(screen.getAllByRole('figure')).toHaveLength(2);
    expect(document.querySelectorAll('figcaption')).toHaveLength(1);
  });

  it.each([null, 'x', {}, 7, undefined])('renders the empty state for images = %j', (images) => {
    expect(() => renderGallery({ images })).not.toThrow();
    expect(screen.getByText('No images yet.')).toBeInTheDocument();
    expect(screen.queryAllByRole('img')).toHaveLength(0);
  });

  it('skips non-object entries', () => {
    renderGallery({ images: [A, null, 'x', 7, [A], B] });
    expect(screen.getAllByRole('img')).toHaveLength(2);
  });

  it('skips an entry with no image URL instead of rendering an empty tile', () => {
    renderGallery({
      images: [{ image: '', alt: 'blank' }, { alt: 'missing' }, { image: 5, alt: 'num' }, A],
    });
    expect(screen.getAllByRole('img')).toHaveLength(1);
    expect(screen.queryByRole('img', { name: 'blank' })).not.toBeInTheDocument();
  });

  it('drives the column count through a CSS variable', () => {
    renderGallery({ columns: 2, images: [A] });
    expect(screen.getByRole('figure').parentElement).toHaveStyle({ '--gallery-columns': '2' });
  });

  it.each([5, '3', null, undefined, 0])('falls back to 3 columns for columns = %j', (columns) => {
    renderGallery({ columns, images: [A] });
    expect(screen.getByRole('figure').parentElement).toHaveStyle({ '--gallery-columns': '3' });
  });

  it('builds the background through backgroundImageValue, which quotes the URL', () => {
    const tricky = 'https://x/a (1).png';
    vi.mocked(backgroundImageValue).mockClear();
    renderGallery({ images: [{ image: tricky, alt: 'tricky' }] });
    expect(backgroundImageValue).toHaveBeenCalledWith(tricky);
    // Asserted on the helper's return, not the rendered style: jsdom normalises url() on read-back.
    expect(backgroundImageValue(tricky)).toBe('url("https://x/a (1).png")');
  });

  it('applies the helper output as the tile background', () => {
    vi.mocked(backgroundImageValue).mockReturnValueOnce('url("sentinel")');
    renderGallery({ images: [A] });
    expect(screen.getByRole('img')).toHaveStyle({ backgroundImage: 'url("sentinel")' });
  });
});
