'use client';

import { Select, Icon, iconRegistry, type IconName } from '@true-tech-team/react-components';

export interface IconFieldProps {
  value: string;
  onChange: (name: string) => void;
  label?: string;
  id?: string;
}

const ICON_OPTIONS = Object.keys(iconRegistry).map((name) => ({
  value: name,
  label: (
    <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
      <Icon name={name as IconName} size="sm" />
      {name}
    </span>
  ),
}));

export function IconField({ value, onChange, label = 'Icon', id = 'icon-field' }: IconFieldProps) {
  return (
    <Select
      id={id}
      label={label}
      searchable
      options={ICON_OPTIONS}
      value={value}
      onChange={(newValue) => onChange(newValue)}
    />
  );
}
