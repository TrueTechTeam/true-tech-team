'use client';

import { useRef } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Button, IconButton } from '@true-tech-team/react-components';
import type { PropertyField, PropertySchema } from './types';
import { PropertyPanel } from './PropertyPanel';
import styles from './ListField.module.scss';

export interface ListFieldProps {
  /** The `list` field being edited. */
  field: PropertyField;
  /** Expected `Array<Record<string, unknown>>`; anything else reads as an empty list. */
  value: unknown;
  onChange: (next: Array<Record<string, unknown>>) => void;
  supabase: SupabaseClient;
  userId: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Reads stored list data defensively. A hand-edited row, or data written by an older client, can
 * put anything here - a string, an object, null - and the editor must render an empty list rather
 * than throw. Non-object entries inside an otherwise valid array are dropped for the same reason.
 */
function readEntries(value: unknown): Array<Record<string, unknown>> {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(isRecord);
}

/**
 * Nested lists are deliberately unsupported: a `list` inside an `itemSchema` would need recursive
 * path addressing to edit, and no section type wants one. Stripping it here means `PropertyPanel`
 * renders the rest of the entry normally instead of breaking on it.
 */
function withoutNestedLists(schema: PropertySchema): PropertySchema {
  return schema.filter((itemField) => itemField.type !== 'list');
}

export function ListField({ field, value, onChange, supabase, userId }: ListFieldProps) {
  const entries = readEntries(value);

  // The sub-forms below close over the entry OBJECT, not its index, because an async edit (an
  // ImageField upload) can resolve after the user has reordered. `handleMove` splices the same
  // object references, so identity survives a reorder while an index does not. The ref keeps the
  // lookup against the CURRENT array rather than the one captured at render time.
  const entriesRef = useRef(entries);
  entriesRef.current = entries;

  const itemSchema = field.itemSchema;
  if (!itemSchema) {
    // A `list` field with no `itemSchema` is a metadata bug, not user data. Render nothing rather
    // than guessing at a shape; the registry parity test is what catches it at source.
    return null;
  }

  const entrySchema = withoutNestedLists(itemSchema);
  const itemLabel = field.itemLabel ?? 'Item';
  const canAdd = field.maxItems === undefined || entries.length < field.maxItems;

  function handleEntryChange(entry: Record<string, unknown>, next: Record<string, unknown>) {
    const current = entriesRef.current;
    const index = current.indexOf(entry);
    if (index === -1) {
      // The entry was removed while an edit was in flight. Dropping the write is correct: there is
      // no longer a target, and appending it would resurrect deleted content.
      return;
    }
    onChange(current.map((candidate, i) => (i === index ? next : candidate)));
  }

  function handleAdd() {
    onChange([...entries, {}]);
  }

  function handleRemove(index: number) {
    onChange(entries.filter((_entry, i) => i !== index));
  }

  function handleMove(index: number, delta: -1 | 1) {
    const target = index + delta;
    if (target < 0 || target >= entries.length) {
      return;
    }
    const next = [...entries];
    const moved = next[index];
    if (!moved) {
      return;
    }
    next.splice(index, 1);
    next.splice(target, 0, moved);
    onChange(next);
  }

  return (
    <div className={styles.field}>
      <span className={styles.label}>{field.label}</span>

      {entries.length === 0 && <p className={styles.empty}>No {itemLabel.toLowerCase()}s yet.</p>}

      {entries.map((entry, index) => {
        const title = `${itemLabel} ${index + 1}`;
        return (
          // eslint-disable-next-line react/no-array-index-key -- list entries have no stable id in stored data; position IS their identity, and reorder replaces the whole array
          <div key={index} className={styles.entry}>
            <div className={styles.entryHeader}>
              <span className={styles.entryTitle}>{title}</span>
              <span className={styles.entryControls}>
                <IconButton
                  icon="chevron-up"
                  aria-label={`Move ${title} up`}
                  size="sm"
                  disabled={index === 0}
                  onClick={() => handleMove(index, -1)}
                />
                <IconButton
                  icon="chevron-down"
                  aria-label={`Move ${title} down`}
                  size="sm"
                  disabled={index === entries.length - 1}
                  onClick={() => handleMove(index, 1)}
                />
                <IconButton
                  icon="delete"
                  aria-label={`Remove ${title}`}
                  size="sm"
                  onClick={() => handleRemove(index)}
                />
              </span>
            </div>
            <PropertyPanel
              schema={entrySchema}
              values={entry}
              onChange={(next) => handleEntryChange(entry, next)}
              supabase={supabase}
              userId={userId}
              idPrefix={`${field.key}-${index}`}
            />
          </div>
        );
      })}

      {canAdd && (
        <Button type="button" variant="ghost" onClick={handleAdd}>
          Add {itemLabel}
        </Button>
      )}
    </div>
  );
}
