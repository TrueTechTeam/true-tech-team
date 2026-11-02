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

const UNSAFE_HREFS = [
  'javascript:alert(1)',
  'JaVaScRiPt:alert(1)',
  'data:text/html,<script>alert(1)</script>',
  'vbscript:msgbox(1)',
  '//evil.example.com',
  '/\\evil.example.com',
];

const SAFE_HREFS = [
  'https://example.com',
  'http://example.com',
  'mailto:a@example.com',
  'tel:+15551234567',
  '#contact',
  '/about',
];

describe('LinkButtonItem href safety', () => {
  it.each(UNSAFE_HREFS)('does not render a link for the unsafe href %s', (href) => {
    render(<LinkButtonItem label="Click" href={href} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it.each(SAFE_HREFS)('renders a link for the safe href %s', (href) => {
    render(<LinkButtonItem label="Click" href={href} />);
    expect(screen.getByRole('link', { name: 'Click' })).toHaveAttribute('href', href);
  });

  it('adds rel="noopener noreferrer" when opening in a new tab', () => {
    render(<LinkButtonItem label="Click" href="https://example.com" openInNewTab />);
    const link = screen.getByRole('link', { name: 'Click' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
    expect(link).toHaveAttribute('rel', expect.stringContaining('noreferrer'));
  });

  it('sets neither target nor rel when not opening in a new tab', () => {
    render(<LinkButtonItem label="Click" href="https://example.com" />);
    const link = screen.getByRole('link', { name: 'Click' });
    expect(link).not.toHaveAttribute('target');
    expect(link).not.toHaveAttribute('rel');
  });
});

describe('IconLinkButtonItem href safety', () => {
  it.each(UNSAFE_HREFS)('does not render a link for the unsafe href %s', (href) => {
    render(<IconLinkButtonItem href={href} icon="external-link" ariaLabel="Open" />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it.each(SAFE_HREFS)('renders a link for the safe href %s', (href) => {
    render(<IconLinkButtonItem href={href} icon="external-link" ariaLabel="Open" />);
    expect(screen.getByRole('link', { name: 'Open' })).toHaveAttribute('href', href);
  });

  it('adds rel="noopener noreferrer" when opening in a new tab', () => {
    render(
      <IconLinkButtonItem
        href="https://example.com"
        icon="external-link"
        ariaLabel="Open"
        openInNewTab
      />
    );
    const link = screen.getByRole('link', { name: 'Open' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
    expect(link).toHaveAttribute('rel', expect.stringContaining('noreferrer'));
  });

  it('sets neither target nor rel when not opening in a new tab', () => {
    render(<IconLinkButtonItem href="https://example.com" icon="external-link" ariaLabel="Open" />);
    const link = screen.getByRole('link', { name: 'Open' });
    expect(link).not.toHaveAttribute('target');
    expect(link).not.toHaveAttribute('rel');
  });
});
