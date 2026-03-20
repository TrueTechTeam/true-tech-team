import type { BracketMatch as BracketMatchType } from '../../../../../hooks/useBracketMatches';
import { BracketMatch } from './BracketMatch';
import {
  calculateMatchPositions,
  getConnectorPaths,
  ROUND_WIDTH,
  type BracketLayout,
} from '../../utils/bracketLayout';
import styles from './BracketTree.module.scss';

interface BracketTreeProps {
  matches: BracketMatchType[];
  onMatchClick?: (match: BracketMatchType) => void;
  editable?: boolean;
  teamSeedMap?: Map<string, number>;
}

export function BracketTree({
  matches,
  onMatchClick,
  editable = false,
  teamSeedMap,
}: BracketTreeProps) {
  console.warn('[BracketTree] render:', {
    matchCount: matches.length,
    editable,
    hasSeedMap: !!teamSeedMap,
    matchSummary: matches.map((m) => ({
      id: m.id,
      round: m.round,
      pos: m.position,
      team1: m.team1?.name ?? m.team1_id ?? 'TBD',
      team2: m.team2?.name ?? m.team2_id ?? 'TBD',
      scheduled_at: m.scheduled_at,
      play_area: m.play_area,
      winner_next: m.winner_next_match_id,
    })),
  });

  if (matches.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No matches in this bracket yet.</p>
        <p className={styles.emptyHint}>Generate the bracket to create matches.</p>
      </div>
    );
  }

  // Calculate layout
  const layout: BracketLayout = calculateMatchPositions(matches);
  const connectorPaths = getConnectorPaths(layout);

  console.warn('[BracketTree] layout result:', {
    width: layout.width,
    height: layout.height,
    roundCount: layout.rounds.length,
    connectorCount: connectorPaths.length,
  });

  // Deduplicate round labels (double elimination may have multiple round sections)
  const roundLabels = new Map<number, { x: number; round: number }>();
  for (const round of layout.rounds) {
    if (!roundLabels.has(round.round)) {
      roundLabels.set(round.round, { x: round.x, round: round.round });
    }
  }

  return (
    <div className={styles.bracketTreeContainer}>
      <div
        className={styles.bracketTree}
        style={{
          width: `${layout.width}px`,
          height: `${layout.height}px`,
          position: 'relative',
        }}
      >
        {/* SVG layer for connector lines */}
        <svg
          className={styles.connectors}
          width={layout.width}
          height={layout.height}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'none',
          }}
        >
          {connectorPaths.map((connector, index) => (
            <path
              key={index}
              d={connector.path}
              className={
                connector.type === 'winner' ? styles.winnerConnector : styles.loserConnector
              }
              fill="none"
              strokeWidth="2"
            />
          ))}
        </svg>

        {/* Round labels - positioned at top of each column */}
        {Array.from(roundLabels.values()).map(({ x, round }) => (
          <div
            key={`label-${round}`}
            className={styles.roundLabel}
            style={{
              position: 'absolute',
              left: `${x}px`,
              top: '8px',
              width: `${ROUND_WIDTH - 60}px`,
            }}
          >
            Round {round}
          </div>
        ))}

        {/* Match cards layer */}
        {layout.rounds.map((round) =>
          round.matches.map((matchPos) => (
            <BracketMatch
              key={matchPos.match.id}
              match={matchPos.match}
              position={{ x: matchPos.x, y: matchPos.y }}
              onClick={editable ? onMatchClick : undefined}
              teamSeedMap={teamSeedMap}
            />
          ))
        )}
      </div>
    </div>
  );
}
