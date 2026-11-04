import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FaqSection } from './FaqSection';
import type { PageSection, PortfolioPage } from '../../schema/types';

function renderFaq(props: Record<string, unknown>) {
  const section: PageSection = { id: 'f', type: 'faq', name: 'FAQ', showInNav: true, props };
  const page: PortfolioPage = {
    schemaVersion: 2,
    slug: 's',
    title: 'Justin True',
    templateId: 'default',
    sections: [section],
  };
  return render(<FaqSection section={section} page={page} anchors={new Map()} />);
}

const A = { question: 'Do you freelance?', answer: 'Yes, part time.' };
const B = { question: 'Where are you?', answer: 'Remote.' };

describe('FaqSection', () => {
  it('renders the heading', () => {
    renderFaq({ heading: 'FAQ', items: [A] });
    expect(screen.getByRole('heading', { level: 2, name: 'FAQ' })).toBeInTheDocument();
  });

  it('omits an empty heading', () => {
    renderFaq({ heading: '', items: [A] });
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
  });

  it('renders every question', () => {
    renderFaq({ items: [A, B] });
    expect(screen.getByText('Do you freelance?')).toBeInTheDocument();
    expect(screen.getByText('Where are you?')).toBeInTheDocument();
  });

  it('renders the first answer visible at rest (open by default, since the canvas is inert)', () => {
    renderFaq({ items: [A, B] });
    expect(screen.getByText('Yes, part time.')).toBeVisible();
  });

  it('marks only the first accordion expanded at rest and the rest collapsed', () => {
    renderFaq({ items: [A, B, { question: 'Rates?', answer: 'Ask.' }] });
    const headers = screen.getAllByRole('button');
    expect(headers).toHaveLength(3);
    // aria-expanded, not toBeVisible: jsdom does not apply the stylesheet, so visibility proves
    // nothing about whether an accordion is actually collapsed.
    expect(headers[0]).toHaveAttribute('aria-expanded', 'true');
    expect(headers[1]).toHaveAttribute('aria-expanded', 'false');
    expect(headers[2]).toHaveAttribute('aria-expanded', 'false');
  });

  it.each([null, 'x', {}, 7, undefined])('renders the empty state for items = %j', (items) => {
    expect(() => renderFaq({ items })).not.toThrow();
    expect(screen.getByText('No questions yet.')).toBeInTheDocument();
  });

  it('skips non-object entries', () => {
    renderFaq({ items: [A, null, 'x', 7, [A], B] });
    expect(screen.getByText('Do you freelance?')).toBeInTheDocument();
    expect(screen.getByText('Where are you?')).toBeInTheDocument();
    expect(screen.queryByText('No questions yet.')).not.toBeInTheDocument();
  });

  it('skips an entry with no usable question', () => {
    renderFaq({
      items: [{ answer: 'orphan' }, { question: '  ', answer: 'blank' }, { question: 5 }, B],
    });
    expect(screen.queryByText('orphan')).not.toBeInTheDocument();
    expect(screen.queryByText('blank')).not.toBeInTheDocument();
    expect(screen.getByText('Remote.')).toBeInTheDocument();
  });
});
