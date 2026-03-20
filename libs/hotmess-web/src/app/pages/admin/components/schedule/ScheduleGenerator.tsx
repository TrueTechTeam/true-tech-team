import { useState } from 'react';
import {
  Button,
  ButtonToggleGroup,
  ButtonToggleGroupItem,
  Checkbox,
  Select,
} from '@true-tech-team/ui-components';
import type { SchedulingRule } from '@true-tech-team/hotmess-types';
import {
  generateFullSeasonSchedule,
  generateWeeklySchedule,
  type GeneratedGame,
  type TeamStanding,
  type ScheduleConstraints,
  type WeeklyMatchupMode,
} from '../../utils';
import styles from './ScheduleConfigPanel.module.scss';

type GenerationMode = 'full' | 'weekly';

interface ScheduleGeneratorProps {
  teams: TeamStanding[];
  playAreas: string[];
  timeSlots: string[];
  totalWeeks: number;
  gameDays: number[];
  schedulingRule: SchedulingRule;
  maxGamesPerDay: number;
  generatedGames: GeneratedGame[];
  onGenerate: (games: GeneratedGame[]) => void;
  onClear: () => void;
}

export function ScheduleGenerator({
  teams,
  playAreas,
  timeSlots,
  totalWeeks,
  gameDays,
  schedulingRule,
  maxGamesPerDay,
  generatedGames,
  onGenerate,
  onClear,
}: ScheduleGeneratorProps) {
  const [mode, setMode] = useState<GenerationMode>('full');
  const [weeklyMode, setWeeklyMode] = useState<WeeklyMatchupMode>('standings');
  const [selectedWeek, setSelectedWeek] = useState('1');
  const [constraints, setConstraints] = useState<ScheduleConstraints>({
    preventRepeatMatchups: true,
    rotatePlayAreas: true,
    rotateTimeSlots: true,
  });

  const canGenerate = teams.length >= 2 && playAreas.length > 0 && timeSlots.length > 0;

  // Figure out which weeks already have games
  const generatedWeeks = new Set(generatedGames.map((g) => g.week));
  const weekOptions = Array.from({ length: totalWeeks }, (_, i) => ({
    value: String(i + 1),
    label: `Week ${i + 1}${generatedWeeks.has(i + 1) ? ' (generated)' : ''}`,
  }));

  const handleGenerate = () => {
    if (!canGenerate) {
      return;
    }

    if (mode === 'full') {
      const games = generateFullSeasonSchedule({
        teams,
        playAreas,
        timeSlots,
        totalWeeks,
        gameDays,
        schedulingRule,
        maxGamesPerDay,
        constraints,
      });
      onGenerate(games);
    } else {
      const week = parseInt(selectedWeek);
      const previousGames = generatedGames.filter((g) => g.week < week);
      const newGames = generateWeeklySchedule(
        {
          teams,
          playAreas,
          timeSlots,
          totalWeeks,
          gameDays,
          schedulingRule,
          maxGamesPerDay,
          constraints,
        },
        week,
        weeklyMode,
        previousGames
      );
      // Replace games for this week, keep others
      const otherGames = generatedGames.filter((g) => g.week !== week);
      onGenerate([...otherGames, ...newGames]);
    }
  };

  return (
    <div className={styles.configPanel}>
      <h3 className={styles.sectionTitle}>Generate Schedule</h3>
      <p className={styles.description}>
        Choose a generation mode and configure constraints. Full season generates all weeks at once
        with random matchups. Weekly mode generates one week at a time based on current standings.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Mode selector */}
        <div>
          <p className={styles.schedulingRuleLabel}>Generation Mode</p>
          <ButtonToggleGroup
            value={mode}
            onChange={(val) => setMode(val as GenerationMode)}
            aria-label="Generation mode"
          >
            <ButtonToggleGroupItem value="full">Full Season (Random)</ButtonToggleGroupItem>
            <ButtonToggleGroupItem value="weekly">Weekly</ButtonToggleGroupItem>
          </ButtonToggleGroup>
        </div>

        {/* Weekly sub-options */}
        {mode === 'weekly' && (
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ minWidth: '160px' }}>
              <Select
                label="Week"
                options={weekOptions}
                value={selectedWeek}
                onChange={setSelectedWeek}
              />
            </div>
            <div style={{ minWidth: '200px' }}>
              <p className={styles.schedulingRuleLabel}>Matchup Mode</p>
              <ButtonToggleGroup
                value={weeklyMode}
                onChange={(val) => setWeeklyMode(val as WeeklyMatchupMode)}
                aria-label="Matchup mode"
                size="sm"
              >
                <ButtonToggleGroupItem value="standings">Standings</ButtonToggleGroupItem>
                <ButtonToggleGroupItem value="swiss">Swiss</ButtonToggleGroupItem>
              </ButtonToggleGroup>
            </div>
          </div>
        )}

        {/* Constraints */}
        <div>
          <p className={styles.schedulingRuleLabel}>Constraints</p>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <Checkbox
              label="Prevent repeat matchups"
              checked={constraints.preventRepeatMatchups}
              onChange={(checked) =>
                setConstraints((c) => ({ ...c, preventRepeatMatchups: checked }))
              }
            />
            <Checkbox
              label="Rotate play areas"
              checked={constraints.rotatePlayAreas}
              onChange={(checked) => setConstraints((c) => ({ ...c, rotatePlayAreas: checked }))}
            />
            <Checkbox
              label="Rotate time slots"
              checked={constraints.rotateTimeSlots}
              onChange={(checked) => setConstraints((c) => ({ ...c, rotateTimeSlots: checked }))}
            />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Button variant="primary" onClick={handleGenerate} disabled={!canGenerate}>
            {mode === 'full' ? 'Generate Full Season' : `Generate Week ${selectedWeek}`}
          </Button>
          {generatedGames.length > 0 && (
            <Button variant="outline" onClick={onClear}>
              Clear Schedule
            </Button>
          )}
          {!canGenerate && (
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Need at least 2 teams, 1 play area, and 1 time slot to generate.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
