import { describe, it, expect } from 'vitest';
import { timelineSectionMeta } from './meta';

const entries = () => timelineSectionMeta.propertySchema.find((f) => f.key === 'entries');

describe('timelineSectionMeta', () => {
  it('declares every itemSchema key the component reads', () => {
    const keys = (entries()?.itemSchema ?? []).map((f) => f.key);
    expect(keys).toEqual(expect.arrayContaining(['period', 'title', 'body']));
  });

  it('caps the entry list at 10', () => {
    expect(entries()?.maxItems).toBe(10);
  });

  it('is a content section, not chrome, and is not a singleton', () => {
    expect(timelineSectionMeta.chrome).toBeUndefined();
    expect(timelineSectionMeta.singleton).toBeUndefined();
  });
});
