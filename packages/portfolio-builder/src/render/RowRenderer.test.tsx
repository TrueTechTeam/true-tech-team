import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RowRenderer } from './RowRenderer';
import type { SectionRow } from '../schema/types';

describe('RowRenderer', () => {
  it('renders every item in the row, in order', () => {
    const row: SectionRow = {
      id: 'row-1',
      items: [
        { id: 'item-1', component: 'heading', span: 6, props: { text: 'First' } },
        { id: 'item-2', component: 'heading', span: 6, props: { text: 'Second' } },
      ],
    };
    render(<RowRenderer row={row} />);
    const headings = screen.getAllByRole('heading');
    expect(headings.map((h) => h.textContent)).toEqual(['First', 'Second']);
  });

  it('applies justify-content and align-items inline when the row sets justify/align', () => {
    const row: SectionRow = {
      id: 'row-2',
      items: [],
      justify: 'center',
      align: 'bottom',
    };
    render(<RowRenderer row={row} />);
    const rowElement = screen.getByTestId('row-2');
    expect(rowElement).toHaveStyle({ justifyContent: 'center', alignItems: 'flex-end' });
  });

  it('applies no inline justify-content/align-items when the row has neither set', () => {
    const row: SectionRow = { id: 'row-3', items: [] };
    render(<RowRenderer row={row} />);
    const rowElement = screen.getByTestId('row-3');
    expect(rowElement.style.justifyContent).toBe('');
    expect(rowElement.style.alignItems).toBe('');
  });
});
