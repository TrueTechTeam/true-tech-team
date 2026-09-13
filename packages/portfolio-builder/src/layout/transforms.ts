import type { PortfolioPage, SectionRow, GridItem } from '../schema/types';

export function getRowRemainingCapacity(row: SectionRow, excludeItemId?: string): number {
  const used = row.items
    .filter((item) => item.id !== excludeItemId)
    .reduce((sum, item) => sum + item.span, 0);
  return 12 - used;
}

interface ItemLocation {
  sectionIndex: number;
  rowIndex: number;
  itemIndex: number;
}

function findItemLocation(page: PortfolioPage, itemId: string): ItemLocation | undefined {
  for (let sectionIndex = 0; sectionIndex < page.sections.length; sectionIndex++) {
    const section = page.sections[sectionIndex];
    for (let rowIndex = 0; rowIndex < section.rows.length; rowIndex++) {
      const row = section.rows[rowIndex];
      const itemIndex = row.items.findIndex((item) => item.id === itemId);
      if (itemIndex !== -1) {
        return { sectionIndex, rowIndex, itemIndex };
      }
    }
  }
  return undefined;
}

export function insertItemInRow(
  page: PortfolioPage,
  sectionId: string,
  rowId: string,
  index: number,
  item: GridItem
): PortfolioPage {
  const sectionIndex = page.sections.findIndex((s) => s.id === sectionId);
  if (sectionIndex === -1) {
    throw new Error(`Section not found: ${sectionId}`);
  }
  const section = page.sections[sectionIndex];
  const rowIndex = section.rows.findIndex((r) => r.id === rowId);
  if (rowIndex === -1) {
    throw new Error(`Row not found: ${rowId}`);
  }
  const row = section.rows[rowIndex];
  if (item.span > getRowRemainingCapacity(row)) {
    throw new Error(`Row ${rowId} does not have capacity for span ${item.span}`);
  }

  const newItems = [...row.items];
  newItems.splice(index, 0, item);
  const newRows = [...section.rows];
  newRows[rowIndex] = { ...row, items: newItems };
  const newSections = [...page.sections];
  newSections[sectionIndex] = { ...section, rows: newRows };
  return { ...page, sections: newSections };
}

export function insertItemInNewRow(
  page: PortfolioPage,
  sectionId: string,
  index: number,
  item: GridItem
): PortfolioPage {
  const sectionIndex = page.sections.findIndex((s) => s.id === sectionId);
  if (sectionIndex === -1) {
    throw new Error(`Section not found: ${sectionId}`);
  }
  const section = page.sections[sectionIndex];
  const newRow: SectionRow = { id: crypto.randomUUID(), items: [item] };
  const newRows = [...section.rows];
  newRows.splice(index, 0, newRow);
  const newSections = [...page.sections];
  newSections[sectionIndex] = { ...section, rows: newRows };
  return { ...page, sections: newSections };
}

function removeItemInternal(
  page: PortfolioPage,
  itemId: string
): { page: PortfolioPage; item: GridItem } {
  const location = findItemLocation(page, itemId);
  if (!location) {
    throw new Error(`Item not found: ${itemId}`);
  }
  const { sectionIndex, rowIndex, itemIndex } = location;
  const section = page.sections[sectionIndex];
  const row = section.rows[rowIndex];
  const item = row.items[itemIndex];

  const newItems = row.items.filter((_, i) => i !== itemIndex);
  const newRows =
    newItems.length === 0
      ? section.rows.filter((_, i) => i !== rowIndex)
      : section.rows.map((r, i) => (i === rowIndex ? { ...r, items: newItems } : r));
  const newSections = [...page.sections];
  newSections[sectionIndex] = { ...section, rows: newRows };
  return { page: { ...page, sections: newSections }, item };
}

export function removeItem(page: PortfolioPage, itemId: string): PortfolioPage {
  return removeItemInternal(page, itemId).page;
}

export function moveItem(
  page: PortfolioPage,
  itemId: string,
  targetSectionId: string,
  targetRowId: string,
  targetIndex: number
): PortfolioPage {
  const location = findItemLocation(page, itemId);
  if (!location) {
    throw new Error(`Item not found: ${itemId}`);
  }
  const sourceSection = page.sections[location.sectionIndex];
  const sourceRow = sourceSection.rows[location.rowIndex];
  const item = sourceRow.items[location.itemIndex];

  if (sourceSection.id === targetSectionId && sourceRow.id === targetRowId) {
    const itemsWithoutMoved = sourceRow.items.filter((i) => i.id !== itemId);
    const newItems = [...itemsWithoutMoved];
    newItems.splice(targetIndex, 0, item);
    const newRows = [...sourceSection.rows];
    newRows[location.rowIndex] = { ...sourceRow, items: newItems };
    const newSections = [...page.sections];
    newSections[location.sectionIndex] = { ...sourceSection, rows: newRows };
    return { ...page, sections: newSections };
  }

  const targetSection = page.sections.find((s) => s.id === targetSectionId);
  if (!targetSection) {
    throw new Error(`Section not found: ${targetSectionId}`);
  }
  const targetRow = targetSection.rows.find((r) => r.id === targetRowId);
  if (!targetRow) {
    throw new Error(`Row not found: ${targetRowId}`);
  }
  if (item.span > getRowRemainingCapacity(targetRow)) {
    throw new Error(`Row ${targetRowId} does not have capacity for span ${item.span}`);
  }

  const { page: pageAfterRemoval } = removeItemInternal(page, itemId);
  return insertItemInRow(pageAfterRemoval, targetSectionId, targetRowId, targetIndex, item);
}

export function updateItemProps(
  page: PortfolioPage,
  itemId: string,
  props: Record<string, unknown>
): PortfolioPage {
  const location = findItemLocation(page, itemId);
  if (!location) {
    throw new Error(`Item not found: ${itemId}`);
  }
  const { sectionIndex, rowIndex, itemIndex } = location;
  const section = page.sections[sectionIndex];
  const row = section.rows[rowIndex];
  const newItems = row.items.map((item, i) => (i === itemIndex ? { ...item, props } : item));
  const newRows = section.rows.map((r, i) => (i === rowIndex ? { ...r, items: newItems } : r));
  const newSections = [...page.sections];
  newSections[sectionIndex] = { ...section, rows: newRows };
  return { ...page, sections: newSections };
}

export function updateItemSpan(page: PortfolioPage, itemId: string, span: number): PortfolioPage {
  const location = findItemLocation(page, itemId);
  if (!location) {
    throw new Error(`Item not found: ${itemId}`);
  }
  const { sectionIndex, rowIndex, itemIndex } = location;
  const section = page.sections[sectionIndex];
  const row = section.rows[rowIndex];
  const maxSpan = Math.max(1, getRowRemainingCapacity(row, itemId));
  const clampedSpan = Math.min(12, Math.max(1, Math.round(span)), maxSpan);
  const newItems = row.items.map((item, i) =>
    i === itemIndex ? { ...item, span: clampedSpan } : item
  );
  const newRows = section.rows.map((r, i) => (i === rowIndex ? { ...r, items: newItems } : r));
  const newSections = [...page.sections];
  newSections[sectionIndex] = { ...section, rows: newRows };
  return { ...page, sections: newSections };
}

export function moveItemToNewRow(
  page: PortfolioPage,
  itemId: string,
  targetSectionId: string,
  targetIndex: number
): PortfolioPage {
  const location = findItemLocation(page, itemId);
  if (!location) {
    throw new Error(`Item not found: ${itemId}`);
  }
  const sourceSection = page.sections[location.sectionIndex];
  const sourceRow = sourceSection.rows[location.rowIndex];
  const item = sourceRow.items[location.itemIndex];
  const sourceRowWillBePruned = sourceRow.items.length === 1;

  const { page: pageAfterRemoval } = removeItemInternal(page, itemId);

  const adjustedTargetIndex =
    sourceSection.id === targetSectionId && sourceRowWillBePruned && location.rowIndex < targetIndex
      ? targetIndex - 1
      : targetIndex;

  return insertItemInNewRow(pageAfterRemoval, targetSectionId, adjustedTargetIndex, item);
}
