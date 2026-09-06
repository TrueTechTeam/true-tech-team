import { describe, it, expect } from 'vitest';
import { collapsedSpans } from './responsive';

describe('collapsedSpans', () => {
  it('keeps the authored span for desktop', () => {
    expect(collapsedSpans(4).desktop).toBe(4);
    expect(collapsedSpans(12).desktop).toBe(12);
  });

  it('collapses spans of 6 or less to 6 on tablet', () => {
    expect(collapsedSpans(1).tablet).toBe(6);
    expect(collapsedSpans(6).tablet).toBe(6);
  });

  it('collapses spans of 7 or more to 12 on tablet', () => {
    expect(collapsedSpans(7).tablet).toBe(12);
    expect(collapsedSpans(12).tablet).toBe(12);
  });

  it('always collapses to 12 on mobile', () => {
    expect(collapsedSpans(1).mobile).toBe(12);
    expect(collapsedSpans(12).mobile).toBe(12);
  });
});
