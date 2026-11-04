import { describe, it, expect } from 'vitest';
import { faqSectionMeta } from './meta';

const items = () => faqSectionMeta.propertySchema.find((f) => f.key === 'items');

describe('faqSectionMeta', () => {
  it('declares every itemSchema key the component reads', () => {
    const keys = (items()?.itemSchema ?? []).map((f) => f.key);
    expect(keys).toEqual(expect.arrayContaining(['question', 'answer']));
  });

  it('caps the list at 10', () => {
    expect(items()?.maxItems).toBe(10);
  });

  it('is a content section, not chrome, and is not a singleton', () => {
    expect(faqSectionMeta.chrome).toBeUndefined();
    expect(faqSectionMeta.singleton).toBeUndefined();
  });
});
