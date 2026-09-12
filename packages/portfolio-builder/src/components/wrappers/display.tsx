import {
  Badge,
  Chip,
  Pill,
  StatusIndicator,
  Icon,
  type BadgeProps,
  type PillProps,
  type StatusIndicatorProps,
  type IconName,
} from '@true-tech-team/react-components';
import type { PropertySchema } from '../../properties/types';

export interface BadgeItemProps {
  label: string | number;
  variant?: BadgeProps['variant'];
  size?: BadgeProps['size'];
}

export function validateBadgeProps(props: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (typeof props.label !== 'string' && typeof props.label !== 'number') {
    errors.push('label is required and must be a string or number');
  }
  return errors;
}

export function BadgeItem(props: Record<string, unknown>) {
  const label =
    typeof props.label === 'string' || typeof props.label === 'number' ? props.label : '';
  const variant =
    typeof props.variant === 'string' ? (props.variant as BadgeProps['variant']) : undefined;
  const size = typeof props.size === 'string' ? (props.size as BadgeProps['size']) : undefined;
  return (
    <Badge variant={variant} size={size}>
      {label}
    </Badge>
  );
}

export interface ChipItemProps {
  label: string;
}

export function validateChipProps(props: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (typeof props.label !== 'string' || props.label.length === 0) {
    errors.push('label is required and must be a string');
  }
  return errors;
}

export function ChipItem(props: Record<string, unknown>) {
  const label = typeof props.label === 'string' ? props.label : '';
  return <Chip>{label}</Chip>;
}

export interface PillItemProps {
  label: string;
  variant?: PillProps['variant'];
  color?: PillProps['color'];
}

export function validatePillProps(props: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (typeof props.label !== 'string' || props.label.length === 0) {
    errors.push('label is required and must be a string');
  }
  return errors;
}

export function PillItem(props: Record<string, unknown>) {
  const label = typeof props.label === 'string' ? props.label : '';
  const variant =
    typeof props.variant === 'string' ? (props.variant as PillProps['variant']) : undefined;
  const color = typeof props.color === 'string' ? (props.color as PillProps['color']) : undefined;
  return (
    <Pill variant={variant} color={color}>
      {label}
    </Pill>
  );
}

const VALID_STATUSES = [
  'online',
  'offline',
  'away',
  'busy',
  'success',
  'warning',
  'error',
  'info',
  'neutral',
  'processing',
];

export interface StatusIndicatorItemProps {
  status?: StatusIndicatorProps['status'];
  label?: string;
}

export function validateStatusIndicatorProps(props: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (props.status !== undefined && !VALID_STATUSES.includes(props.status as string)) {
    errors.push('status must be a known StatusIndicator status');
  }
  return errors;
}

export function StatusIndicatorItem(props: Record<string, unknown>) {
  const status = VALID_STATUSES.includes(props.status as string)
    ? (props.status as StatusIndicatorProps['status'])
    : undefined;
  const label = typeof props.label === 'string' ? props.label : undefined;
  return (
    <StatusIndicator status={status} withText={label !== undefined}>
      {label}
    </StatusIndicator>
  );
}

export interface IconItemProps {
  name: IconName;
  ariaLabel: string;
  color?: string;
}

export function validateIconProps(props: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (typeof props.name !== 'string' || props.name.length === 0) {
    errors.push('name is required and must be a string');
  }
  return errors;
}

export function IconItem(props: Record<string, unknown>) {
  const name = typeof props.name === 'string' ? (props.name as IconName) : 'info';
  const ariaLabel = typeof props.ariaLabel === 'string' ? props.ariaLabel : undefined;
  const color = typeof props.color === 'string' ? props.color : undefined;
  return <Icon name={name} aria-label={ariaLabel} color={color} />;
}

export const badgePropertySchema: PropertySchema = [
  { key: 'label', label: 'Label', type: 'text', required: true },
  {
    key: 'variant',
    label: 'Variant',
    type: 'select',
    options: [
      { value: 'primary', label: 'Primary' },
      { value: 'secondary', label: 'Secondary' },
      { value: 'success', label: 'Success' },
      { value: 'warning', label: 'Warning' },
      { value: 'danger', label: 'Danger' },
      { value: 'info', label: 'Info' },
      { value: 'neutral', label: 'Neutral' },
    ],
  },
  {
    key: 'size',
    label: 'Size',
    type: 'select',
    options: [
      { value: 'sm', label: 'Small' },
      { value: 'md', label: 'Medium' },
      { value: 'lg', label: 'Large' },
    ],
  },
];

export const chipPropertySchema: PropertySchema = [
  { key: 'label', label: 'Label', type: 'text', required: true },
];

export const pillPropertySchema: PropertySchema = [
  { key: 'label', label: 'Label', type: 'text', required: true },
  {
    key: 'variant',
    label: 'Variant',
    type: 'select',
    options: [
      { value: 'filled', label: 'Filled' },
      { value: 'outlined', label: 'Outlined' },
      { value: 'subtle', label: 'Subtle' },
    ],
  },
  {
    key: 'color',
    label: 'Color',
    type: 'select',
    options: [
      { value: 'primary', label: 'Primary' },
      { value: 'secondary', label: 'Secondary' },
      { value: 'success', label: 'Success' },
      { value: 'warning', label: 'Warning' },
      { value: 'danger', label: 'Danger' },
      { value: 'info', label: 'Info' },
      { value: 'neutral', label: 'Neutral' },
    ],
  },
];

export const statusIndicatorPropertySchema: PropertySchema = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'online', label: 'Online' },
      { value: 'offline', label: 'Offline' },
      { value: 'away', label: 'Away' },
      { value: 'busy', label: 'Busy' },
      { value: 'success', label: 'Success' },
      { value: 'warning', label: 'Warning' },
      { value: 'error', label: 'Error' },
      { value: 'info', label: 'Info' },
      { value: 'neutral', label: 'Neutral' },
      { value: 'processing', label: 'Processing' },
    ],
  },
  { key: 'label', label: 'Label', type: 'text' },
];

export const iconPropertySchema: PropertySchema = [
  { key: 'name', label: 'Icon', type: 'icon', required: true },
  { key: 'ariaLabel', label: 'Accessible label', type: 'text', required: true },
  { key: 'color', label: 'Color', type: 'text' },
];
