'use client';

import { useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Input, Textarea, NumberInput, Checkbox, Select } from '@true-tech-team/react-components';
import { getRegistryEntry } from '../components/registry';
import type { PropertyField, SelectedItem } from './types';
import { ImageField } from './ImageField';
import { IconField } from './IconField';
import styles from './PropertyPanel.module.scss';

export interface PropertyPanelProps {
  item: SelectedItem;
  onPropsChange: (props: Record<string, unknown>) => void;
  onSpanChange: (span: number) => void;
  supabase: SupabaseClient;
  userId: string;
}

function clampSpan(value: number): number {
  return Math.min(12, Math.max(1, Math.round(value)));
}

function renderField(
  field: PropertyField,
  props: Record<string, unknown>,
  errors: string[],
  onChange: (key: string, value: unknown) => void,
  supabase: SupabaseClient,
  userId: string
) {
  const rawValue = props[field.key];
  const fieldError = errors.find((message) => message.startsWith(field.key));

  if (field.type === 'text') {
    return (
      <Input
        key={field.key}
        id={field.key}
        label={field.label}
        value={typeof rawValue === 'string' ? rawValue : rawValue != null ? String(rawValue) : ''}
        required={field.required}
        errorMessage={fieldError}
        error={Boolean(fieldError)}
        onChange={(event) => onChange(field.key, event.target.value)}
      />
    );
  }

  if (field.type === 'textarea') {
    return (
      <Textarea
        key={field.key}
        id={field.key}
        label={field.label}
        value={typeof rawValue === 'string' ? rawValue : ''}
        required={field.required}
        errorMessage={fieldError}
        error={Boolean(fieldError)}
        onChange={(event) => onChange(field.key, event.target.value)}
      />
    );
  }

  if (field.type === 'number') {
    return (
      <NumberInput
        key={field.key}
        id={field.key}
        label={field.label}
        value={typeof rawValue === 'number' ? rawValue : undefined}
        min={field.min}
        max={field.max}
        required={field.required}
        errorMessage={fieldError}
        error={Boolean(fieldError)}
        onChange={(value) => onChange(field.key, value)}
      />
    );
  }

  if (field.type === 'boolean') {
    return (
      <Checkbox
        key={field.key}
        id={field.key}
        label={field.label}
        checked={rawValue === true}
        onChange={(checked) => onChange(field.key, checked)}
      />
    );
  }

  if (field.type === 'select') {
    const stringValue = rawValue == null ? '' : String(rawValue);
    return (
      <Select
        key={field.key}
        id={field.key}
        label={field.label}
        options={field.options ?? []}
        value={stringValue}
        errorMessage={fieldError}
        error={Boolean(fieldError)}
        onChange={(value) =>
          onChange(field.key, field.optionValueType === 'number' ? Number(value) : value)
        }
      />
    );
  }

  if (field.type === 'image') {
    return (
      <ImageField
        key={field.key}
        id={field.key}
        label={field.label}
        value={typeof rawValue === 'string' ? rawValue : ''}
        onChange={(url) => onChange(field.key, url)}
        supabase={supabase}
        userId={userId}
      />
    );
  }

  if (field.type === 'icon') {
    return (
      <IconField
        key={field.key}
        id={field.key}
        label={field.label}
        value={typeof rawValue === 'string' ? rawValue : ''}
        onChange={(name) => onChange(field.key, name)}
      />
    );
  }

  return null;
}

export function PropertyPanel({
  item,
  onPropsChange,
  onSpanChange,
  supabase,
  userId,
}: PropertyPanelProps) {
  const entry = getRegistryEntry(item.componentType);
  const schema = entry?.propertySchema;
  const [errors, setErrors] = useState<string[]>([]);

  function handleFieldChange(key: string, value: unknown) {
    const newProps = { ...item.props, [key]: value };
    if (entry) {
      setErrors(entry.validate(newProps));
    }
    onPropsChange(newProps);
  }

  const claimedErrors = new Set(
    (schema ?? []).flatMap((field) => errors.filter((message) => message.startsWith(field.key)))
  );
  const unclaimedErrors = errors.filter((message) => !claimedErrors.has(message));

  return (
    <div className={styles.panel}>
      <NumberInput
        id="span"
        label="Width"
        value={item.span}
        min={1}
        max={12}
        onChange={(value) => onSpanChange(clampSpan(value))}
      />
      {!schema && (
        <p className={styles.fallback}>Properties for this component aren&apos;t editable yet.</p>
      )}
      {unclaimedErrors.length > 0 && (
        <ul className={styles.errorSummary}>
          {unclaimedErrors.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}
      {schema?.map((field) =>
        renderField(field, item.props, errors, handleFieldChange, supabase, userId)
      )}
    </div>
  );
}
