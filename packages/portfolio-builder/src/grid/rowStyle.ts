import type { CSSProperties } from 'react';
import type { SectionRow } from '../schema/types';

const JUSTIFY_MAP: Record<NonNullable<SectionRow['justify']>, CSSProperties['justifyContent']> = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
  'space-between': 'space-between',
};

const ALIGN_MAP: Record<NonNullable<SectionRow['align']>, CSSProperties['alignItems']> = {
  top: 'flex-start',
  center: 'center',
  bottom: 'flex-end',
  stretch: 'stretch',
};

export function rowAlignmentStyle(row: SectionRow): CSSProperties {
  const style: CSSProperties = {};
  if (row.justify) {
    style.justifyContent = JUSTIFY_MAP[row.justify];
  }
  if (row.align) {
    style.alignItems = ALIGN_MAP[row.align];
  }
  return style;
}
