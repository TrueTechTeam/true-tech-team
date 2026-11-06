import { describe, it, expect } from 'vitest';
import { hasSectionContent } from './sectionContent';
import type { PropertySchema } from '../properties/types';

const schema: PropertySchema = [
  { key: 'heading', label: 'Heading', type: 'text' },
  { key: 'subheading', label: 'Sub', type: 'textarea' },
  { key: 'body', label: 'Body', type: 'textarea' },
  { key: 'bg', label: 'Image', type: 'image' },
  { key: 'align', label: 'Align', type: 'select' },
  { key: 'animate', label: 'Animate', type: 'boolean' },
  { key: 'items', label: 'Items', type: 'list', itemSchema: [] },
];

describe('hasSectionContent', () => {
  it('is false for a section with only a heading and settings', () => {
    expect(
      hasSectionContent(schema, {
        heading: 'Services',
        subheading: 'Sub',
        align: 'left',
        animate: true,
        body: '   ',
        bg: '',
        items: [],
      })
    ).toBe(false);
  });

  it('is false when stored props are missing or the wrong type', () => {
    expect(hasSectionContent(schema, { items: 'nope', body: 4 })).toBe(false);
  });

  it('is true for a non-empty list', () => {
    expect(hasSectionContent(schema, { items: [{}] })).toBe(true);
  });

  it('is true for body text', () => {
    expect(hasSectionContent(schema, { body: 'Hello' })).toBe(true);
  });

  it('is true for an image', () => {
    expect(hasSectionContent(schema, { bg: 'https://x/y.png' })).toBe(true);
  });
});
