import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  Badge,
  Button,
  Dialog,
  DialogFooter,
  Input,
  NumberInput,
  Breadcrumbs,
  FilterProvider,
  FilterBar,
  FilterField,
  type ColumnConfig,
  type FilterDefinition,
  type FilterValue,
  type MultiSelectFilterConfig,
} from '@true-tech-team/ui-components';
import { mockGames, mockDivisions, mockSeasons, mockLeagues } from '../../../mocks/data';
import { useCities, useSports } from '../../../hooks/useSupabaseQuery';
import { buildAdminBreadcrumbs, useAdminDialog, TIME_RANGE_OPTIONS, getMonthsAgo } from './utils';
import { useScheduleMutations } from '../../../hooks/mutations';
import styles from './AdminPages.module.scss';

interface EnrichedGameRow {
  id: string;
  scheduled_at: string;
  status: string;
  home_team: { id: string; name: string };
  away_team: { id: string; name: string };
  venue: { name: string };
  play_area: string;
  home_score: number | null;
  away_score: number | null;
  division_id: string;
  city_id: string;
  city_name: string;
  sport_id: string;
  sport_name: string;
  league_id: string;
  league_name: string;
  season_id: string;
  season_name: string;
  [key: string]: unknown;
}

interface LeagueGroup {
  leagueId: string;
  leagueName: string;
  sportName: string;
  games: EnrichedGameRow[];
}

interface CityGroup {
  cityId: string;
  cityName: string;
  leagues: LeagueGroup[];
  totalGames: number;
}

const STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
];

const dropdownConfig = { displayMode: 'dropdown' } as MultiSelectFilterConfig;

const initialGameForm = {
  home_team_id: '',
  away_team_id: '',
  venue_id: '',
  scheduled_at: '',
};

const initialScoreForm = { home_score: 0, away_score: 0 };

// Build lookup maps once
const divisionMap = new Map(mockDivisions.map((d) => [d.id, d]));
const seasonMap = new Map(mockSeasons.map((s) => [s.id, s]));
const leagueMap = new Map(mockLeagues.map((l) => [l.id, l]));

// Enrich all games with hierarchy data
const enrichedGames: EnrichedGameRow[] = [];
for (const game of mockGames) {
  const division = divisionMap.get(game.division_id);
  const season = division ? seasonMap.get(division.season_id) : undefined;
  const league = season ? leagueMap.get(season.league_id) : undefined;

  if (!division || !season || !league) {
    continue;
  }

  enrichedGames.push({
    id: game.id,
    scheduled_at: game.scheduled_at,
    status: game.status,
    home_team: game.home_team,
    away_team: game.away_team,
    venue: game.venue,
    play_area: game.play_area,
    home_score: game.home_score,
    away_score: game.away_score,
    division_id: game.division_id,
    city_id: league.city_id as string,
    city_name: league.cities.name as string,
    sport_id: league.sport_id as string,
    sport_name: league.sports.name as string,
    league_id: league.id,
    league_name: league.name,
    season_id: season.id,
    season_name: season.name,
  });
}

export function SchedulesManagerPage() {
  const navigate = useNavigate();
  const gameDialog = useAdminDialog<EnrichedGameRow>();
  const scoreDialog = useAdminDialog<EnrichedGameRow>();
  const mutations = useScheduleMutations();
  const { data: cities } = useCities();
  const { data: sports } = useSports();
  const [gameForm, setGameForm] = useState(initialGameForm);
  const [scoreForm, setScoreForm] = useState(initialScoreForm);

  const breadcrumbs = buildAdminBreadcrumbs([{ label: 'Schedules' }]);

  // Filter state — default to last 3 months
  const [filterValues, setFilterValues] = useState<Record<string, FilterValue>>({
    timeRange: '3',
    city: [],
    sport: [],
    league: [],
    status: [],
  });

  const handleFilterChange = useCallback(
    (values: Record<string, FilterValue>, changedFilterId: string) => {
      const newValues = { ...values };

      if (changedFilterId === 'city' || changedFilterId === 'sport') {
        newValues.league = [];
      }

      setFilterValues(newValues);
    },
    []
  );

  useEffect(() => {
    if (!gameDialog.isOpen) {
      setGameForm(initialGameForm);
    }
  }, [gameDialog.isOpen]);

  useEffect(() => {
    if (!scoreDialog.isOpen) {
      setScoreForm(initialScoreForm);
    }
  }, [scoreDialog.isOpen]);

  const handleGameSave = () => {
    if (gameDialog.mode === 'create') {
      mutations.create(gameForm);
    } else if (gameDialog.editingItem) {
      mutations.update(gameDialog.editingItem.id, gameForm);
    }
    gameDialog.close();
  };

  const handleScoreSave = () => {
    if (scoreDialog.editingItem) {
      mutations.submitScore(scoreDialog.editingItem.id, scoreForm);
    }
    scoreDialog.close();
  };

  // Build filter definitions
  const filterDefinitions: FilterDefinition[] = useMemo(() => {
    const cityOpts = (cities || []).map((c) => ({ value: c.id, label: c.name }));
    const sportOpts = (sports || []).map((s) => ({ value: s.id, label: s.name }));

    const cityFilter = filterValues.city as string[];
    const sportFilter = filterValues.sport as string[];

    // Build league options filtered by city/sport
    let filteredLeagues = [...mockLeagues];
    if (cityFilter.length > 0) {
      filteredLeagues = filteredLeagues.filter((l) => cityFilter.includes(l.city_id as string));
    }
    if (sportFilter.length > 0) {
      filteredLeagues = filteredLeagues.filter((l) => sportFilter.includes(l.sport_id as string));
    }
    const leagueOpts = filteredLeagues.map((l) => ({ value: l.id, label: l.name }));

    return [
      {
        id: 'timeRange',
        type: 'select' as const,
        label: 'Time Range',
        defaultValue: '3',
        options: TIME_RANGE_OPTIONS,
      },
      {
        id: 'city',
        type: 'multi-select' as const,
        label: 'City',
        placeholder: 'All Cities',
        options: cityOpts,
        config: dropdownConfig,
      },
      {
        id: 'sport',
        type: 'multi-select' as const,
        label: 'Sport',
        placeholder: 'All Sports',
        options: sportOpts,
        config: dropdownConfig,
      },
      {
        id: 'league',
        type: 'multi-select' as const,
        label: 'League',
        placeholder: 'All Leagues',
        options: leagueOpts,
        config: dropdownConfig,
      },
      {
        id: 'status',
        type: 'multi-select' as const,
        label: 'Status',
        options: STATUS_OPTIONS,
        config: dropdownConfig,
      },
    ];
  }, [cities, sports, filterValues.city, filterValues.sport]);

  // Apply filters
  const filteredGames = useMemo(() => {
    const timeRange = filterValues.timeRange as string;
    const cityFilter = filterValues.city as string[];
    const sportFilter = filterValues.sport as string[];
    const leagueFilter = filterValues.league as string[];
    const statusFilter = filterValues.status as string[];

    return enrichedGames.filter((game) => {
      // Time range filter — show games from cutoff onward (includes future)
      if (timeRange !== 'all') {
        const months = parseInt(timeRange, 10);
        const cutoff = getMonthsAgo(months);
        if (new Date(game.scheduled_at) < cutoff) {
          return false;
        }
      }
      if (cityFilter.length > 0 && !cityFilter.includes(game.city_id)) {
        return false;
      }
      if (sportFilter.length > 0 && !sportFilter.includes(game.sport_id)) {
        return false;
      }
      if (leagueFilter.length > 0 && !leagueFilter.includes(game.league_id)) {
        return false;
      }
      if (statusFilter.length > 0 && !statusFilter.includes(game.status)) {
        return false;
      }
      return true;
    });
  }, [filterValues]);

  // Group filtered games by city → league
  const cityGroups = useMemo(() => {
    const cityMap = new Map<
      string,
      {
        cityName: string;
        leagueMap: Map<string, { leagueName: string; sportName: string; games: EnrichedGameRow[] }>;
      }
    >();

    for (const game of filteredGames) {
      let cityEntry = cityMap.get(game.city_id);
      if (!cityEntry) {
        cityEntry = { cityName: game.city_name, leagueMap: new Map() };
        cityMap.set(game.city_id, cityEntry);
      }

      let leagueEntry = cityEntry.leagueMap.get(game.league_id);
      if (!leagueEntry) {
        leagueEntry = { leagueName: game.league_name, sportName: game.sport_name, games: [] };
        cityEntry.leagueMap.set(game.league_id, leagueEntry);
      }

      leagueEntry.games.push(game);
    }

    // Sort games within each league by date
    const groups: CityGroup[] = [];
    for (const [cityId, cityEntry] of cityMap) {
      const leagues: LeagueGroup[] = [];
      for (const [leagueId, leagueEntry] of cityEntry.leagueMap) {
        leagueEntry.games.sort(
          (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
        );
        leagues.push({
          leagueId,
          leagueName: leagueEntry.leagueName,
          sportName: leagueEntry.sportName,
          games: leagueEntry.games,
        });
      }
      // Sort leagues alphabetically
      leagues.sort((a, b) => a.leagueName.localeCompare(b.leagueName));

      groups.push({
        cityId,
        cityName: cityEntry.cityName,
        leagues,
        totalGames: leagues.reduce((sum, l) => sum + l.games.length, 0),
      });
    }

    // Sort cities alphabetically
    groups.sort((a, b) => a.cityName.localeCompare(b.cityName));
    return groups;
  }, [filteredGames]);

  const columns: Array<ColumnConfig<EnrichedGameRow>> = [
    {
      key: 'scheduled_at',
      header: 'Date',
      sortable: true,
      render: (value) =>
        new Date(value as string).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        }),
    },
    {
      key: 'home_team',
      header: 'Home Team',
      sortable: true,
      render: (_v, row) => row.home_team.name,
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
          <span style={{ color: 'var(--text-muted)' }}>—</span>
        ),
    },
    {
      key: 'away_team',
      header: 'Away Team',
      sortable: true,
      render: (_v, row) => row.away_team.name,
    },
    {
      key: 'venue',
      header: 'Venue',
      render: (_v, row) => row.venue.name,
    },
    {
      key: 'play_area',
      header: 'Play Area',
      render: (_v, row) => row.play_area || '—',
    },
    {
      key: 'status',
      header: 'Status',
      render: (_v, row) => (
        <Badge variant={row.status === 'completed' ? 'success' : 'info'} size="sm">
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '150px',
      render: (_v, row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="outline" size="xs" onClick={() => gameDialog.openEdit(row)}>
            Edit
          </Button>
          {row.status === 'scheduled' && (
            <Button variant="outline" size="xs" onClick={() => scoreDialog.openEdit(row)}>
              Score
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <Breadcrumbs items={breadcrumbs} separator="/" size="sm" />

      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          Schedules
          {filteredGames.length > 0 && (
            <span style={{ color: 'var(--text-muted)', fontSize: '1rem', marginLeft: '0.75rem' }}>
              ({filteredGames.length} games)
            </span>
          )}
        </h1>
        <Button variant="primary" onClick={gameDialog.openCreate}>
          + Add Game
        </Button>
      </div>

      <FilterProvider
        filters={filterDefinitions}
        values={filterValues}
        onChange={handleFilterChange}
        defaultValues={{ timeRange: '3' }}
      >
        <FilterBar
          showActiveFilters={false}
          showMoreFilters={false}
          clearButtonLabel="Clear Filters"
          fillWidth
          style={{ marginBottom: '1.5rem' }}
        >
          <FilterField filterId="timeRange" />
          <FilterField filterId="city" />
          <FilterField filterId="sport" />
          <FilterField filterId="league" />
          <FilterField filterId="status" />
        </FilterBar>
      </FilterProvider>

      {cityGroups.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem 0' }}>
          No games found matching your filters.
        </p>
      ) : (
        cityGroups.map((cityGroup) => (
          <div key={cityGroup.cityId} className={styles.scheduleCity}>
            <h2 className={styles.scheduleCityHeader}>
              <span
                className={styles.groupLink}
                role="link"
                tabIndex={0}
                onClick={() => navigate(`/admin/cities/${cityGroup.cityId}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    navigate(`/admin/cities/${cityGroup.cityId}`);
                  }
                }}
              >
                {cityGroup.cityName}
              </span>
              <span className={styles.scheduleCityCount}>
                {cityGroup.totalGames} {cityGroup.totalGames === 1 ? 'game' : 'games'}
              </span>
            </h2>

            {cityGroup.leagues.map((leagueGroup) => (
              <div key={leagueGroup.leagueId} className={styles.scheduleLeague}>
                <div className={styles.scheduleLeagueHeader}>
                  <h3 className={styles.scheduleLeagueName}>{leagueGroup.leagueName}</h3>
                  <Badge variant="neutral" size="sm">
                    {leagueGroup.sportName}
                  </Badge>
                  {leagueGroup.games[0]?.season_id && (
                    <span
                      className={styles.groupLink}
                      role="link"
                      tabIndex={0}
                      onClick={() => navigate(`/admin/seasons/${leagueGroup.games[0].season_id}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          navigate(`/admin/seasons/${leagueGroup.games[0].season_id}`);
                        }
                      }}
                      style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}
                    >
                      {leagueGroup.games[0].season_name}
                    </span>
                  )}
                </div>

                <Table<EnrichedGameRow>
                  data={leagueGroup.games}
                  columns={columns}
                  rowKey="id"
                  emptyContent="No games."
                  defaultSort={{ column: 'scheduled_at', direction: 'asc' }}
                />
              </div>
            ))}
          </div>
        ))
      )}

      {/* Add/Edit Game Dialog */}
      <Dialog
        isOpen={gameDialog.isOpen}
        onClose={gameDialog.close}
        title={gameDialog.mode === 'create' ? 'Add Game' : 'Edit Game'}
        size="md"
        actions={
          <DialogFooter align="end">
            <Button variant="outline" onClick={gameDialog.close}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleGameSave}>
              {gameDialog.mode === 'create' ? 'Create' : 'Save Changes'}
            </Button>
          </DialogFooter>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Home Team"
            value={gameForm.home_team_id}
            onChange={(e) => setGameForm((f) => ({ ...f, home_team_id: e.target.value }))}
            placeholder="Team name or ID"
          />
          <Input
            label="Away Team"
            value={gameForm.away_team_id}
            onChange={(e) => setGameForm((f) => ({ ...f, away_team_id: e.target.value }))}
            placeholder="Team name or ID"
          />
          <Input
            label="Venue"
            value={gameForm.venue_id}
            onChange={(e) => setGameForm((f) => ({ ...f, venue_id: e.target.value }))}
            placeholder="Venue name or ID"
          />
          <Input
            label="Date & Time"
            type="datetime-local"
            value={gameForm.scheduled_at}
            onChange={(e) => setGameForm((f) => ({ ...f, scheduled_at: e.target.value }))}
          />
        </div>
      </Dialog>

      {/* Score Entry Dialog */}
      <Dialog
        isOpen={scoreDialog.isOpen}
        onClose={scoreDialog.close}
        title={
          scoreDialog.editingItem
            ? `Score: ${scoreDialog.editingItem.home_team.name} vs ${scoreDialog.editingItem.away_team.name}`
            : 'Enter Score'
        }
        size="sm"
        actions={
          <DialogFooter align="end">
            <Button variant="outline" onClick={scoreDialog.close}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleScoreSave}>
              Submit Score
            </Button>
          </DialogFooter>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <NumberInput
            label={scoreDialog.editingItem?.home_team.name ?? 'Home Score'}
            value={scoreForm.home_score}
            onChange={(val) => setScoreForm((f) => ({ ...f, home_score: val }))}
            min={0}
          />
          <NumberInput
            label={scoreDialog.editingItem?.away_team.name ?? 'Away Score'}
            value={scoreForm.away_score}
            onChange={(val) => setScoreForm((f) => ({ ...f, away_score: val }))}
            min={0}
          />
        </div>
      </Dialog>
    </div>
  );
}
