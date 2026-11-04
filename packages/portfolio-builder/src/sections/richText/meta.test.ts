import { describe, it, expect } from 'vitest';
import { richTextSectionMeta } from './meta';

describe('richTextSectionMeta', () => {
  it('declares every prop key the component reads', () => {
    const keys = richTextSectionMeta.propertySchema.map((field) => field.key);
    expect(keys).toEqual(expect.arrayContaining(['heading', 'body', 'align']));
  });

  it('offers left and center alignment', () => {
    const align = richTextSectionMeta.propertySchema.find((field) => field.key === 'align');
    expect((align?.options ?? []).map((option) => option.value)).toEqual(['left', 'center']);
  });

  it('is a content section, not chrome, and is not a singleton', () => {
    expect(richTextSectionMeta.chrome).toBeUndefined();
    expect(richTextSectionMeta.singleton).toBeUndefined();
  });
});
