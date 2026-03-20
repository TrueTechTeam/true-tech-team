import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  Badge,
  Button,
  Dialog,
  DialogFooter,
  Input,
  Toggle,
  Breadcrumbs,
  FilterProvider,
  FilterBar,
  FilterField,
  type ColumnConfig,
  type FilterDefinition,
  type FilterValue,
  type MultiSelectFilterConfig,
} from '@true-tech-team/ui-components';
import { useCities, useLeagues } from '../../../hooks/useSupabaseQuery';
import { buildAdminBreadcrumbs, useAdminDialog } from './utils';
import { useCityMutations } from '../../../hooks/mutations';
import styles from './AdminPages.module.scss';

interface CityRow {
  id: string;
  name: string;
  state: string;
  is_active: boolean;
  slug: string;
  [key: string]: unknown;
}

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const initialForm = { name: '', state: '', is_active: true };

export function CitiesManagerPage() {
  const navigate = useNavigate();
  const { data: cities, loading } = useCities();
  const { data: leagues } = useLeagues();
  const dialog = useAdminDialog<CityRow>();
  const mutations = useCityMutations();
  const [form, setForm] = useState(initialForm);

  // Filter state
  const [filterValues, setFilterValues] = useState<Record<string, FilterValue>>({
    status: [],
  });

  const handleFilterChange = useCallback(
    (values: Record<string, FilterValue>) => {
      setFilterValues(values);
    },
    []
  );

  const filterDefinitions: FilterDefinition[] = useMemo(() => [
    {
      id: 'status',
      type: 'multi-select' as const,
      label: 'Status',
      options: STATUS_OPTIONS,
      config: { displayMode: 'dropdown' } as MultiSelectFilterConfig,
    },
  ], []);

  const filteredData = useMemo(() => {
    const items = (cities || []) as CityRow[];
    const status = filterValues.status as string[];
    if (status.length === 0) {
      return items;
    }
    return items.filter((c) => {
      const cityStatus = c.is_active ? 'active' : 'inactive';
      return status.includes(cityStatus);
    });
  }, [cities, filterValues]);

  const breadcrumbs = buildAdminBreadcrumbs([{ label: 'Cities' }]);

  useEffect(() => {
    if (dialog.editingItem) {
      setForm({
        name: dialog.editingItem.name,
        state: dialog.editingItem.state,
        is_active: dialog.editingItem.is_active,
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

  const columns: Array<ColumnConfig<CityRow>> = [
    { key: 'name', header: 'City', sortable: true },
    { key: 'state', header: 'State', sortable: true },
    {
      key: 'leagues_count',
      header: 'Leagues',
      align: 'center',
      render: (_v, row) => leagues?.filter((l) => l.city_id === row.id).length || 0,
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (_v, row) => (
        <Badge variant={row.is_active ? 'success' : 'neutral'} size="sm">
          {row.is_active ? 'Active' : 'Inactive'}
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
            onClick={() => navigate(`/admin/cities/${row.id}/leagues`)}
          >
            Leagues
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
        <h1 className={styles.pageTitle}>Cities</h1>
        <Button variant="primary" onClick={dialog.openCreate}>
          + Add City
        </Button>
      </div>

      <FilterProvider
        filters={filterDefinitions}
        values={filterValues}
        onChange={handleFilterChange}
      >
        <FilterBar
          showActiveFilters={false}
          showMoreFilters={false}
          clearButtonLabel="Clear Filters"
          fillWidth
          style={{ marginBottom: '1.5rem' }}
        >
          <FilterField filterId="status" />
        </FilterBar>
      </FilterProvider>

      <Table<CityRow>
        data={filteredData}
        columns={columns}
        rowKey="id"
        loading={loading}
        skeleton={{ enabled: loading, rows: 5 }}
        searchable
        searchPlaceholder="Search cities..."
        searchFields={['name', 'state']}
        emptyContent="No cities found."
        onRowClick={(row) => navigate(`/admin/cities/${row.id}`)}
      />

      <Dialog
        isOpen={dialog.isOpen}
        onClose={dialog.close}
        title={dialog.mode === 'create' ? 'Add City' : 'Edit City'}
        size="sm"
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
            label="City Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <Input
            label="State"
            value={form.state}
            onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
            required
          />
          <Toggle
            label="Active"
            checked={form.is_active}
            onChange={(checked) => setForm((f) => ({ ...f, is_active: checked }))}
          />
        </div>
      </Dialog>
    </div>
  );
}
