import { describe, it, expect } from 'vitest';
import { testimonialsSectionMeta } from './meta';

const items = () => testimonialsSectionMeta.propertySchema.find((f) => f.key === 'items');

describe('testimonialsSectionMeta', () => {
  it('declares every itemSchema key the component reads', () => {
    const keys = (items()?.itemSchema ?? []).map((f) => f.key);
    expect(keys).toEqual(expect.arrayContaining(['quote', 'author', 'role', 'avatar']));
  });

  it('requires quote and author, and takes an image for the avatar', () => {
    const schema = items()?.itemSchema ?? [];
    expect(schema.find((f) => f.key === 'quote')?.required).toBe(true);
    expect(schema.find((f) => f.key === 'author')?.required).toBe(true);
    expect(schema.find((f) => f.key === 'avatar')?.type).toBe('image');
  });

  it('caps the list at 6', () => {
    expect(items()?.maxItems).toBe(6);
  });

  it('is a content section, not chrome, and is not a singleton', () => {
    expect(testimonialsSectionMeta.chrome).toBeUndefined();
    expect(testimonialsSectionMeta.singleton).toBeUndefined();
  });
});
