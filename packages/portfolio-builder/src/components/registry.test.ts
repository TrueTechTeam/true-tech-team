import { describe, it, expect } from 'vitest';
import { getRegistryEntry } from './registry';
import { COMPONENT_TYPES, type ComponentType } from '../schema/types';

// Maps every ComponentType to the exact component function it must resolve to. Asserting only
// `toBeDefined()` doesn't catch a mis-pairing (e.g. `pill` wired to `ChipItem`'s component but
// `validateChipProps`) because TypeScript already guarantees every key exists — it does not
// guarantee the pairing is correct. Comparing `.name` catches that class of copy-paste error.
const EXPECTED_COMPONENT_NAMES: Record<ComponentType, string> = {
  heading: 'HeadingItem',
  text: 'TextItem',
  image: 'ImageItem',
  spacer: 'SpacerItem',
  card: 'CardItem',
  badge: 'BadgeItem',
  avatar: 'AvatarItem',
  chip: 'ChipItem',
  pill: 'PillItem',
  icon: 'IconItem',
  statusIndicator: 'StatusIndicatorItem',
  progressBar: 'ProgressBarItem',
  circularProgress: 'CircularProgressItem',
  kpi: 'KpiItem',
  countUp: 'CountUpItem',
  reveal: 'RevealItem',
  collapse: 'ExpandableTextItem',
  flipCard: 'FlipCardItem',
  carousel: 'CarouselItem',
  overflowText: 'OverflowTextItem',
  truncatedList: 'TruncatedListItem',
  button: 'LinkButtonItem',
  iconButton: 'IconLinkButtonItem',
  accordion: 'AccordionItem',
  tabs: 'TabsItem',
};

describe('component registry', () => {
  it('has an entry for every declared ComponentType', () => {
    for (const type of COMPONENT_TYPES) {
      expect(getRegistryEntry(type)).toBeDefined();
    }
  });

  it('maps every ComponentType to its correct component (not just any entry)', () => {
    for (const type of COMPONENT_TYPES) {
      const entry = getRegistryEntry(type);
      expect(entry?.component.name).toBe(EXPECTED_COMPONENT_NAMES[type]);
    }
  });

  it('returns undefined for an unregistered type', () => {
    // @ts-expect-error -- deliberately invalid for the test
    expect(getRegistryEntry('not-a-real-type')).toBeUndefined();
  });

  it('validates props through the matching entry', () => {
    const entry = getRegistryEntry('heading');
    expect(entry?.validate({})).toContain('text is required and must be a string');
    expect(entry?.validate({ text: 'Hi' })).toEqual([]);
  });
});
