export interface CollapsedSpans {
  desktop: number;
  tablet: number;
  mobile: number;
}

export function collapsedSpans(span: number): CollapsedSpans {
  return {
    desktop: span,
    tablet: span <= 6 ? 6 : 12,
    mobile: 12,
  };
}
