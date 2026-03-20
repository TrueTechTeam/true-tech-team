import { Badge } from '@true-tech-team/ui-components';
import type { BracketMatch as BracketMatchType } from '../../../../../hooks/useBracketMatches';
import styles from './BracketMatch.module.scss';

interface BracketMatchProps {
  match: BracketMatchType;
  position: { x: number; y: number };
  onClick?: (match: BracketMatchType) => void;
  teamSeedMap?: Map<string, number>;
}

export function BracketMatch({ match, position, onClick, teamSeedMap }: BracketMatchProps) {
  const team1Name = match.team1?.name;
  const team2Name = match.team2?.name;
  const team1Seed = match.team1_id ? teamSeedMap?.get(match.team1_id) : undefined;
  const team2Seed = match.team2_id ? teamSeedMap?.get(match.team2_id) : undefined;
  const isTeam1Winner = match.winner_id === match.team1_id;
  const isTeam2Winner = match.winner_id === match.team2_id;
  const hasWinner = !!match.winner_id;

  const handleClick = () => {
    if (onClick) {
      onClick(match);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick(match);
    }
  };

  const isClickable = !!onClick;

  return (
    <div
      className={styles.matchCard}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      {/* Team 1 */}
      <div
        className={`${styles.team} ${isTeam1Winner ? styles.winner : ''} ${
          hasWinner && !isTeam1Winner ? styles.loser : ''
        }`}
      >
        {team1Name ? (
          <span className={styles.teamName}>
            {team1Seed !== undefined && <span className={styles.seed}>#{team1Seed}</span>}
            {team1Name}
          </span>
        ) : (
          <span className={styles.teamPlaceholder} />
        )}
        {match.team1_score !== undefined && match.team1_score !== null && (
          <span className={styles.score}>{match.team1_score}</span>
        )}
      </div>

      {/* Divider */}
      <div className={styles.divider} />

      {/* Team 2 */}
      <div
        className={`${styles.team} ${isTeam2Winner ? styles.winner : ''} ${
          hasWinner && !isTeam2Winner ? styles.loser : ''
        }`}
      >
        {team2Name ? (
          <span className={styles.teamName}>
            {team2Seed !== undefined && <span className={styles.seed}>#{team2Seed}</span>}
            {team2Name}
          </span>
        ) : (
          <span className={styles.teamPlaceholder} />
        )}
        {match.team2_score !== undefined && match.team2_score !== null && (
          <span className={styles.score}>{match.team2_score}</span>
        )}
      </div>

      {/* Match Info - always visible */}
      <div className={styles.matchInfo}>
        {match.scheduled_at ? (
          <span className={styles.infoText}>
            {new Date(match.scheduled_at).toLocaleTimeString(undefined, {
              hour: 'numeric',
              minute: '2-digit',
            })}
          </span>
        ) : (
          <span className={styles.infoPlaceholder}>Time</span>
        )}
        {match.play_area ? (
          <Badge size="sm" variant="neutral">
            {match.play_area}
          </Badge>
        ) : (
          <span className={styles.infoPlaceholder}>Location</span>
        )}
      </div>
    </div>
  );
}
