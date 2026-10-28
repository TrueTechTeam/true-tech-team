'use client';

import type { SupabaseClient } from '@supabase/supabase-js';
import { Input, Textarea, NumberInput, Checkbox, Select } from '@true-tech-team/react-components';
import type { PropertyField, PropertySchema } from './types';
import { ImageField } from './ImageField';
import { IconField } from './IconField';
import { ListField } from './ListField';
import styles from './PropertyPanel.module.scss';

export interface PropertyPanelProps {
  schema: PropertySchema;
  values: Record<string, unknown>;
  onChange: (values: Record<string, unknown>) => void;
  supabase: SupabaseClient;
  userId: string;
  /** Namespaces each field's DOM id (`${idPrefix}-${key}`) so repeated panels do not collide. */
  idPrefix?: string;
}

function renderField(
  field: PropertyField,
  values: Record<string, unknown>,
  onChange: (key: string, value: unknown) => void,
  supabase: SupabaseClient,
  userId: string,
  idPrefix?: string
) {
  if (field.type === 'list') {
    return (
      <ListField
        key={field.key}
        field={field}
        value={values[field.key]}
        onChange={(next) => onChange(field.key, next)}
        supabase={supabase}
        userId={userId}
      />
    );
  }

  const rawValue = values[field.key];
  const fieldId = idPrefix ? `${idPrefix}-${field.key}` : field.key;

  if (field.type === 'text') {
    return (
      <Input
        key={field.key}
        id={fieldId}
        label={field.label}
        value={typeof rawValue === 'string' ? rawValue : rawValue != null ? String(rawValue) : ''}
        required={field.required}
        onChange={(event) => onChange(field.key, event.target.value)}
      />
    );
  }

  if (field.type === 'textarea') {
    return (
      <Textarea
        key={field.key}
        id={fieldId}
        label={field.label}
        value={typeof rawValue === 'string' ? rawValue : ''}
        required={field.required}
        onChange={(event) => onChange(field.key, event.target.value)}
      />
    );
  }

  if (field.type === 'number') {
    return (
      <NumberInput
        key={field.key}
        id={fieldId}
        label={field.label}
        value={typeof rawValue === 'number' ? rawValue : undefined}
        min={field.min}
        max={field.max}
        required={field.required}
        onChange={(value) => onChange(field.key, value)}
      />
    );
  }

  if (field.type === 'boolean') {
    return (
      <Checkbox
        key={field.key}
        id={fieldId}
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
        id={fieldId}
        label={field.label}
        options={field.options ?? []}
        value={stringValue}
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
        id={fieldId}
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
        id={fieldId}
        label={field.label}
        value={typeof rawValue === 'string' ? rawValue : ''}
        onChange={(name) => onChange(field.key, name)}
      />
    );
  }

  return null;
}

export function PropertyPanel({
  schema,
  values,
  onChange,
  supabase,
  userId,
  idPrefix,
}: PropertyPanelProps) {
  function handleFieldChange(key: string, value: unknown) {
    onChange({ ...values, [key]: value });
  }

  return (
    <div className={styles.panel}>
      {schema.map((field) =>
        renderField(field, values, handleFieldChange, supabase, userId, idPrefix)
      )}
    </div>
  );
}
