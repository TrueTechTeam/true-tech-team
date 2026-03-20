import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogFooter,
  Button,
  Select,
  Alert,
  useToastContext,
} from '@true-tech-team/ui-components';
import type { BracketMatch } from '../../../../../hooks/useBracketMatches';
import { detectConflicts, DEFAULT_CONSTRAINTS } from '../../utils/bracketScheduling';
import styles from './MatchScheduler.module.scss';

interface MatchSchedulerProps {
  match: BracketMatch | null;
  allMatches: BracketMatch[];
  availableVenues?: Array<{ id: string; name: string }>;
  playAreas?: string[];
  timeSlots?: string[];
  tournamentDate?: string;
  onSave: (matchId: string, updates: MatchScheduleUpdate) => Promise<void>;
  onClose: () => void;
}

export interface MatchScheduleUpdate {
  scheduled_at?: string;
  venue_id?: string;
  play_area?: string;
}

function formatTimeSlot(slot: string): string {
  const [hours, minutes] = slot.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${minutes} ${ampm}`;
}

function buildTimeSlotOptions(
  timeSlots: string[],
  tournamentDate: string
): Array<{ value: string; label: string }> {
  return timeSlots.map((slot) => {
    const [hours, minutes] = slot.split(':');
    const scheduledAt = new Date(tournamentDate);
    scheduledAt.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return {
      value: scheduledAt.toISOString(),
      label: formatTimeSlot(slot),
    };
  });
}

export function MatchScheduler({
  match,
  allMatches,
  availableVenues = [],
  playAreas = [],
  timeSlots = [],
  tournamentDate = '',
  onSave,
  onClose,
}: MatchSchedulerProps) {
  const toast = useToastContext();
  const [form, setForm] = useState<MatchScheduleUpdate>({});
  const [saving, setSaving] = useState(false);
  const [conflicts, setConflicts] = useState<ReturnType<typeof detectConflicts>>([]);

  useEffect(() => {
    if (match) {
      setForm({
        scheduled_at: match.scheduled_at || '',
        venue_id: match.venue_id || '',
        play_area: match.play_area || '',
      });
    }
  }, [match]);

  // Detect conflicts whenever schedule changes
  useEffect(() => {
    if (match && form.scheduled_at) {
      const updatedMatch: BracketMatch = {
        ...match,
        scheduled_at: form.scheduled_at,
        venue_id: form.venue_id,
        play_area: form.play_area,
      };

      const detected = detectConflicts(updatedMatch, allMatches, DEFAULT_CONSTRAINTS);
      setConflicts(detected);
    } else {
      setConflicts([]);
    }
  }, [match, form.scheduled_at, form.venue_id, form.play_area, allMatches]);

  const handleSave = async () => {
    if (!match) {
      return;
    }

    const hasErrors = conflicts.some((c) => c.severity === 'error');
    if (hasErrors) {
      toast?.error('Cannot save: there are scheduling conflicts that must be resolved.');
      return;
    }

    setSaving(true);
    try {
      const updates: MatchScheduleUpdate = {};

      if (form.scheduled_at) {
        updates.scheduled_at = form.scheduled_at;
      }
      if (form.venue_id) {
        updates.venue_id = form.venue_id;
      }
      if (form.play_area) {
        updates.play_area = form.play_area;
      }

      await onSave(match.id, updates);
      toast?.success('Match schedule updated successfully!');
      onClose();
    } catch (error) {
      console.error('Failed to save match:', error);
      toast?.error('Failed to save match. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!match) {
    return null;
  }

  const team1Name = match.team1?.name || '\u2014';
  const team2Name = match.team2?.name || '\u2014';

  const hasErrors = conflicts.some((c) => c.severity === 'error');

  const timeOptions =
    tournamentDate && timeSlots.length > 0 ? buildTimeSlotOptions(timeSlots, tournamentDate) : [];

  return (
    <Dialog
      isOpen={!!match}
      onClose={onClose}
      title="Edit Match Schedule"
      size="md"
      actions={
        <DialogFooter align="end">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving || hasErrors}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      }
    >
      <div className={styles.matchScheduler}>
        {/* Match Info */}
        <div className={styles.matchInfo}>
          <h3>
            Round {match.round} &bull; Match {match.position + 1}
          </h3>
          <div className={styles.teams}>
            <span>{team1Name}</span>
            <span className={styles.vs}>vs</span>
            <span>{team2Name}</span>
          </div>
        </div>

        {/* Scheduling Form */}
        <div className={styles.form}>
          {/* Time Slot Selection */}
          {timeOptions.length > 0 && (
            <div className={styles.formRow}>
              <Select
                label="Scheduled Time"
                options={[{ value: '', label: 'Select time slot...' }, ...timeOptions]}
                value={form.scheduled_at || ''}
                onChange={(val) => setForm({ ...form, scheduled_at: val })}
              />
            </div>
          )}

          {availableVenues.length > 0 && (
            <div className={styles.formRow}>
              <Select
                label="Venue"
                options={[
                  { value: '', label: 'Select venue...' },
                  ...availableVenues.map((v) => ({ value: v.id, label: v.name })),
                ]}
                value={form.venue_id || ''}
                onChange={(val) => setForm({ ...form, venue_id: val })}
              />
            </div>
          )}

          {playAreas.length > 0 && (
            <div className={styles.formRow}>
              <Select
                label="Play Area"
                options={[
                  { value: '', label: 'Select play area...' },
                  ...playAreas.map((area) => ({ value: area, label: area })),
                ]}
                value={form.play_area || ''}
                onChange={(val) => setForm({ ...form, play_area: val })}
              />
            </div>
          )}

          {/* Conflict Warnings */}
          {conflicts.length > 0 && (
            <div className={styles.conflicts}>
              {conflicts.map((conflict, index) => (
                <Alert
                  key={index}
                  variant={conflict.severity === 'error' ? 'error' : 'warning'}
                  size="sm"
                >
                  {conflict.message}
                </Alert>
              ))}
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}
