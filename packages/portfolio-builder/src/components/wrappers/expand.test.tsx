import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  ExpandableTextItem,
  validateExpandableTextProps,
  AccordionItem,
  validateAccordionProps,
  RevealItem,
  validateRevealProps,
  FlipCardItem,
  validateFlipCardProps,
} from './expand';

describe('ExpandableTextItem', () => {
  it('shows the body after the title is clicked', async () => {
    render(<ExpandableTextItem title="Read more" body="The full story." />);
    expect(screen.queryByText('The full story.')).not.toBeVisible();
    await userEvent.click(screen.getByText('Read more'));
    expect(screen.getByText('The full story.')).toBeVisible();
  });
  it('flags a missing title', () => {
    expect(validateExpandableTextProps({ body: 'x' })).toContain(
      'title is required and must be a non-empty string'
    );
  });
});

describe('AccordionItem', () => {
  it('renders the given header', () => {
    render(<AccordionItem header="FAQ" body="An answer." />);
    expect(screen.getByText('FAQ')).toBeInTheDocument();
  });
  it('flags a missing body', () => {
    expect(validateAccordionProps({ header: 'x' })).toContain(
      'body is required and must be a string'
    );
  });
});

describe('RevealItem', () => {
  it('renders the given text', () => {
    render(<RevealItem text="Welcome" />);
    expect(screen.getByText('Welcome')).toBeInTheDocument();
  });
  it('flags a missing text', () => {
    expect(validateRevealProps({})).toContain('text is required and must be a string');
  });
});

describe('FlipCardItem', () => {
  it('renders the front text', () => {
    render(<FlipCardItem frontText="Front" backText="Back" />);
    expect(screen.getByText('Front')).toBeInTheDocument();
  });
  it('flags a missing backText', () => {
    expect(validateFlipCardProps({ frontText: 'x' })).toContain(
      'backText is required and must be a string'
    );
  });
});
