import { useMemo } from 'react';
import { Table } from '@true-tech-team/ui-components';
import type { BracketMatch } from '../../../../../hooks/useBracketMatches';
import { type MatchWithGameId, buildFeederLookup } from '../../utils/divisionLettering';
import { getTimeSlotColor, getTimeSlotBgColor, findTimeSlotIndex } from '../../utils/rainbowColors';
import styles from './MasterSchedule.module.scss';

interface MasterScheduleProps {
  matches: MatchWithGameId[];
  timeSlots: string[];
  onMatchClick?: (match: BracketMatch) => void;
}

export function MasterSchedule({ matches, timeSlots, onMatchClick }: MasterScheduleProps) {
  const feederLookup = useMemo(() => buildFeederLookup(matches), [matches]);

  const matchesByField = useMemo(() => {
    const grouped = new Map<string, MatchWithGameId[]>();

    for (const match of matches) {
      const field = match.play_area || 'Unassigned';
      if (!grouped.has(field)) {
        grouped.set(field, []);
      }
      const fieldMatches = grouped.get(field);
      if (fieldMatches) {
        fieldMatches.push(match);
      }
    }

    // Sort within each field by scheduled_at
    for (const [, fieldMatches] of grouped) {
      fieldMatches.sort((a, b) => {
        const aTime = a.scheduled_at ? new Date(a.scheduled_at).getTime() : Infinity;
        const bTime = b.scheduled_at ? new Date(b.scheduled_at).getTime() : Infinity;
        return aTime - bTime;
      });
    }

    return grouped;
  }, [matches]);

  if (matches.length === 0) {
    return null;
  }

  const columns = [
    {
      key: 'scheduled_at' as const,
      header: 'Time',
      width: '100px',
      render: (value: unknown) => {
        if (!value) {
          return '\u2014';
        }
        const slotIdx = findTimeSlotIndex(value as string, timeSlots);
        const color = getTimeSlotColor(slotIdx);
        const bgColor = getTimeSlotBgColor(slotIdx);
        return (
          <span className={styles.timeSlot} style={{ color, backgroundColor: bgColor }}>
            {new Date(value as string).toLocaleTimeString(undefined, {
              hour: 'numeric',
              minute: '2-digit',
            })}
          </span>
        );
      },
    },
    {
      key: 'gameId' as const,
      header: 'Game',
      width: '60px',
      render: (_: unknown, row: MatchWithGameId) => (
        <span className={styles.gameId}>{row.gameId}</span>
      ),
    },
    {
      key: 'team1' as const,
      header: 'Home',
      width: '1fr',
      render: (_: unknown, row: MatchWithGameId) => {
        const feeders = feederLookup.get(row.id);
        if (row.team1?.name) {
          return <span className={styles.teamName}>{row.team1.name}</span>;
        }
        if (feeders?.homeFeeder) {
          return <span className={styles.feederGameId}>{feeders.homeFeeder}</span>;
        }
        return <span className={styles.tbd}>{'\u2014'}</span>;
      },
    },
    {
      key: 'vs' as const,
      header: '',
      width: '40px',
      render: () => <span className={styles.vs}>vs</span>,
    },
    {
      key: 'team2' as const,
      header: 'Away',
      width: '1fr',
      render: (_: unknown, row: MatchWithGameId) => {
        const feeders = feederLookup.get(row.id);
        if (row.team2?.name) {
          return <span className={styles.teamName}>{row.team2.name}</span>;
        }
        if (feeders?.awayFeeder) {
          return <span className={styles.feederGameId}>{feeders.awayFeeder}</span>;
        }
        return <span className={styles.tbd}>{'\u2014'}</span>;
      },
    },
  ];

  return (
    <div className={styles.masterSchedule}>
      <h3 className={styles.title}>Master Schedule</h3>

      {Array.from(matchesByField.entries()).map(([field, fieldMatches]) => (
        <div key={field} className={styles.fieldSection}>
          <h4 className={styles.fieldHeader}>{field}</h4>
          <Table
            data={fieldMatches}
            columns={columns}
            rowKey="id"
            onRowClick={onMatchClick ? (row) => onMatchClick(row) : undefined}
            variant="bordered"
            size="sm"
          />
        </div>
      ))}
    </div>
  );
}
