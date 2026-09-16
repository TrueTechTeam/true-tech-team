import { describe, it, expect } from 'vitest';
import { nearestBoundary } from './nearestBoundary';

function rect(left: number, right: number, top = 0, bottom = 80): DOMRect {
  return {
    left,
    right,
    top,
    bottom,
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
    toJSON: () => ({}),
  } as DOMRect;
}

describe('nearestBoundary', () => {
  it('returns undefined for an empty rect list', () => {
    expect(nearestBoundary(50, [], 'x')).toBeUndefined();
  });

  it('resolves to index 0 (before the first rect) when the pointer is near its left edge', () => {
    const rects = [rect(0, 100), rect(108, 208), rect(216, 316)];
    const result = nearestBoundary(2, rects, 'x');
    expect(result).toEqual({ index: 0, position: 0 });
  });

  it('resolves to the boundary between two rects', () => {
    const rects = [rect(0, 100), rect(108, 208), rect(216, 316)];
    // Midpoint between rect 0's right (100) and rect 1's left (108) is 104.
    const result = nearestBoundary(104, rects, 'x');
    expect(result).toEqual({ index: 1, position: 104 });
  });

  it('resolves to the boundary after the last rect when the pointer is near its right edge', () => {
    const rects = [rect(0, 100), rect(108, 208), rect(216, 316)];
    const result = nearestBoundary(314, rects, 'x');
    expect(result).toEqual({ index: 3, position: 316 });
  });

  it("breaks a tie at a rect's own midpoint in favor of the earlier (left/top) boundary", () => {
    const _rects = [rect(0, 100), rect(108, 208)];
    // Midpoint of rect 1 (108-208) is 158, exactly equidistant from boundary index 1 (104) and
    // boundary index 2 (208): distance to 104 is 54, distance to 208 is 50 - NOT actually a tie
    // with these numbers, so use rect 0 alone: its own midpoint (50) is equidistant from boundary
    // 0 (0, distance 50) and boundary 1 (104, distance 54) - still not exact. Construct an exact
    // tie deliberately: a single rect from 0 to 100, pointer at 50 is 50 from boundary 0 (at 0)
    // and 50 from boundary 1 (at 100).
    const singleRect = [rect(0, 100)];
    const result = nearestBoundary(50, singleRect, 'x');
    expect(result).toEqual({ index: 0, position: 0 });
  });

  it('supports the y axis using top/bottom instead of left/right', () => {
    const rects = [rect(0, 300, 0, 80), rect(0, 300, 88, 168)];
    // Midpoint between rect 0's bottom (80) and rect 1's top (88) is 84.
    const result = nearestBoundary(84, rects, 'y');
    expect(result).toEqual({ index: 1, position: 84 });
  });
});
