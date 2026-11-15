import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CardItem, validateCardProps } from './card';

describe('CardItem', () => {
  it('renders header, body, and footer text', () => {
    render(<CardItem header="Project Alpha" body="A cool project." footer="View source" />);
    expect(screen.getByText('Project Alpha')).toBeInTheDocument();
    expect(screen.getByText('A cool project.')).toBeInTheDocument();
    expect(screen.getByText('View source')).toBeInTheDocument();
  });

  it('renders an image thumbnail when imageSrc is given', () => {
    render(<CardItem body="A cool project." imageSrc="/thumb.jpg" imageAlt="Screenshot" />);
    expect(screen.getByRole('img', { name: 'Screenshot' })).toHaveAttribute('src', '/thumb.jpg');
  });

  it('flags a missing body', () => {
    expect(validateCardProps({})).toContain('body is required and must be a string');
  });
});
