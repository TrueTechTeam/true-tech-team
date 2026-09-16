export interface BoundaryResult {
  /** Index of the nearest boundary: 0 = before the first rect, rects.length = after the last. */
  index: number;
  /** The boundary's coordinate along `axis`, in the same coordinate space as the input rects. */
  position: number;
}

export function nearestBoundary(
  pointerCoord: number,
  rects: DOMRect[],
  axis: 'x' | 'y'
): BoundaryResult | undefined {
  if (rects.length === 0) {
    return undefined;
  }
  const start = axis === 'x' ? 'left' : 'top';
  const end = axis === 'x' ? 'right' : 'bottom';

  const boundaries: number[] = [rects[0][start]];
  for (let i = 0; i < rects.length - 1; i++) {
    boundaries.push((rects[i][end] + rects[i + 1][start]) / 2);
  }
  boundaries.push(rects[rects.length - 1][end]);

  let bestIndex = 0;
  let bestDistance = Infinity;
  boundaries.forEach((position, index) => {
    const distance = Math.abs(pointerCoord - position);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });
  return { index: bestIndex, position: boundaries[bestIndex] };
}
