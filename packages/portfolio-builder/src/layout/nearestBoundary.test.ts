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
    // An exact tie needs a deliberately constructed case: with a single rect from 0 to 100 the
    // only two boundaries are 0 and 100, so a pointer at 50 is exactly 50 from each. (Multi-rect
    // layouts don't produce one - e.g. with rects 0-100 and 108-208, the midpoint of the second
    // rect, 158, is 54 from boundary 1 at 104 and 50 from boundary 2 at 208.)
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
