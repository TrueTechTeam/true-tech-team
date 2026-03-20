import { useState } from 'react';
import { Badge, Button } from '@true-tech-team/ui-components';
import styles from './DivisionCustomizer.module.scss';

export interface DivisionTeam {
  id: string;
  name: string;
  wins: number;
  losses: number;
  ties: number;
}

export interface CustomizableDivision {
  id: string;
  name: string;
  teams: DivisionTeam[];
}

interface DivisionCustomizerProps {
  divisions: CustomizableDivision[];
  onDivisionsChange: (divisions: CustomizableDivision[]) => void;
}

function sortTeams(teams: DivisionTeam[]): DivisionTeam[] {
  return [...teams].sort((a, b) => {
    if (b.wins !== a.wins) { return b.wins - a.wins; }
    const aTotalGames = a.wins + a.losses + a.ties;
    const bTotalGames = b.wins + b.losses + b.ties;
    const aWinPct = aTotalGames > 0 ? a.wins / aTotalGames : 0;
    const bWinPct = bTotalGames > 0 ? b.wins / bTotalGames : 0;
    return bWinPct - aWinPct;
  });
}

export function DivisionCustomizer({ divisions, onDivisionsChange }: DivisionCustomizerProps) {
  const [movingTeam, setMovingTeam] = useState<{ teamId: string; fromDivisionId: string } | null>(null);
  const totalBrackets = divisions.length;
  const totalTeams = divisions.reduce((sum, div) => sum + div.teams.length, 0);

  const handleMoveTeam = (teamId: string, fromDivisionId: string, toDivisionId: string) => {
    const updated = divisions.map((div) => {
      if (div.id === fromDivisionId) {
        return { ...div, teams: div.teams.filter((t) => t.id !== teamId) };
      }
      if (div.id === toDivisionId) {
        const fromDiv = divisions.find((d) => d.id === fromDivisionId);
        const team = fromDiv?.teams.find((t) => t.id === teamId);
        if (team) {
          return { ...div, teams: [...div.teams, team] };
        }
      }
      return div;
    });
    onDivisionsChange(updated);
    setMovingTeam(null);
  };

  const handleSplitDivision = (divisionId: string) => {
    const division = divisions.find((d) => d.id === divisionId);
    if (!division || division.teams.length < 2) { return; }

    const sorted = sortTeams(division.teams);
    const half1: DivisionTeam[] = [];
    const half2: DivisionTeam[] = [];

    // Alternate assignment by seed for balanced splits
    sorted.forEach((team, i) => {
      if (i % 2 === 0) {
        half1.push(team);
      } else {
        half2.push(team);
      }
    });

    const newDiv1: CustomizableDivision = {
      id: `${divisionId}-1`,
      name: `${division.name} - Group 1`,
      teams: half1,
    };
    const newDiv2: CustomizableDivision = {
      id: `${divisionId}-2`,
      name: `${division.name} - Group 2`,
      teams: half2,
    };

    const updated = divisions.flatMap((div) =>
      div.id === divisionId ? [newDiv1, newDiv2] : [div]
    );
    onDivisionsChange(updated);
  };

  const otherDivisions = (currentDivisionId: string) =>
    divisions.filter((d) => d.id !== currentDivisionId);

  return (
    <div className={styles.divisionCustomizer}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Divisions & Teams</h3>
          <p className={styles.description}>
            Review and organize teams across divisions before generating brackets.
            Move teams between divisions or split a division into groups.
          </p>
        </div>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{totalBrackets}</span>
            <span className={styles.statLabel}>
              {totalBrackets === 1 ? 'Bracket' : 'Brackets'}
            </span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{totalTeams}</span>
            <span className={styles.statLabel}>Total Teams</span>
          </div>
        </div>
      </div>

      <div className={styles.divisionsGrid}>
        {divisions.map((division) => (
          <div key={division.id} className={styles.divisionCard}>
            <div className={styles.divisionHeader}>
              <h4>{division.name}</h4>
              <div className={styles.divisionActions}>
                <Badge variant="neutral" size="sm">
                  {division.teams.length} {division.teams.length === 1 ? 'team' : 'teams'}
                </Badge>
                {division.teams.length >= 4 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSplitDivision(division.id)}
                  >
                    Split
                  </Button>
                )}
              </div>
            </div>

            <div className={styles.teamsList}>
              {division.teams.length === 0 ? (
                <p className={styles.emptyText}>No teams in this division</p>
              ) : (
                sortTeams(division.teams).map((team, index) => (
                  <div key={team.id} className={styles.teamCard}>
                    <div className={styles.teamRank}>#{index + 1}</div>
                    <div className={styles.teamInfo}>
                      <span className={styles.teamName}>{team.name}</span>
                      <span className={styles.teamRecord}>
                        {team.wins}-{team.losses}
                        {team.ties > 0 && `-${team.ties}`}
                      </span>
                    </div>
                    {otherDivisions(division.id).length > 0 && (
                      <div className={styles.teamActions}>
                        {movingTeam?.teamId === team.id ? (
                          <div className={styles.moveDropdown}>
                            {otherDivisions(division.id).map((target) => (
                              <button
                                key={target.id}
                                type="button"
                                className={styles.moveOption}
                                onClick={() => handleMoveTeam(team.id, division.id, target.id)}
                              >
                                {target.name}
                              </button>
                            ))}
                            <button
                              type="button"
                              className={styles.moveCancel}
                              onClick={() => setMovingTeam(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className={styles.moveBtn}
                            onClick={() => setMovingTeam({ teamId: team.id, fromDivisionId: division.id })}
                            title="Move to another division"
                          >
                            Move
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {divisions.length === 0 && (
        <div className={styles.emptyState}>
          <p>No divisions found for this season.</p>
          <p className={styles.hint}>Create divisions in the Season page first.</p>
        </div>
      )}
    </div>
  );
}
