'use client';

import type { SupabaseClient } from '@supabase/supabase-js';
import { Checkbox, Input, Select } from '@true-tech-team/react-components';
import { getSectionTypeMeta } from '../sections/meta';
import { PropertyPanel } from '../properties/PropertyPanel';
import type { PageSection, SectionBackground } from '../schema/types';
import styles from './SectionFormPanel.module.scss';

export interface SectionFormPanelProps {
  section: PageSection | null;
  onMetaChange: (patch: {
    name?: string;
    showInNav?: boolean;
    background?: SectionBackground;
  }) => void;
  onPropsChange: (props: Record<string, unknown>) => void;
  supabase: SupabaseClient;
  userId: string;
}

const BACKGROUND_OPTIONS = [
  { value: 'transparent', label: 'Transparent' },
  { value: 'primary', label: 'Primary' },
  { value: 'secondary', label: 'Secondary' },
  { value: 'tertiary', label: 'Tertiary' },
];

export function SectionFormPanel({
  section,
  onMetaChange,
  onPropsChange,
  supabase,
  userId,
}: SectionFormPanelProps) {
  if (!section) {
    return (
      <div className={styles.panel}>
        <p className={styles.message}>Select a section to edit it.</p>
      </div>
    );
  }

  const meta = getSectionTypeMeta(section.type);

  return (
    <div className={styles.panel}>
      {/* Section settings write to PageSection itself, not into `props`. Kept visually separate
          because they are a different part of the schema with different validation. */}
      <div className={styles.group}>
        <h3 className={styles.groupHeading}>Section settings</h3>
        <span className={styles.typeLabel}>{meta?.label ?? 'Unknown section type'}</span>
        <Input
          id="section-name"
          label="Section name"
          value={section.name}
          onChange={(event) => onMetaChange({ name: event.target.value })}
        />
        <Checkbox
          id="section-show-in-nav"
          label="Show in navigation"
          checked={section.showInNav}
          onChange={(checked) => onMetaChange({ showInNav: checked })}
        />
        <Select
          id="section-background"
          label="Background"
          options={BACKGROUND_OPTIONS}
          value={section.background ?? 'transparent'}
          onChange={(value) => onMetaChange({ background: value as SectionBackground })}
        />
      </div>

      <div className={styles.group}>
        <h3 className={styles.groupHeading}>Content</h3>
        {meta ? (
          <PropertyPanel
            schema={meta.propertySchema}
            values={section.props}
            onChange={onPropsChange}
            supabase={supabase}
            userId={userId}
          />
        ) : (
          <p className={styles.message}>
            This section can&apos;t be edited because its type isn&apos;t recognised. You can rename
            or remove it.
          </p>
        )}
      </div>
    </div>
  );
}
