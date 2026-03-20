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
import { useSeasons, useLeagues, useCities, useSports } from '../../../hooks/useSupabaseQuery';
import {
  buildAdminBreadcrumbs,
  getStatusBadgeVariant,
  useAdminDialog,
  TIME_RANGE_OPTIONS,
  getMonthsAgo,
} from './utils';
import { useSeasonMutations } from '../../../hooks/mutations';
import styles from './AdminPages.module.scss';

interface SeasonRow {
  id: string;
  name: string;
  status: string;
  season_start_date: string;
  season_end_date: string;
  league_id: string;
  leagues?: { name: string };
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


export function SeasonsManagerPage() {
  const { leagueId } = useParams();
  const navigate = useNavigate();
  const { data: seasons, loading } = useSeasons(leagueId);
  const { data: leagues } = useLeagues();
  const { data: cities } = useCities();
  const { data: sports } = useSports();
  const dialog = useAdminDialog<SeasonRow>();
  const mutations = useSeasonMutations();
  const [form, setForm] = useState(initialForm);

  // Filter state
  const [filterValues, setFilterValues] = useState<Record<string, FilterValue>>({
    timeRange: '6',
    city: [],
    sport: [],
    league: [],
  });

  const leagueName = leagueId
    ? (seasons?.[0] as SeasonRow | undefined)?.leagues?.name ?? 'League'
    : null;

  const breadcrumbs = buildAdminBreadcrumbs(
    leagueId
      ? [
          { label: 'Leagues', href: '/admin/leagues' },
          { label: `${leagueName} Seasons` },
        ]
      : [{ label: 'Seasons' }]
  );

  useEffect(() => {
    if (dialog.editingItem) {
      setForm({
        name: dialog.editingItem.name,
        league_id: '',
        registration_start_date: '',
        registration_end_date: '',
        season_start_date: dialog.editingItem.season_start_date,
        season_end_date: dialog.editingItem.season_end_date,
        status: dialog.editingItem.status,
      });
    } else {
      setForm(initialForm);
    }
  }, [dialog.editingItem]);

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

  const handleSave = () => {
    if (dialog.mode === 'create') {
      mutations.create(form);
    } else if (dialog.editingItem) {
      mutations.update(dialog.editingItem.id, form);
    }
    dialog.close();
  };

  // Build filter definitions
  const filterDefinitions: FilterDefinition[] = useMemo(() => {
    const cityOpts = (cities || []).map((c) => ({ value: c.id, label: c.name }));
    const sportOpts = (sports || []).map((s) => ({ value: s.id, label: s.name }));

    const cityFilter = filterValues.city as string[];
    const sportFilter = filterValues.sport as string[];

    let filteredLeagues = leagues || [];
    if (cityFilter.length > 0) {
      filteredLeagues = filteredLeagues.filter((l) => cityFilter.includes(l.city_id));
    }
    if (sportFilter.length > 0) {
      filteredLeagues = filteredLeagues.filter((l) => sportFilter.includes(l.sport_id));
    }
    const leagueOpts = filteredLeagues.map((l) => ({ value: l.id, label: l.name }));

    const dropdownConfig = { displayMode: 'dropdown' } as MultiSelectFilterConfig;

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
    ];
  }, [cities, sports, leagues, filterValues.city, filterValues.sport]);

  // Apply filters
  const filteredData = useMemo(() => {
    const items = (seasons || []) as SeasonRow[];
    const timeRange = filterValues.timeRange as string;
    const cityFilter = filterValues.city as string[];
    const sportFilter = filterValues.sport as string[];
    const leagueFilter = filterValues.league as string[];

    // Build a set of matching league IDs for city/sport filtering
    const allLeagues = leagues || [];
    const matchingLeagueIds = cityFilter.length > 0 || sportFilter.length > 0
      ? new Set(
          allLeagues
            .filter((l) =>
              (cityFilter.length === 0 || cityFilter.includes(l.city_id)) &&
              (sportFilter.length === 0 || sportFilter.includes(l.sport_id))
            )
            .map((l) => l.id)
        )
      : null;

    return items.filter((s) => {
      // Time range filter
      if (timeRange !== 'all') {
        const months = parseInt(timeRange, 10);
        const cutoff = getMonthsAgo(months);
        const endDate = new Date(s.season_end_date);
        if (endDate < cutoff) {
          return false;
        }
      }
      if (leagueFilter.length > 0 && !leagueFilter.includes(s.league_id)) {
        return false;
      }
      if (matchingLeagueIds && !matchingLeagueIds.has(s.league_id)) {
        return false;
      }
      return true;
    });
  }, [seasons, leagues, filterValues]);

  // Split filtered data into status groups
  const statusGroups = useMemo(() => {
    const active: SeasonRow[] = [];
    const draft: SeasonRow[] = [];
    const completed: SeasonRow[] = [];

    for (const season of filteredData) {
      if (season.status === 'registration' || season.status === 'active') {
        active.push(season);
      } else if (season.status === 'completed') {
        completed.push(season);
      } else {
        draft.push(season);
      }
    }

    return [
      { key: 'active', label: 'Registration & Active', seasons: active },
      { key: 'draft', label: 'Draft', seasons: draft },
      { key: 'completed', label: 'Completed', seasons: completed },
    ].filter((g) => g.seasons.length > 0);
  }, [filteredData]);

  const columns: Array<ColumnConfig<SeasonRow>> = [
    { key: 'name', header: 'Season', sortable: true },
    {
      key: 'leagues',
      header: 'League',
      sortable: true,
      render: (_v, row) => row.leagues?.name || '\u2014',
    },
    {
      key: 'season_start_date',
      header: 'Start Date',
      sortable: true,
      render: (value) => new Date(value as string).toLocaleDateString(),
    },
    {
      key: 'season_end_date',
      header: 'End Date',
      sortable: true,
      render: (value) => new Date(value as string).toLocaleDateString(),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (_v, row) => (
        <Badge variant={getStatusBadgeVariant(row.status)} size="sm">
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_v, row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button
            variant="outline"
            size="xs"
            onClick={() => navigate(`/admin/seasons/${row.id}`)}
          >
            Manage
          </Button>
          <Button
            variant="outline"
            size="xs"
            onClick={() => navigate(`/admin/seasons/${row.id}/teams`)}
          >
            Teams
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <Breadcrumbs items={breadcrumbs} separator="/" size="sm" />

      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          {leagueId ? `${leagueName} Seasons` : 'All Seasons'}
        </h1>
        <Button variant="primary" onClick={dialog.openCreate}>
          + Create Season
        </Button>
      </div>

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
        </FilterBar>
      </FilterProvider>

      {statusGroups.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem 0' }}>
          No seasons found.
        </p>
      ) : (
        statusGroups.map((group) => (
          <div key={group.key} className={styles.scheduleCity}>
            <h2 className={styles.scheduleCityHeader}>
              {group.label}
              <span className={styles.scheduleCityCount}>
                {group.seasons.length} {group.seasons.length === 1 ? 'season' : 'seasons'}
              </span>
            </h2>

            <Table<SeasonRow>
              data={group.seasons}
              columns={columns}
              rowKey="id"
              loading={loading}
              searchable
              searchPlaceholder="Search seasons..."
              searchFields={['name']}
              emptyContent="No seasons."
              defaultSort={{ column: 'season_start_date', direction: 'asc' }}
              onRowClick={(row) => navigate(`/admin/seasons/${row.id}`)}
            />
          </div>
        ))
      )}

      <Dialog
        isOpen={dialog.isOpen}
        onClose={dialog.close}
        title={dialog.mode === 'create' ? 'Create Season' : 'Edit Season'}
        size="md"
        actions={
          <DialogFooter align="end">
            <Button variant="outline" onClick={dialog.close}>Cancel</Button>
            <Button variant="primary" onClick={handleSave}>
              {dialog.mode === 'create' ? 'Create' : 'Save Changes'}
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
