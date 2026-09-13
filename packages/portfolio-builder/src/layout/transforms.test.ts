import { describe, it, expect } from 'vitest';
import type { PortfolioPage } from '../schema/types';
import {
  getRowRemainingCapacity,
  insertItemInRow,
  insertItemInNewRow,
  moveItem,
  moveItemToNewRow,
  removeItem,
  updateItemProps,
  updateItemSpan,
} from './transforms';

function fixturePage(): PortfolioPage {
  return {
    schemaVersion: 1,
    slug: 'test',
    title: 'Test Page',
    templateId: 'test',
    showNav: false,
    sections: [
      {
        id: 'sec1',
        name: 'Section 1',
        showInNav: false,
        rows: [
          {
            id: 'row1',
            items: [
              { id: 'item1', component: 'heading', span: 6, props: { text: 'A' } },
              { id: 'item2', component: 'text', span: 6, props: { text: 'B' } },
            ],
          },
          {
            id: 'row2',
            items: [{ id: 'item3', component: 'spacer', span: 12, props: { height: 24 } }],
          },
        ],
      },
      {
        id: 'sec2',
        name: 'Section 2',
        showInNav: false,
        rows: [
          {
            id: 'row3',
            items: [{ id: 'item4', component: 'badge', span: 4, props: { label: 'X' } }],
          },
        ],
      },
      {
        id: 'sec3',
        name: 'Section 3',
        showInNav: false,
        rows: [
          {
            id: 'row5',
            items: [{ id: 'item6', component: 'chip', span: 2, props: { label: 'Z' } }],
          },
        ],
      },
    ],
  };
}

describe('getRowRemainingCapacity', () => {
  it('returns 12 minus the sum of item spans', () => {
    const page = fixturePage();
    expect(getRowRemainingCapacity(page.sections[0].rows[0])).toBe(0);
    expect(getRowRemainingCapacity(page.sections[0].rows[1])).toBe(0);
    expect(getRowRemainingCapacity(page.sections[1].rows[0])).toBe(8);
  });

  it('excludes the given item id from the sum', () => {
    const page = fixturePage();
    expect(getRowRemainingCapacity(page.sections[0].rows[0], 'item1')).toBe(6);
  });
});

describe('insertItemInRow', () => {
  it('inserts an item at the given index when capacity allows', () => {
    const page = fixturePage();
    const newItem = { id: 'new1', component: 'badge' as const, span: 8, props: { label: 'Y' } };
    const result = insertItemInRow(page, 'sec2', 'row3', 1, newItem);
    expect(result.sections[1].rows[0].items).toEqual([
      { id: 'item4', component: 'badge', span: 4, props: { label: 'X' } },
      newItem,
    ]);
    // original page unchanged
    expect(page.sections[1].rows[0].items).toHaveLength(1);
  });

  it('throws when the row lacks capacity', () => {
    const page = fixturePage();
    const newItem = { id: 'new1', component: 'badge' as const, span: 9, props: { label: 'Y' } };
    expect(() => insertItemInRow(page, 'sec2', 'row3', 1, newItem)).toThrow(/capacity/i);
  });
});

describe('insertItemInNewRow', () => {
  it('creates a fresh row at the given index', () => {
    const page = fixturePage();
    const newItem = { id: 'new1', component: 'badge' as const, span: 12, props: { label: 'Y' } };
    const result = insertItemInNewRow(page, 'sec1', 1, newItem);
    expect(result.sections[0].rows).toHaveLength(3);
    expect(result.sections[0].rows[1].items).toEqual([newItem]);
    expect(typeof result.sections[0].rows[1].id).toBe('string');
    expect(result.sections[0].rows[1].id.length).toBeGreaterThan(0);
  });
});

describe('moveItem', () => {
  it('reorders within the same row', () => {
    const page = fixturePage();
    const result = moveItem(page, 'item1', 'sec1', 'row1', 1);
    expect(result.sections[0].rows[0].items.map((i) => i.id)).toEqual(['item2', 'item1']);
  });

  it('throws and leaves the page unchanged when moving to a different row in the same section lacks capacity', () => {
    // row1 is already full (item1 span6 + item2 span6 = 12), so moving item3
    // (span12) from row2 into row1 must be rejected, not silently overflow it.
    const page = fixturePage();
    expect(() => moveItem(page, 'item3', 'sec1', 'row1', 0)).toThrow(/capacity/i);
    expect(page.sections[0].rows).toHaveLength(2);
    expect(page.sections[0].rows[1].items.map((i) => i.id)).toEqual(['item3']);
  });

  it('moves an item across sections into an existing row with capacity', () => {
    const page = fixturePage();
    const result = moveItem(page, 'item4', 'sec3', 'row5', 1);
    // row3 (source) is now empty and deleted
    expect(result.sections[1].rows).toHaveLength(0);
    expect(result.sections[2].rows[0].items.map((i) => i.id)).toEqual(['item6', 'item4']);
  });

  it('throws and leaves the page unchanged when moving across sections lacks capacity', () => {
    // row2 is already full (item3 span12), so moving item4 (span4) from
    // sec2/row3 into it must be rejected, not silently overflow it.
    const page = fixturePage();
    expect(() => moveItem(page, 'item4', 'sec1', 'row2', 1)).toThrow(/capacity/i);
    expect(page.sections[1].rows[0].items.map((i) => i.id)).toEqual(['item4']);
    expect(page.sections[0].rows[1].items.map((i) => i.id)).toEqual(['item3']);
  });

  it('throws and leaves the page unchanged when the target lacks capacity', () => {
    const page = fixturePage();
    expect(() => moveItem(page, 'item4', 'sec1', 'row1', 0)).toThrow(/capacity/i);
    // page passed in is untouched (function throws before mutating anything)
    expect(page.sections[0].rows[0].items).toHaveLength(2);
    expect(page.sections[1].rows[0].items).toHaveLength(1);
  });
});

describe('moveItemToNewRow', () => {
  it('removes the item from its source row and creates a fresh row for it', () => {
    const page = fixturePage();
    const result = moveItemToNewRow(page, 'item1', 'sec2', 1);
    expect(result.sections[0].rows[0].items.map((i) => i.id)).toEqual(['item2']);
    expect(result.sections[1].rows).toHaveLength(2);
    expect(result.sections[1].rows[1].items.map((i) => i.id)).toEqual(['item1']);
  });

  it('adjusts the target index when the source row is pruned and precedes the target', () => {
    // Section rows: [r0(only itemX), r1(itemY), r2(itemZ)]. Dropping itemX on the gap between
    // r1 and r2 (rendered index 2, computed pre-removal) should produce [r1, itemX-row, r2] —
    // not [r1, r2, itemX-row] — since pruning r0 shifts r1/r2 down by one first.
    const page: PortfolioPage = {
      schemaVersion: 1,
      slug: 'test',
      title: 'Test Page',
      templateId: 'test',
      showNav: false,
      sections: [
        {
          id: 'sec1',
          name: 'Section 1',
          showInNav: false,
          rows: [
            { id: 'r0', items: [{ id: 'itemX', component: 'heading', span: 6, props: {} }] },
            { id: 'r1', items: [{ id: 'itemY', component: 'text', span: 6, props: {} }] },
            { id: 'r2', items: [{ id: 'itemZ', component: 'badge', span: 6, props: {} }] },
          ],
        },
      ],
    };

    const result = moveItemToNewRow(page, 'itemX', 'sec1', 2);

    expect(result.sections[0].rows.map((r) => r.items.map((i) => i.id))).toEqual([
      ['itemY'],
      ['itemX'],
      ['itemZ'],
    ]);
  });
});

describe('removeItem', () => {
  it('removes an item, leaving its row intact when other items remain', () => {
    const page = fixturePage();
    const result = removeItem(page, 'item1');
    expect(result.sections[0].rows[0].items.map((i) => i.id)).toEqual(['item2']);
  });

  it('deletes the row when removing its last item', () => {
    const page = fixturePage();
    const result = removeItem(page, 'item3');
    expect(result.sections[0].rows).toHaveLength(1);
  });
});

describe('updateItemProps', () => {
  it('replaces the item props entirely', () => {
    const page = fixturePage();
    const result = updateItemProps(page, 'item1', { text: 'Updated' });
    expect(result.sections[0].rows[0].items[0].props).toEqual({ text: 'Updated' });
    // original page unchanged
    expect(page.sections[0].rows[0].items[0].props).toEqual({ text: 'A' });
  });

  it('throws when the item is not found', () => {
    const page = fixturePage();
    expect(() => updateItemProps(page, 'does-not-exist', {})).toThrow(/not found/i);
  });
});

describe('updateItemSpan', () => {
  it('sets the span when there is enough room in the row', () => {
    const page = fixturePage();
    // sec2/row3 has item4 (span 4) alone — plenty of room
    const result = updateItemSpan(page, 'item4', 8);
    expect(result.sections[1].rows[0].items[0].span).toBe(8);
  });

  it('clamps to the row remaining capacity when the request would overflow', () => {
    const page = fixturePage();
    // sec2/row3 has only item4 (span 4) — max valid span for item4 alone is 12
    const result = updateItemSpan(page, 'item4', 20);
    expect(result.sections[1].rows[0].items[0].span).toBe(12);
  });

  it('clamps down when growing would push a row with siblings over 12', () => {
    const page = fixturePage();
    // sec1/row1 has item1 (span 6) + item2 (span 6) — item1 can grow to at most 6
    // (12 total - item2's span 6), even though it requests 10
    const result = updateItemSpan(page, 'item1', 10);
    expect(result.sections[0].rows[0].items[0].span).toBe(6);
  });

  it('clamps up to a minimum of 1', () => {
    const page = fixturePage();
    const result = updateItemSpan(page, 'item4', 0);
    expect(result.sections[1].rows[0].items[0].span).toBe(1);
  });

  it('never throws', () => {
    const page = fixturePage();
    expect(() => updateItemSpan(page, 'item1', 999)).not.toThrow();
  });
});
