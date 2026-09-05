'use client';

import { Input, Textarea, Button, IconButton } from '@true-tech-team/react-components';
import type { ResumeExperienceEntry } from '../lib/types';
import { useStableKeys } from './useStableKeys';
import styles from './ExperienceEntryFields.module.scss';

interface ExperienceEntryFieldsProps {
  entry: ResumeExperienceEntry;
  onChange: (entry: ResumeExperienceEntry) => void;
  onRemove: () => void;
}

export default function ExperienceEntryFields({
  entry,
  onChange,
  onRemove,
}: ExperienceEntryFieldsProps) {
  const update = (patch: Partial<ResumeExperienceEntry>) => onChange({ ...entry, ...patch });
  const bulletKeys = useStableKeys(entry.bullets.length);

  const updateBullet = (index: number, value: string) => {
    update({ bullets: entry.bullets.map((b, i) => (i === index ? value : b)) });
  };
  const addBullet = () => update({ bullets: [...entry.bullets, ''] });
  const removeBullet = (index: number) =>
    update({ bullets: entry.bullets.filter((_, i) => i !== index) });

  return (
    <div className={styles.row}>
      <div className={styles.grid2}>
        <Input
          label="Company"
          value={entry.company}
          onChange={(e) => update({ company: e.target.value })}
        />
        <Input label="Role" value={entry.role} onChange={(e) => update({ role: e.target.value })} />
        <Input
          label="Location"
          value={entry.location}
          onChange={(e) => update({ location: e.target.value })}
        />
        <Input
          label="Start date"
          value={entry.startDate}
          onChange={(e) => update({ startDate: e.target.value })}
          placeholder="e.g. Jan 2022"
        />
        <Input
          label="End date"
          value={entry.endDate}
          onChange={(e) => update({ endDate: e.target.value })}
          placeholder="e.g. Present"
        />
      </div>

      <div className={styles.bullets}>
        <span className={styles.bulletsLabel}>Bullet points</span>
        {entry.bullets.map((bullet, i) => (
          <div key={bulletKeys[i]} className={styles.bulletRow}>
            <Textarea
              value={bullet}
              onChange={(e) => updateBullet(i, e.target.value)}
              placeholder="Describe an accomplishment…"
              rows={2}
            />
            <IconButton
              icon="delete"
              aria-label="Remove bullet"
              size="sm"
              variant="ghost"
              onClick={() => removeBullet(i)}
            />
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addBullet}>
          Add bullet
        </Button>
      </div>

      <Button variant="ghost" size="sm" onClick={onRemove}>
        Remove experience
      </Button>
    </div>
  );
}
