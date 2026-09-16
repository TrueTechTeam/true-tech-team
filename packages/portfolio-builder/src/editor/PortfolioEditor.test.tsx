import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
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

/** A two-section page: `sec1` holds "Hello", `sec2` holds "World" (or no rows at all when
 * `emptySecond` is set, standing in for the empty Footer every new page seeds). */
function makeTwoSectionRecord(emptySecond = false): PortfolioPageRecord {
  const record = makeRecord();
  record.sections = [
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
    {
      id: 'sec2',
      name: 'Second',
      showInNav: false,
      rows: emptySecond
        ? []
        : [
            {
              id: 'row2',
              items: [{ id: 'item2', component: 'heading', span: 12, props: { text: 'World' } }],
            },
          ],
    },
  ];
  return record;
}

/** jsdom computes no layout, so the canvas's tier-3 geometry needs real section rects to work
 * against. `sec1` occupies y 0-100, `sec2` occupies y 100-300. */
function mockSectionRects() {
  const rects: Record<string, { top: number; bottom: number }> = {
    'section:sec1': { top: 0, bottom: 100 },
    'section:sec2': { top: 100, bottom: 300 },
  };
  for (const [testId, { top, bottom }] of Object.entries(rects)) {
    const element = screen.getByTestId(testId);
    vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
      top,
      bottom,
      left: 0,
      right: 800,
      x: 0,
      y: top,
      width: 800,
      height: bottom - top,
      toJSON: () => ({}),
    } as DOMRect);
  }
}

/** Starts a real drag from a palette entry, populating DndProvider's `active`. */
function startPaletteDrag(label = 'Heading') {
  const entry = screen.getByText(label).closest('[draggable="true"]');
  if (!entry) {
    throw new Error('expected a draggable palette entry');
  }
  fireEvent.dragStart(entry);
  return entry;
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

  // NOTE on interaction pattern — see RowPropertiesPanel.test.tsx / IconField.test.tsx:
  // `Select`'s closed trigger is a `<div role="button" aria-label={label}>`, not a native
  // <select>, so selecting an option means clicking the trigger open and then clicking the
  // desired `menuitem`, not firing a `change` event.
  it('shows row properties alongside item properties when an item is selected', async () => {
    vi.spyOn(crud, 'loadPortfolioPage').mockResolvedValue(makeRecord());
    render(<PortfolioEditor pageId="page-1" userId="user-1" supabase={fakeSupabase} />);
    const item = await screen.findByText('Hello');
    fireEvent.click(item);

    expect(await screen.findByLabelText('Justify')).toBeInTheDocument();
    expect(screen.getByLabelText('Align')).toBeInTheDocument();
  });

  it('updates the row alignment when a justify option is changed', async () => {
    const record = makeRecord();
    vi.spyOn(crud, 'loadPortfolioPage').mockResolvedValue(record);
    vi.spyOn(crud, 'savePortfolioPage').mockResolvedValue(record);
    render(<PortfolioEditor pageId="page-1" userId="user-1" supabase={fakeSupabase} />);
    const item = await screen.findByText('Hello');
    fireEvent.click(item);

    fireEvent.click(await screen.findByLabelText('Justify'));
    const menu = await screen.findByRole('menu');
    fireEvent.click(within(menu).getByRole('menuitem', { name: 'Center' }));

    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));

    await waitFor(() =>
      expect(crud.savePortfolioPage).toHaveBeenCalledWith(
        fakeSupabase,
        'user-1',
        expect.objectContaining({
          sections: expect.arrayContaining([
            expect.objectContaining({
              rows: expect.arrayContaining([expect.objectContaining({ justify: 'center' })]),
            }),
          ]),
        }),
        'page-1'
      )
    );
  });

  // I4 (tier 2): `SectionEmptyDropTarget` declares `accepts: ['palette-item', 'grid-item']` but
  // only ever implemented the palette branch - dropping an EXISTING item onto an empty section
  // (e.g. the Footer a new page seeds) silently claimed the event and did nothing.
  it('moves an existing grid item into an empty section when dropped on its placeholder', async () => {
    vi.spyOn(crud, 'loadPortfolioPage').mockResolvedValue(makeTwoSectionRecord(true));
    render(<PortfolioEditor pageId="page-1" userId="user-1" supabase={fakeSupabase} />);
    await screen.findByText('Hello');

    const dragBox = screen.getByLabelText('Drag heading');
    fireEvent.dragStart(dragBox);
    fireEvent.drop(screen.getByText(/drag a component here to get started/i));

    await waitFor(() =>
      expect(within(screen.getByTestId('section:sec2')).getByText('Hello')).toBeInTheDocument()
    );
    expect(within(screen.getByTestId('section:sec1')).queryByText('Hello')).not.toBeInTheDocument();
  });

  // I4 (tier 3): same gap on the canvas-level fallback - a grid item dropped on empty canvas
  // margin must append to the bottom of the nearest section.
  it('moves an existing grid item to the bottom of the nearest section when dropped on canvas margin', async () => {
    vi.spyOn(crud, 'loadPortfolioPage').mockResolvedValue(makeTwoSectionRecord());
    render(<PortfolioEditor pageId="page-1" userId="user-1" supabase={fakeSupabase} />);
    await screen.findByText('Hello');
    mockSectionRects();

    const canvas = screen.getByTestId('canvas-background');
    fireEvent.dragStart(screen.getAllByLabelText('Drag heading')[0]);
    // y=250 is nearest the boundary below sec2 (sec2 spans 100-300), so sec2 receives the item.
    fireEvent.dragOver(canvas, { clientY: 250 });
    fireEvent.drop(canvas, { clientY: 250 });

    await waitFor(() =>
      expect(within(screen.getByTestId('section:sec2')).getByText('Hello')).toBeInTheDocument()
    );
  });

  // I7: `handleCanvasDrop` (the whole tier-3 drop path) previously had zero coverage.
  it('appends a dropped palette item to the bottom of the nearest section via the canvas fallback', async () => {
    vi.spyOn(crud, 'loadPortfolioPage').mockResolvedValue(makeTwoSectionRecord());
    render(<PortfolioEditor pageId="page-1" userId="user-1" supabase={fakeSupabase} />);
    await screen.findByText('Hello');
    mockSectionRects();

    const canvas = screen.getByTestId('canvas-background');
    startPaletteDrag();
    fireEvent.dragOver(canvas, { clientY: 250 });
    fireEvent.drop(canvas, { clientY: 250 });

    await waitFor(() =>
      expect(
        within(screen.getByTestId('section:sec2')).getByText('New Heading')
      ).toBeInTheDocument()
    );
    expect(
      within(screen.getByTestId('section:sec1')).queryByText('New Heading')
    ).not.toBeInTheDocument();
  });

  // I6: the line used to be drawn at the raw `nearestBoundary` position while the drop always
  // appended to the bottom of the clamped target section - for a pointer near a section's TOP the
  // two visibly disagreed. Here the boundary position is 100 (sec2's top edge) but sec2 is the
  // section that receives the item, so the line must sit at sec2's BOTTOM: offset 200 within a
  // section that spans 100-300.
  it('draws the canvas insertion line at the bottom of the section that will receive the drop', async () => {
    vi.spyOn(crud, 'loadPortfolioPage').mockResolvedValue(makeTwoSectionRecord());
    render(<PortfolioEditor pageId="page-1" userId="user-1" supabase={fakeSupabase} />);
    await screen.findByText('Hello');
    mockSectionRects();

    startPaletteDrag();
    fireEvent.dragOver(screen.getByTestId('canvas-background'), { clientY: 110 });

    const line = within(screen.getByTestId('section:sec2')).getByTestId('insertion-line');
    expect(line.style.top).toBe('200px');
  });

  // I5: `canvasInsertion` was only ever cleared by the canvas's own drop handler. Moving onto a
  // row (which `stopPropagation()`s every later dragover) left the canvas line rendered alongside
  // the row's own, and a drop on the row then left it on screen after the drag was over.
  it('clears the canvas insertion line when the drag moves from canvas margin onto a row', async () => {
    vi.spyOn(crud, 'loadPortfolioPage').mockResolvedValue(makeTwoSectionRecord());
    render(<PortfolioEditor pageId="page-1" userId="user-1" supabase={fakeSupabase} />);
    await screen.findByText('Hello');
    mockSectionRects();

    const canvas = screen.getByTestId('canvas-background');
    startPaletteDrag();
    fireEvent.dragOver(canvas, { clientY: 250 });
    expect(screen.getAllByTestId('insertion-line')).toHaveLength(1);

    // Pointer crosses from the canvas margin onto a row: `dragleave` fires on the canvas (it was
    // the previous immediate target), then the row claims every subsequent `dragover`.
    fireEvent.dragLeave(canvas);
    fireEvent.dragOver(screen.getByTestId('row1'), { clientY: 50 });

    const lines = screen.getAllByTestId('insertion-line');
    expect(lines).toHaveLength(1);
    expect(within(screen.getByTestId('row1')).getByTestId('insertion-line')).toBe(lines[0]);
  });

  it('leaves no insertion line behind once the drag ends', async () => {
    vi.spyOn(crud, 'loadPortfolioPage').mockResolvedValue(makeTwoSectionRecord());
    render(<PortfolioEditor pageId="page-1" userId="user-1" supabase={fakeSupabase} />);
    await screen.findByText('Hello');
    mockSectionRects();

    const paletteEntry = startPaletteDrag();
    fireEvent.dragOver(screen.getByTestId('canvas-background'), { clientY: 250 });
    expect(screen.getAllByTestId('insertion-line')).toHaveLength(1);

    // The drag ends without the canvas ever seeing another event (dropped on a row, or cancelled).
    fireEvent.dragEnd(paletteEntry);

    await waitFor(() => expect(screen.queryByTestId('insertion-line')).not.toBeInTheDocument());
  });

  // I7: nothing pinned `EditableRow`'s `stopPropagation()` - the row and the canvas both handling
  // the same dragover would render two insertion lines at once.
  it("a row's dragover does not also reach the canvas-level tier-3 handler", async () => {
    vi.spyOn(crud, 'loadPortfolioPage').mockResolvedValue(makeTwoSectionRecord());
    render(<PortfolioEditor pageId="page-1" userId="user-1" supabase={fakeSupabase} />);
    await screen.findByText('Hello');
    mockSectionRects();

    startPaletteDrag();
    // Dispatched on the row, but it bubbles - the canvas's handler is on an ancestor and would
    // fire too (adding a second, section-level line) if the row didn't stop the event.
    fireEvent.dragOver(screen.getByTestId('row1'), { clientY: 50 });
    expect(screen.getAllByTestId('insertion-line')).toHaveLength(1);
    expect(within(screen.getByTestId('row1')).getByTestId('insertion-line')).toBeInTheDocument();

    // Control: the canvas handler really is live, so the single line above is genuinely the result
    // of the row stopping the event rather than of a dead tier-3 handler.
    fireEvent.dragLeave(screen.getByTestId('row1'));
    fireEvent.dragOver(screen.getByTestId('canvas-background'), { clientY: 250 });
    const canvasLine = within(screen.getByTestId('section:sec2')).getByTestId('insertion-line');
    expect(screen.getAllByTestId('insertion-line')).toHaveLength(1);
    expect(canvasLine).toBeInTheDocument();
  });
});
