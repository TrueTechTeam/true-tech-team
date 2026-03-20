import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Table,
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
import { useLeagues, useCities, useSports, useSeasons } from '../../../hooks/useSupabaseQuery';
import { SportIcon } from '../../../components/SportIcons';
import {
  buildAdminBreadcrumbs,
  useAdminDialog,
  TIME_RANGE_OPTIONS,
  getMonthsAgo,
} from './utils';
import { useLeagueMutations } from '../../../hooks/mutations';
import styles from './AdminPages.module.scss';

interface LeagueRow {
  id: string;
  name: string;
  city_id: string;
  sport_id: string;
  cities?: { name: string };
  sports?: { name: string };
  [key: string]: unknown;
}

const initialForm = { name: '', city_id: '', sport_id: '' };

export function LeaguesManagerPage() {
  const { cityId } = useParams();
  const navigate = useNavigate();
  const { data: leagues, loading } = useLeagues(cityId);
  const { data: cities } = useCities();
  const { data: sports } = useSports();
  const { data: seasons } = useSeasons();
  const dialog = useAdminDialog<LeagueRow>();
  const mutations = useLeagueMutations();
  const [form, setForm] = useState(initialForm);

  // Filter state
  const [filterValues, setFilterValues] = useState<Record<string, FilterValue>>({
    timeRange: '6',
    city: [],
    sport: [],
  });

  const handleFilterChange = useCallback(
    (values: Record<string, FilterValue>) => {
      setFilterValues(values);
    },
    []
  );

  const cityName = cityId
    ? cities?.find((c) => c.id === cityId)?.name ?? 'City'
    : null;

  const breadcrumbs = buildAdminBreadcrumbs(
    cityId
      ? [
          { label: 'Cities', href: '/admin/cities' },
          { label: `${cityName} Leagues` },
        ]
      : [{ label: 'Leagues' }]
  );

  useEffect(() => {
    if (dialog.editingItem) {
      setForm({
        name: dialog.editingItem.name,
        city_id: dialog.editingItem.city_id,
        sport_id: dialog.editingItem.sport_id,
      });
    } else {
      setForm(initialForm);
    }
  }, [dialog.editingItem]);

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
        config: { displayMode: 'dropdown' } as MultiSelectFilterConfig,
      },
      {
        id: 'sport',
        type: 'multi-select' as const,
        label: 'Sport',
        placeholder: 'All Sports',
        options: sportOpts,
        config: { displayMode: 'dropdown' } as MultiSelectFilterConfig,
      },
    ];
  }, [cities, sports]);

  // Apply filters
  const filteredData = useMemo(() => {
    const items = (leagues || []) as LeagueRow[];
    const timeRange = filterValues.timeRange as string;
    const cityFilter = filterValues.city as string[];
    const sportFilter = filterValues.sport as string[];

    // Build a set of league IDs that have seasons within the time range
    const activeLeagueIds = timeRange !== 'all'
      ? new Set(
          (seasons || [])
            .filter((s) => {
              const months = parseInt(timeRange, 10);
              const cutoff = getMonthsAgo(months);
              return new Date(s.season_end_date) >= cutoff;
            })
            .map((s) => s.league_id)
        )
      : null;

    return items.filter((l) => {
      if (activeLeagueIds && !activeLeagueIds.has(l.id)) {
        return false;
      }
      if (cityFilter.length > 0 && !cityFilter.includes(l.city_id)) {
        return false;
      }
      if (sportFilter.length > 0 && !sportFilter.includes(l.sport_id)) {
        return false;
      }
      return true;
    });
  }, [leagues, seasons, filterValues]);

  const columns: Array<ColumnConfig<LeagueRow>> = [
    { key: 'name', header: 'League', sortable: true },
    {
      key: 'cities',
      header: 'City',
      sortable: true,
      render: (_v, row) => row.cities?.name || '\u2014',
    },
    {
      key: 'sports',
      header: 'Sport',
      sortable: true,
      render: (_v, row) => {
        const sportSlug = row.sports?.name?.toLowerCase().replace(/\s+/g, '-') || '';
        return (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <SportIcon slug={sportSlug} size={20} />
            {row.sports?.name}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_v, row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button
            variant="outline"
            size="xs"
            onClick={() => navigate(`/admin/leagues/${row.id}/seasons`)}
          >
            Seasons
          </Button>
          <Button variant="outline" size="xs" onClick={() => dialog.openEdit(row)}>
            Edit
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
          {cityId ? `${cityName} Leagues` : 'All Leagues'}
        </h1>
        <Button variant="primary" onClick={dialog.openCreate}>
          + Add League
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
        </FilterBar>
      </FilterProvider>

      <Table<LeagueRow>
        data={filteredData}
        columns={columns}
        rowKey="id"
        loading={loading}
        skeleton={{ enabled: loading, rows: 5 }}
        searchable
        searchPlaceholder="Search leagues..."
        searchFields={['name']}
        emptyContent="No leagues found."
        onRowClick={(row) => navigate(`/admin/leagues/${row.id}`)}
      />

      <Dialog
        isOpen={dialog.isOpen}
        onClose={dialog.close}
        title={dialog.mode === 'create' ? 'Add League' : 'Edit League'}
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
            label="League Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <Select
            label="City"
            options={(cities || []).map((c) => ({ value: c.id, label: c.name }))}
            value={form.city_id}
            onChange={(val) => setForm((f) => ({ ...f, city_id: val }))}
          />
          <Select
            label="Sport"
            options={(sports || []).map((s) => ({ value: s.id, label: s.name }))}
            value={form.sport_id}
            onChange={(val) => setForm((f) => ({ ...f, sport_id: val }))}
          />
        </div>
      </Dialog>
    </div>
  );
}
