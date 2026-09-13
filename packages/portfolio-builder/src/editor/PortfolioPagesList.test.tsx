import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { PortfolioPagesList } from './PortfolioPagesList';
import * as crud from '../pages/crud';
import type { PortfolioPageRecord } from '../pages/types';

const fakeSupabase = {} as SupabaseClient;

function makeRecord(overrides: Partial<PortfolioPageRecord> = {}): PortfolioPageRecord {
  return {
    id: 'page-1',
    userId: 'user-1',
    slug: 'jtrue',
    title: 'Justin True',
    templateId: 'blank',
    published: false,
    showNav: true,
    sections: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('PortfolioPagesList', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders each page as a link to its editor route', () => {
    render(<PortfolioPagesList pages={[makeRecord()]} userId="user-1" supabase={fakeSupabase} />);
    const link = screen.getByRole('link', { name: /justin true/i });
    expect(link).toHaveAttribute('href', '/portfolio-builder/edit/page-1');
  });

  it('shows a draft/published badge per page', () => {
    render(
      <PortfolioPagesList
        pages={[makeRecord({ published: true })]}
        userId="user-1"
        supabase={fakeSupabase}
      />
    );
    expect(screen.getByText(/published/i)).toBeInTheDocument();
  });

  it('creates a new page and calls onCreated with the new record', async () => {
    vi.spyOn(crud, 'checkSlugAvailable').mockResolvedValue(true);
    const created = makeRecord({ id: 'page-2', slug: 'new-page', title: 'New Page' });
    vi.spyOn(crud, 'savePortfolioPage').mockResolvedValue(created);
    const onCreated = vi.fn();

    render(
      <PortfolioPagesList
        pages={[]}
        userId="user-1"
        supabase={fakeSupabase}
        onCreated={onCreated}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /new page/i }));
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'New Page' } });
    fireEvent.change(screen.getByLabelText(/slug/i), { target: { value: 'new-page' } });
    fireEvent.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => expect(onCreated).toHaveBeenCalledWith(created));
    expect(crud.savePortfolioPage).toHaveBeenCalledWith(fakeSupabase, 'user-1', {
      schemaVersion: 1,
      slug: 'new-page',
      title: 'New Page',
      templateId: 'blank',
      showNav: true,
      sections: [],
    });
  });

  it('shows an error when the slug is already taken', async () => {
    vi.spyOn(crud, 'checkSlugAvailable').mockResolvedValue(false);
    render(<PortfolioPagesList pages={[]} userId="user-1" supabase={fakeSupabase} />);

    fireEvent.click(screen.getByRole('button', { name: /new page/i }));
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Taken' } });
    fireEvent.change(screen.getByLabelText(/slug/i), { target: { value: 'taken' } });
    fireEvent.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => expect(screen.getByText(/already taken/i)).toBeInTheDocument());
  });
});
