import { describe, it, expect } from 'vitest';
import { estimateCost } from './pricing';

describe('estimateCost', () => {
  it('computes cost for a known model', () => {
    // claude-opus-4-5: $5/MTok input, $25/MTok output
    // 1,000,000 input tokens -> $5.00; 1,000,000 output tokens -> $25.00
    expect(estimateCost('claude-opus-4-5', 1_000_000, 1_000_000)).toBeCloseTo(30, 5);
  });

  it('computes cost proportionally for partial-MTok token counts', () => {
    // 200,000 input tokens -> $1.00; 40,000 output tokens -> $1.00
    expect(estimateCost('claude-opus-4-5', 200_000, 40_000)).toBeCloseTo(2, 5);
  });

  it('returns 0 for zero tokens', () => {
    expect(estimateCost('claude-opus-4-5', 0, 0)).toBe(0);
  });

  it('returns null for an unknown model', () => {
    expect(estimateCost('claude-made-up-model', 1000, 1000)).toBeNull();
  });
});
