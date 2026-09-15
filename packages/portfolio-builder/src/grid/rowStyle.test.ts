import { describe, it, expect } from 'vitest';
import { rowAlignmentStyle } from './rowStyle';
import type { SectionRow } from '../schema/types';

function makeRow(overrides: Partial<SectionRow> = {}): SectionRow {
  return { id: 'row-1', items: [], ...overrides };
}

describe('rowAlignmentStyle', () => {
  it('returns an empty style object when neither justify nor align is set', () => {
    expect(rowAlignmentStyle(makeRow())).toEqual({});
  });

  it('maps every RowJustify value to its CSS justify-content value', () => {
    expect(rowAlignmentStyle(makeRow({ justify: 'left' }))).toEqual({
      justifyContent: 'flex-start',
    });
    expect(rowAlignmentStyle(makeRow({ justify: 'center' }))).toEqual({
      justifyContent: 'center',
    });
    expect(rowAlignmentStyle(makeRow({ justify: 'right' }))).toEqual({
      justifyContent: 'flex-end',
    });
    expect(rowAlignmentStyle(makeRow({ justify: 'space-between' }))).toEqual({
      justifyContent: 'space-between',
    });
  });

  it('maps every RowAlign value to its CSS align-items value', () => {
    expect(rowAlignmentStyle(makeRow({ align: 'top' }))).toEqual({ alignItems: 'flex-start' });
    expect(rowAlignmentStyle(makeRow({ align: 'center' }))).toEqual({ alignItems: 'center' });
    expect(rowAlignmentStyle(makeRow({ align: 'bottom' }))).toEqual({ alignItems: 'flex-end' });
    expect(rowAlignmentStyle(makeRow({ align: 'stretch' }))).toEqual({ alignItems: 'stretch' });
  });

  it('combines justify and align when both are set', () => {
    expect(rowAlignmentStyle(makeRow({ justify: 'center', align: 'bottom' }))).toEqual({
      justifyContent: 'center',
      alignItems: 'flex-end',
    });
  });
});
