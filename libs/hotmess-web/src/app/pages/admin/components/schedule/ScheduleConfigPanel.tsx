import { useState } from 'react';
import { Button, Input, Badge, Select } from '@true-tech-team/ui-components';
import type { SchedulingRule } from '@true-tech-team/hotmess-types';
import { computeTimeSlots } from '../../utils/timeSlotComputation';
import styles from './ScheduleConfigPanel.module.scss';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const SCHEDULING_RULE_LABELS: Record<SchedulingRule, string> = {
  no_rules: 'No Rules — back-to-back OK',
  one_game_break: 'One Game Break — exactly 1 slot gap',
  not_back_to_back: 'Not Back to Back — min 1 slot gap',
  any_schedule: 'Any Schedule — flexible spacing',
};

export interface ScheduleConfigState {
  venueId: string;
  selectedPlayAreas: string[];
  gameDays: number[];
  firstGameTime: string;
  bufferMinutes: number;
  totalWeeks: number;
  maxGamesPerDay: number;
  tournamentDate: string;
  backupTournamentDates: string[];
  makeupDates: string[];
  blackoutDates: string[];
}

interface ScheduleConfigPanelProps {
  config: ScheduleConfigState;
  onUpdate: (config: ScheduleConfigState) => void;
  venues: Array<{ id: string; name: string; play_areas: string[] }>;
  gameDurationMinutes: number;
  schedulingRule?: SchedulingRule;
}

export function ScheduleConfigPanel({
  config,
  onUpdate,
  venues,
  gameDurationMinutes,
  schedulingRule,
}: ScheduleConfigPanelProps) {
  const [newPlayArea, setNewPlayArea] = useState('');
  const [newBackupDate, setNewBackupDate] = useState('');
  const [newMakeupDate, setNewMakeupDate] = useState('');
  const [newBlackoutDate, setNewBlackoutDate] = useState('');

  const computedTimeSlots = config.firstGameTime && gameDurationMinutes > 0
    ? computeTimeSlots(config.firstGameTime, gameDurationMinutes, 10, config.bufferMinutes)
    : [];

  const handleVenueChange = (venueId: string) => {
    const venue = venues.find((v) => v.id === venueId);
    onUpdate({
      ...config,
      venueId,
      selectedPlayAreas: venue ? [...venue.play_areas] : [],
    });
  };

  const handleAddPlayArea = () => {
    if (!newPlayArea.trim()) return;
    onUpdate({
      ...config,
      selectedPlayAreas: [...config.selectedPlayAreas, newPlayArea.trim()],
    });
    setNewPlayArea('');
  };

  const handleRemovePlayArea = (index: number) => {
    onUpdate({
      ...config,
      selectedPlayAreas: config.selectedPlayAreas.filter((_, i) => i !== index),
    });
  };

  const toggleGameDay = (day: number) => {
    const newDays = config.gameDays.includes(day)
      ? config.gameDays.filter((d) => d !== day)
      : [...config.gameDays, day].sort();
    onUpdate({ ...config, gameDays: newDays });
  };

  const addDate = (
    list: string[],
    newDate: string,
    field: 'backupTournamentDates' | 'makeupDates' | 'blackoutDates',
    clearFn: (val: string) => void
  ) => {
    if (!newDate) return;
    onUpdate({ ...config, [field]: [...list, newDate] });
    clearFn('');
  };

  const removeDate = (
    list: string[],
    index: number,
    field: 'backupTournamentDates' | 'makeupDates' | 'blackoutDates'
  ) => {
    onUpdate({ ...config, [field]: list.filter((_, i) => i !== index) });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  const formatDate = (date: string) =>
    new Date(`${date}T00:00`).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  return (
    <div className={styles.configPanel}>
      <h3 className={styles.sectionTitle}>Schedule Configuration</h3>
      <p className={styles.description}>
        Configure the venue, play areas, game days, timing, and important dates for this season.
      </p>

      <div className={styles.columnsGrid}>
        {/* Column 1 — Venue & Play Areas */}
        <div className={styles.configSection}>
          <h4>Venue & Play Areas</h4>

          <div className={styles.venueSelector}>
            <Select
              label="Venue"
              options={venues.map((v) => ({ value: v.id, label: v.name }))}
              value={config.venueId}
              onChange={handleVenueChange}
              placeholder="Select a venue..."
            />
          </div>

          <p className={styles.hint}>
            Play areas from the venue. You can add or remove areas for this season.
          </p>

          <div className={styles.tagList}>
            {config.selectedPlayAreas.map((area, index) => (
              <Badge key={index} variant="neutral" size="sm" className={styles.tag}>
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
            {config.selectedPlayAreas.length === 0 && (
              <p className={styles.emptyText}>No play areas selected</p>
            )}
          </div>

          <div className={styles.addRow}>
            <div onKeyDown={(e) => e.key === 'Enter' && handleAddPlayArea()}>
              <Input
                placeholder="e.g., Field 3, Court C"
                value={newPlayArea}
                onChange={(e) => setNewPlayArea(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" onClick={handleAddPlayArea}>
              Add
            </Button>
          </div>

          {schedulingRule && (
            <>
              <p className={styles.schedulingRuleLabel} style={{ marginTop: '1.5rem' }}>
                Sport Scheduling Rule
              </p>
              <div className={styles.schedulingRuleBadge}>
                {SCHEDULING_RULE_LABELS[schedulingRule]}
              </div>
            </>
          )}
        </div>

        {/* Column 2 — Schedule Timing */}
        <div className={styles.configSection}>
          <h4>Schedule Timing</h4>
          <p className={styles.hint}>Select game days and configure timing for each game day.</p>

          <div className={styles.gameDaysGrid}>
            {DAY_LABELS.map((label, index) => (
              <button
                key={index}
                type="button"
                className={`${styles.dayToggle} ${config.gameDays.includes(index) ? styles.active : ''}`}
                onClick={() => toggleGameDay(index)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className={styles.timingInputs}>
            <Input
              type="time"
              label="First Game Time"
              value={config.firstGameTime}
              onChange={(e) => onUpdate({ ...config, firstGameTime: e.target.value })}
            />
            <Input
              type="number"
              label="Buffer (min)"
              value={String(config.bufferMinutes)}
              onChange={(e) =>
                onUpdate({ ...config, bufferMinutes: parseInt(e.target.value) || 0 })
              }
            />
            <Input
              type="number"
              label="Total Weeks"
              value={String(config.totalWeeks)}
              onChange={(e) =>
                onUpdate({ ...config, totalWeeks: parseInt(e.target.value) || 1 })
              }
            />
            <Input
              type="number"
              label="Max Games/Team/Day"
              value={String(config.maxGamesPerDay)}
              onChange={(e) =>
                onUpdate({ ...config, maxGamesPerDay: parseInt(e.target.value) || 1 })
              }
            />
          </div>

          <div className={styles.readOnlyField}>
            <span className={styles.readOnlyLabel}>Game Duration</span>
            <span className={styles.readOnlyValue}>{gameDurationMinutes} min</span>
          </div>

          <div className={styles.timeSlotList} style={{ marginTop: '1rem' }}>
            <h5
              style={{
                margin: '0 0 0.5rem 0',
                fontSize: '0.8125rem',
                fontWeight: 500,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.025em',
              }}
            >
              Computed Time Slots
            </h5>
            {computedTimeSlots.length > 0 ? (
              computedTimeSlots.map((time, index) => (
                <div key={index} className={styles.timeSlot}>
                  <span>
                    Slot {index + 1}: {formatTime(time)}
                  </span>
                </div>
              ))
            ) : (
              <p className={styles.emptyText}>
                Set first game time to compute time slots.
              </p>
            )}
          </div>
        </div>

        {/* Column 3 — Dates */}
        <div className={styles.configSection}>
          <h4>Tournament & Dates</h4>
          <p className={styles.hint}>Tournament date, backup dates, and schedule blackout dates.</p>

          <Input
            type="date"
            label="Tournament Date"
            value={config.tournamentDate}
            onChange={(e) => onUpdate({ ...config, tournamentDate: e.target.value })}
            style={{ marginBottom: '1.5rem' }}
          />

          <p className={styles.schedulingRuleLabel}>Backup Tournament Dates</p>
          <div className={styles.dateList}>
            {config.backupTournamentDates.map((date, index) => (
              <div key={index} className={styles.dateItem}>
                <span style={{ flex: 1 }}>{formatDate(date)}</span>
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => removeDate(config.backupTournamentDates, index, 'backupTournamentDates')}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className={styles.addRow} style={{ marginBottom: '1.5rem' }}>
            <Input
              type="date"
              value={newBackupDate}
              onChange={(e) => setNewBackupDate(e.target.value)}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                addDate(config.backupTournamentDates, newBackupDate, 'backupTournamentDates', setNewBackupDate)
              }
            >
              Add
            </Button>
          </div>

          <p className={styles.schedulingRuleLabel}>Makeup Dates</p>
          <div className={styles.dateList}>
            {config.makeupDates.map((date, index) => (
              <div key={index} className={styles.dateItem}>
                <span style={{ flex: 1 }}>{formatDate(date)}</span>
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => removeDate(config.makeupDates, index, 'makeupDates')}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className={styles.addRow} style={{ marginBottom: '1.5rem' }}>
            <Input
              type="date"
              value={newMakeupDate}
              onChange={(e) => setNewMakeupDate(e.target.value)}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                addDate(config.makeupDates, newMakeupDate, 'makeupDates', setNewMakeupDate)
              }
            >
              Add
            </Button>
          </div>

          <p className={styles.schedulingRuleLabel}>Blackout Dates</p>
          <div className={styles.dateList}>
            {config.blackoutDates.map((date, index) => (
              <div key={index} className={styles.dateItem}>
                <span style={{ flex: 1 }}>{formatDate(date)}</span>
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => removeDate(config.blackoutDates, index, 'blackoutDates')}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className={styles.addRow}>
            <Input
              type="date"
              value={newBlackoutDate}
              onChange={(e) => setNewBlackoutDate(e.target.value)}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                addDate(config.blackoutDates, newBlackoutDate, 'blackoutDates', setNewBlackoutDate)
              }
            >
              Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
