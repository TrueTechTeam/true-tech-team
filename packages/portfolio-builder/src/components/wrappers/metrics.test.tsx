import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  ProgressBarItem,
  validateProgressBarProps,
  CircularProgressItem,
  validateCircularProgressProps,
  KpiItem,
  validateKpiProps,
  CountUpItem,
  validateCountUpProps,
} from './metrics';

describe('ProgressBarItem', () => {
  it('renders with the given value and label', () => {
    render(<ProgressBarItem value={75} label="React proficiency" showValue />);
    expect(screen.getByText('React proficiency')).toBeInTheDocument();
  });
  it('flags a non-numeric value', () => {
    expect(validateProgressBarProps({ value: 'high' })).toContain(
      'value is required and must be a number'
    );
  });
});

describe('CircularProgressItem', () => {
  it('renders with the given value', () => {
    const { container } = render(<CircularProgressItem value={50} />);
    expect(container.firstChild).toBeInTheDocument();
  });
  it('flags a non-numeric value', () => {
    expect(validateCircularProgressProps({})).toContain('value is required and must be a number');
  });
});

describe('KpiItem', () => {
  it('renders the given title and value', () => {
    render(<KpiItem title="Years of experience" value={5} />);
    expect(screen.getByText('Years of experience')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });
  it('flags a missing title', () => {
    expect(validateKpiProps({ value: 5 })).toContain('title is required and must be a string');
  });
  it('flags a missing value', () => {
    expect(validateKpiProps({ title: 'x' })).toContain(
      'value is required and must be a string or number'
    );
  });
});

describe('CountUpItem', () => {
  it('renders without crashing', () => {
    const { container } = render(<CountUpItem value={100} suffix="+" />);
    expect(container.firstChild).toBeInTheDocument();
  });
  it('flags a non-numeric value', () => {
    expect(validateCountUpProps({})).toContain('value is required and must be a number');
  });
});
