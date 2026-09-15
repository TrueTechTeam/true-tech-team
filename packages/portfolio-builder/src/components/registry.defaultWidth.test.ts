import { describe, it, expect } from 'vitest';
import { getRegistryEntry } from './registry';
import { COMPONENT_TYPES } from '../schema/types';

const EXPECTED_DEFAULT_WIDTHS: Record<string, number> = {
  heading: 6,
  text: 6,
  image: 6,
  spacer: 12,
  card: 4,
  badge: 2,
  avatar: 1,
  chip: 2,
  pill: 2,
  icon: 1,
  statusIndicator: 3,
  progressBar: 4,
  circularProgress: 3,
  kpi: 3,
  countUp: 3,
  reveal: 12,
  collapse: 12,
  flipCard: 4,
  carousel: 12,
  overflowText: 6,
  truncatedList: 6,
  button: 3,
  iconButton: 1,
  accordion: 12,
  tabs: 12,
};

describe('registry defaultWidth', () => {
  it('has the expected defaultWidth for every component type', () => {
    for (const type of COMPONENT_TYPES) {
      const entry = getRegistryEntry(type);
      expect(entry?.defaultWidth, `${type} should have a defaultWidth`).toBe(
        EXPECTED_DEFAULT_WIDTHS[type]
      );
    }
  });

  it('is between 1 and 12 inclusive for every component type', () => {
    for (const type of COMPONENT_TYPES) {
      const width = getRegistryEntry(type)?.defaultWidth;
      expect(width, `${type}'s defaultWidth should be defined`).toBeDefined();
      expect(width! >= 1 && width! <= 12, `${type}'s defaultWidth (${width}) should be 1-12`).toBe(
        true
      );
    }
  });

  it('covers every entry in EXPECTED_DEFAULT_WIDTHS, matching COMPONENT_TYPES exactly', () => {
    expect(Object.keys(EXPECTED_DEFAULT_WIDTHS).sort()).toEqual([...COMPONENT_TYPES].sort());
  });
});
