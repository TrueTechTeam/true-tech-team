'use client';

import { useDraggable, Icon, type IconName } from '@true-tech-team/react-components';
import type { ComponentType } from '../schema/types';
import styles from './editor.module.scss';

interface PaletteEntry {
  componentType: ComponentType;
  label: string;
  icon: IconName;
}

const INTERACTIVE_ENTRIES: PaletteEntry[] = [
  { componentType: 'button', label: 'Button', icon: 'link' },
  { componentType: 'iconButton', label: 'Icon Button', icon: 'link' },
  { componentType: 'accordion', label: 'Accordion', icon: 'list' },
  { componentType: 'collapse', label: 'Expandable Text', icon: 'chevron-down' },
  { componentType: 'flipCard', label: 'Flip Card', icon: 'refresh' },
];

const DISPLAY_ENTRIES: PaletteEntry[] = [
  { componentType: 'heading', label: 'Heading', icon: 'type' },
  { componentType: 'text', label: 'Text', icon: 'align-left' },
  { componentType: 'image', label: 'Image', icon: 'image' },
  { componentType: 'spacer', label: 'Spacer', icon: 'minus' },
  { componentType: 'card', label: 'Card', icon: 'credit-card' },
  { componentType: 'badge', label: 'Badge', icon: 'tag' },
  { componentType: 'avatar', label: 'Avatar', icon: 'user' },
  { componentType: 'chip', label: 'Chip', icon: 'tag' },
  { componentType: 'pill', label: 'Pill', icon: 'tag' },
  { componentType: 'icon', label: 'Icon', icon: 'star' },
  { componentType: 'statusIndicator', label: 'Status Indicator', icon: 'activity' },
  { componentType: 'progressBar', label: 'Progress Bar', icon: 'trending-up' },
  { componentType: 'circularProgress', label: 'Circular Progress', icon: 'target' },
  { componentType: 'kpi', label: 'KPI', icon: 'trending-up' },
  { componentType: 'countUp', label: 'Count Up', icon: 'hash' },
  { componentType: 'overflowText', label: 'Overflow Text', icon: 'align-left' },
  { componentType: 'reveal', label: 'Reveal', icon: 'eye' },
];

function PaletteEntryButton({ entry }: { entry: PaletteEntry }) {
  const { setNodeRef, attributes, listeners, isDragging } = useDraggable({
    id: `palette:${entry.componentType}`,
    data: { type: 'palette-item', componentType: entry.componentType },
  });

  return (
    <button
      type="button"
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={isDragging ? styles.paletteEntryDragging : styles.paletteEntry}
    >
      <Icon name={entry.icon} size="sm" />
      <span>{entry.label}</span>
    </button>
  );
}

export interface PaletteProps {
  className?: string;
}

export function Palette({ className }: PaletteProps) {
  return (
    <div className={className}>
      <section>
        <h3 className={styles.paletteGroupTitle}>Interactive</h3>
        {INTERACTIVE_ENTRIES.map((entry) => (
          <PaletteEntryButton key={entry.componentType} entry={entry} />
        ))}
      </section>
      <section>
        <h3 className={styles.paletteGroupTitle}>Display</h3>
        {DISPLAY_ENTRIES.map((entry) => (
          <PaletteEntryButton key={entry.componentType} entry={entry} />
        ))}
      </section>
    </div>
  );
}
