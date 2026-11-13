import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeadingItem, validateHeadingProps } from './Heading';
import { TextItem, validateTextProps } from './Text';
import { ImageItem, validateImageProps } from './Image';
import { SpacerItem, validateSpacerProps } from './Spacer';

describe('HeadingItem', () => {
  it('renders the given text at the given level', () => {
    render(<HeadingItem text="Hello" level={3} />);
    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toHaveTextContent('Hello');
  });

  it('flags a missing text prop', () => {
    expect(validateHeadingProps({})).toContain('text is required and must be a string');
  });
});

describe('TextItem', () => {
  it('renders the given text', () => {
    render(<TextItem text="A paragraph." />);
    expect(screen.getByText('A paragraph.')).toBeInTheDocument();
  });

  it('flags a missing text prop', () => {
    expect(validateTextProps({})).toContain('text is required and must be a string');
  });
});

describe('ImageItem', () => {
  it('renders an img with the given src and alt', () => {
    render(<ImageItem src="/photo.jpg" alt="A portrait" />);
    const img = screen.getByRole('img', { name: 'A portrait' });
    expect(img).toHaveAttribute('src', '/photo.jpg');
  });

  it('flags a missing src prop', () => {
    expect(validateImageProps({ alt: 'x' })).toContain('src is required and must be a string');
  });

  it('flags a missing alt prop', () => {
    expect(validateImageProps({ src: '/x.jpg' })).toContain('alt is required and must be a string');
  });
});

describe('SpacerItem', () => {
  it('renders a block with the given height', () => {
    render(<SpacerItem height={48} data-testid="spacer" />);
    expect(screen.getByTestId('spacer')).toHaveStyle({ height: '48px' });
  });

  it('flags a non-numeric height prop', () => {
    expect(validateSpacerProps({ height: 'tall' })).toContain(
      'height is required and must be a number'
    );
  });
});
