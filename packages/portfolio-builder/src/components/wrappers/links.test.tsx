import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  LinkButtonItem,
  validateLinkButtonProps,
  IconLinkButtonItem,
  validateIconLinkButtonProps,
} from './links';

describe('LinkButtonItem', () => {
  it('renders a link with the given label and href', () => {
    render(<LinkButtonItem label="Visit GitHub" href="https://github.com/example" />);
    const link = screen.getByRole('link', { name: 'Visit GitHub' });
    expect(link).toHaveAttribute('href', 'https://github.com/example');
  });

  it('opens in a new tab when openInNewTab is set', () => {
    render(<LinkButtonItem label="Resume" href="/resume.pdf" openInNewTab />);
    expect(screen.getByRole('link', { name: 'Resume' })).toHaveAttribute('target', '_blank');
  });

  it('flags a missing href', () => {
    expect(validateLinkButtonProps({ label: 'x' })).toContain(
      'href is required and must be a string'
    );
  });

  it('flags a missing label', () => {
    expect(validateLinkButtonProps({ href: '/x' })).toContain(
      'label is required and must be a string'
    );
  });
});

describe('IconLinkButtonItem', () => {
  it('renders an accessible icon-only link', () => {
    render(
      <IconLinkButtonItem
        href="https://linkedin.com/in/example"
        icon="external-link"
        ariaLabel="LinkedIn"
      />
    );
    const link = screen.getByRole('link', { name: 'LinkedIn' });
    expect(link).toHaveAttribute('href', 'https://linkedin.com/in/example');
  });

  it('flags a missing ariaLabel', () => {
    expect(validateIconLinkButtonProps({ href: '/x', icon: 'home' })).toContain(
      'ariaLabel is required and must be a string'
    );
  });
});
