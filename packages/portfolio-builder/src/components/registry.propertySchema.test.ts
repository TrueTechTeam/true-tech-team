import { describe, it, expect } from 'vitest';
import { getRegistryEntry } from './registry';
import type { ComponentType } from '../schema/types';

const VALID_PROPS: Record<ComponentType, Record<string, unknown>> = {
  heading: { text: 'Hi', level: 2, align: 'left' },
  text: { text: 'Hi', size: 'base', align: 'left' },
  image: { src: 'https://example.com/a.png', alt: 'Alt', rounded: true, objectFit: 'cover' },
  spacer: { height: 24 },
  card: {
    header: 'H',
    body: 'B',
    footer: 'F',
    imageSrc: 'https://example.com/a.png',
    imageAlt: 'Alt',
    variant: 'outlined',
  },
  badge: { label: 'New', variant: 'primary', size: 'sm' },
  avatar: {
    src: 'https://example.com/a.png',
    alt: 'Alt',
    initials: 'JT',
    size: 'md',
    variant: 'circular',
  },
  chip: { label: 'Chip' },
  pill: { label: 'Pill', variant: 'filled', color: 'primary' },
  icon: { name: 'star', ariaLabel: 'Star', color: 'currentColor' },
  statusIndicator: { status: 'online', label: 'Online' },
  progressBar: { value: 50, max: 100, label: 'Progress', showValue: true },
  circularProgress: { value: 50, max: 100, label: 'Progress', showValue: true },
  kpi: {
    title: 'Revenue',
    value: '10k',
    subtitle: 'MTD',
    changeText: '+5%',
    changeType: 'increase',
  },
  countUp: { value: 100, prefix: '$', suffix: 'k', decimals: 1 },
  reveal: { text: 'Reveal me', animation: 'fade', playOnMount: true },
  collapse: { title: 'Title', body: 'Body', defaultOpen: false },
  flipCard: { frontText: 'Front', backText: 'Back', height: 200, width: 200 },
  carousel: { slides: [{ imageSrc: 'https://example.com/a.png' }] },
  overflowText: { text: 'Long text', lines: 3 },
  truncatedList: { items: ['a', 'b'] },
  button: { label: 'Go', href: 'https://example.com', icon: 'arrow-right', openInNewTab: true },
  iconButton: {
    href: 'https://example.com',
    icon: 'arrow-right',
    ariaLabel: 'Go',
    openInNewTab: false,
  },
  accordion: { header: 'Header', body: 'Body', defaultOpen: false },
  tabs: { tabs: [{ label: 'One', content: 'Content' }] },
};

const SCHEMA_LESS_TYPES: ComponentType[] = ['carousel', 'tabs', 'truncatedList'];

describe('registry propertySchema', () => {
  it('has no propertySchema for array-prop component types', () => {
    for (const type of SCHEMA_LESS_TYPES) {
      expect(getRegistryEntry(type)?.propertySchema).toBeUndefined();
    }
  });

  it('has a propertySchema for every other component type, with keys matching real props', () => {
    const allTypes = Object.keys(VALID_PROPS) as ComponentType[];
    const schemaExpectedTypes = allTypes.filter((type) => !SCHEMA_LESS_TYPES.includes(type));
    for (const type of schemaExpectedTypes) {
      const entry = getRegistryEntry(type);
      expect(entry?.propertySchema, `${type} should have a propertySchema`).toBeDefined();
      const schema = entry!.propertySchema!;
      expect(schema.length).toBeGreaterThan(0);
      for (const field of schema) {
        expect(
          Object.prototype.hasOwnProperty.call(VALID_PROPS[type], field.key),
          `${type}.${field.key} should be a real prop key`
        ).toBe(true);
      }
    }
  });

  it('marks select fields with a real prop-defined set of options', () => {
    const headingSchema = getRegistryEntry('heading')!.propertySchema!;
    const levelField = headingSchema.find((f) => f.key === 'level')!;
    expect(levelField.type).toBe('select');
    expect(levelField.optionValueType).toBe('number');
    expect(levelField.options?.map((o) => o.value)).toEqual(['1', '2', '3', '4']);
  });
});
