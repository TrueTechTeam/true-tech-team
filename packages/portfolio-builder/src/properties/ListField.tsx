'use client';

import { useRef } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Button, IconButton } from '@true-tech-team/react-components';
import { ReorderableList } from '../editor/ReorderableList';
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
  // ImageField upload) can resolve after the user has reordered. A reorder moves the same object
  // references, so identity survives it while an index does not. The ref keeps the lookup against
  // the CURRENT array rather than the one captured at render time.
  const entriesRef = useRef(entries);
  entriesRef.current = entries;

  // Maps an entry object to the object that replaced it after an edit. A WeakMap so replaced
  // entries garbage-collect naturally and there is nothing to prune.
  const superseded = useRef(new WeakMap<object, Record<string, unknown>>());

  // Stored entries carry no id, but a reorderable row needs one that survives both a reorder and an
  // edit (an edit replaces the entry object). Ids live beside the data, keyed by object identity,
  // and an edit hands its id on to the replacement. Two entries with identical content still get
  // different ids, so the right one moves.
  const entryIds = useRef(new WeakMap<object, string>());
  const nextEntryId = useRef(0);
  function entryId(entry: Record<string, unknown>): string {
    let id = entryIds.current.get(entry);
    if (id === undefined) {
      id = `entry-${nextEntryId.current++}`;
      entryIds.current.set(entry, id);
    }
    return id;
  }

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
    let target: Record<string, unknown> | undefined = entry;
    let index = current.indexOf(entry);
    // `PropertyPanel` builds every edit as a NEW object, so editing any sibling field while an
    // upload is in flight replaces the entry this callback captured. Follow the supersession chain
    // to the entry's current incarnation before concluding it is gone.
    while (index === -1 && target) {
      target = superseded.current.get(target);
      index = target ? current.indexOf(target) : -1;
    }
    if (index === -1 || !target) {
      // Nothing in the chain is still in the array: the entry was genuinely removed while an edit
      // was in flight. Dropping the write is correct - appending it would resurrect deleted content.
      return;
    }
    // A deferred write was built from the entry as it was when the edit began, so applying it
    // wholesale would revert any sibling fields edited since. Apply only the keys it changed.
    let replacement = next;
    if (target !== entry) {
      const patch: Record<string, unknown> = {};
      for (const key of Object.keys(next)) {
        if (next[key] !== entry[key]) {
          patch[key] = next[key];
        }
      }
      replacement = { ...target, ...patch };
    }
    superseded.current.set(target, replacement);
    entryIds.current.set(replacement, entryId(target));
    onChange(current.map((candidate, i) => (i === index ? replacement : candidate)));
  }

  function handleAdd() {
    onChange([...entries, {}]);
  }

  function handleRemove(index: number) {
    onChange(entries.filter((_entry, i) => i !== index));
  }

  return (
    <div className={styles.field}>
      <span className={styles.label}>{field.label}</span>

      {entries.length === 0 && <p className={styles.empty}>No {itemLabel.toLowerCase()}s yet.</p>}

      {entries.length > 0 && (
        <ReorderableList
          items={entries}
          label={field.label}
          getId={entryId}
          getLabel={(_entry, index) => `${itemLabel} ${index + 1}`}
          onReorder={(next) => onChange(next)}
          renderItem={(entry, { handle, index, isDragging, isOver }) => {
            const title = `${itemLabel} ${index + 1}`;
            const classes = [
              styles.entry,
              isDragging ? styles.entryDragging : '',
              isOver ? styles.entryOver : '',
            ]
              .filter(Boolean)
              .join(' ');
            return (
              <div className={classes}>
                <div className={styles.entryHeader}>
                  {handle}
                  <span className={styles.entryTitle}>{title}</span>
                  <IconButton
                    icon="delete"
                    aria-label={`Remove ${title}`}
                    size="sm"
                    onClick={() => handleRemove(index)}
                  />
                </div>
                <PropertyPanel
                  dense
                  schema={entrySchema}
                  values={entry}
                  onChange={(next) => handleEntryChange(entry, next)}
                  supabase={supabase}
                  userId={userId}
                  idPrefix={`${field.key}-${index}`}
                />
              </div>
            );
          }}
        />
      )}

      {canAdd && (
        <Button type="button" variant="ghost" onClick={handleAdd}>
          Add {itemLabel}
        </Button>
      )}
    </div>
  );
}
