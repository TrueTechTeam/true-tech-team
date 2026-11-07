import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { SupabaseClient } from '@supabase/supabase-js';
import { PortfolioEditor } from './PortfolioEditor';
import * as crud from '../pages/crud';
import { CURRENT_SCHEMA_VERSION, PRE_PIVOT_SCHEMA_VERSION } from '../schema/types';
import type { PortfolioPageRecord } from '../pages/types';

const fakeSupabase = {} as SupabaseClient;

function makeRecord(overrides: Partial<PortfolioPageRecord> = {}): PortfolioPageRecord {
  return {
    id: 'page-1',
    userId: 'user-1',
    slug: 'jtrue',
    title: 'Justin True',
    templateId: 'default',
    published: false,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    sections: [
      { id: 'sec-nav', type: 'navbar', name: 'Home', showInNav: false, props: { brand: 'JT' } },
      {
        id: 'sec-header',
        type: 'header',
        name: 'Intro',
        showInNav: true,
        props: {
          heading: 'Your name here',
          subheading: '',
          backgroundImage: '',
          align: 'left',
          ctas: [],
        },
      },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function renderEditor() {
  return render(<PortfolioEditor pageId="page-1" userId="user-1" supabase={fakeSupabase} />);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('PortfolioEditor — back button', () => {
  it('links to the page list with an accessible name, rather than using history', async () => {
    vi.spyOn(crud, 'loadPortfolioPage').mockResolvedValue(makeRecord());
    renderEditor();
    const back = await screen.findByRole('link', { name: 'Back to pages' });
    expect(back).toHaveAttribute('href', '/portfolio-builder');
  });
});

describe('PortfolioEditor — load states', () => {
  it('renders the page content once loaded', async () => {
    vi.spyOn(crud, 'loadPortfolioPage').mockResolvedValue(makeRecord());
    renderEditor();
    expect(await screen.findByText('Your name here')).toBeInTheDocument();
  });

  it('shows a not-found message when the record belongs to a different user', async () => {
    vi.spyOn(crud, 'loadPortfolioPage').mockResolvedValue(makeRecord({ userId: 'someone-else' }));
    renderEditor();
    expect(await screen.findByText(/doesn.t exist or you don.t have access/i)).toBeInTheDocument();
  });

  it('shows a not-found message when the page does not exist', async () => {
    vi.spyOn(crud, 'loadPortfolioPage').mockResolvedValue(null);
    renderEditor();
    expect(await screen.findByText(/doesn.t exist or you don.t have access/i)).toBeInTheDocument();
  });

  it('shows an error message when loading fails', async () => {
    vi.spyOn(crud, 'loadPortfolioPage').mockRejectedValue(new Error('network error'));
    renderEditor();
    expect(await screen.findByText(/couldn.t load this page/i)).toBeInTheDocument();
  });

  // Spec 8: the pre-pivot gate
  it('blocks editing of a pre-pivot page with an explanation and no editor controls', async () => {
    vi.spyOn(crud, 'loadPortfolioPage').mockResolvedValue(
      makeRecord({ schemaVersion: PRE_PIVOT_SCHEMA_VERSION })
    );
    renderEditor();
    expect(await screen.findByText(/earlier version of the builder/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add Section' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^save$/i })).not.toBeInTheDocument();
  });
});

describe('PortfolioEditor — editing', () => {
  async function ready() {
    vi.spyOn(crud, 'loadPortfolioPage').mockResolvedValue(makeRecord());
    renderEditor();
    await screen.findByText('Your name here');
  }

  it('lists the page sections in the sidebar', async () => {
    await ready();
    expect(screen.getByRole('button', { name: '1. Home' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2. Intro' })).toBeInTheDocument();
  });

  it('prompts to select a section before one is chosen', async () => {
    await ready();
    expect(screen.getByText(/select a section to edit/i)).toBeInTheDocument();
  });

  it('opens a section form when a sidebar row is selected', async () => {
    await ready();
    fireEvent.click(screen.getByRole('button', { name: '2. Intro' }));
    expect(screen.getByLabelText('Section name')).toHaveValue('Intro');
    expect(screen.getByLabelText(/^Heading/)).toHaveValue('Your name here');
  });

  it('opens a section form when the section is clicked in the canvas', async () => {
    await ready();
    fireEvent.click(screen.getByTestId('canvas-section-sec-header'));
    expect(screen.getByLabelText('Section name')).toHaveValue('Intro');
  });

  it('reflects a content edit in the live canvas', async () => {
    await ready();
    fireEvent.click(screen.getByRole('button', { name: '2. Intro' }));
    fireEvent.change(screen.getByLabelText(/^Heading/), { target: { value: 'Jane Doe' } });
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  it('reflects a section rename in the sidebar', async () => {
    await ready();
    fireEvent.click(screen.getByRole('button', { name: '2. Intro' }));
    fireEvent.change(screen.getByLabelText('Section name'), { target: { value: 'About' } });
    expect(screen.getByRole('button', { name: '2. About' })).toBeInTheDocument();
  });

  it('reorders a section from the sidebar', async () => {
    await ready();
    fireEvent.click(screen.getByRole('button', { name: 'Move Intro up (section 2)' }));
    expect(screen.getByRole('button', { name: '1. Intro' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2. Home' })).toBeInTheDocument();
  });

  it('adds a section from the catalog', async () => {
    await ready();
    fireEvent.click(screen.getByRole('button', { name: 'Add Section' }));
    fireEvent.click(screen.getByRole('button', { name: /^header$/i }));
    expect(screen.getByRole('button', { name: '3. Header' })).toBeInTheDocument();
  });

  it('removes a section after confirmation', async () => {
    await ready();
    fireEvent.click(screen.getByRole('button', { name: 'Remove Intro (section 2)' }));
    fireEvent.click(screen.getByRole('button', { name: 'Remove' }));
    expect(screen.queryByRole('button', { name: '2. Intro' })).not.toBeInTheDocument();
  });
});

describe('PortfolioEditor — saving and publishing', () => {
  async function ready() {
    vi.spyOn(crud, 'loadPortfolioPage').mockResolvedValue(makeRecord());
    renderEditor();
    await screen.findByText('Your name here');
  }

  it('saves and shows a saved state', async () => {
    await ready();
    vi.spyOn(crud, 'savePortfolioPage').mockResolvedValue(makeRecord());
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));
    await waitFor(() => expect(crud.savePortfolioPage).toHaveBeenCalled());
    expect(await screen.findByText(/saved/i)).toBeInTheDocument();
  });

  it('shows a save error', async () => {
    await ready();
    vi.spyOn(crud, 'savePortfolioPage').mockRejectedValue(new Error('Slug taken'));
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));
    expect(await screen.findByText('Slug taken')).toBeInTheDocument();
  });

  // Review Focus 4 reaching the UI
  it('lists validation errors instead of saving an invalid page', async () => {
    vi.spyOn(crud, 'loadPortfolioPage').mockResolvedValue(
      makeRecord({
        sections: [
          {
            id: 'sec-header',
            type: 'header',
            name: 'Intro',
            showInNav: true,
            props: { heading: '', subheading: '', backgroundImage: '', align: 'left', ctas: [] },
          },
        ],
      })
    );
    const save = vi.spyOn(crud, 'savePortfolioPage').mockResolvedValue(makeRecord());
    renderEditor();
    await screen.findByRole('button', { name: '1. Intro' });

    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));

    expect(await screen.findByText(/heading/i)).toBeInTheDocument();
    expect(save).not.toHaveBeenCalled();
  });

  it('publishes from page settings and shows the public URL', async () => {
    await ready();
    vi.spyOn(crud, 'setPortfolioPagePublished').mockResolvedValue(makeRecord({ published: true }));
    fireEvent.click(screen.getByRole('button', { name: /settings/i }));
    fireEvent.click(screen.getByLabelText(/publish/i));
    await waitFor(() =>
      expect(crud.setPortfolioPagePublished).toHaveBeenCalledWith(fakeSupabase, 'page-1', true)
    );
    expect(await screen.findByRole('link', { name: /\/p\/jtrue/ })).toBeInTheDocument();
  });

  it('blocks publishing while there are unsaved changes', async () => {
    await ready();
    fireEvent.click(screen.getByRole('button', { name: '2. Intro' }));
    fireEvent.change(screen.getByLabelText(/^Heading/), { target: { value: 'Dirty' } });
    fireEvent.click(screen.getByRole('button', { name: /settings/i }));
    expect(screen.getByLabelText(/publish/i)).toBeDisabled();
    expect(screen.getByText(/save your changes before publishing/i)).toBeInTheDocument();
  });

  it('changes the theme from page settings and applies it to the canvas', async () => {
    await ready();
    fireEvent.click(screen.getByRole('button', { name: /settings/i }));
    // findBy, not getBy: the Dialog mounts its content behind an enter animation (it reports
    // data-state="entering" first), so a synchronous query can run before the ThemeDropdown
    // trigger exists.
    //
    // The name is anchored exactly, not /^slate /. Library 1.3.0 tightened the Dropdown's
    // accessible-name computation so the decorative colour swatches no longer leak into it: the
    // trigger is now named exactly "Slate" rather than "Slate " plus swatch text.
    await userEvent.click(await screen.findByRole('button', { name: /^slate$/i }));
    await userEvent.click(screen.getByText('Coral Reef'));
    await waitFor(() =>
      expect(screen.getByTestId('canvas-background')).toHaveStyle({
        '--theme-primary': 'var(--color-coral-500)',
      })
    );
  });

  it('toggles the preview dialog', async () => {
    await ready();
    expect(screen.queryByTitle('Portfolio preview')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /preview/i }));
    expect(await screen.findByTitle('Portfolio preview')).toBeInTheDocument();
  });
});
