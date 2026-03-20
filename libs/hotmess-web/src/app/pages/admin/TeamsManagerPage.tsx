import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Table,
  Badge,
  Button,
  Dialog,
  DialogFooter,
  Input,
  Select,
  Breadcrumbs,
  FilterProvider,
  FilterBar,
  FilterField,
  type ColumnConfig,
  type FilterDefinition,
  type FilterValue,
  type MultiSelectFilterConfig,
} from '@true-tech-team/ui-components';
import {
  useAllTeamsEnriched,
  useCities,
  useSports,
  useLeagues,
  useSeasons,
  useTeamMembers,
  type AllTeamRow,
  type TeamMemberRow,
} from '../../../hooks/useSupabaseQuery';
import {
  buildAdminBreadcrumbs,
  getStatusBadgeVariant,
  useAdminDialog,
  TIME_RANGE_OPTIONS,
  getMonthsAgo,
} from './utils';
import { useTeamMutations } from '../../../hooks/mutations';
import styles from './AdminPages.module.scss';

interface SeasonGroup {
  seasonId: string;
  seasonName: string;
  seasonStatus: string;
  teams: AllTeamRow[];
}

interface CityGroup {
  cityId: string;
  cityName: string;
  seasons: SeasonGroup[];
  totalTeams: number;
}

const initialForm = { name: '', shirt_color: '', status: 'pending' };

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
];

const dropdownConfig = { displayMode: 'dropdown' } as MultiSelectFilterConfig;

export function TeamsManagerPage() {
  const { seasonId } = useParams();
  const navigate = useNavigate();
  const { data: allTeamsRaw } = useAllTeamsEnriched();
  const { data: cities } = useCities();
  const { data: sports } = useSports();
  const { data: leagues } = useLeagues();
  const { data: seasons } = useSeasons();
  const dialog = useAdminDialog<AllTeamRow>();
  const mutations = useTeamMutations();
  const [form, setForm] = useState(initialForm);

  // Filter state
  const [filterValues, setFilterValues] = useState<Record<string, FilterValue>>({
    timeRange: '6',
    city: [],
    sport: [],
    league: [],
    season: [],
    status: [],
  });

  // Roster dialog
  const [rosterTeamId, setRosterTeamId] = useState<string | null>(null);
  const [rosterTeamName, setRosterTeamName] = useState('');
  const { data: teamMembers, loading: membersLoading } = useTeamMembers(rosterTeamId ?? undefined);

  const breadcrumbs = buildAdminBreadcrumbs(
    seasonId
      ? [
          { label: 'Seasons', href: '/admin/seasons' },
          { label: 'Season Detail', href: `/admin/seasons/${seasonId}` },
          { label: 'Teams' },
        ]
      : [{ label: 'Teams' }]
  );

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

  const handleFilterChange = useCallback(
    (values: Record<string, FilterValue>, changedFilterId: string) => {
      const newValues = { ...values };

      // Clear dependent filters when parent changes
      if (changedFilterId === 'city' || changedFilterId === 'sport') {
        newValues.league = [];
        newValues.season = [];
      } else if (changedFilterId === 'league') {
        newValues.season = [];
      }

      setFilterValues(newValues);
    },
    []
  );

  const handleSave = () => {
    if (dialog.mode === 'create') {
      mutations.create(form);
    } else if (dialog.editingItem) {
      mutations.update(dialog.editingItem.id, form);
    }
    dialog.close();
  };

  // Build filter definitions with dynamic options
  const filterDefinitions: FilterDefinition[] = useMemo(() => {
    const cityOpts = (cities || []).map((c) => ({ value: c.id, label: c.name }));
    const sportOpts = (sports || []).map((s) => ({ value: s.id, label: s.name }));

    const cityFilter = filterValues.city as string[];
    const sportFilter = filterValues.sport as string[];
    const leagueFilter = filterValues.league as string[];

    let filteredLeagues = leagues || [];
    if (cityFilter.length > 0) {
      filteredLeagues = filteredLeagues.filter((l) => cityFilter.includes(l.city_id));
    }
    if (sportFilter.length > 0) {
      filteredLeagues = filteredLeagues.filter((l) => sportFilter.includes(l.sport_id));
    }
    const leagueOpts = filteredLeagues.map((l) => ({ value: l.id, label: l.name }));

    let filteredSeasons = seasons || [];
    if (leagueFilter.length > 0) {
      filteredSeasons = filteredSeasons.filter((s) => leagueFilter.includes(s.league_id));
    }
    const seasonOpts = filteredSeasons.map((s) => ({ value: s.id, label: s.name }));

    return [
      {
        id: 'timeRange',
        type: 'select' as const,
        label: 'Time Range',
        defaultValue: '6',
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
        id: 'season',
        type: 'multi-select' as const,
        label: 'Season',
        placeholder: 'All Seasons',
        options: seasonOpts,
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
  }, [
    cities,
    sports,
    leagues,
    seasons,
    filterValues.city,
    filterValues.sport,
    filterValues.league,
  ]);

  // Apply filters to team data
  const filteredTeams = useMemo(() => {
    const teams = (allTeamsRaw || []) as AllTeamRow[];
    const timeRange = filterValues.timeRange as string;
    const cityFilter = filterValues.city as string[];
    const sportFilter = filterValues.sport as string[];
    const leagueFilter = filterValues.league as string[];
    const seasonFilter = filterValues.season as string[];
    const statusFilter = filterValues.status as string[];

    return teams.filter((team) => {
      const teamSeason = team.divisions?.seasons;
      const teamLeague = teamSeason?.leagues;

      // Time range filter
      if (timeRange !== 'all' && teamSeason) {
        const months = parseInt(timeRange, 10);
        const cutoff = getMonthsAgo(months);
        const endDate = new Date(teamSeason.season_end_date);
        if (endDate < cutoff) {
          return false;
        }
      }

      if (
        cityFilter.length > 0 &&
        (!teamLeague?.cities?.id || !cityFilter.includes(teamLeague.cities.id))
      ) {
        return false;
      }
      if (
        sportFilter.length > 0 &&
        (!teamLeague?.sports?.id || !sportFilter.includes(teamLeague.sports.id))
      ) {
        return false;
      }
      if (leagueFilter.length > 0 && (!teamLeague?.id || !leagueFilter.includes(teamLeague.id))) {
        return false;
      }
      if (seasonFilter.length > 0 && (!teamSeason?.id || !seasonFilter.includes(teamSeason.id))) {
        return false;
      }
      if (statusFilter.length > 0 && !statusFilter.includes(team.status)) {
        return false;
      }

      return true;
    });
  }, [allTeamsRaw, filterValues]);

  // Group filtered teams by city → season
  const cityGroups = useMemo(() => {
    const cityMap = new Map<
      string,
      {
        cityName: string;
        seasonMap: Map<string, { seasonName: string; seasonStatus: string; teams: AllTeamRow[] }>;
      }
    >();

    for (const team of filteredTeams) {
      const teamSeason = team.divisions?.seasons;
      const teamLeague = teamSeason?.leagues;
      const city = teamLeague?.cities;

      const cityId = city?.id ?? 'unknown';
      const cityName = city?.name ?? 'Unknown City';
      const sId = teamSeason?.id ?? 'unknown';
      const sName = teamSeason?.name ?? 'Unknown Season';
      const sStatus = teamSeason?.status ?? 'draft';

      let cityEntry = cityMap.get(cityId);
      if (!cityEntry) {
        cityEntry = { cityName, seasonMap: new Map() };
        cityMap.set(cityId, cityEntry);
      }

      let seasonEntry = cityEntry.seasonMap.get(sId);
      if (!seasonEntry) {
        seasonEntry = { seasonName: sName, seasonStatus: sStatus, teams: [] };
        cityEntry.seasonMap.set(sId, seasonEntry);
      }

      seasonEntry.teams.push(team);
    }

    // Convert to sorted array
    const groups: CityGroup[] = [];
    for (const [cityId, cityEntry] of cityMap) {
      const seasonGroups: SeasonGroup[] = [];
      for (const [sId, sEntry] of cityEntry.seasonMap) {
        sEntry.teams.sort((a, b) => a.name.localeCompare(b.name));
        seasonGroups.push({
          seasonId: sId,
          seasonName: sEntry.seasonName,
          seasonStatus: sEntry.seasonStatus,
          teams: sEntry.teams,
        });
      }
      seasonGroups.sort((a, b) => a.seasonName.localeCompare(b.seasonName));

      groups.push({
        cityId,
        cityName: cityEntry.cityName,
        seasons: seasonGroups,
        totalTeams: seasonGroups.reduce((sum, s) => sum + s.teams.length, 0),
      });
    }

    groups.sort((a, b) => a.cityName.localeCompare(b.cityName));
    return groups;
  }, [filteredTeams]);

  const columns: Array<ColumnConfig<AllTeamRow>> = [
    { key: 'name', header: 'Team Name', sortable: true },
    {
      key: 'shirt_color',
      header: 'Shirt Color',
      sortable: true,
      render: (_v, row) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              backgroundColor: row.shirt_color.toLowerCase(),
              border: '1px solid var(--border-default)',
              display: 'inline-block',
            }}
          />
          {row.shirt_color}
        </span>
      ),
    },
    {
      key: 'divisions.seasons.leagues.sports.name' as keyof AllTeamRow,
      header: 'Sport',
      sortable: true,
      render: (_v, row) => row.divisions?.seasons?.leagues?.sports?.name || '—',
    },
    { key: 'wins', header: 'W', sortable: true, align: 'center' },
    { key: 'losses', header: 'L', sortable: true, align: 'center' },
    { key: 'ties', header: 'T', sortable: true, align: 'center' },
    {
      key: 'status',
      header: 'Status',
      render: (_v, row) => (
        <Badge variant={getStatusBadgeVariant(row.status)} size="sm">
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '180px',
      render: (_v, row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="outline" size="xs" onClick={() => dialog.openEdit(row)}>
            Edit
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={(e) => {
              e.stopPropagation();
              setRosterTeamId(row.id);
              setRosterTeamName(row.name);
            }}
          >
            Roster
          </Button>
        </div>
      ),
    },
  ];

  const rosterMembers = (teamMembers || []) as TeamMemberRow[];

  return (
    <div className={styles.page}>
      <Breadcrumbs items={breadcrumbs} separator="/" size="sm" />

      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          {seasonId ? 'Season Teams' : 'All Teams'}
          {filteredTeams.length > 0 && (
            <span style={{ color: 'var(--text-muted)', fontSize: '1rem', marginLeft: '0.75rem' }}>
              ({filteredTeams.length} total)
            </span>
          )}
        </h1>
        <Button variant="primary" onClick={dialog.openCreate}>
          + Add Team
        </Button>
      </div>

      {/* Filter Bar */}
      <FilterProvider
        filters={filterDefinitions}
        values={filterValues}
        onChange={handleFilterChange}
        defaultValues={{ timeRange: '6' }}
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
          <FilterField filterId="season" />
          <FilterField filterId="status" />
        </FilterBar>
      </FilterProvider>

      {cityGroups.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem 0' }}>
          No teams found matching your filters.
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
                {cityGroup.totalTeams} {cityGroup.totalTeams === 1 ? 'team' : 'teams'}
              </span>
            </h2>

            {cityGroup.seasons.map((seasonGroup) => (
              <div key={seasonGroup.seasonId} className={styles.seasonGroup}>
                <div className={styles.seasonGroupHeader}>
                  <h3 className={styles.seasonGroupName}>
                    <span
                      className={styles.groupLink}
                      role="link"
                      tabIndex={0}
                      onClick={() => navigate(`/admin/seasons/${seasonGroup.seasonId}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          navigate(`/admin/seasons/${seasonGroup.seasonId}`);
                        }
                      }}
                    >
                      {seasonGroup.seasonName}
                    </span>
                  </h3>
                  <Badge variant={getStatusBadgeVariant(seasonGroup.seasonStatus)} size="sm">
                    {seasonGroup.seasonStatus.charAt(0).toUpperCase() +
                      seasonGroup.seasonStatus.slice(1)}
                  </Badge>
                  <span className={styles.seasonGroupCount}>
                    {seasonGroup.teams.length} {seasonGroup.teams.length === 1 ? 'team' : 'teams'}
                  </span>
                </div>

                <Table<AllTeamRow>
                  data={seasonGroup.teams}
                  columns={columns}
                  rowKey="id"
                  emptyContent="No teams."
                  defaultSort={{ column: 'name', direction: 'asc' }}
                  onRowClick={(row) => navigate(`/admin/teams/${row.id}`)}
                />
              </div>
            ))}
          </div>
        ))
      )}

      {/* Create / Edit Team Dialog */}
      <Dialog
        isOpen={dialog.isOpen}
        onClose={dialog.close}
        title={dialog.mode === 'create' ? 'Add Team' : 'Edit Team'}
        size="sm"
        actions={
          <DialogFooter align="end">
            <Button variant="outline" onClick={dialog.close}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              {dialog.mode === 'create' ? 'Create' : 'Save Changes'}
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

      {/* Roster Dialog */}
      <Dialog
        isOpen={!!rosterTeamId}
        onClose={() => {
          setRosterTeamId(null);
          setRosterTeamName('');
        }}
        title={`${rosterTeamName} — Roster`}
        size="md"
        actions={
          <DialogFooter align="end">
            <Button
              variant="outline"
              onClick={() => {
                setRosterTeamId(null);
                setRosterTeamName('');
              }}
            >
              Close
            </Button>
          </DialogFooter>
        }
      >
        {membersLoading ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
            Loading roster...
          </p>
        ) : rosterMembers.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
            No players on this roster.
          </p>
        ) : (
          <div className={styles.rosterList}>
            {rosterMembers.map((member) => (
              <div key={member.id} className={styles.rosterItem}>
                <div className={styles.rosterPlayer}>
                  <span className={styles.rosterName}>
                    {member.first_name} {member.last_name}
                  </span>
                  <span className={styles.rosterEmail}>{member.email}</span>
                </div>
                <div className={styles.rosterBadges}>
                  {member.role === 'team_captain' && (
                    <Badge variant="warning" size="sm">
                      Captain
                    </Badge>
                  )}
                  {member.is_rookie && (
                    <Badge variant="info" size="sm">
                      Rookie
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Dialog>
    </div>
  );
}
