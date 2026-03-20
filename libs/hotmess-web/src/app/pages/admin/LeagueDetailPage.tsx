import { useState, useEffect } from 'react';
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
  KPI,
  type ColumnConfig,
} from '@true-tech-team/ui-components';
import {
  useLeague,
  useSeasons,
  useCities,
  useSports,
  type LeagueDetailRow,
} from '../../../hooks/useSupabaseQuery';
import { SportIcon } from '../../../components/SportIcons';
import { buildAdminBreadcrumbs, getStatusBadgeVariant, useAdminDialog } from './utils';
import { useLeagueMutations } from '../../../hooks/mutations';
import styles from './AdminPages.module.scss';

interface SeasonRow {
  id: string;
  name: string;
  status: string;
  season_start_date: string;
  season_end_date: string;
  leagues?: { name: string };
  [key: string]: unknown;
}

const initialForm = { name: '', city_id: '', sport_id: '' };

export function LeagueDetailPage() {
  const { leagueId } = useParams();
  const navigate = useNavigate();
  const { data: leagueData, loading } = useLeague(leagueId);
  const league = leagueData as LeagueDetailRow | null;
  const { data: seasons } = useSeasons(leagueId);
  const { data: cities } = useCities();
  const { data: sports } = useSports();
  const dialog = useAdminDialog<{ name: string; city_id: string; sport_id: string }>();
  const mutations = useLeagueMutations();
  const [form, setForm] = useState(initialForm);

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
    if (leagueId) {
      mutations.update(leagueId, form);
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

  if (!league) {
    const notFoundBreadcrumbs = buildAdminBreadcrumbs([
      { label: 'Leagues', href: '/admin/leagues' },
      { label: 'Not Found' },
    ]);
    return (
      <div className={styles.page}>
        <Breadcrumbs items={notFoundBreadcrumbs} separator="/" size="sm" />
        <p style={{ marginTop: '1rem' }}>League not found.</p>
      </div>
    );
  }

  const cityName = league.cities?.name ?? 'Unknown City';
  const sportName = league.sports?.name ?? 'Unknown Sport';
  const sportSlug = sportName.toLowerCase().replace(/\s+/g, '-');

  const breadcrumbs = buildAdminBreadcrumbs([
    { label: cityName, href: `/admin/cities/${league.city_id}` },
    { label: league.name },
  ]);

  const allSeasons = (seasons || []) as unknown as SeasonRow[];
  const activeSeasons = allSeasons.filter(
    (s) => s.status === 'active' || s.status === 'registration'
  );

  const columns: Array<ColumnConfig<SeasonRow>> = [
    { key: 'name', header: 'Season', sortable: true },
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
  ];

  return (
    <div className={styles.page}>
      <Breadcrumbs items={breadcrumbs} separator="/" size="sm" />

      <div className={styles.pageHeader} style={{ marginTop: '1rem' }}>
        <div>
          <h1 className={styles.pageTitle}>{league.name}</h1>
          <p
            style={{
              color: 'var(--text-muted)',
              margin: '0.25rem 0 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <SportIcon slug={sportSlug} size={18} />
            {sportName} &middot; {cityName}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() =>
            dialog.openEdit({
              name: league.name,
              city_id: league.city_id,
              sport_id: league.sport_id,
            })
          }
        >
          Edit
        </Button>
      </div>

      <div className={styles.statsGrid}>
        <KPI
          title="Seasons"
          value={allSeasons.length}
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
          title="Active / Registration"
          value={activeSeasons.length}
          className={styles.coloredKpi}
          style={
            {
              '--kpi-bg': 'var(--logo-yellow-50)',
              '--kpi-border': 'none',
              '--theme-text-primary': '#ffffff',
            } as React.CSSProperties
          }
        />
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Seasons</h2>
        <Table<SeasonRow>
          data={allSeasons}
          columns={columns}
          rowKey="id"
          searchable
          searchPlaceholder="Search seasons..."
          searchFields={['name']}
          emptyContent="No seasons found for this league."
          defaultSort={{ column: 'season_start_date', direction: 'desc' }}
          onRowClick={(row) => navigate(`/admin/seasons/${row.id}`)}
        />
      </section>

      <Dialog
        isOpen={dialog.isOpen}
        onClose={dialog.close}
        title="Edit League"
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
