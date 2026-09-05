'use client';

import { Input, Button } from '@true-tech-team/react-components';
import type { ResumeEducationEntry } from '../lib/types';
import styles from './EducationEntryFields.module.scss';

interface EducationEntryFieldsProps {
  entry: ResumeEducationEntry;
  onChange: (entry: ResumeEducationEntry) => void;
  onRemove: () => void;
}

export default function EducationEntryFields({
  entry,
  onChange,
  onRemove,
}: EducationEntryFieldsProps) {
  const update = (patch: Partial<ResumeEducationEntry>) => onChange({ ...entry, ...patch });

  return (
    <div className={styles.row}>
      <div className={styles.grid2}>
        <Input
          label="School"
          value={entry.school}
          onChange={(e) => update({ school: e.target.value })}
        />
        <Input
          label="Degree"
          value={entry.degree}
          onChange={(e) => update({ degree: e.target.value })}
        />
        <Input
          label="Location"
          value={entry.location ?? ''}
          onChange={(e) => update({ location: e.target.value })}
        />
        <Input
          label="Start date"
          value={entry.startDate ?? ''}
          onChange={(e) => update({ startDate: e.target.value })}
        />
        <Input
          label="End date"
          value={entry.endDate ?? ''}
          onChange={(e) => update({ endDate: e.target.value })}
        />
      </div>

      <Button variant="ghost" size="sm" onClick={onRemove}>
        Remove education
      </Button>
    </div>
  );
}
