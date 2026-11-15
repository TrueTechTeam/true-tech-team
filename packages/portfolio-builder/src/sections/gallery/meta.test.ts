import { describe, it, expect } from 'vitest';
import { gallerySectionMeta } from './meta';

describe('gallerySectionMeta', () => {
  it('declares every itemSchema key the component reads', () => {
    const list = gallerySectionMeta.propertySchema.find((field) => field.key === 'images');
    const keys = (list?.itemSchema ?? []).map((field) => field.key);
    expect(keys).toEqual(expect.arrayContaining(['image', 'alt', 'caption']));
  });

  it('caps the image list at 12', () => {
    const list = gallerySectionMeta.propertySchema.find((field) => field.key === 'images');
    expect(list?.maxItems).toBe(12);
  });

  it('is a content section, not chrome, and is not a singleton', () => {
    expect(gallerySectionMeta.chrome).toBeUndefined();
    expect(gallerySectionMeta.singleton).toBeUndefined();
  });
});
