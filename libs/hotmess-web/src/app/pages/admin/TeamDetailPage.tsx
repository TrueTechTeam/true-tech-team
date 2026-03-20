import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Table,
  Badge,
  Button,
  Dialog,
  DialogFooter,
  Input,
  Select,
  Breadcrumbs,
  KPI,
  type ColumnConfig,
} from '@true-tech-team/ui-components';
import {
  useTeam,
  useTeamMembers,
  type TeamDetailRow,
  type TeamMemberRow,
} from '../../../hooks/useSupabaseQuery';
import { mockGames } from '../../../mocks/data';
import {
  buildAdminBreadcrumbs,
  getStatusBadgeVariant,
  useAdminDialog,
  groupGamesByDate,
} from './utils';
import { useTeamMutations } from '../../../hooks/mutations';
import styles from './AdminPages.module.scss';

interface GameRow {
  id: string;
  scheduled_at: string;
  status: string;
  home_team: { id: string; name: string };
  away_team: { id: string; name: string };
  venue: { name: string };
  home_score?: number;
  away_score?: number;
  [key: string]: unknown;
}

const initialForm = { name: '', shirt_color: '', status: 'pending' };

export function TeamDetailPage() {
  const { teamId } = useParams();
  const { data: teamData, loading } = useTeam(teamId);
  const team = teamData as TeamDetailRow | null;
  const { data: members } = useTeamMembers(teamId);
  const dialog = useAdminDialog<{ name: string; shirt_color: string; status: string }>();
  const mutations = useTeamMutations();
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (dialog.editingItem) {
      setForm({
        name: dialog.editingItem.name,
        shirt_color: dialog.editingItem.shirt_color,
        status: dialog.editingItem.status,
      });
    } else {
      setForm(initialForm);
    }
  }, [dialog.editingItem]);

  const handleSave = () => {
    if (teamId) {
      mutations.update(teamId, form);
    }
    dialog.close();
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!team) {
    const notFoundBreadcrumbs = buildAdminBreadcrumbs([
      { label: 'Teams', href: '/admin/teams' },
      { label: 'Not Found' },
    ]);
    return (
      <div className={styles.page}>
        <Breadcrumbs items={notFoundBreadcrumbs} separator="/" size="sm" />
        <p style={{ marginTop: '1rem' }}>Team not found.</p>
      </div>
    );
  }

  // Build breadcrumb chain from nested parent data
  const division = team.divisions;
  const season = division?.seasons;
  const league = season?.leagues;
  const city = league?.cities;

  const breadcrumbItems = [];
  if (city && league) {
    breadcrumbItems.push({ label: city.name, href: `/admin/cities/${league.city_id}` });
  }
  if (league && season) {
    breadcrumbItems.push({ label: league.name, href: `/admin/leagues/${season.league_id}` });
  }
  if (season && division) {
    breadcrumbItems.push({ label: season.name, href: `/admin/seasons/${division.season_id}` });
  }
  breadcrumbItems.push({ label: team.name });

  const breadcrumbs = buildAdminBreadcrumbs(breadcrumbItems);

  const allMembers = (members || []) as TeamMemberRow[];

  // Games where this team is home or away
  const teamGames = (mockGames as GameRow[]).filter(
    (g) => g.home_team.id === teamId || g.away_team.id === teamId
  );
  const gamesByDate = groupGamesByDate(teamGames);

  const gameColumns: Array<ColumnConfig<GameRow>> = [
    {
      key: 'scheduled_at',
      header: 'Time',
      render: (value) =>
        new Date(value as string).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        }),
    },
    {
      key: 'opponent',
      header: 'Opponent',
      render: (_v, row) => {
        const isHome = row.home_team.id === teamId;
        const opponent = isHome ? row.away_team.name : row.home_team.name;
        return (
          <span>
            <span style={{ color: 'var(--text-muted)', marginRight: '0.25rem' }}>
              {isHome ? 'vs' : '@'}
            </span>
            {opponent}
          </span>
        );
      },
    },
    {
      key: 'score',
      header: 'Score',
      align: 'center',
      render: (_v, row) =>
        row.status === 'completed' ? (
          <>
            <strong>{row.home_score}</strong> - <strong>{row.away_score}</strong>
          </>
        ) : (
          <span style={{ color: 'var(--text-muted)' }}>&ndash;</span>
        ),
    },
    { key: 'venue', header: 'Venue', render: (_v, row) => row.venue.name },
    {
      key: 'status',
      header: 'Status',
      render: (_v, row) => (
        <Badge variant={row.status === 'completed' ? 'success' : 'info'} size="sm">
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </Badge>
      ),
    },
  ];

  const memberColumns: Array<ColumnConfig<TeamMemberRow>> = [
    {
      key: 'first_name',
      header: 'Name',
      sortable: true,
      render: (_v, row) => `${row.first_name} ${row.last_name}`,
    },
    { key: 'email', header: 'Email', sortable: true },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      render: (_v, row) => (
        <Badge variant={row.role === 'team_captain' ? 'warning' : 'neutral'} size="sm">
          {row.role === 'team_captain' ? 'Captain' : 'Player'}
        </Badge>
      ),
    },
    {
      key: 'is_rookie',
      header: 'Rookie',
      align: 'center',
      render: (_v, row) =>
        row.is_rookie ? (
          <Badge variant="info" size="sm">
            Rookie
          </Badge>
        ) : null,
    },
  ];

  return (
    <div className={styles.page}>
      <Breadcrumbs items={breadcrumbs} separator="/" size="sm" />

      <div className={styles.pageHeader} style={{ marginTop: '1rem' }}>
        <div>
          <h1
            className={styles.pageTitle}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
          >
            <span
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: team.shirt_color?.toLowerCase(),
                border: '2px solid var(--border-default)',
                display: 'inline-block',
                flexShrink: 0,
              }}
            />
            {team.name}
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
            {division?.name ?? 'Unknown Division'}
            {season ? ` \u00B7 ${season.name}` : ''}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Badge variant={getStatusBadgeVariant(team.status)} size="lg">
            {team.status.charAt(0).toUpperCase() + team.status.slice(1)}
          </Badge>
          <Button
            variant="outline"
            onClick={() =>
              dialog.openEdit({
                name: team.name,
                shirt_color: team.shirt_color,
                status: team.status,
              })
            }
          >
            Edit
          </Button>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <KPI
          title="Wins"
          value={team.wins}
          className={styles.coloredKpi}
          style={
            {
              '--kpi-bg': 'var(--logo-green-50)',
              '--kpi-border': 'none',
              '--theme-text-primary': '#ffffff',
            } as React.CSSProperties
          }
        />
        <KPI
          title="Losses"
          value={team.losses}
          className={styles.coloredKpi}
          style={
            {
              '--kpi-bg': 'var(--logo-red-50)',
              '--kpi-border': 'none',
              '--theme-text-primary': '#ffffff',
            } as React.CSSProperties
          }
        />
        <KPI
          title="Ties"
          value={team.ties}
          className={styles.coloredKpi}
          style={
            {
              '--kpi-bg': 'var(--logo-yellow-50)',
              '--kpi-border': 'none',
              '--theme-text-primary': '#ffffff',
            } as React.CSSProperties
          }
        />
        <KPI
          title="Roster"
          value={allMembers.length}
          className={styles.coloredKpi}
          style={
            {
              '--kpi-bg': 'var(--logo-blue-50)',
              '--kpi-border': 'none',
              '--theme-text-primary': '#ffffff',
            } as React.CSSProperties
          }
        />
      </div>

      <div
        style={{
          display: 'flex',
          gap: '2rem',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          fontSize: '0.875rem',
          color: 'var(--text-muted)',
        }}
      >
        <span>
          Points For: <strong style={{ color: 'var(--text-primary)' }}>{team.points_for}</strong>
        </span>
        <span>
          Points Against:{' '}
          <strong style={{ color: 'var(--text-primary)' }}>{team.points_against}</strong>
        </span>
        {team.free_agents_requested > 0 && (
          <span>
            Free Agents Requested:{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{team.free_agents_requested}</strong>
          </span>
        )}
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Roster</h2>
        <Table<TeamMemberRow>
          data={allMembers}
          columns={memberColumns}
          rowKey="id"
          searchable
          searchPlaceholder="Search roster..."
          searchFields={['first_name', 'last_name', 'email']}
          emptyContent="No team members found."
          defaultSort={{ column: 'role', direction: 'asc' }}
        />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Schedule</h2>
        {gamesByDate.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No games scheduled.</p>
        ) : (
          gamesByDate.map((group) => (
            <div key={group.dateLabel} style={{ marginBottom: '1.5rem' }}>
              <h3
                style={{
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                  color: 'var(--text-secondary)',
                }}
              >
                {group.dateLabel}
              </h3>
              <Table<GameRow> data={group.games} columns={gameColumns} rowKey="id" />
            </div>
          ))
        )}
      </section>

      <Dialog
        isOpen={dialog.isOpen}
        onClose={dialog.close}
        title="Edit Team"
        size="sm"
        actions={
          <DialogFooter align="end">
            <Button variant="outline" onClick={dialog.close}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Save Changes
            </Button>
          </DialogFooter>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Team Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <Input
            label="Shirt Color"
            value={form.shirt_color}
            onChange={(e) => setForm((f) => ({ ...f, shirt_color: e.target.value }))}
            required
          />
          <Select
            label="Status"
            options={[
              { value: 'pending', label: 'Pending' },
              { value: 'confirmed', label: 'Confirmed' },
            ]}
            value={form.status}
            onChange={(val) => setForm((f) => ({ ...f, status: val }))}
          />
        </div>
      </Dialog>
    </div>
  );
}
