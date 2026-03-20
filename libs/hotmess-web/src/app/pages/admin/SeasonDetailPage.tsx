import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Table,
  Badge,
  Button,
  Dialog,
  DialogFooter,
  Input,
  Select,
  KPI,
  Breadcrumbs,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  type ColumnConfig,
} from '@true-tech-team/ui-components';
import type { SchedulingRule } from '@true-tech-team/hotmess-types';
import {
  useSeason,
  useDivisions,
  useTeams,
  useLeagues,
  type SeasonDetailRow,
} from '../../../hooks/useSupabaseQuery';
import { mockGames, mockVenues } from '../../../mocks/data';
import {
  buildAdminBreadcrumbs,
  getStatusBadgeVariant,
  useAdminDialog,
  groupGamesByDate,
  type GeneratedGame,
  type TeamStanding,
} from './utils';
import { computeTimeSlots } from './utils/timeSlotComputation';
import { useSeasonMutations } from '../../../hooks/mutations';
import {
  ScheduleConfigPanel,
  GameCalculationInfo,
  ScheduleGenerator,
  WeeklySchedulePreview,
  type ScheduleConfigState,
} from './components/schedule';
import styles from './AdminPages.module.scss';

interface StandingsRow {
  id: string;
  name: string;
  shirt_color: string;
  wins: number;
  losses: number;
  ties: number;
  points_for: number;
  points_against: number;
  status: string;
  [key: string]: unknown;
}

interface GameRow {
  id: string;
  scheduled_at: string;
  status: string;
  home_team: { id: string; name: string };
  away_team: { id: string; name: string };
  venue: { name: string };
  play_area: string;
  home_score?: number;
  away_score?: number;
  [key: string]: unknown;
}

const initialForm = {
  name: '',
  league_id: '',
  registration_start_date: '',
  registration_end_date: '',
  season_start_date: '',
  season_end_date: '',
  status: 'draft',
};

const DEFAULT_SCHEDULE_CONFIG: ScheduleConfigState = {
  venueId: '',
  selectedPlayAreas: [],
  gameDays: [6],
  firstGameTime: '09:00',
  bufferMinutes: 10,
  totalWeeks: 8,
  maxGamesPerDay: 3,
  tournamentDate: '',
  backupTournamentDates: [],
  makeupDates: [],
  blackoutDates: [],
};

export function SeasonDetailPage() {
  const { seasonId } = useParams();
  const navigate = useNavigate();
  const { data: seasonData, loading } = useSeason(seasonId);
  const season = seasonData as SeasonDetailRow | null;
  const { data: divisions } = useDivisions(seasonId);
  const { data: allTeams } = useTeams();
  const { data: leagues } = useLeagues();
  const dialog = useAdminDialog<typeof initialForm>();
  const mutations = useSeasonMutations();
  const [form, setForm] = useState(initialForm);
  const [scheduleConfig, setScheduleConfig] =
    useState<ScheduleConfigState>(DEFAULT_SCHEDULE_CONFIG);
  const [generatedGames, setGeneratedGames] = useState<GeneratedGame[]>([]);

  // Initialize schedule config from season data
  useEffect(() => {
    if (season) {
      const sc = season.schedule_config;
      setScheduleConfig({
        venueId: season.venue_id || '',
        selectedPlayAreas: sc?.selectedPlayAreas || season.venues?.play_areas || [],
        gameDays: sc?.gameDays || [6],
        firstGameTime: sc?.firstGameTime || '09:00',
        bufferMinutes: sc?.bufferMinutes ?? 10,
        totalWeeks: sc?.totalWeeks || 8,
        maxGamesPerDay: sc?.maxGamesPerDay || 3,
        tournamentDate: sc?.tournamentDate ? String(sc.tournamentDate) : '',
        backupTournamentDates: (sc?.backupTournamentDates || []).map(String),
        makeupDates: (sc?.makeupDates || []).map(String),
        blackoutDates: (sc?.blackoutDates || []).map(String),
      });
    }
  }, [season]);

  useEffect(() => {
    if (dialog.editingItem) {
      setForm({ ...dialog.editingItem });
    } else {
      setForm(initialForm);
    }
  }, [dialog.editingItem]);

  const handleSave = () => {
    if (seasonId) {
      mutations.update(seasonId, form);
    }
    dialog.close();
  };

  // Venues filtered by city
  const cityVenues = useMemo(() => {
    const cityId = season?.leagues?.city_id;
    if (!cityId) {
      return mockVenues;
    }
    return mockVenues.filter((v) => v.city_id === cityId);
  }, [season?.leagues?.city_id]);

  // Sport config
  const sportConfig = season?.leagues?.sports?.config;
  const gameDurationMinutes = sportConfig?.gameDurationMinutes || 50;
  const schedulingRule = (sportConfig?.schedulingRule || 'not_back_to_back') as SchedulingRule;

  // Computed time slots
  const computedTimeSlots = useMemo(() => {
    if (!scheduleConfig.firstGameTime || gameDurationMinutes <= 0) {
      return [];
    }
    return computeTimeSlots(
      scheduleConfig.firstGameTime,
      gameDurationMinutes,
      10,
      scheduleConfig.bufferMinutes
    );
  }, [scheduleConfig.firstGameTime, gameDurationMinutes, scheduleConfig.bufferMinutes]);

  if (loading) {
    return (
      <div className={styles.page}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!season) {
    const notFoundBreadcrumbs = buildAdminBreadcrumbs([
      { label: 'Seasons', href: '/admin/seasons' },
      { label: 'Not Found' },
    ]);
    return (
      <div className={styles.page}>
        <Breadcrumbs items={notFoundBreadcrumbs} separator="/" size="sm" />
        <p style={{ marginTop: '1rem' }}>Season not found.</p>
      </div>
    );
  }

  // Build full-hierarchy breadcrumbs
  const cityName = season.leagues?.cities?.name;
  const leagueName = season.leagues?.name;
  const breadcrumbItems = [];
  if (cityName && season.leagues?.city_id) {
    breadcrumbItems.push({ label: cityName, href: `/admin/cities/${season.leagues.city_id}` });
  }
  if (leagueName && season.league_id) {
    breadcrumbItems.push({ label: leagueName, href: `/admin/leagues/${season.league_id}` });
  }
  breadcrumbItems.push({ label: season.name });
  const breadcrumbs = buildAdminBreadcrumbs(breadcrumbItems);

  const divisionList = divisions || [];
  const divisionIds = new Set(divisionList.map((d) => d.id));
  const teams = (allTeams || []).filter((t) => divisionIds.has(t.division_id as string));
  const allGames = mockGames.filter((g) => divisionIds.has(g.division_id)) as GameRow[];

  const scheduledCount = allGames.filter((g) => g.status === 'scheduled').length;
  const completedCount = allGames.filter((g) => g.status === 'completed').length;
  const gamesByDate = groupGamesByDate(allGames);

  // Build team standings for schedule generator
  const teamStandings: TeamStanding[] = teams.map((t) => ({
    id: t.id,
    name: t.name,
    wins: t.wins || 0,
    losses: t.losses || 0,
    ties: t.ties || 0,
    gamesPlayed: (t.wins || 0) + (t.losses || 0) + (t.ties || 0),
  }));

  const standingsColumns: Array<ColumnConfig<StandingsRow>> = [
    {
      key: 'rank',
      header: '#',
      width: '100px',
      render: (_v, _row, idx) => idx + 1,
    },
    {
      key: 'name',
      header: 'Team',
      render: (_v, row) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: row.shirt_color.toLowerCase(),
              border: '1px solid var(--border-default)',
              display: 'inline-block',
            }}
          />
          {row.name}
        </span>
      ),
    },
    { key: 'wins', header: 'W', align: 'center', sortable: true },
    { key: 'losses', header: 'L', align: 'center', sortable: true },
    { key: 'ties', header: 'T', align: 'center', sortable: true },
    { key: 'points_for', header: 'PF', align: 'center', sortable: true },
    { key: 'points_against', header: 'PA', align: 'center', sortable: true },
    {
      key: 'status',
      header: 'Status',
      render: (_v, row) => (
        <Badge variant={getStatusBadgeVariant(row.status)} size="sm">
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </Badge>
      ),
    },
  ];

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
    { key: 'home_team', header: 'Home', render: (_v, row) => row.home_team.name },
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
          <span style={{ color: 'var(--text-muted)' }}>vs</span>
        ),
    },
    { key: 'away_team', header: 'Away', render: (_v, row) => row.away_team.name },
    { key: 'venue', header: 'Venue', render: (_v, row) => row.venue.name },
    { key: 'play_area', header: 'Play Area', render: (_v, row) => row.play_area || '—' },
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

  const sportName = season.leagues?.sports?.name;

  return (
    <div className={styles.page}>
      <Breadcrumbs items={breadcrumbs} separator="/" size="sm" />

      <div className={styles.pageHeader} style={{ marginTop: '1rem' }}>
        <div>
          <h1 className={styles.pageTitle}>{season.name}</h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
            {cityName}
            {sportName ? ` \u00B7 ${sportName}` : ''}
            {season.venues ? ` \u00B7 ${season.venues.name}` : ''}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Badge variant={getStatusBadgeVariant(season.status)} size="lg">
            {season.status.charAt(0).toUpperCase() + season.status.slice(1)}
          </Badge>
          <Button
            variant="outline"
            onClick={() =>
              dialog.openEdit({
                name: season.name,
                league_id: season.league_id,
                registration_start_date: season.registration_start_date,
                registration_end_date: season.registration_end_date,
                season_start_date: season.season_start_date,
                season_end_date: season.season_end_date,
                status: season.status,
              })
            }
          >
            Edit
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" style={{ marginTop: '1.5rem' }}>
        <TabList>
          <Tab value="overview">Overview</Tab>
          <Tab value="schedule-builder">Schedule Builder</Tab>
        </TabList>

        {/* ── Overview Tab ── */}
        <TabPanel value="overview">
          <div className={styles.statsGrid} style={{ marginTop: '1.5rem' }}>
            <KPI
              title="Divisions"
              value={divisionList.length}
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
              title="Teams"
              value={teams.length}
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
              title="Upcoming Games"
              value={scheduledCount}
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
              title="Completed Games"
              value={completedCount}
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

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Registration: {new Date(season.registration_start_date).toLocaleDateString()} &ndash;{' '}
              {new Date(season.registration_end_date).toLocaleDateString()}
            </span>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Season: {new Date(season.season_start_date).toLocaleDateString()} &ndash;{' '}
              {new Date(season.season_end_date).toLocaleDateString()}
            </span>
            {season.venues && (
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Venue: {season.venues.name}
                {season.venues.play_areas.length > 0 && ` (${season.venues.play_areas.join(', ')})`}
              </span>
            )}
          </div>

          {divisionList.map((division) => {
            const divTeams = teams
              .filter((t) => (t as unknown as StandingsRow).division_id === division.id)
              .sort((a, b) => b.wins - a.wins || a.losses - b.losses) as unknown as StandingsRow[];

            return (
              <section key={division.id} className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  {division.name}
                  <span
                    style={{
                      color: 'var(--text-muted)',
                      fontWeight: 400,
                      fontSize: '0.875rem',
                      marginLeft: '0.5rem',
                    }}
                  >
                    ({divTeams.length} teams)
                  </span>
                </h2>
                <Table<StandingsRow>
                  data={divTeams}
                  columns={standingsColumns}
                  rowKey="id"
                  emptyContent="No teams in this division."
                  onRowClick={(row) => navigate(`/admin/teams/${row.id}`)}
                />
              </section>
            );
          })}

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Games</h2>
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
        </TabPanel>

        {/* ── Schedule Builder Tab ── */}
        <TabPanel value="schedule-builder">
          <div style={{ marginTop: '1.5rem' }}>
            <ScheduleConfigPanel
              config={scheduleConfig}
              onUpdate={setScheduleConfig}
              venues={cityVenues}
              gameDurationMinutes={gameDurationMinutes}
              schedulingRule={schedulingRule}
            />

            <GameCalculationInfo
              teamCount={teams.length}
              playAreaCount={scheduleConfig.selectedPlayAreas.length}
              timeSlotCount={computedTimeSlots.length}
              totalWeeks={scheduleConfig.totalWeeks}
              maxGamesPerDay={scheduleConfig.maxGamesPerDay}
            />

            <ScheduleGenerator
              teams={teamStandings}
              playAreas={scheduleConfig.selectedPlayAreas}
              timeSlots={computedTimeSlots}
              totalWeeks={scheduleConfig.totalWeeks}
              gameDays={scheduleConfig.gameDays}
              schedulingRule={schedulingRule}
              maxGamesPerDay={scheduleConfig.maxGamesPerDay}
              generatedGames={generatedGames}
              onGenerate={setGeneratedGames}
              onClear={() => setGeneratedGames([])}
            />

            <WeeklySchedulePreview
              games={generatedGames}
              teams={teamStandings}
              totalWeeks={scheduleConfig.totalWeeks}
              onClearWeek={(week) =>
                setGeneratedGames((prev) => prev.filter((g) => g.week !== week))
              }
            />
          </div>
        </TabPanel>
      </Tabs>

      <Dialog
        isOpen={dialog.isOpen}
        onClose={dialog.close}
        title="Edit Season"
        size="md"
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
            label="Season Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <Select
            label="League"
            options={(leagues || []).map((l) => ({ value: l.id, label: l.name }))}
            value={form.league_id}
            onChange={(val) => setForm((f) => ({ ...f, league_id: val }))}
          />
          <Input
            label="Registration Start"
            type="date"
            value={form.registration_start_date}
            onChange={(e) => setForm((f) => ({ ...f, registration_start_date: e.target.value }))}
          />
          <Input
            label="Registration End"
            type="date"
            value={form.registration_end_date}
            onChange={(e) => setForm((f) => ({ ...f, registration_end_date: e.target.value }))}
          />
          <Input
            label="Season Start"
            type="date"
            value={form.season_start_date}
            onChange={(e) => setForm((f) => ({ ...f, season_start_date: e.target.value }))}
          />
          <Input
            label="Season End"
            type="date"
            value={form.season_end_date}
            onChange={(e) => setForm((f) => ({ ...f, season_end_date: e.target.value }))}
          />
          <Select
            label="Status"
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'registration', label: 'Registration' },
              { value: 'active', label: 'Active' },
              { value: 'completed', label: 'Completed' },
            ]}
            value={form.status}
            onChange={(val) => setForm((f) => ({ ...f, status: val }))}
          />
        </div>
      </Dialog>
    </div>
  );
}
