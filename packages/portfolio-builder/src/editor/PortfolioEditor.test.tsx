import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { PortfolioEditor } from './PortfolioEditor';
import * as crud from '../pages/crud';
import type { PortfolioPageRecord } from '../pages/types';

const fakeSupabase = {} as SupabaseClient;

function makeRecord(): PortfolioPageRecord {
  return {
    id: 'page-1',
    userId: 'user-1',
    slug: 'jtrue',
    title: 'Justin True',
    templateId: 'blank',
    published: false,
    showNav: true,
    sections: [
      {
        id: 'sec1',
        name: 'Intro',
        showInNav: false,
        rows: [
          {
            id: 'row1',
            items: [{ id: 'item1', component: 'heading', span: 12, props: { text: 'Hello' } }],
          },
        ],
      },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

describe('PortfolioEditor', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads the page and renders its items in the canvas', async () => {
    vi.spyOn(crud, 'loadPortfolioPage').mockResolvedValue(makeRecord());
    render(<PortfolioEditor pageId="page-1" userId="user-1" supabase={fakeSupabase} />);
    expect(await screen.findByText('Hello')).toBeInTheDocument();
  });

  it('selects an item on click', async () => {
    vi.spyOn(crud, 'loadPortfolioPage').mockResolvedValue(makeRecord());
    render(<PortfolioEditor pageId="page-1" userId="user-1" supabase={fakeSupabase} />);
    const item = await screen.findByText('Hello');
    fireEvent.click(item);
    await waitFor(() => expect(item.closest('[data-selected="true"]')).toBeInTheDocument());
  });

  it('deselects when clicking empty canvas background', async () => {
    vi.spyOn(crud, 'loadPortfolioPage').mockResolvedValue(makeRecord());
    render(<PortfolioEditor pageId="page-1" userId="user-1" supabase={fakeSupabase} />);
    const item = await screen.findByText('Hello');
    fireEvent.click(item);
    await waitFor(() => expect(item.closest('[data-selected="true"]')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('canvas-background'));
    await waitFor(() => expect(item.closest('[data-selected="true"]')).not.toBeInTheDocument());
  });

  it('shows the property panel for the selected item and updates its props', async () => {
    vi.spyOn(crud, 'loadPortfolioPage').mockResolvedValue(makeRecord());
    render(<PortfolioEditor pageId="page-1" userId="user-1" supabase={fakeSupabase} />);
    const item = await screen.findByText('Hello');
    fireEvent.click(item);

    const textField = await screen.findByLabelText(/^Text/);
    fireEvent.change(textField, { target: { value: 'Updated Text' } });

    await waitFor(() => expect(screen.getAllByText('Updated Text').length).toBeGreaterThan(0));
  });

  it('does not show a property panel when nothing is selected', async () => {
    vi.spyOn(crud, 'loadPortfolioPage').mockResolvedValue(makeRecord());
    render(<PortfolioEditor pageId="page-1" userId="user-1" supabase={fakeSupabase} />);
    await screen.findByText('Hello');
    expect(screen.queryByLabelText('Width')).not.toBeInTheDocument();
  });

  it('deletes the selected item and clears the selection', async () => {
    vi.spyOn(crud, 'loadPortfolioPage').mockResolvedValue(makeRecord());
    render(<PortfolioEditor pageId="page-1" userId="user-1" supabase={fakeSupabase} />);
    const item = await screen.findByText('Hello');
    fireEvent.click(item);

    fireEvent.click(await screen.findByRole('button', { name: /delete/i }));

    await waitFor(() => expect(screen.queryByText('Hello')).not.toBeInTheDocument());
    expect(screen.queryByLabelText('Width')).not.toBeInTheDocument();
  });

  it('selecting a theme preset sets themeId and clears any themeOverride', async () => {
    const record = makeRecord();
    record.themeOverride = { colors: { primary: 'var(--color-blue-500)' } };
    vi.spyOn(crud, 'loadPortfolioPage').mockResolvedValue(record);
    render(<PortfolioEditor pageId="page-1" userId="user-1" supabase={fakeSupabase} />);
    await screen.findByText('Hello');

    fireEvent.click(screen.getAllByRole('button', { name: /slate/i })[0]);

    // No direct assertion on internal state — verify indirectly via a re-render effect:
    // the swatch/tile for 'slate' should now show as selected (aria-pressed).
    await waitFor(() =>
      expect(screen.getAllByRole('button', { name: /slate/i })[0]).toHaveAttribute(
        'aria-pressed',
        'true'
      )
    );
  });
});
