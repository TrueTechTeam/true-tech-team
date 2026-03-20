import { KPI } from '@true-tech-team/ui-components';
import { calculateGameTotals } from '../../utils';
import styles from './ScheduleConfigPanel.module.scss';

interface GameCalculationInfoProps {
  teamCount: number;
  playAreaCount: number;
  timeSlotCount: number;
  totalWeeks: number;
  maxGamesPerDay: number;
}

export function GameCalculationInfo({
  teamCount,
  playAreaCount,
  timeSlotCount,
  totalWeeks,
  maxGamesPerDay,
}: GameCalculationInfoProps) {
  const calc = calculateGameTotals(
    teamCount,
    playAreaCount,
    timeSlotCount,
    totalWeeks,
    maxGamesPerDay
  );

  return (
    <div className={styles.configPanel}>
      <h3 className={styles.sectionTitle}>Game Calculations</h3>
      <p className={styles.description}>
        Estimated game totals based on your schedule configuration.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem',
        }}
      >
        <KPI title="Teams" value={calc.teamsPerDivision} />
        <KPI title="Play Areas" value={calc.playAreaCount} />
        <KPI title="Time Slots/Day" value={calc.timeSlotsPerDay} />
        <KPI title="Games/Slot" value={calc.gamesPerTimeSlot} />
        <KPI title="Games/Team/Week" value={calc.gamesPerTeamPerWeek} />
        <KPI title="Games/Week" value={calc.totalGamesPerWeek} />
        <KPI title="Total Season Games" value={calc.totalSeasonGames} />
        <KPI title="Max Games/Team/Day" value={calc.maxGamesPerTeamPerDay} />
      </div>
    </div>
  );
}
