'use client';

import { Select } from '@true-tech-team/react-components';
import { JUSTIFY_MAP, ALIGN_MAP } from '../grid/rowStyle';
import { getRowRemainingCapacity } from '../layout/transforms';
import type { RowAlign, RowJustify, SectionRow } from '../schema/types';
import styles from './RowPropertiesPanel.module.scss';

export interface RowPropertiesPanelProps {
  row: SectionRow;
  onAlignmentChange: (alignment: { justify?: RowJustify; align?: RowAlign }) => void;
}

const JUSTIFY_LABELS: Record<RowJustify, string> = {
  left: 'Left',
  center: 'Center',
  right: 'Right',
  'space-between': 'Space Between',
};

const ALIGN_LABELS: Record<RowAlign, string> = {
  top: 'Top',
  center: 'Center',
  bottom: 'Bottom',
  stretch: 'Stretch',
};

export function RowPropertiesPanel({ row, onAlignmentChange }: RowPropertiesPanelProps) {
  const used = 12 - getRowRemainingCapacity(row);

  return (
    <div className={styles.panel}>
      <Select
        id="row-justify"
        label="Justify"
        value={row.justify ?? 'left'}
        onChange={(value) => onAlignmentChange({ justify: value as RowJustify })}
        options={Object.keys(JUSTIFY_MAP).map((key) => ({
          value: key,
          label: JUSTIFY_LABELS[key as RowJustify],
        }))}
      />
      <Select
        id="row-align"
        label="Align"
        value={row.align ?? 'top'}
        onChange={(value) => onAlignmentChange({ align: value as RowAlign })}
        options={Object.keys(ALIGN_MAP).map((key) => ({
          value: key,
          label: ALIGN_LABELS[key as RowAlign],
        }))}
      />
      <p className={styles.capacity}>{used} of 12 columns used</p>
    </div>
  );
}
