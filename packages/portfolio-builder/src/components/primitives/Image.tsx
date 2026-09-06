export interface ImageItemProps {
  src: string;
  alt: string;
  rounded?: boolean;
  objectFit?: 'cover' | 'contain';
}

export function validateImageProps(props: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (typeof props.src !== 'string' || props.src.length === 0) {
    errors.push('src is required and must be a string');
  }
  if (typeof props.alt !== 'string' || props.alt.length === 0) {
    errors.push('alt is required and must be a string');
  }
  return errors;
}

export function ImageItem(props: Record<string, unknown>) {
  const src = typeof props.src === 'string' ? props.src : '';
  const alt = typeof props.alt === 'string' ? props.alt : '';
  const rounded = props.rounded === true;
  const objectFit = props.objectFit === 'contain' ? 'contain' : 'cover';
  return (
    <img
      src={src}
      alt={alt}
      style={{
        width: '100%',
        height: '100%',
        objectFit,
        borderRadius: rounded ? 'var(--radius-lg)' : undefined,
      }}
    />
  );
}
