import { describe, it, expect } from 'vitest';
import { logoStripSectionMeta } from './meta';

const items = () => logoStripSectionMeta.propertySchema.find((f) => f.key === 'items');

describe('logoStripSectionMeta', () => {
  it('declares every itemSchema key the component reads', () => {
    const keys = (items()?.itemSchema ?? []).map((f) => f.key);
    expect(keys).toEqual(expect.arrayContaining(['image', 'alt', 'href']));
  });

  it('caps the list at 10', () => {
    expect(items()?.maxItems).toBe(10);
  });

  it('defaults to an empty heading', () => {
    expect(logoStripSectionMeta.defaultProps['heading']).toBe('');
  });

  it('is a content section, not chrome, and is not a singleton', () => {
    expect(logoStripSectionMeta.chrome).toBeUndefined();
    expect(logoStripSectionMeta.singleton).toBeUndefined();
  });
});
