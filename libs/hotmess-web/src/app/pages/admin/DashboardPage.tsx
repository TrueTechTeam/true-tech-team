import { Link } from 'react-router-dom';
import { KPI } from '@true-tech-team/ui-components';
import { UserRole } from '@true-tech-team/hotmess-types';
import { usePermissions } from '../../../contexts/PermissionsContext';
import {
  useCities,
  useSports,
  useSeasons,
  useTeams,
  useDivisions,
  useUpcomingGames,
} from '../../../hooks/useSupabaseQuery';
import { mockNotifications } from '../../../mocks/data';
import styles from './AdminPages.module.scss';

// ─── Admin / Commissioner Dashboard ────────────────────────────────────
function AdminDashboard() {
  const { data: cities } = useCities();
  const { data: sports } = useSports();
  const { data: seasons } = useSeasons();
  const { data: teams } = useTeams();
  const { data: divisions } = useDivisions();

  const activeSeasons = seasons?.filter((s) => s.status === 'active') || [];
  const activeDivisionIds = new Set(
    divisions?.filter((d) => activeSeasons.some((s) => s.id === d.season_id)).map((d) => d.id) || []
  );
  const activeTeams = teams?.filter((t) => activeDivisionIds.has(t.division_id)) || [];
  const registrationSeasons = seasons?.filter((s) => s.status === 'registration') || [];

  const kpiStyle = (color: string) =>
    ({
      '--kpi-bg': color,
      '--kpi-border': 'none',
      '--theme-text-primary': '#ffffff',
    }) as React.CSSProperties;

  return (
    <>
      <div className={styles.statsGrid} style={{ marginTop: '1.5rem' }}>
        <Link to="/admin/cities" className={styles.kpiLink}>
          <KPI
            title="Active Cities"
            value={cities?.length || 0}
            className={styles.coloredKpi}
            style={kpiStyle('var(--logo-red-50)')}
          />
        </Link>
        <Link to="/admin/sports" className={styles.kpiLink}>
          <KPI
            title="Sports"
            value={sports?.length || 0}
            className={styles.coloredKpi}
            style={kpiStyle('var(--logo-yellow-50)')}
          />
        </Link>
        <Link to="/admin/seasons" className={styles.kpiLink}>
          <KPI
            title="Active Seasons"
            value={activeSeasons.length}
            className={styles.coloredKpi}
            style={kpiStyle('var(--logo-green-50)')}
          />
        </Link>
        <Link to="/admin/teams" className={styles.kpiLink}>
          <KPI
            title="Active Teams"
            value={activeTeams.length}
            className={styles.coloredKpi}
            style={kpiStyle('var(--logo-blue-50)')}
          />
        </Link>
      </div>

      {registrationSeasons.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Open Registration ({registrationSeasons.length})
            </h2>
            <Link to="/admin/seasons" className={styles.viewAllLink}>
              View All
            </Link>
          </div>
          <div className={styles.activityList}>
            {registrationSeasons.slice(0, 5).map((season) => (
              <Link
                key={season.id}
                to={`/admin/seasons/${season.id}`}
                className={styles.activityItemLink}
              >
                <span className={styles.activityIcon}>📋</span>
                <div className={styles.activityContent}>
                  <p>{season.name}</p>
                  <span className={styles.activityTime}>
                    Starts{' '}
                    {new Date(season.season_start_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Recent Notifications</h2>
        <div className={styles.activityList}>
          {mockNotifications
            .filter((n) => n.status === 'sent')
            .slice(0, 5)
            .map((notif) => (
              <div key={notif.id} className={styles.activityItem}>
                <span className={styles.activityIcon}>📢</span>
                <div className={styles.activityContent}>
                  <p>{notif.title}</p>
                  <span className={styles.activityTime}>
                    {new Date(notif.sent_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                    {notif.target !== 'all' && ` · ${notif.target_name}`}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </section>
    </>
  );
}

// ─── Manager Dashboard ─────────────────────────────────────────────────
function ManagerDashboard() {
  const { managedSeasonIds } = usePermissions();
  const { data: seasons } = useSeasons();
  const { data: teams } = useTeams();

  const mySeasons = seasons?.filter((s) => managedSeasonIds.includes(s.id)) || [];
  const activeSeasons = mySeasons.filter((s) => s.status === 'active');
  const regSeasons = mySeasons.filter((s) => s.status === 'registration');

  const kpiStyle = (color: string) =>
    ({
      '--kpi-bg': color,
      '--kpi-border': 'none',
      '--theme-text-primary': '#ffffff',
    }) as React.CSSProperties;

  return (
    <>
      <div className={styles.statsGrid} style={{ marginTop: '1.5rem' }}>
        <KPI
          title="Your Seasons"
          value={mySeasons.length}
          className={styles.coloredKpi}
          style={kpiStyle('var(--logo-green-50)')}
        />
        <KPI
          title="Active"
          value={activeSeasons.length}
          className={styles.coloredKpi}
          style={kpiStyle('var(--logo-blue-50)')}
        />
        <KPI
          title="Registration Open"
          value={regSeasons.length}
          className={styles.coloredKpi}
          style={kpiStyle('var(--logo-yellow-50)')}
        />
        <KPI
          title="Total Teams"
          value={teams?.length || 0}
          className={styles.coloredKpi}
          style={kpiStyle('var(--logo-purple-50)')}
        />
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Your Seasons</h2>
          <Link to="/admin/seasons" className={styles.viewAllLink}>
            View All
          </Link>
        </div>
        <div className={styles.activityList}>
          {mySeasons.length === 0 && (
            <div className={styles.activityItem}>
              <div className={styles.activityContent}>
                <p>No seasons assigned yet.</p>
              </div>
            </div>
          )}
          {mySeasons.map((season) => (
            <Link
              key={season.id}
              to={`/admin/seasons/${season.id}`}
              className={styles.activityItemLink}
            >
              <span className={styles.activityIcon}>
                {season.status === 'active' ? '🟢' : season.status === 'registration' ? '📋' : '📅'}
              </span>
              <div className={styles.activityContent}>
                <p>{season.name}</p>
                <span className={styles.activityTime}>
                  {season.status.charAt(0).toUpperCase() + season.status.slice(1)} · Starts{' '}
                  {new Date(season.season_start_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {activeSeasons.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Quick Actions</h2>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/admin/schedules" style={{ textDecoration: 'none' }}>
              <div
                className={styles.activityItem}
                style={{
                  borderRadius: '0.5rem',
                  border: '1px solid var(--border-default)',
                  background: 'var(--bg-secondary)',
                  cursor: 'pointer',
                  padding: '0.75rem 1rem',
                }}
              >
                <span className={styles.activityIcon}>📋</span>
                <div className={styles.activityContent}>
                  <p>Manage Schedules</p>
                </div>
              </div>
            </Link>
            <Link to="/admin/teams" style={{ textDecoration: 'none' }}>
              <div
                className={styles.activityItem}
                style={{
                  borderRadius: '0.5rem',
                  border: '1px solid var(--border-default)',
                  background: 'var(--bg-secondary)',
                  cursor: 'pointer',
                  padding: '0.75rem 1rem',
                }}
              >
                <span className={styles.activityIcon}>👥</span>
                <div className={styles.activityContent}>
                  <p>Manage Teams</p>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}
    </>
  );
}

// ─── Referee Dashboard ─────────────────────────────────────────────────
function RefereeDashboard() {
  const { refereeSeasonIds } = usePermissions();
  const { data: games } = useUpcomingGames();
  const { data: seasons } = useSeasons();

  const mySeasons = seasons?.filter((s) => refereeSeasonIds.includes(s.id)) || [];
  const upcomingGames = games || [];

  const kpiStyle = (color: string) =>
    ({
      '--kpi-bg': color,
      '--kpi-border': 'none',
      '--theme-text-primary': '#ffffff',
    }) as React.CSSProperties;

  return (
    <>
      <div className={styles.statsGrid} style={{ marginTop: '1.5rem' }}>
        <KPI
          title="Assigned Seasons"
          value={mySeasons.length}
          className={styles.coloredKpi}
          style={kpiStyle('var(--logo-green-50)')}
        />
        <KPI
          title="Upcoming Games"
          value={upcomingGames.length}
          className={styles.coloredKpi}
          style={kpiStyle('var(--logo-blue-50)')}
        />
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Your Schedule</h2>
          <Link to="/admin/schedules" className={styles.viewAllLink}>
            View Full Schedule
          </Link>
        </div>
        <div className={styles.activityList}>
          {upcomingGames.length === 0 && (
            <div className={styles.activityItem}>
              <div className={styles.activityContent}>
                <p>No upcoming games assigned.</p>
              </div>
            </div>
          )}
          {upcomingGames.slice(0, 8).map((game) => (
            <div key={game.id} className={styles.activityItem}>
              <span className={styles.activityIcon}>🏟️</span>
              <div className={styles.activityContent}>
                <p>
                  {game.home_team?.name} vs {game.away_team?.name}
                </p>
                <span className={styles.activityTime}>
                  {new Date(game.scheduled_at).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                  {' · '}
                  {new Date(game.scheduled_at).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                  {game.venue && ` · ${game.venue.name}`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {mySeasons.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Assigned Seasons</h2>
          <div className={styles.activityList}>
            {mySeasons.map((season) => (
              <div key={season.id} className={styles.activityItem}>
                <span className={styles.activityIcon}>📅</span>
                <div className={styles.activityContent}>
                  <p>{season.name}</p>
                  <span className={styles.activityTime}>
                    {season.status.charAt(0).toUpperCase() + season.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

// ─── Captain Dashboard ─────────────────────────────────────────────────
function CaptainDashboard() {
  const { myTeamIds, captainTeamIds } = usePermissions();
  const { data: teams } = useTeams();
  const { data: games } = useUpcomingGames();
  const { data: seasons } = useSeasons();

  const myTeams = teams?.filter((t) => myTeamIds.includes(t.id)) || [];
  const captainedTeams = teams?.filter((t) => captainTeamIds.includes(t.id)) || [];
  const activeSeasons = seasons?.filter((s) => s.status === 'active') || [];
  const regSeasons = seasons?.filter((s) => s.status === 'registration') || [];

  // Filter games to only those involving our teams
  const myGames = (games || []).filter(
    (g) => myTeamIds.includes(g.home_team?.id) || myTeamIds.includes(g.away_team?.id)
  );

  const kpiStyle = (color: string) =>
    ({
      '--kpi-bg': color,
      '--kpi-border': 'none',
      '--theme-text-primary': '#ffffff',
    }) as React.CSSProperties;

  return (
    <>
      <div className={styles.statsGrid} style={{ marginTop: '1.5rem' }}>
        <KPI
          title="Your Teams"
          value={myTeams.length}
          className={styles.coloredKpi}
          style={kpiStyle('var(--logo-blue-50)')}
        />
        <KPI
          title="Captain Of"
          value={captainedTeams.length}
          className={styles.coloredKpi}
          style={kpiStyle('var(--logo-green-50)')}
        />
        <KPI
          title="Upcoming Games"
          value={myGames.length}
          className={styles.coloredKpi}
          style={kpiStyle('var(--logo-yellow-50)')}
        />
        <KPI
          title="Active Seasons"
          value={activeSeasons.length}
          className={styles.coloredKpi}
          style={kpiStyle('var(--logo-purple-50)')}
        />
      </div>

      {captainedTeams.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Your Teams (Captain)</h2>
            <Link to="/admin/teams" className={styles.viewAllLink}>
              Manage Teams
            </Link>
          </div>
          <div className={styles.activityList}>
            {captainedTeams.map((team) => (
              <Link
                key={team.id}
                to={`/admin/teams/${team.id}`}
                className={styles.activityItemLink}
              >
                <span className={styles.activityIcon}>👥</span>
                <div className={styles.activityContent}>
                  <p>{team.name}</p>
                  <span className={styles.activityTime}>
                    {team.wins}W - {team.losses}L - {team.ties}T · {team.shirt_color}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Upcoming Games</h2>
          <Link to="/admin/schedules" className={styles.viewAllLink}>
            Full Schedule
          </Link>
        </div>
        <div className={styles.activityList}>
          {myGames.length === 0 && (
            <div className={styles.activityItem}>
              <div className={styles.activityContent}>
                <p>No upcoming games.</p>
              </div>
            </div>
          )}
          {myGames.slice(0, 5).map((game) => (
            <div key={game.id} className={styles.activityItem}>
              <span className={styles.activityIcon}>🏟️</span>
              <div className={styles.activityContent}>
                <p>
                  {game.home_team?.name} vs {game.away_team?.name}
                </p>
                <span className={styles.activityTime}>
                  {new Date(game.scheduled_at).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                  {' · '}
                  {new Date(game.scheduled_at).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {regSeasons.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Register for Seasons</h2>
          <div className={styles.activityList}>
            {regSeasons.map((season) => (
              <Link
                key={season.id}
                to={`/admin/seasons/${season.id}`}
                className={styles.activityItemLink}
              >
                <span className={styles.activityIcon}>📋</span>
                <div className={styles.activityContent}>
                  <p>{season.name}</p>
                  <span className={styles.activityTime}>
                    Registration open · Starts{' '}
                    {new Date(season.season_start_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

// ─── Player Dashboard ──────────────────────────────────────────────────
function PlayerDashboard() {
  const { myTeamIds } = usePermissions();
  const { data: teams } = useTeams();
  const { data: games } = useUpcomingGames();
  const { data: seasons } = useSeasons();

  const myTeams = teams?.filter((t) => myTeamIds.includes(t.id)) || [];
  const activeSeasons = seasons?.filter((s) => s.status === 'active') || [];
  const regSeasons = seasons?.filter((s) => s.status === 'registration') || [];
  const pastSeasons = seasons?.filter((s) => s.status === 'completed') || [];

  const myGames = (games || []).filter(
    (g) => myTeamIds.includes(g.home_team?.id) || myTeamIds.includes(g.away_team?.id)
  );

  const kpiStyle = (color: string) =>
    ({
      '--kpi-bg': color,
      '--kpi-border': 'none',
      '--theme-text-primary': '#ffffff',
    }) as React.CSSProperties;

  return (
    <>
      <div className={styles.statsGrid} style={{ marginTop: '1.5rem' }}>
        <KPI
          title="Your Teams"
          value={myTeams.length}
          className={styles.coloredKpi}
          style={kpiStyle('var(--logo-blue-50)')}
        />
        <KPI
          title="Upcoming Games"
          value={myGames.length}
          className={styles.coloredKpi}
          style={kpiStyle('var(--logo-green-50)')}
        />
        <KPI
          title="Active Seasons"
          value={activeSeasons.length}
          className={styles.coloredKpi}
          style={kpiStyle('var(--logo-yellow-50)')}
        />
      </div>

      {myTeams.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Your Teams</h2>
          <div className={styles.activityList}>
            {myTeams.map((team) => (
              <Link
                key={team.id}
                to={`/admin/teams/${team.id}`}
                className={styles.activityItemLink}
              >
                <span className={styles.activityIcon}>👥</span>
                <div className={styles.activityContent}>
                  <p>{team.name}</p>
                  <span className={styles.activityTime}>
                    {team.wins}W - {team.losses}L - {team.ties}T · {team.shirt_color}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Upcoming Games</h2>
        <div className={styles.activityList}>
          {myGames.length === 0 && (
            <div className={styles.activityItem}>
              <div className={styles.activityContent}>
                <p>No upcoming games.</p>
              </div>
            </div>
          )}
          {myGames.slice(0, 5).map((game) => (
            <div key={game.id} className={styles.activityItem}>
              <span className={styles.activityIcon}>🏟️</span>
              <div className={styles.activityContent}>
                <p>
                  {game.home_team?.name} vs {game.away_team?.name}
                </p>
                <span className={styles.activityTime}>
                  {new Date(game.scheduled_at).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                  {' · '}
                  {new Date(game.scheduled_at).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {regSeasons.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Register for Seasons</h2>
          <div className={styles.activityList}>
            {regSeasons.map((season) => (
              <Link
                key={season.id}
                to={`/admin/seasons/${season.id}`}
                className={styles.activityItemLink}
              >
                <span className={styles.activityIcon}>📋</span>
                <div className={styles.activityContent}>
                  <p>{season.name}</p>
                  <span className={styles.activityTime}>
                    Registration open · Starts{' '}
                    {new Date(season.season_start_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {pastSeasons.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Past Seasons</h2>
          <div className={styles.activityList}>
            {pastSeasons.slice(0, 5).map((season) => (
              <div key={season.id} className={styles.activityItem}>
                <span className={styles.activityIcon}>🏁</span>
                <div className={styles.activityContent}>
                  <p>{season.name}</p>
                  <span className={styles.activityTime}>
                    Completed{' '}
                    {new Date(season.season_end_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

// ─── Dashboard Page (Router) ───────────────────────────────────────────
const ROLE_TITLES: Record<string, string> = {
  [UserRole.Admin]: 'Dashboard',
  [UserRole.Commissioner]: 'Commissioner Dashboard',
  [UserRole.Manager]: 'Manager Dashboard',
  [UserRole.Referee]: 'Referee Dashboard',
  [UserRole.TeamCaptain]: 'Captain Dashboard',
  [UserRole.Player]: 'Player Dashboard',
};

export function DashboardPage() {
  const { effectiveRole } = usePermissions();

  const title = ROLE_TITLES[effectiveRole] ?? 'Dashboard';

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>{title}</h1>

      {(effectiveRole === UserRole.Admin || effectiveRole === UserRole.Commissioner) && (
        <AdminDashboard />
      )}
      {effectiveRole === UserRole.Manager && <ManagerDashboard />}
      {effectiveRole === UserRole.Referee && <RefereeDashboard />}
      {effectiveRole === UserRole.TeamCaptain && <CaptainDashboard />}
      {effectiveRole === UserRole.Player && <PlayerDashboard />}
    </div>
  );
}
