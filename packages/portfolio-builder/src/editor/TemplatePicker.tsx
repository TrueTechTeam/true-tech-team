'use client';

import {
  ButtonToggleGroup,
  ButtonToggleGroupItem,
  type ThemeMode,
} from '@true-tech-team/react-components';
import { TEMPLATE_IDS, TEMPLATES } from '../templates/registry';
import { isThemeMode } from '../themes/types';
import { TemplateThumbnail } from './TemplateThumbnail';
import styles from './TemplatePicker.module.scss';

export interface TemplatePickerProps {
  selectedId: string;
  onSelect: (id: string) => void;
  /**
   * The mode every thumbnail previews in. Already resolved by the caller - the picker never
   * guesses a default, so there is one place that decides what "the template's default" means.
   */
  mode: ThemeMode;
  onModeChange: (mode: ThemeMode) => void;
}

/**
 * Controlled template chooser for the create dialog. Holds no state of its own so the dialog can
 * reset the selection when it closes.
 *
 * The mode toggle sits OUTSIDE the cards on purpose. A card is a `<button>` whose thumbnail
 * already renders the library `Navbar`'s own `<button>` - a known nested-button defect deferred
 * elsewhere - and `ButtonToggleGroupItem` renders a `<button>` too, so putting the toggle inside a
 * card would add a second instance of that defect.
 */
export function TemplatePicker({ selectedId, onSelect, mode, onModeChange }: TemplatePickerProps) {
  const selected = TEMPLATES[selectedId];

  return (
    <div className={styles.picker} role="group" aria-label="Choose a template">
      <div className={styles.labelRow}>
        <span className={styles.label}>Choose a template</span>
        {/* A segmented control rather than a checkbox: light/dark switches a view, both options
            have one-word labels, and showing them side by side says what the alternative is.
            `onChange` hands back a plain string and fires even on the already-selected item, so
            it is narrowed to a ThemeMode and a no-op repeat is harmless. */}
        <ButtonToggleGroup
          value={mode}
          onChange={(value) => {
            if (isThemeMode(value)) {
              onModeChange(value);
            }
          }}
          size="sm"
          aria-label="Preview mode"
          data-testid="template-mode-toggle"
        >
          <ButtonToggleGroupItem value="light">Light</ButtonToggleGroupItem>
          <ButtonToggleGroupItem value="dark">Dark</ButtonToggleGroupItem>
        </ButtonToggleGroup>
      </div>
      <div className={styles.cards}>
        {TEMPLATE_IDS.map((id) => {
          const template = TEMPLATES[id];
          if (!template) {
            return null;
          }
          const isSelected = id === selectedId;
          return (
            <button
              key={id}
              type="button"
              className={styles.card}
              aria-pressed={isSelected}
              onClick={() => onSelect(id)}
            >
              <TemplateThumbnail template={template} mode={mode} />
              <span className={styles.cardLabel}>{template.label}</span>
              {isSelected && (
                <span className={styles.check} aria-hidden="true" data-testid="selected-indicator">
                  &#10003;
                </span>
              )}
            </button>
          );
        })}
      </div>
      {/* One description for the selection rather than one per card, so the cards stay scannable. */}
      <p className={styles.description}>{selected?.description ?? ''}</p>
    </div>
  );
}
