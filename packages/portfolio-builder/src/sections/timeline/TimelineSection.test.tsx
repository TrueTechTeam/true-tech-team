import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TimelineSection } from './TimelineSection';
import type { PageSection, PortfolioPage } from '../../schema/types';

function renderTimeline(props: Record<string, unknown>) {
  const section: PageSection = {
    id: 'tl',
    type: 'timeline',
    name: 'Timeline',
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
  return render(<TimelineSection section={section} page={page} anchors={new Map()} />);
}

const A = { period: '2020', title: 'Joined', body: 'Started here.' };
const B = { period: '2022', title: 'Promoted' };
const C = { period: '2024', title: 'Lead' };

describe('TimelineSection', () => {
  it('renders the heading', () => {
    renderTimeline({ heading: 'Experience', entries: [A] });
    expect(screen.getByRole('heading', { level: 2, name: 'Experience' })).toBeInTheDocument();
  });

  it('omits an empty heading', () => {
    renderTimeline({ heading: '', entries: [A] });
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
  });

  it('renders an ordered list with one item per valid entry', () => {
    renderTimeline({ entries: [A, B] });
    expect(document.querySelector('ol')).not.toBeNull();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('preserves entry order', () => {
    renderTimeline({ entries: [C, A, B] });
    const titles = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(titles).toEqual(['Lead', 'Joined', 'Promoted']);
  });

  it('shows period and body, and omits a missing body', () => {
    renderTimeline({ entries: [A, B] });
    expect(screen.getByText('2020')).toBeInTheDocument();
    expect(screen.getByText('Started here.')).toBeInTheDocument();
    expect(document.querySelectorAll('li p')).toHaveLength(1);
  });

  it.each([null, 'x', {}, 7, undefined])('renders the empty state for entries = %j', (entries) => {
    expect(() => renderTimeline({ entries })).not.toThrow();
    expect(screen.getByText('No entries yet.')).toBeInTheDocument();
    expect(document.querySelector('ol')).toBeNull();
  });

  it('skips non-object entries', () => {
    renderTimeline({ entries: [A, null, 'x', 7, [A], B] });
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('skips an entry with no usable title', () => {
    renderTimeline({
      entries: [{ period: '1' }, { period: '2', title: '  ' }, { period: '3', title: 5 }, B],
    });
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
  });
});
