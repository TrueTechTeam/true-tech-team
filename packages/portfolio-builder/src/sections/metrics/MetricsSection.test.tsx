import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MetricsSection } from './MetricsSection';
import type { PageSection, PortfolioPage } from '../../schema/types';

function renderMetrics(props: Record<string, unknown>) {
  const section: PageSection = {
    id: 'm',
    type: 'metrics',
    name: 'Metrics',
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
  return render(<MetricsSection section={section} page={page} anchors={new Map()} />);
}

const A = { value: 120, label: 'Projects', suffix: '+' };
const B = { value: 98, label: 'Uptime', suffix: '%' };

describe('MetricsSection', () => {
  it('renders the heading', () => {
    renderMetrics({ heading: 'Results', animate: false, items: [A] });
    expect(screen.getByRole('heading', { level: 2, name: 'Results' })).toBeInTheDocument();
  });

  it('omits an empty heading', () => {
    renderMetrics({ heading: '', animate: false, items: [A] });
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
  });

  it('renders one list item per valid metric', () => {
    renderMetrics({ animate: false, items: [A, B] });
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('non-animated shows label and value', () => {
    renderMetrics({ animate: false, items: [A] });
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText(/120/)).toBeInTheDocument();
  });

  it('animated renders a count-up and still shows the label', () => {
    renderMetrics({ animate: true, items: [A, B] });
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Uptime')).toBeInTheDocument();
  });

  it.each([null, 'x', {}, 7, undefined])('renders the empty state for items = %j', (items) => {
    expect(() => renderMetrics({ animate: false, items })).not.toThrow();
    expect(screen.getByText('No metrics yet.')).toBeInTheDocument();
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });

  it('skips non-object entries', () => {
    renderMetrics({ animate: false, items: [A, null, 'x', 7, [A], B] });
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it.each([
    ['a string', '12'],
    ['null', null],
    ['undefined', undefined],
    ['NaN', Number.NaN],
    ['Infinity', Number.POSITIVE_INFINITY],
    ['an object', {}],
  ])('skips a metric whose value is %s rather than rendering NaN', (_name, value) => {
    for (const animate of [false, true]) {
      const { container, unmount } = renderMetrics({
        animate,
        items: [{ value, label: 'Bad' }, B],
      });
      expect(screen.getAllByRole('listitem')).toHaveLength(1);
      expect(screen.queryByText('Bad')).not.toBeInTheDocument();
      expect(container.textContent).not.toMatch(/NaN|Infinity/);
      unmount();
    }
  });

  it('keeps a legitimate zero value', () => {
    renderMetrics({ animate: false, items: [{ value: 0, label: 'Bugs' }] });
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
  });
});
