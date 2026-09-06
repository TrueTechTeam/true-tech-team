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
