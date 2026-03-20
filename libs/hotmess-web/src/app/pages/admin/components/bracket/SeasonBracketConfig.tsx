import { useState } from 'react';
import { Button, Input, Badge } from '@true-tech-team/ui-components';
import styles from './SeasonBracketConfig.module.scss';

export interface BracketScheduleConfig {
  playAreas: string[];
  tournamentDate: string;
  timeSlots: string[];
  firstGameTime: string;
  gameDurationMinutes: number;
  bufferMinutes: number;
}

interface SeasonBracketConfigProps {
  config: BracketScheduleConfig;
  onUpdate: (config: BracketScheduleConfig) => void;
}

export function SeasonBracketConfig({ config, onUpdate }: SeasonBracketConfigProps) {
  const [newPlayArea, setNewPlayArea] = useState('');

  const handleAddPlayArea = () => {
    if (!newPlayArea.trim()) { return; }
    onUpdate({
      ...config,
      playAreas: [...config.playAreas, newPlayArea.trim()],
    });
    setNewPlayArea('');
  };

  const handleRemovePlayArea = (index: number) => {
    onUpdate({
      ...config,
      playAreas: config.playAreas.filter((_, i) => i !== index),
    });
  };

  const handleDateChange = (date: string) => {
    onUpdate({ ...config, tournamentDate: date });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  return (
    <div className={styles.seasonConfig}>
      <h3 className={styles.sectionTitle}>Tournament Schedule Configuration</h3>
      <p className={styles.description}>
        Configure the tournament date, play areas, and scheduling timing. Time slots are
        auto-calculated from the sport&apos;s game duration and the number of matches needed.
      </p>

      <div className={styles.tournamentDate}>
        <Input
          type="date"
          label="Tournament Date"
          value={config.tournamentDate}
          onChange={(e) => handleDateChange(e.target.value)}
        />
        {config.tournamentDate && (
          <span className={styles.datePreview}>
            {new Date(`${config.tournamentDate}T00:00`).toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        )}
      </div>

      <div className={styles.columnsGrid}>
        {/* Play Areas */}
        <div className={styles.configSection}>
          <h4>Play Areas</h4>
          <p className={styles.hint}>
            Add all available play areas (fields, courts, etc.) for this tournament.
          </p>

          <div className={styles.tagList}>
            {config.playAreas.map((area, index) => (
              <Badge
                key={index}
                variant="neutral"
                size="sm"
                className={styles.tag}
              >
                {area}
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => handleRemovePlayArea(index)}
                  aria-label={`Remove ${area}`}
                >
                  ×
                </button>
              </Badge>
            ))}
            {config.playAreas.length === 0 && (
              <p className={styles.emptyText}>No play areas added yet</p>
            )}
          </div>

          <div className={styles.addRow}>
            <div onKeyDown={(e) => e.key === 'Enter' && handleAddPlayArea()}>
              <Input
                placeholder="e.g., Field 1, Court A"
                value={newPlayArea}
                onChange={(e) => setNewPlayArea(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" onClick={handleAddPlayArea}>
              Add
            </Button>
          </div>
        </div>

        {/* Schedule Timing */}
        <div className={styles.configSection}>
          <h4>Schedule Timing</h4>
          <p className={styles.hint}>
            Time slots are auto-calculated from the game duration and buffer time.
          </p>

          <div className={styles.timingInputs}>
            <Input
              type="time"
              label="First Game Time"
              value={config.firstGameTime}
              onChange={(e) => onUpdate({ ...config, firstGameTime: e.target.value })}
            />
            <div className={styles.readOnlyField}>
              <span className={styles.readOnlyLabel}>Game Duration</span>
              <span>{config.gameDurationMinutes} min</span>
            </div>
            <Input
              type="number"
              label="Buffer (min)"
              value={String(config.bufferMinutes)}
              onChange={(e) => onUpdate({ ...config, bufferMinutes: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className={styles.timeSlotList}>
            <h5 className={styles.subHeading}>Computed Time Slots</h5>
            {config.timeSlots.length > 0 ? (
              config.timeSlots.map((time, index) => (
                <div key={index} className={styles.timeSlot}>
                  <span>Slot {index + 1}: {formatTime(time)}</span>
                </div>
              ))
            ) : (
              <p className={styles.emptyText}>
                Time slots will be computed when divisions and teams are configured.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
