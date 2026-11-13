import { describe, it, expect } from 'vitest';
import { contactSectionMeta } from './meta';

const field = (key: string) => contactSectionMeta.propertySchema.find((f) => f.key === key);

describe('contactSectionMeta', () => {
  it('declares every prop key the component reads', () => {
    const keys = contactSectionMeta.propertySchema.map((f) => f.key);
    expect(keys).toEqual(expect.arrayContaining(['heading', 'intro', 'email', 'phone', 'links']));
  });

  it('declares every itemSchema key the component reads', () => {
    const keys = (field('links')?.itemSchema ?? []).map((f) => f.key);
    expect(keys).toEqual(expect.arrayContaining(['label', 'href']));
  });

  it('caps the link list at 5', () => {
    expect(field('links')?.maxItems).toBe(5);
  });

  it('requires a heading', () => {
    expect(field('heading')?.required).toBe(true);
  });

  it('is a content section, not chrome, and is not a singleton', () => {
    expect(contactSectionMeta.chrome).toBeUndefined();
    expect(contactSectionMeta.singleton).toBeUndefined();
  });
});
