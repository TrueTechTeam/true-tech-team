import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Table,
  Badge,
  Button,
  Dialog,
  DialogFooter,
  Input,
  Toggle,
  Breadcrumbs,
  KPI,
  type ColumnConfig,
} from '@true-tech-team/ui-components';
import { useCity, useLeagues } from '../../../hooks/useSupabaseQuery';
import { SportIcon } from '../../../components/SportIcons';
import { buildAdminBreadcrumbs, useAdminDialog } from './utils';
import { useCityMutations } from '../../../hooks/mutations';
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

interface CityFormData {
  name: string;
  state: string;
  is_active: boolean;
}

const initialForm: CityFormData = { name: '', state: '', is_active: true };

export function CityDetailPage() {
  const { cityId } = useParams();
  const navigate = useNavigate();
  const { data: city, loading } = useCity(cityId);
  const { data: leagues } = useLeagues(cityId);
  const dialog = useAdminDialog<CityFormData>();
  const mutations = useCityMutations();
  const [form, setForm] = useState(initialForm);

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
    if (cityId) {
      mutations.update(cityId, form);
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

  if (!city) {
    const notFoundBreadcrumbs = buildAdminBreadcrumbs([
      { label: 'Cities', href: '/admin/cities' },
      { label: 'Not Found' },
    ]);
    return (
      <div className={styles.page}>
        <Breadcrumbs items={notFoundBreadcrumbs} separator="/" size="sm" />
        <p style={{ marginTop: '1rem' }}>City not found.</p>
      </div>
    );
  }

  const breadcrumbs = buildAdminBreadcrumbs([
    { label: 'Cities', href: '/admin/cities' },
    { label: city.name },
  ]);

  const columns: Array<ColumnConfig<LeagueRow>> = [
    { key: 'name', header: 'League', sortable: true },
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
      width: '100px',
      render: (_v, row) => (
        <Button
          variant="outline"
          size="xs"
          onClick={() =>
            dialog.openEdit({
              name: row.name,
              state: '',
              is_active: true,
            })
          }
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <Breadcrumbs items={breadcrumbs} separator="/" size="sm" />

      <div className={styles.pageHeader} style={{ marginTop: '1rem' }}>
        <div>
          <h1 className={styles.pageTitle}>{city.name}</h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>{city.state}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Badge variant={city.is_active ? 'success' : 'neutral'} size="lg">
            {city.is_active ? 'Active' : 'Inactive'}
          </Badge>
          <Button
            variant="outline"
            onClick={() =>
              dialog.openEdit({ name: city.name, state: city.state, is_active: city.is_active })
            }
          >
            Edit
          </Button>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <KPI
          title="Leagues"
          value={leagues?.length ?? 0}
          className={styles.coloredKpi}
          style={
            {
              '--kpi-bg': 'var(--logo-red-50)',
              '--kpi-border': 'none',
              '--theme-text-primary': '#ffffff',
            } as React.CSSProperties
          }
        />
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Leagues</h2>
        <Table<LeagueRow>
          data={(leagues || []) as LeagueRow[]}
          columns={columns}
          rowKey="id"
          searchable
          searchPlaceholder="Search leagues..."
          searchFields={['name']}
          emptyContent="No leagues found for this city."
          onRowClick={(row) => navigate(`/admin/leagues/${row.id}`)}
        />
      </section>

      <Dialog
        isOpen={dialog.isOpen}
        onClose={dialog.close}
        title="Edit City"
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
