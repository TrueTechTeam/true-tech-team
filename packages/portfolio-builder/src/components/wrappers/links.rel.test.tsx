import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

// NavLink defaults `rel` to "noopener noreferrer" when target="_blank", which masks a missing
// `rel` in a DOM-level assertion. These tests stub NavLink so they pin what OUR code passes, and
// stay correct if the library's default ever changes.
const navLinkProps = vi.hoisted(() => ({ calls: [] as Array<Record<string, unknown>> }));

vi.mock('@true-tech-team/react-components', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    NavLink: (props: Record<string, unknown>) => {
      navLinkProps.calls.push(props);
      return null;
    },
  };
});

import { LinkButtonItem, IconLinkButtonItem } from './links';

describe('link wrappers pass rel explicitly', () => {
  it('LinkButtonItem passes rel with target=_blank', () => {
    navLinkProps.calls.length = 0;
    render(<LinkButtonItem label="Click" href="https://example.com" openInNewTab />);
    expect(navLinkProps.calls[0]).toMatchObject({ target: '_blank', rel: 'noopener noreferrer' });
  });

  it('IconLinkButtonItem passes rel with target=_blank', () => {
    navLinkProps.calls.length = 0;
    render(
      <IconLinkButtonItem
        href="https://example.com"
        icon="external-link"
        ariaLabel="Open"
        openInNewTab
      />
    );
    expect(navLinkProps.calls[0]).toMatchObject({ target: '_blank', rel: 'noopener noreferrer' });
  });
});
