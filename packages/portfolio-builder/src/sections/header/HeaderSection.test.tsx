import { describe, it, expect } from 'vitest';
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
});
