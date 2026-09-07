'use client';

import { Dialog, Table, type ColumnConfig } from '@true-tech-team/react-components';
import type { UserUsageHistory, DailyUsage } from '@true-tech-team/project-gateway';

interface Props {
  userName: string;
  history: UserUsageHistory;
  onClose: () => void;
}

function formatCost(cost: number | null): string {
  return cost === null ? '—' : `$${cost.toFixed(2)}`;
}

const columns: ColumnConfig<DailyUsage>[] = [
  { key: 'date', header: 'Date' },
  { key: 'inputTokens', header: 'Input tokens', align: 'right' },
  { key: 'outputTokens', header: 'Output tokens', align: 'right' },
  {
    key: 'cost',
    header: 'Est. cost',
    align: 'right',
    render: (value) => formatCost(value as number | null),
  },
];

export default function UsageHistoryDialog({ userName, history, onClose }: Props) {
  return (
    <Dialog
      isOpen
      onClose={onClose}
      onOpenChange={(open) => !open && onClose()}
      title={`AI usage — ${userName}`}
      size="md"
    >
      <p>
        Last 30 days: {formatCost(history.totalCost)} total ({history.totalInputTokens} input /{' '}
        {history.totalOutputTokens} output tokens).
      </p>
      <Table<DailyUsage>
        data={history.daily}
        columns={columns}
        rowKey="date"
        emptyContent="No usage in the last 30 days"
      />
    </Dialog>
  );
}
