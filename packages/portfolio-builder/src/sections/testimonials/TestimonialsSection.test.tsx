import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TestimonialsSection } from './TestimonialsSection';
import type { PageSection, PortfolioPage } from '../../schema/types';

function renderTestimonials(props: Record<string, unknown>) {
  const section: PageSection = {
    id: 't',
    type: 'testimonials',
    name: 'Testimonials',
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
  return render(<TestimonialsSection section={section} page={page} anchors={new Map()} />);
}

const A = {
  quote: 'Delivered early.',
  author: 'Ada',
  role: 'CTO',
  avatar: 'https://x/ada.png',
};
const B = { quote: 'A joy to work with.', author: 'Bo' };

describe('TestimonialsSection', () => {
  it('renders the heading', () => {
    renderTestimonials({ heading: 'Kind words', items: [A] });
    expect(screen.getByRole('heading', { level: 2, name: 'Kind words' })).toBeInTheDocument();
  });

  it('omits an empty heading', () => {
    renderTestimonials({ heading: '', items: [A] });
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
  });

  it('renders one blockquote per valid entry', () => {
    renderTestimonials({ items: [A, B] });
    expect(document.querySelectorAll('blockquote')).toHaveLength(2);
    expect(screen.getByText('Delivered early.')).toBeInTheDocument();
  });

  it('renders the author and role as the attribution', () => {
    renderTestimonials({ items: [A] });
    expect(screen.getByText('Ada')).toBeInTheDocument();
    expect(screen.getByText('CTO')).toBeInTheDocument();
  });

  it('omits the role when absent', () => {
    renderTestimonials({ items: [B] });
    expect(screen.getByText('Bo')).toBeInTheDocument();
    expect(document.querySelectorAll('figcaption span span')).toHaveLength(1);
  });

  it('renders the avatar image with the author as alt when an avatar is set', () => {
    renderTestimonials({ items: [A] });
    const img = screen.getByRole('img', { name: 'Ada' });
    expect(img).toHaveAttribute('src', 'https://x/ada.png');
  });

  it.each([undefined, '', null, 5])('renders no avatar for avatar = %j', (avatar) => {
    renderTestimonials({ items: [{ ...B, avatar }] });
    expect(screen.getByText('Bo')).toBeInTheDocument();
    expect(document.querySelector('img')).toBeNull();
    // No Avatar shell at all, not just an empty one.
    expect(document.querySelector('[data-component="avatar"]')).toBeNull();
  });

  it.each([null, 'x', {}, 7, undefined])('renders the empty state for items = %j', (items) => {
    expect(() => renderTestimonials({ items })).not.toThrow();
    expect(screen.getByText('No testimonials yet.')).toBeInTheDocument();
    expect(document.querySelectorAll('blockquote')).toHaveLength(0);
  });

  it('skips non-object entries', () => {
    renderTestimonials({ items: [A, null, 'x', 7, [A], B] });
    expect(document.querySelectorAll('blockquote')).toHaveLength(2);
  });

  it('skips an entry with no quote or no author', () => {
    renderTestimonials({
      items: [{ author: 'x' }, { quote: 'y' }, { quote: '  ', author: 'z' }, { quote: 5 }, B],
    });
    expect(document.querySelectorAll('blockquote')).toHaveLength(1);
  });
});
