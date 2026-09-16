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

  it('shows a placeholder in the side panel instead of a property panel when nothing is selected', async () => {
    vi.spyOn(crud, 'loadPortfolioPage').mockResolvedValue(makeRecord());
    render(<PortfolioEditor pageId="page-1" userId="user-1" supabase={fakeSupabase} />);
    await screen.findByText('Hello');
    expect(screen.queryByLabelText('Width')).not.toBeInTheDocument();
    expect(screen.getByText('Select an item to edit its properties')).toBeInTheDocument();
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

    // The dropdown defaults to the first theme preset ("Slate") when the page has no themeId
    // of its own, so its trigger already reads "Slate" before any selection is made here.
    // Select a different preset so the test can verify a genuine change, not a no-op re-click.
    await userEvent.click(screen.getByRole('button', { name: /^slate /i }));
    await userEvent.click(screen.getByText('Coral Reef'));

    // No direct assertion on internal state — verify indirectly via a re-render effect: the
    // theme dropdown's trigger should now show the newly selected preset's name.
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /coral reef/i })).toBeInTheDocument()
    );
  });

  it("applies the page's resolved theme colors as scoped CSS variables on the canvas", async () => {
    const record = makeRecord();
    record.themeOverride = { colors: { primary: 'var(--color-blue-500)' } };
    vi.spyOn(crud, 'loadPortfolioPage').mockResolvedValue(record);
    render(<PortfolioEditor pageId="page-1" userId="user-1" supabase={fakeSupabase} />);
    await screen.findByText('Hello');

    expect(screen.getByTestId('canvas-background')).toHaveStyle({
      '--theme-primary': 'var(--color-blue-500)',
    });
  });

  it('updates the canvas theme variables when a different theme preset is selected', async () => {
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

  // F1: the Palette must actually be rendered somewhere the editor's DndProvider (via
  // PageDragDropContainer) can reach - otherwise dragging a palette entry onto the canvas is
  // impossible even though both pieces exist in isolation.
  it('renders the component palette so items can be dragged onto the canvas', async () => {
    vi.spyOn(crud, 'loadPortfolioPage').mockResolvedValue(makeRecord());
    render(<PortfolioEditor pageId="page-1" userId="user-1" supabase={fakeSupabase} />);
    await screen.findByText('Hello');

    expect(screen.getByText('Heading')).toBeInTheDocument();
    expect(screen.getByText('Button')).toBeInTheDocument();
  });

  // F2: a brand-new page (one empty section, no rows) must render a droppable, non-broken-looking
  // canvas rather than an empty void.
  it('renders a drop zone and empty-state message for a page with an empty section', async () => {
    const record = makeRecord();
    record.sections = [{ id: 'sec1', name: 'Main', showInNav: false, rows: [] }];
    vi.spyOn(crud, 'loadPortfolioPage').mockResolvedValue(record);
    render(<PortfolioEditor pageId="page-1" userId="user-1" supabase={fakeSupabase} />);

    expect(await screen.findByText(/drag a component here to get started/i)).toBeInTheDocument();
  });

  // F4: `selectedItem` is a fresh object literal every render, so PropertyPanel must be keyed by
  // selection (not left to re-render in place) or its internally-tracked validation errors get
  // wiped moments after being set. This only manifests through PortfolioEditor's render pattern -
  // a standalone PropertyPanel test can't catch it.
  it('keeps a validation error visible after clearing a required field', async () => {
    vi.spyOn(crud, 'loadPortfolioPage').mockResolvedValue(makeRecord());
    render(<PortfolioEditor pageId="page-1" userId="user-1" supabase={fakeSupabase} />);
    const item = await screen.findByText('Hello');
    fireEvent.click(item);

    const textField = await screen.findByLabelText(/^Text/);
    fireEvent.change(textField, { target: { value: '' } });

    expect(await screen.findByText('text is required and must be a string')).toBeInTheDocument();
  });

  // F5/F6: a record that resolves successfully but belongs to another user must be treated the
  // same as "not found", not silently loaded into the current user's editor.
  it('shows a not-found message when the loaded record belongs to a different user', async () => {
    const record = makeRecord();
    record.userId = 'someone-else';
    vi.spyOn(crud, 'loadPortfolioPage').mockResolvedValue(record);
    render(<PortfolioEditor pageId="page-1" userId="user-1" supabase={fakeSupabase} />);

    expect(await screen.findByText(/doesn.t exist or you don.t have access/i)).toBeInTheDocument();
    expect(screen.queryByText('Hello')).not.toBeInTheDocument();
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

  // F10: once saved, further edits should un-stick the "Saved" indicator since there are once
  // again unsaved changes.
  it('resets the save indicator back to idle after a further edit', async () => {
    const record = makeRecord();
    vi.spyOn(crud, 'loadPortfolioPage').mockResolvedValue(record);
    vi.spyOn(crud, 'savePortfolioPage').mockResolvedValue(record);
    render(<PortfolioEditor pageId="page-1" userId="user-1" supabase={fakeSupabase} />);
    await screen.findByText('Hello');

    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));
    expect(await screen.findByText(/saved/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText('Hello'));
    const textField = await screen.findByLabelText(/^Text/);
    fireEvent.change(textField, { target: { value: 'Changed' } });

    await waitFor(() => expect(screen.queryByText(/^saved$/i)).not.toBeInTheDocument());
  });

  it('marks the canvas as drag-active while something is being dragged', async () => {
    vi.spyOn(crud, 'loadPortfolioPage').mockResolvedValue(makeRecord());
    render(<PortfolioEditor pageId="page-1" userId="user-1" supabase={fakeSupabase} />);
    await screen.findByText('Hello');

    const canvas = screen.getByTestId('canvas-background');
    expect(canvas).not.toHaveAttribute('data-drag-active', 'true');

    const paletteHeading = screen.getByText('Heading').closest('[draggable="true"]');
    if (!paletteHeading) {
      throw new Error('expected a draggable palette entry');
    }
    fireEvent.dragStart(paletteHeading);
    expect(canvas).toHaveAttribute('data-drag-active', 'true');

    fireEvent.dragEnd(paletteHeading);
    expect(canvas).not.toHaveAttribute('data-drag-active', 'true');
  });

  it('appends a dropped palette item to the end of an empty section via the section-level fallback', async () => {
    const record = makeRecord();
    record.sections = [{ id: 'sec1', name: 'Body', showInNav: false, rows: [] }];
    vi.spyOn(crud, 'loadPortfolioPage').mockResolvedValue(record);
    render(<PortfolioEditor pageId="page-1" userId="user-1" supabase={fakeSupabase} />);

    const placeholder = await screen.findByText(/drag a component here to get started/i);
    const paletteHeading = screen.getByText('Heading').closest('[draggable="true"]');
    if (!paletteHeading) {
      throw new Error('expected a draggable palette entry');
    }
    fireEvent.dragStart(paletteHeading);
    fireEvent.drop(placeholder);

    await waitFor(() =>
      expect(screen.queryByText(/drag a component here to get started/i)).not.toBeInTheDocument()
    );
  });
});
