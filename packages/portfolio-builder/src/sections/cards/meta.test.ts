import { describe, it, expect } from 'vitest';
import { cardsSectionMeta } from './meta';

const items = () => cardsSectionMeta.propertySchema.find((f) => f.key === 'items');

describe('cardsSectionMeta', () => {
  it('declares every itemSchema key the component reads', () => {
    const keys = (items()?.itemSchema ?? []).map((f) => f.key);
    expect(keys).toEqual(expect.arrayContaining(['title', 'body', 'backText']));
  });

  it('caps the card list at 8', () => {
    expect(items()?.maxItems).toBe(8);
  });

  it('offers static and flip styles, defaulting to static', () => {
    const style = cardsSectionMeta.propertySchema.find((f) => f.key === 'style');
    expect(style?.options?.map((o) => o.value)).toEqual(['static', 'flip']);
    expect(cardsSectionMeta.defaultProps['style']).toBe('static');
  });

  it('labels backText as flip-only', () => {
    const back = items()?.itemSchema?.find((f) => f.key === 'backText');
    expect(back?.label).toBe('Back text (flip style only)');
  });

  it('is a content section, not chrome, and is not a singleton', () => {
    expect(cardsSectionMeta.chrome).toBeUndefined();
    expect(cardsSectionMeta.singleton).toBeUndefined();
  });
});
