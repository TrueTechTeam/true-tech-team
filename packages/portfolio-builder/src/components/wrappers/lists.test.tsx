import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  CarouselItem,
  validateCarouselProps,
  TabsItem,
  validateTabsProps,
  OverflowTextItem,
  validateOverflowTextProps,
  TruncatedListItem,
  validateTruncatedListProps,
} from './lists';

describe('CarouselItem', () => {
  it('renders a slide image for each slide', () => {
    render(
      <CarouselItem
        slides={[
          { imageSrc: '/1.jpg', alt: 'One' },
          { imageSrc: '/2.jpg', alt: 'Two' },
        ]}
      />
    );
    // The real Carousel keeps every slide mounted and marks inactive ones aria-hidden="true"
    // (verified against the installed @true-tech-team/react-components@1.2.1 render output),
    // so getByRole('img', { name }) only finds the active slide's image — getByAltText queries
    // the DOM directly and correctly finds both.
    expect(screen.getByAltText('One')).toBeInTheDocument();
    expect(screen.getByAltText('Two')).toBeInTheDocument();
  });
  it('flags an empty slides array', () => {
    expect(validateCarouselProps({ slides: [] })).toContain(
      'slides must contain at least one slide'
    );
  });
  it('flags a missing slides array', () => {
    expect(validateCarouselProps({})).toContain('slides must contain at least one slide');
  });
});

describe('TabsItem', () => {
  it('renders every tab label', () => {
    render(
      <TabsItem
        tabs={[
          { label: 'Overview', content: 'A.' },
          { label: 'Details', content: 'B.' },
        ]}
      />
    );
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Details')).toBeInTheDocument();
  });
  it('flags duplicate tab labels', () => {
    const errors = validateTabsProps({
      tabs: [
        { label: 'A', content: '1' },
        { label: 'A', content: '2' },
      ],
    });
    expect(errors).toContain('tab labels must be unique within one tabs item');
  });
  it('flags an empty tabs array', () => {
    expect(validateTabsProps({ tabs: [] })).toContain('tabs must contain at least one tab');
  });
});

describe('OverflowTextItem', () => {
  it('renders the given text', () => {
    render(<OverflowTextItem text="A long line of text." />);
    expect(screen.getByText('A long line of text.')).toBeInTheDocument();
  });
  it('flags a missing text', () => {
    expect(validateOverflowTextProps({})).toContain('text is required and must be a string');
  });
});

describe('TruncatedListItem', () => {
  it('renders each item as a pill', () => {
    render(<TruncatedListItem items={['React', 'TypeScript', 'Next.js']} maxVisible={2} />);
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });
  it('flags a missing items array', () => {
    expect(validateTruncatedListProps({})).toContain('items must be a non-empty array of strings');
  });
});
