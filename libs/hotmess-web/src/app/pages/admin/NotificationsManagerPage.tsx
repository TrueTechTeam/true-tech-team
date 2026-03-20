import { useState, useEffect, useMemo } from 'react';
import {
  Table,
  Badge,
  Button,
  Dialog,
  DialogFooter,
  Input,
  Select,
  Textarea,
  Breadcrumbs,
  type ColumnConfig,
} from '@true-tech-team/ui-components';
import { mockNotifications, type MockNotification } from '../../../mocks/data';
import { buildAdminBreadcrumbs, getStatusBadgeVariant, useAdminDialog } from './utils';
import { useNotificationMutations } from '../../../hooks/mutations';
import styles from './AdminPages.module.scss';

type NotifRow = MockNotification & { [key: string]: unknown };

const initialForm = {
  title: '',
  message: '',
  target: 'all' as MockNotification['target'],
  target_name: '',
  status: 'draft' as MockNotification['status'],
  sent_date: '',
};

const statusFilterOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'sent', label: 'Sent' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'draft', label: 'Draft' },
];

export function NotificationsManagerPage() {
  const dialog = useAdminDialog<NotifRow>();
  const mutations = useNotificationMutations();
  const [form, setForm] = useState(initialForm);
  const [statusFilter, setStatusFilter] = useState('');

  const breadcrumbs = buildAdminBreadcrumbs([{ label: 'Notifications' }]);

  useEffect(() => {
    if (dialog.editingItem) {
      setForm({
        title: dialog.editingItem.title,
        message: dialog.editingItem.message,
        target: dialog.editingItem.target,
        target_name: dialog.editingItem.target_name || '',
        status: dialog.editingItem.status,
        sent_date: dialog.editingItem.sent_date,
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

  const data: NotifRow[] = useMemo(() => {
    const items = mockNotifications as NotifRow[];
    if (!statusFilter) { return items; }
    return items.filter((n) => n.status === statusFilter);
  }, [statusFilter]);

  const columns: Array<ColumnConfig<NotifRow>> = [
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      width: 'minmax(200px, 1fr)',
      render: (_v, row) => (
        <div>
          <strong>{row.title}</strong>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
            {row.message.length > 80 ? `${row.message.slice(0, 80)}...` : row.message}
          </p>
        </div>
      ),
    },
    {
      key: 'target',
      header: 'Target',
      render: (_v, row) => (
        <Badge variant="neutral" size="sm">
          {row.target === 'all' ? 'All Users' : row.target_name || row.target}
        </Badge>
      ),
    },
    {
      key: 'sent_date',
      header: 'Date',
      sortable: true,
      render: (value) =>
        new Date(value as string).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
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
      width: '180px',
      render: (_v, row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="outline" size="xs" onClick={() => dialog.openEdit(row)}>
            Edit
          </Button>
          {row.status === 'draft' && (
            <Button variant="outline" size="xs" onClick={() => mutations.send(row.id)}>
              Send
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
        <h1 className={styles.pageTitle}>Notifications</h1>
        <Button variant="primary" onClick={dialog.openCreate}>
          + New Notification
        </Button>
      </div>

      <div style={{ marginBottom: '1rem', maxWidth: '200px' }}>
        <Select
          label="Filter by Status"
          options={statusFilterOptions}
          value={statusFilter}
          onChange={(val) => setStatusFilter(val)}
        />
      </div>

      <Table<NotifRow>
        data={data}
        columns={columns}
        rowKey="id"
        searchable
        searchPlaceholder="Search notifications..."
        searchFields={['title']}
        emptyContent="No notifications found."
        defaultSort={{ column: 'sent_date', direction: 'desc' }}
      />

      <Dialog
        isOpen={dialog.isOpen}
        onClose={dialog.close}
        title={dialog.mode === 'create' ? 'New Notification' : 'Edit Notification'}
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
            label="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />
          <Textarea
            label="Message"
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            required
          />
          <Select
            label="Target"
            options={[
              { value: 'all', label: 'All Users' },
              { value: 'city', label: 'City' },
              { value: 'league', label: 'League' },
              { value: 'team', label: 'Team' },
            ]}
            value={form.target}
            onChange={(val) => setForm((f) => ({ ...f, target: val as MockNotification['target'] }))}
          />
          {form.target !== 'all' && (
            <Input
              label="Target Name"
              value={form.target_name}
              onChange={(e) => setForm((f) => ({ ...f, target_name: e.target.value }))}
            />
          )}
          <Select
            label="Status"
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'scheduled', label: 'Scheduled' },
              { value: 'sent', label: 'Sent' },
            ]}
            value={form.status}
            onChange={(val) => setForm((f) => ({ ...f, status: val as MockNotification['status'] }))}
          />
          {form.status === 'scheduled' && (
            <Input
              label="Schedule Date"
              type="datetime-local"
              value={form.sent_date ? form.sent_date.slice(0, 16) : ''}
              onChange={(e) => setForm((f) => ({ ...f, sent_date: e.target.value }))}
            />
          )}
        </div>
      </Dialog>
    </div>
  );
}
