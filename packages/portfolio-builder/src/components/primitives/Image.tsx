import type { PropertySchema } from '../../properties/types';

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

export const imagePropertySchema: PropertySchema = [
  { key: 'src', label: 'Image', type: 'image', required: true },
  { key: 'alt', label: 'Alt text', type: 'text', required: true },
  { key: 'rounded', label: 'Rounded corners', type: 'boolean' },
  {
    key: 'objectFit',
    label: 'Fit',
    type: 'select',
    options: [
      { value: 'cover', label: 'Cover' },
      { value: 'contain', label: 'Contain' },
    ],
  },
];

export const imageDefaultProps: Record<string, unknown> = {
  src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23e5e7eb'/%3E%3C/svg%3E",
  alt: 'Placeholder image',
  rounded: false,
  objectFit: 'cover',
};
