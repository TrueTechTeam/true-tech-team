import { NavLink, type IconName } from '@true-tech-team/react-components';
import type { PropertySchema } from '../../properties/types';
import { isSafeHref } from '../../sections/safeHref';
import styles from './links.module.scss';

export interface LinkButtonItemProps {
  label: string;
  href: string;
  icon?: IconName;
  openInNewTab?: boolean;
}

export function validateLinkButtonProps(props: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (typeof props.label !== 'string' || props.label.length === 0) {
    errors.push('label is required and must be a string');
  }
  if (typeof props.href !== 'string' || props.href.length === 0) {
    errors.push('href is required and must be a string');
  }
  return errors;
}

export function LinkButtonItem(props: Record<string, unknown>) {
  const label = typeof props.label === 'string' ? props.label : '';
  const href = typeof props.href === 'string' ? props.href : '#';
  const icon = typeof props.icon === 'string' ? (props.icon as IconName) : undefined;
  if (!isSafeHref(href)) {
    // Drop the link entirely: a dead control beats a live javascript: URL.
    return null;
  }
  const newTab = props.openInNewTab === true;
  return (
    <NavLink
      href={href}
      icon={icon}
      target={newTab ? '_blank' : undefined}
      rel={newTab ? 'noopener noreferrer' : undefined}
      variant="pill"
    >
      {label}
    </NavLink>
  );
}

export interface IconLinkButtonItemProps {
  href: string;
  icon: IconName;
  ariaLabel: string;
  openInNewTab?: boolean;
}

export function validateIconLinkButtonProps(props: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (typeof props.href !== 'string' || props.href.length === 0) {
    errors.push('href is required and must be a string');
  }
  if (typeof props.icon !== 'string' || props.icon.length === 0) {
    errors.push('icon is required and must be a string');
  }
  if (typeof props.ariaLabel !== 'string' || props.ariaLabel.length === 0) {
    errors.push('ariaLabel is required and must be a string');
  }
  return errors;
}

export function IconLinkButtonItem(props: Record<string, unknown>) {
  const href = typeof props.href === 'string' ? props.href : '#';
  const icon = typeof props.icon === 'string' ? (props.icon as IconName) : 'external-link';
  const ariaLabel = typeof props.ariaLabel === 'string' ? props.ariaLabel : '';
  if (!isSafeHref(href)) {
    return null;
  }
  const newTab = props.openInNewTab === true;
  return (
    <NavLink
      href={href}
      icon={icon}
      target={newTab ? '_blank' : undefined}
      rel={newTab ? 'noopener noreferrer' : undefined}
      variant="ghost"
      aria-label={ariaLabel}
    >
      <span className={styles.srOnly}>{ariaLabel}</span>
    </NavLink>
  );
}

export const linkButtonPropertySchema: PropertySchema = [
  { key: 'label', label: 'Label', type: 'text', required: true },
  { key: 'href', label: 'Link URL', type: 'text', required: true },
  { key: 'icon', label: 'Icon', type: 'icon' },
  { key: 'openInNewTab', label: 'Open in new tab', type: 'boolean' },
];

export const iconLinkButtonPropertySchema: PropertySchema = [
  { key: 'href', label: 'Link URL', type: 'text', required: true },
  { key: 'icon', label: 'Icon', type: 'icon', required: true },
  { key: 'ariaLabel', label: 'Accessible label', type: 'text', required: true },
  { key: 'openInNewTab', label: 'Open in new tab', type: 'boolean' },
];

export const linkButtonDefaultProps: Record<string, unknown> = {
  label: 'Click Me',
  href: 'https://example.com',
};

export const iconLinkButtonDefaultProps: Record<string, unknown> = {
  href: 'https://example.com',
  icon: 'external-link',
  ariaLabel: 'Open link',
};
