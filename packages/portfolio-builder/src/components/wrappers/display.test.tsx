import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  BadgeItem,
  validateBadgeProps,
  ChipItem,
  validateChipProps,
  PillItem,
  validatePillProps,
  StatusIndicatorItem,
  validateStatusIndicatorProps,
  IconItem,
  validateIconProps,
} from './display';

describe('BadgeItem', () => {
  it('renders the given label', () => {
    render(<BadgeItem label="New" />);
    expect(screen.getByText('New')).toBeInTheDocument();
  });
  it('flags a missing label', () => {
    expect(validateBadgeProps({})).toContain('label is required and must be a string or number');
  });
});

describe('ChipItem', () => {
  it('renders the given label', () => {
    render(<ChipItem label="React" />);
    expect(screen.getByText('React')).toBeInTheDocument();
  });
  it('flags a missing label', () => {
    expect(validateChipProps({})).toContain('label is required and must be a string');
  });
});

describe('PillItem', () => {
  it('renders the given label', () => {
    render(<PillItem label="Available for hire" />);
    expect(screen.getByText('Available for hire')).toBeInTheDocument();
  });
  it('flags a missing label', () => {
    expect(validatePillProps({})).toContain('label is required and must be a string');
  });
});

describe('StatusIndicatorItem', () => {
  it('renders the given label with the status dot', () => {
    render(<StatusIndicatorItem status="online" label="Available" />);
    expect(screen.getByText('Available')).toBeInTheDocument();
  });
  it('flags an invalid status', () => {
    expect(validateStatusIndicatorProps({ status: 'not-a-status' })).toContain(
      'status must be a known StatusIndicator status'
    );
  });
});

describe('IconItem', () => {
  it('renders an icon with an accessible label', () => {
    render(<IconItem name="home" ariaLabel="Home" />);
    expect(screen.getByLabelText('Home')).toBeInTheDocument();
  });
  it('flags a missing name', () => {
    expect(validateIconProps({})).toContain('name is required and must be a string');
  });
});
