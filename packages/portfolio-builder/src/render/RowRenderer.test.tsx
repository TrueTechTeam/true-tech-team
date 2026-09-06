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
});
