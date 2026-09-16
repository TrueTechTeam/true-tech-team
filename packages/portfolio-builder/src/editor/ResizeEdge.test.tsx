import { describe, it, expect } from 'vitest';
import { computeEffectiveDelta } from './ResizeEdge';

describe('computeEffectiveDelta', () => {
  it('passes a right-edge raw delta through unchanged (dragging right grows the item)', () => {
    expect(computeEffectiveDelta('right', 3)).toBe(3);
    expect(computeEffectiveDelta('right', -2)).toBe(-2);
  });

  it('inverts a left-edge raw delta (dragging left grows the item)', () => {
    expect(computeEffectiveDelta('left', 3)).toBe(-3);
    expect(computeEffectiveDelta('left', -2)).toBe(2);
  });
});
