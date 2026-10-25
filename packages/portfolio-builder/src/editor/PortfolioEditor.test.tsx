import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('loads the page and renders its content read-only', async () => {
    vi.spyOn(crud, 'loadPortfolioPage').mockResolvedValue(makeRecord());
    render(<PortfolioEditor pageId="page-1" userId="user-1" supabase={fakeSupabase} />);
    expect(await screen.findByText('Hello')).toBeInTheDocument();
  });

  it('shows a not-found message when the loaded record belongs to a different user', async () => {
    const record = makeRecord();
    record.userId = 'someone-else';
    vi.spyOn(crud, 'loadPortfolioPage').mockResolvedValue(record);
    render(<PortfolioEditor pageId="page-1" userId="user-1" supabase={fakeSupabase} />);
    expect(await screen.findByText(/doesn.t exist or you don.t have access/i)).toBeInTheDocument();
  });

  it('shows a not-found message when the page does not exist', async () => {
    vi.spyOn(crud, 'loadPortfolioPage').mockResolvedValue(null);
    render(<PortfolioEditor pageId="page-1" userId="user-1" supabase={fakeSupabase} />);
    expect(await screen.findByText(/doesn.t exist or you don.t have access/i)).toBeInTheDocument();
  });

  it('shows an error message when loading the page fails', async () => {
    vi.spyOn(crud, 'loadPortfolioPage').mockRejectedValue(new Error('network error'));
    render(<PortfolioEditor pageId="page-1" userId="user-1" supabase={fakeSupabase} />);
    expect(await screen.findByText(/couldn.t load this page/i)).toBeInTheDocument();
  });

  it('saves the page and shows a success state', async () => {
    const record = makeRecord();
    vi.spyOn(crud, 'loadPortfolioPage').mockResolvedValue(record);
    vi.spyOn(crud, 'savePortfolioPage').mockResolvedValue(record);
    render(<PortfolioEditor pageId="page-1" userId="user-1" supabase={fakeSupabase} />);
    await screen.findByText('Hello');

    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));

    await waitFor(() => expect(crud.savePortfolioPage).toHaveBeenCalled());
    expect(await screen.findByText(/saved/i)).toBeInTheDocument();
  });

  it('shows a save error message when saving fails', async () => {
    vi.spyOn(crud, 'loadPortfolioPage').mockResolvedValue(makeRecord());
    vi.spyOn(crud, 'savePortfolioPage').mockRejectedValue(new Error('Slug taken'));
    render(<PortfolioEditor pageId="page-1" userId="user-1" supabase={fakeSupabase} />);
    await screen.findByText('Hello');

    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));

    expect(await screen.findByText('Slug taken')).toBeInTheDocument();
  });

  it('selecting a theme preset updates the theme variables on the rendered page', async () => {
    vi.spyOn(crud, 'loadPortfolioPage').mockResolvedValue(makeRecord());
    render(<PortfolioEditor pageId="page-1" userId="user-1" supabase={fakeSupabase} />);
    await screen.findByText('Hello');

    await userEvent.click(screen.getByRole('button', { name: /^slate /i }));
    await userEvent.click(screen.getByText('Coral Reef'));

    await waitFor(() =>
      expect(screen.getByTestId('canvas-background')).toHaveStyle({
        '--theme-primary': 'var(--color-coral-500)',
      })
    );
  });

  it('toggles the preview panel', async () => {
    vi.spyOn(crud, 'loadPortfolioPage').mockResolvedValue(makeRecord());
    render(<PortfolioEditor pageId="page-1" userId="user-1" supabase={fakeSupabase} />);
    await screen.findByText('Hello');

    expect(screen.queryByTitle('Portfolio preview')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /preview/i }));
    expect(await screen.findByTitle('Portfolio preview')).toBeInTheDocument();
  });
});
