import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { RowPropertiesPanel } from './RowPropertiesPanel';
import type { SectionRow } from '../schema/types';

// NOTE on interaction pattern — verified against the real rendered markup (see
// IconField.test.tsx and task-5-report.md): `Select`'s closed trigger is a
// `<div role="button" id={id} aria-label={label}>`, not a native <select>, so it has no DOM
// "value" to drive with `fireEvent.change`. Its dropdown is a portal-rendered menu
// (`role="menu"` / `role="menuitem"`), so selecting an option means clicking the trigger open
// and then clicking the desired `menuitem`.
function makeRow(overrides: Partial<SectionRow> = {}): SectionRow {
  return {
    id: 'row1',
    items: [{ id: 'item1', component: 'heading', span: 6, props: {} }],
    ...overrides,
  };
}

describe('RowPropertiesPanel', () => {
  it('shows how many of the 12 columns are used', () => {
    render(<RowPropertiesPanel row={makeRow()} onAlignmentChange={vi.fn()} />);
    expect(screen.getByText('6 of 12 columns used')).toBeInTheDocument();
  });

  it('calls onAlignmentChange with the selected justify value', async () => {
    const onAlignmentChange = vi.fn();
    render(<RowPropertiesPanel row={makeRow()} onAlignmentChange={onAlignmentChange} />);

    fireEvent.click(screen.getByLabelText('Justify'));
    const menu = await screen.findByRole('menu');
    fireEvent.click(within(menu).getByRole('menuitem', { name: 'Center' }));

    expect(onAlignmentChange).toHaveBeenCalledWith({ justify: 'center' });
  });

  it('calls onAlignmentChange with the selected align value', async () => {
    const onAlignmentChange = vi.fn();
    render(<RowPropertiesPanel row={makeRow()} onAlignmentChange={onAlignmentChange} />);

    fireEvent.click(screen.getByLabelText('Align'));
    const menu = await screen.findByRole('menu');
    fireEvent.click(within(menu).getByRole('menuitem', { name: 'Bottom' }));

    expect(onAlignmentChange).toHaveBeenCalledWith({ align: 'bottom' });
  });

  it("reflects the row's current justify/align values as the selected options", () => {
    render(
      <RowPropertiesPanel
        row={makeRow({ justify: 'right', align: 'stretch' })}
        onAlignmentChange={vi.fn()}
      />
    );
    expect(screen.getByLabelText('Justify')).toHaveTextContent('Right');
    expect(screen.getByLabelText('Align')).toHaveTextContent('Stretch');
  });
});
