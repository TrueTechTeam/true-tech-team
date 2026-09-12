import { Avatar, type AvatarProps } from '@true-tech-team/react-components';
import type { PropertySchema } from '../../properties/types';

export interface AvatarItemProps {
  src?: string;
  alt?: string;
  initials?: string;
  size?: AvatarProps['size'];
  variant?: AvatarProps['variant'];
}

export function validateAvatarProps(props: Record<string, unknown>): string[] {
  const errors: string[] = [];
  const hasSrc = typeof props.src === 'string' && props.src.length > 0;
  const hasInitials = typeof props.initials === 'string' && props.initials.length > 0;
  if (!hasSrc && !hasInitials) {
    errors.push('either src or initials is required');
  }
  return errors;
}

export function AvatarItem(props: Record<string, unknown>) {
  const src = typeof props.src === 'string' ? props.src : undefined;
  const alt = typeof props.alt === 'string' ? props.alt : undefined;
  const initials = typeof props.initials === 'string' ? props.initials : undefined;
  const size = typeof props.size === 'string' ? (props.size as AvatarProps['size']) : undefined;
  const variant =
    typeof props.variant === 'string' ? (props.variant as AvatarProps['variant']) : undefined;
  return <Avatar src={src} alt={alt} initials={initials} size={size} variant={variant} />;
}

export const avatarPropertySchema: PropertySchema = [
  { key: 'src', label: 'Image', type: 'image' },
  { key: 'alt', label: 'Alt text', type: 'text' },
  { key: 'initials', label: 'Initials (fallback)', type: 'text' },
  {
    key: 'size',
    label: 'Size',
    type: 'select',
    options: [
      { value: 'xs', label: 'Extra small' },
      { value: 'sm', label: 'Small' },
      { value: 'md', label: 'Medium' },
      { value: 'lg', label: 'Large' },
      { value: 'xl', label: 'Extra large' },
    ],
  },
  {
    key: 'variant',
    label: 'Shape',
    type: 'select',
    options: [
      { value: 'circular', label: 'Circular' },
      { value: 'rounded', label: 'Rounded' },
      { value: 'square', label: 'Square' },
    ],
  },
];
