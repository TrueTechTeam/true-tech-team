import { describe, it, expect } from 'vitest';
import { metricsSectionMeta } from './meta';

const items = () => metricsSectionMeta.propertySchema.find((f) => f.key === 'items');

describe('metricsSectionMeta', () => {
  it('declares every itemSchema key the component reads', () => {
    const keys = (items()?.itemSchema ?? []).map((f) => f.key);
    expect(keys).toEqual(expect.arrayContaining(['value', 'label', 'suffix']));
  });

  it('declares value as a number field', () => {
    const value = items()?.itemSchema?.find((f) => f.key === 'value');
    expect(value?.type).toBe('number');
  });

  it('caps the metric list at 4', () => {
    expect(items()?.maxItems).toBe(4);
  });

  it('declares animate as a boolean defaulting to false', () => {
    const animate = metricsSectionMeta.propertySchema.find((f) => f.key === 'animate');
    expect(animate?.type).toBe('boolean');
    expect(metricsSectionMeta.defaultProps['animate']).toBe(false);
  });

  it('is a content section, not chrome, and is not a singleton', () => {
    expect(metricsSectionMeta.chrome).toBeUndefined();
    expect(metricsSectionMeta.singleton).toBeUndefined();
  });
});
