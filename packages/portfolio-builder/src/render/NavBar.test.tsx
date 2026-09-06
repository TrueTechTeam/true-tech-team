import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NavBar } from './NavBar';
import type { PageSection } from '../schema/types';

function makeSections(): PageSection[] {
  return [
    { id: 'about', name: 'About', showInNav: true, rows: [] },
    { id: 'hidden', name: 'Hidden Section', showInNav: false, rows: [] },
    { id: 'projects', name: 'Projects', showInNav: true, rows: [] },
  ];
}

describe('NavBar', () => {
  it('renders one link per section with showInNav true, in order', () => {
    render(<NavBar title="Justin True" sections={makeSections()} />);
    const links = screen.getAllByRole('link');
    expect(links.map((l) => l.textContent)).toEqual(['About', 'Projects']);
  });

  it('omits sections with showInNav false', () => {
    render(<NavBar title="Justin True" sections={makeSections()} />);
    expect(screen.queryByText('Hidden Section')).not.toBeInTheDocument();
  });

  it('links to the section id as a hash anchor', () => {
    render(<NavBar title="Justin True" sections={makeSections()} />);
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '#about');
  });

  it('renders the given title as the brand', () => {
    render(<NavBar title="Justin True" sections={makeSections()} />);
    expect(screen.getByText('Justin True')).toBeInTheDocument();
  });
});
