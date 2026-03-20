import { useState } from 'react';
import { Table, Badge, Button, type ColumnConfig } from '@true-tech-team/ui-components';
import type { GeneratedGame, TeamStanding } from '../../utils';
import styles from './ScheduleConfigPanel.module.scss';

interface PreviewRow {
  id: string;
  timeSlot: string;
  playArea: string;
  homeTeam: string;
  awayTeam: string;
  [key: string]: unknown;
}

interface WeeklySchedulePreviewProps {
  games: GeneratedGame[];
  teams: TeamStanding[];
  totalWeeks: number;
  onClearWeek: (week: number) => void;
}

export function WeeklySchedulePreview({
  games,
  teams,
  totalWeeks,
  onClearWeek,
}: WeeklySchedulePreviewProps) {
  const [activeWeek, setActiveWeek] = useState(1);

  if (games.length === 0) {
    return null;
  }

  const teamMap = new Map(teams.map((t) => [t.id, t.name]));
  const weekNumbers = Array.from({ length: totalWeeks }, (_, i) => i + 1);
  const generatedWeeks = new Set(games.map((g) => g.week));

  const weekGames = games.filter((g) => g.week === activeWeek);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  const previewData: PreviewRow[] = weekGames
    .sort((a, b) => {
      const timeCompare = a.timeSlot.localeCompare(b.timeSlot);
      if (timeCompare !== 0) {
        return timeCompare;
      }
      return a.playArea.localeCompare(b.playArea);
    })
    .map((game) => ({
      id: game.id,
      timeSlot: game.timeSlot,
      playArea: game.playArea,
      homeTeam: teamMap.get(game.homeTeamId) || game.homeTeamId,
      awayTeam: teamMap.get(game.awayTeamId) || game.awayTeamId,
    }));

  const columns: Array<ColumnConfig<PreviewRow>> = [
    {
      key: 'timeSlot',
      header: 'Time',
      render: (v) => formatTime(v as string),
    },
    { key: 'playArea', header: 'Play Area' },
    { key: 'homeTeam', header: 'Home' },
    {
      key: 'vs',
      header: '',
      width: '40px',
      align: 'center',
      render: () => <span style={{ color: 'var(--text-muted)' }}>vs</span>,
    },
    { key: 'awayTeam', header: 'Away' },
  ];

  return (
    <div className={styles.configPanel}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <h3 className={styles.sectionTitle} style={{ margin: 0 }}>
          Generated Schedule
        </h3>
        <Badge variant="info" size="sm">
          {games.length} games total
        </Badge>
      </div>

      {/* Week tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {weekNumbers.map((week) => {
          const hasGames = generatedWeeks.has(week);
          const isActive = week === activeWeek;
          return (
            <button
              key={week}
              type="button"
              onClick={() => setActiveWeek(week)}
              style={{
                padding: '0.375rem 0.75rem',
                border: `1px solid ${isActive ? 'var(--logo-blue-50)' : 'var(--theme-border)'}`,
                borderRadius: '4px',
                background: isActive ? 'var(--logo-blue-50)' : 'var(--theme-bg-primary)',
                color: isActive
                  ? '#fff'
                  : hasGames
                    ? 'var(--theme-text-primary)'
                    : 'var(--text-muted)',
                fontSize: '0.8125rem',
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                opacity: hasGames ? 1 : 0.5,
              }}
            >
              W{week}
              {hasGames && !isActive && (
                <span style={{ marginLeft: '0.25rem', fontSize: '0.625rem' }}>
                  ({games.filter((g) => g.week === week).length})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Week content */}
      {weekGames.length > 0 ? (
        <>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem',
            }}
          >
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
              Week {activeWeek} — {weekGames.length} games
            </span>
            <Button variant="outline" size="sm" onClick={() => onClearWeek(activeWeek)}>
              Clear Week {activeWeek}
            </Button>
          </div>
          <Table<PreviewRow> data={previewData} columns={columns} rowKey="id" />
        </>
      ) : (
        <p className={styles.emptyText}>
          No games generated for Week {activeWeek}.
          {!generatedWeeks.has(activeWeek) &&
            ' Use the generator above to create games for this week.'}
        </p>
      )}
    </div>
  );
}
