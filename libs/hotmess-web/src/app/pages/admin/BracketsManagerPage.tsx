import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  Badge,
  Button,
  Dialog,
  DialogFooter,
  Select,
  Breadcrumbs,
  type ColumnConfig,
} from '@true-tech-team/ui-components';
import { useAllBrackets, useSeasons } from '../../../hooks/useSupabaseQuery';
import { buildAdminBreadcrumbs, getStatusBadgeVariant, useAdminDialog } from './utils';
import { useBracketMutations } from '../../../hooks/mutations';
import styles from './AdminPages.module.scss';

const formatBracketType = (type: string) =>
  type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

interface SeasonBracketRow {
  seasonId: string;
  seasonName: string;
  leagueName: string;
  cityName: string;
  divisionCount: number;
  totalTeams: number;
  format: string;
  status: string;
}

const initialForm = { season_id: '', format: 'single_elimination' };

export function BracketsManagerPage() {
  const navigate = useNavigate();
  const { data: brackets, loading } = useAllBrackets();
  const { data: seasons } = useSeasons();
  const dialog = useAdminDialog<SeasonBracketRow>();
  const mutations = useBracketMutations();
  const [form, setForm] = useState(initialForm);

  const breadcrumbs = buildAdminBreadcrumbs([{ label: 'Brackets' }]);

  // Group brackets by season — one row per season
  const seasonRows: SeasonBracketRow[] = useMemo(() => {
    if (!brackets) {
      return [];
    }

    const seasonMap = new Map<string, SeasonBracketRow>();

    for (const bracket of brackets) {
      const seasonId = bracket.divisions?.seasons?.id;
      if (!seasonId) {
        continue;
      }

      const existing = seasonMap.get(seasonId);
      if (existing) {
        existing.divisionCount += 1;
        existing.totalTeams += bracket.team_count || 0;
      } else {
        seasonMap.set(seasonId, {
          seasonId,
          seasonName: bracket.divisions?.seasons?.name || '\u2014',
          leagueName: bracket.divisions?.seasons?.leagues?.name || '\u2014',
          cityName: bracket.divisions?.seasons?.leagues?.cities?.name || '\u2014',
          divisionCount: 1,
          totalTeams: bracket.team_count || 0,
          format: bracket.type,
          status: bracket.divisions?.seasons?.status || '',
        });
      }
    }

    return Array.from(seasonMap.values());
  }, [brackets]);

  // Seasons that already have brackets
  const seasonsWithBrackets = useMemo(
    () => new Set(seasonRows.map((r) => r.seasonId)),
    [seasonRows]
  );

  // Seasons eligible for new bracket creation (active/completed, no existing brackets)
  const eligibleSeasons =
    seasons?.filter(
      (s) => (s.status === 'active' || s.status === 'completed') && !seasonsWithBrackets.has(s.id)
    ) || [];

  useEffect(() => {
    if (!dialog.isOpen) {
      setForm(initialForm);
    }
  }, [dialog.isOpen]);

  const handleSave = async () => {
    const seasonId = form.season_id;
    await mutations.create(form);
    dialog.close();
    if (seasonId) {
      navigate(`/admin/brackets/${seasonId}`);
    }
  };

  const columns: Array<ColumnConfig<SeasonBracketRow>> = [
    { key: 'seasonName', header: 'Season', sortable: true },
    { key: 'leagueName', header: 'League', sortable: true },
    { key: 'cityName', header: 'City', sortable: true },
    { key: 'divisionCount', header: 'Divisions', sortable: true },
    { key: 'totalTeams', header: 'Teams', sortable: true },
    {
      key: 'format',
      header: 'Format',
      sortable: true,
      render: (_v, row) => formatBracketType(row.format),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (_v, row) => {
        if (!row.status) {
          return '\u2014';
        }
        return (
          <Badge variant={getStatusBadgeVariant(row.status)} size="sm">
            {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
          </Badge>
        );
      },
    },
  ];

  return (
    <div className={styles.page}>
      <Breadcrumbs items={breadcrumbs} separator="/" size="sm" />

      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Brackets</h1>
        <Button variant="primary" onClick={dialog.openCreate}>
          + Create Bracket
        </Button>
      </div>

      <Table<SeasonBracketRow>
        data={seasonRows}
        columns={columns}
        rowKey="seasonId"
        loading={loading}
        skeleton={{ enabled: loading, rows: 5 }}
        searchable
        searchPlaceholder="Search by season..."
        searchFields={['seasonName', 'leagueName', 'cityName']}
        onRowClick={(row) => navigate(`/admin/brackets/${row.seasonId}`)}
        emptyContent={
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ marginBottom: '0.5rem' }}>No brackets created yet</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Create a bracket to start organizing playoffs for a season.
            </p>
          </div>
        }
      />

      <Dialog
        isOpen={dialog.isOpen}
        onClose={dialog.close}
        title="Create Bracket"
        size="sm"
        actions={
          <DialogFooter align="end">
            <Button variant="outline" onClick={dialog.close}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Create
            </Button>
          </DialogFooter>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Select
            label="Season"
            options={eligibleSeasons.map((s) => ({ value: s.id, label: s.name }))}
            value={form.season_id}
            onChange={(val) => setForm((f) => ({ ...f, season_id: val }))}
          />
          <Select
            label="Format"
            options={[
              { value: 'single_elimination', label: 'Single Elimination' },
              { value: 'double_elimination', label: 'Double Elimination' },
              { value: 'round_robin', label: 'Round Robin' },
            ]}
            value={form.format}
            onChange={(val) => setForm((f) => ({ ...f, format: val }))}
          />
        </div>
      </Dialog>
    </div>
  );
}
