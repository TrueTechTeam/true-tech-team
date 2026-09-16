import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InsertionLine } from './InsertionLine';

describe('InsertionLine', () => {
  it('renders a vertical line positioned at the given horizontal offset', () => {
    render(<InsertionLine orientation="vertical" offset={42} />);
    const line = screen.getByTestId('insertion-line');
    expect(line).toHaveStyle({ left: '42px' });
    expect(line.className).toMatch(/vertical/);
  });

  it('renders a horizontal line positioned at the given vertical offset', () => {
    render(<InsertionLine orientation="horizontal" offset={17} />);
    const line = screen.getByTestId('insertion-line');
    expect(line).toHaveStyle({ top: '17px' });
    expect(line.className).toMatch(/horizontal/);
  });
});
