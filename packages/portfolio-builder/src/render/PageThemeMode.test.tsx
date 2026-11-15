import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { PageThemeMode } from './PageThemeMode';

/** What the host app's shell does on mount: pin the document to its own mode. */
function appShellForcesDark() {
  document.documentElement.setAttribute('data-theme', 'dark');
}

describe('PageThemeMode', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
  });

  it("puts the page's own mode on the document", async () => {
    render(<PageThemeMode mode="light" />);
    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'light'));
  });

  it('wins over the app shell pinning the document to dark', async () => {
    render(<PageThemeMode mode="light" />);
    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'light'));

    appShellForcesDark();

    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'light'));
  });

  // The light fix must not invert the four dark presets.
  it('keeps a dark page dark when something sets the document to light', async () => {
    render(<PageThemeMode mode="dark" />);
    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'dark'));

    document.documentElement.setAttribute('data-theme', 'light');

    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'dark'));
  });

  it('follows a change of mode', async () => {
    const { rerender } = render(<PageThemeMode mode="light" />);
    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'light'));

    rerender(<PageThemeMode mode="dark" />);

    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'dark'));
  });

  it('stops asserting the mode once unmounted', async () => {
    const { unmount } = render(<PageThemeMode mode="light" />);
    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'light'));

    unmount();
    appShellForcesDark();

    // Give the observer the chance it would need to fight back, then confirm it did not.
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  });
});
