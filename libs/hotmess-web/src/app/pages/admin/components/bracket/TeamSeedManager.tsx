import { Table, Badge, type ColumnConfig } from '@true-tech-team/ui-components';
import styles from './TeamSeedManager.module.scss';

interface Team {
  id: string;
  name: string;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
  seed?: number;
}

interface TeamSeedManagerProps {
  teams: Team[];
  bracketGenerated: boolean;
}

export function TeamSeedManager({ teams, bracketGenerated }: TeamSeedManagerProps) {
  // Calculate win percentage and point differential
  const enrichedTeams = teams.map((team, index) => {
    const totalGames = team.wins + team.losses + team.ties;
    const winPct = totalGames > 0 ? (team.wins / totalGames) * 100 : 0;
    const pointDiff = team.pointsFor - team.pointsAgainst;

    return {
      ...team,
      seed: index + 1,
      winPct,
      pointDiff,
    };
  });

  const columns: Array<ColumnConfig<typeof enrichedTeams[0]>> = [
    {
      key: 'seed',
      header: 'Seed',
      width: '80px',
      render: (_, row) => (
        <Badge variant="primary" size="sm">
          #{row.seed}
        </Badge>
      ),
    },
    {
      key: 'name',
      header: 'Team',
      sortable: true,
    },
    {
      key: 'wins',
      header: 'W',
      width: '60px',
      sortable: true,
    },
    {
      key: 'losses',
      header: 'L',
      width: '60px',
      sortable: true,
    },
    {
      key: 'ties',
      header: 'T',
      width: '60px',
      sortable: true,
    },
    {
      key: 'winPct',
      header: 'Win %',
      width: '100px',
      sortable: true,
      render: (val) => `${(val as number).toFixed(1)}%`,
    },
    {
      key: 'pointsFor',
      header: 'PF',
      width: '80px',
      sortable: true,
    },
    {
      key: 'pointsAgainst',
      header: 'PA',
      width: '80px',
      sortable: true,
    },
    {
      key: 'pointDiff',
      header: '+/-',
      width: '80px',
      sortable: true,
      render: (val) => {
        const v = val as number;
        return (
          <span style={{ color: v > 0 ? 'var(--theme-success)' : v < 0 ? 'var(--theme-danger)' : 'inherit' }}>
            {v > 0 ? '+' : ''}{v}
          </span>
        );
      },
    },
  ];

  return (
    <div className={styles.teamSeedManager}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Team Seeding</h3>
          <p className={styles.description}>
            {bracketGenerated
              ? 'Teams were seeded based on regular season performance when the bracket was generated.'
              : 'Teams will be seeded based on regular season performance. Higher seeds get more favorable matchups.'}
          </p>
        </div>
      </div>

      <Table
        data={enrichedTeams}
        columns={columns}
        rowKey="id"
        defaultSort={{ column: 'seed', direction: 'asc' }}
      />

      {teams.length === 0 && (
        <div className={styles.emptyState}>
          <p>No teams found for this division.</p>
        </div>
      )}
    </div>
  );
}
