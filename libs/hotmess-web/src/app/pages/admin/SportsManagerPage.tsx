import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Table,
  Badge,
  Button,
  Dialog,
  DialogFooter,
  Input,
  NumberInput,
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
import { buildAdminBreadcrumbs, useAdminDialog } from './utils';
import { useSportMutations } from '../../../hooks/mutations';
import styles from './AdminPages.module.scss';

interface Sport {
  id: string;
  name: string;
  icon: string;
  teamSize: number;
  isActive: boolean;
  [key: string]: unknown;
}

const sportsData: Sport[] = [
  { id: '1', name: 'Kickball', icon: '\u26BD', teamSize: 11, isActive: true },
  { id: '2', name: 'Volleyball', icon: '\uD83C\uDFD0', teamSize: 6, isActive: true },
  { id: '3', name: 'Pickleball', icon: '\uD83C\uDFD3', teamSize: 2, isActive: true },
  { id: '4', name: 'Basketball', icon: '\uD83C\uDFC0', teamSize: 5, isActive: true },
  { id: '5', name: 'Cornhole', icon: '\uD83C\uDFAF', teamSize: 2, isActive: true },
  { id: '6', name: 'Bowling', icon: '\uD83C\uDFB3', teamSize: 4, isActive: true },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const initialForm = { name: '', icon: '', teamSize: 6, isActive: true };

export function SportsManagerPage() {
  const dialog = useAdminDialog<Sport>();
  const mutations = useSportMutations();
  const [form, setForm] = useState(initialForm);

  // Filter state
  const [filterValues, setFilterValues] = useState<Record<string, FilterValue>>({
    status: [],
  });

  const handleFilterChange = useCallback((values: Record<string, FilterValue>) => {
    setFilterValues(values);
  }, []);

  const filterDefinitions: FilterDefinition[] = useMemo(
    () => [
      {
        id: 'status',
        type: 'multi-select' as const,
        label: 'Status',
        options: STATUS_OPTIONS,
        config: { displayMode: 'dropdown' } as MultiSelectFilterConfig,
      },
    ],
    []
  );

  const filteredData = useMemo(() => {
    const status = filterValues.status as string[];
    if (status.length === 0) {
      return sportsData;
    }
    return sportsData.filter((s) => {
      const sportStatus = s.isActive ? 'active' : 'inactive';
      return status.includes(sportStatus);
    });
  }, [filterValues]);

  const breadcrumbs = buildAdminBreadcrumbs([{ label: 'Sports' }]);

  useEffect(() => {
    if (dialog.editingItem) {
      setForm({
        name: dialog.editingItem.name,
        icon: dialog.editingItem.icon,
        teamSize: dialog.editingItem.teamSize,
        isActive: dialog.editingItem.isActive,
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

  const columns: Array<ColumnConfig<Sport>> = [
    {
      key: 'name',
      header: 'Sport',
      sortable: true,
      render: (_value, row) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>{row.icon}</span>
          <span>{row.name}</span>
        </span>
      ),
    },
    {
      key: 'teamSize',
      header: 'Team Size',
      sortable: true,
      align: 'center',
      width: '150px',
      render: (value) => `${value} players`,
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (_value, row) => (
        <Badge variant={row.isActive ? 'success' : 'neutral'} size="sm">
          {row.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '150px',
      render: (_value, row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="outline" size="xs" onClick={() => dialog.openEdit(row)}>
            Edit
          </Button>
          <Button variant="ghost" size="xs">
            Rules
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <Breadcrumbs items={breadcrumbs} separator="/" size="sm" />

      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Sports</h1>
        <Button variant="primary" onClick={dialog.openCreate}>
          + Add Sport
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

      <Table<Sport>
        data={filteredData}
        columns={columns}
        rowKey="id"
        searchable
        searchPlaceholder="Search sports..."
        searchFields={['name']}
        emptyContent="No sports found."
        variant="default"
      />

      <Dialog
        isOpen={dialog.isOpen}
        onClose={dialog.close}
        title={dialog.mode === 'create' ? 'Add Sport' : 'Edit Sport'}
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
            label="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <Input
            label="Icon (emoji)"
            value={form.icon}
            onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
          />
          <NumberInput
            label="Team Size"
            value={form.teamSize}
            onChange={(val) => setForm((f) => ({ ...f, teamSize: val ?? 0 }))}
            min={1}
            max={30}
          />
          <Toggle
            label="Active"
            checked={form.isActive}
            onChange={(checked) => setForm((f) => ({ ...f, isActive: checked }))}
          />
        </div>
      </Dialog>
    </div>
  );
}
