export interface SpacerItemProps {
  height: number;
}

export function validateSpacerProps(props: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (typeof props.height !== 'number') {
    errors.push('height is required and must be a number');
  }
  return errors;
}

export function SpacerItem(props: Record<string, unknown> & { 'data-testid'?: string }) {
  const height = typeof props.height === 'number' ? props.height : 0;
  return <div data-testid={props['data-testid']} style={{ height: `${height}px` }} />;
}
