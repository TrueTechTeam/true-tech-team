import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CardsSection } from './CardsSection';
import type { PageSection, PortfolioPage } from '../../schema/types';

function renderCards(props: Record<string, unknown>) {
  const section: PageSection = {
    id: 'c',
    type: 'cards',
    name: 'Cards',
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
  return render(<CardsSection section={section} page={page} anchors={new Map()} />);
}

const A = { title: 'Design', body: 'Pixel-perfect work.', backText: 'See my designs' };
const B = { title: 'Build', body: 'Robust code.' };

describe('CardsSection', () => {
  it('renders the heading', () => {
    renderCards({ heading: 'Services', style: 'static', items: [A] });
    expect(screen.getByRole('heading', { level: 2, name: 'Services' })).toBeInTheDocument();
  });

  it('omits an empty heading', () => {
    renderCards({ heading: '', style: 'static', items: [A] });
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
  });

  it('renders one list item per valid card', () => {
    renderCards({ style: 'static', items: [A, B] });
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('static style shows the title as header and the body', () => {
    renderCards({ style: 'static', items: [A] });
    expect(screen.getByText('Design')).toBeInTheDocument();
    expect(screen.getByText('Pixel-perfect work.')).toBeInTheDocument();
  });

  it('static style does not render the back text', () => {
    renderCards({ style: 'static', items: [A] });
    expect(screen.queryByText('See my designs')).not.toBeInTheDocument();
  });

  it('flip style shows the title on the resting front face (inert canvas)', () => {
    renderCards({ style: 'flip', items: [A, B] });
    expect(screen.getByText('Design')).toBeInTheDocument();
    expect(screen.getByText('Build')).toBeInTheDocument();
  });

  it('flip style uses backText for the back face', () => {
    renderCards({ style: 'flip', items: [A] });
    expect(screen.getByText('See my designs')).toBeInTheDocument();
    expect(screen.queryByText('Pixel-perfect work.')).not.toBeInTheDocument();
  });

  it('flip style falls back to body when backText is empty', () => {
    renderCards({ style: 'flip', items: [B] });
    expect(screen.getByText('Robust code.')).toBeInTheDocument();
  });

  it('treats an unknown style as static', () => {
    renderCards({ style: 'bogus', items: [A] });
    expect(screen.getByText('Pixel-perfect work.')).toBeInTheDocument();
  });

  it.each([null, 'x', {}, 7, undefined])('renders the empty state for items = %j', (items) => {
    expect(() => renderCards({ style: 'static', items })).not.toThrow();
    expect(screen.getByText('No cards yet.')).toBeInTheDocument();
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });

  it('skips non-object entries', () => {
    renderCards({ style: 'static', items: [A, null, 'x', 7, [A], B] });
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('skips an entry with no usable title', () => {
    renderCards({
      style: 'static',
      items: [{ body: 'x' }, { title: '  ', body: 'y' }, { title: 5 }, B],
    });
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
  });
});
