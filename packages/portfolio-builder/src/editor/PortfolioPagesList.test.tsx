import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { PortfolioPagesList } from './PortfolioPagesList';
import * as crud from '../pages/crud';
import * as slugModule from '../pages/slug';
import type { PortfolioPageRecord } from '../pages/types';
import { THEME_PRESETS } from '../themes/presets';

const fakeSupabase = {} as SupabaseClient;

function makeRecord(overrides: Partial<PortfolioPageRecord> = {}): PortfolioPageRecord {
  return {
    id: 'page-1',
    userId: 'user-1',
    slug: 'jtrue',
    title: 'Justin True',
    templateId: 'blank',
    published: false,
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

  it('shows a draft badge for an unpublished page', () => {
    render(
      <PortfolioPagesList
        pages={[makeRecord({ published: false })]}
        userId="user-1"
        supabase={fakeSupabase}
      />
    );
    expect(screen.getByText(/draft/i)).toBeInTheDocument();
  });

  it('shows only the Create New Page tile in the grid when there are no pages', () => {
    render(<PortfolioPagesList pages={[]} userId="user-1" supabase={fakeSupabase} />);
    expect(screen.getByRole('button', { name: 'Create New Page' })).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders a Create New Page tile at the end of the grid that opens the dialog', () => {
    render(<PortfolioPagesList pages={[makeRecord()]} userId="user-1" supabase={fakeSupabase} />);
    fireEvent.click(screen.getByRole('button', { name: 'Create New Page' }));
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
  });

  it('opens the create dialog with only a title field when New Page is clicked', () => {
    render(<PortfolioPagesList pages={[]} userId="user-1" supabase={fakeSupabase} />);
    fireEvent.click(screen.getByRole('button', { name: 'New Page' }));
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/slug/i)).not.toBeInTheDocument();
  });

  it('disables the Create button until a title is entered', () => {
    render(<PortfolioPagesList pages={[]} userId="user-1" supabase={fakeSupabase} />);
    fireEvent.click(screen.getByRole('button', { name: 'New Page' }));
    const createButton = screen.getByRole('button', { name: 'Create' });
    expect(createButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'New Page' } });
    expect(createButton).not.toBeDisabled();
  });

  it('generates a slug and creates the page, then calls onCreated', async () => {
    vi.spyOn(slugModule, 'generateUniqueSlug').mockResolvedValue('new-page');
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

    fireEvent.click(screen.getByRole('button', { name: 'New Page' }));
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'New Page' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => expect(onCreated).toHaveBeenCalledWith(created));
    expect(slugModule.generateUniqueSlug).toHaveBeenCalledWith(fakeSupabase, 'New Page');
    expect(crud.savePortfolioPage).toHaveBeenCalledWith(fakeSupabase, 'user-1', {
      schemaVersion: 2,
      slug: 'new-page',
      title: 'New Page',
      templateId: 'default',
      themeId: THEME_PRESETS[0]?.id,
      sections: [
        {
          id: expect.any(String),
          type: 'navbar',
          name: 'Home',
          showInNav: false,
          props: { brand: '', sticky: true },
        },
      ],
    });
  });

  it('shows an error when slug generation fails', async () => {
    vi.spyOn(slugModule, 'generateUniqueSlug').mockRejectedValue(
      new Error('Could not generate a unique page URL. Please try a different title.')
    );
    render(<PortfolioPagesList pages={[]} userId="user-1" supabase={fakeSupabase} />);

    fireEvent.click(screen.getByRole('button', { name: 'New Page' }));
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Taken' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() =>
      expect(screen.getByText(/could not generate a unique page url/i)).toBeInTheDocument()
    );
  });

  it('closes the dialog and resets the title when Cancel is clicked', async () => {
    render(<PortfolioPagesList pages={[]} userId="user-1" supabase={fakeSupabase} />);
    fireEvent.click(screen.getByRole('button', { name: 'New Page' }));
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Draft title' } });
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    // The Dialog's close is animated (default animationDuration 200ms), so the content can
    // still be mounted for a moment after the triggering click. waitFor is the disappearance
    // analog of the findBy fallback used elsewhere in this file for the dialog's open animation.
    await waitFor(() => expect(screen.queryByLabelText(/title/i)).not.toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'New Page' }));
    expect(screen.getByLabelText(/title/i)).toHaveValue('');
  });
});
