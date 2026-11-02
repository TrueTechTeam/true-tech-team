'use client';

import { TEMPLATE_IDS, TEMPLATES } from '../templates/registry';
import styles from './TemplatePicker.module.scss';

export interface TemplatePickerProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

/**
 * Controlled template chooser for the create dialog. Holds no state of its own so the dialog can
 * reset the selection when it closes.
 */
export function TemplatePicker({ selectedId, onSelect }: TemplatePickerProps) {
  const selected = TEMPLATES[selectedId];

  return (
    <div className={styles.picker} role="group" aria-label="Choose a template">
      <span className={styles.label}>Choose a template</span>
      <div className={styles.cards}>
        {TEMPLATE_IDS.map((id) => {
          const template = TEMPLATES[id];
          if (!template) {
            return null;
          }
          return (
            <button
              key={id}
              type="button"
              className={styles.card}
              aria-pressed={id === selectedId}
              onClick={() => onSelect(id)}
            >
              {template.label}
            </button>
          );
        })}
      </div>
      {/* One description for the selection rather than one per card, so the cards stay scannable. */}
      <p className={styles.description}>{selected?.description ?? ''}</p>
    </div>
  );
}
