'use client';

import { useEffect, useState } from 'react';
import type { UsageStatus } from '@true-tech-team/project-gateway';

// Fetches a usage-limit status and refetches whenever refreshKey changes.
// Shared by UsageIndicator (renders it as a badge) and any button that needs
// to disable itself + show a tooltip once usage is exhausted, without
// rendering a badge of its own.
export function useUsageStatus(fetchUrl: string, refreshKey?: number): UsageStatus | null {
  const [usage, setUsage] = useState<UsageStatus | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(fetchUrl)
      .then((res) => (res.ok ? (res.json() as Promise<UsageStatus>) : null))
      .then((data) => {
        if (!cancelled) {
          setUsage(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUsage(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [fetchUrl, refreshKey]);

  return usage;
}
