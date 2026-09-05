'use client';

import { Badge } from '@true-tech-team/react-components';
import { useUsageStatus } from './useUsageStatus';
import styles from './UsageIndicator.module.scss';

interface Props {
  fetchUrl: string;
  label: string;
  // Bump this after an agent run completes to force a refetch.
  refreshKey?: number;
}

export default function UsageIndicator({ fetchUrl, label, refreshKey }: Props) {
  const usage = useUsageStatus(fetchUrl, refreshKey);

  if (!usage) {
    return null;
  }

  return (
    <span className={styles.indicator}>
      <Badge variant={usage.allowed ? 'info' : 'warning'} size="sm">
        {usage.limit === null
          ? `Unlimited ${label}`
          : `${usage.used} of ${usage.limit} ${label} used`}
      </Badge>
    </span>
  );
}
