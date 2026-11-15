import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AvatarItem, validateAvatarProps } from './avatar';

describe('AvatarItem', () => {
  it('renders an image avatar when src is given', () => {
    render(<AvatarItem src="/me.jpg" alt="Justin True" />);
    expect(screen.getByRole('img', { name: 'Justin True' })).toHaveAttribute('src', '/me.jpg');
  });

  it('renders initials when no src is given', () => {
    render(<AvatarItem initials="JT" />);
    expect(screen.getByText('JT')).toBeInTheDocument();
  });

  it('flags a page with neither src nor initials', () => {
    expect(validateAvatarProps({})).toContain('either src or initials is required');
  });
});
