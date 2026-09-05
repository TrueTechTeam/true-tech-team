'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAgentStream } from '@true-tech-team/dashboard-kit';
import type { JobSearchProfile, JobsAgentResult } from './lib/types';

interface JobSearchSearchContextValue {
  isSearching: boolean;
  // Bumped once a search finishes, so anything reading a usage-status
  // endpoint (e.g. the header's Run Search button) knows to refetch.
  usageRefreshKey: number;
  // Bumped once a search finishes, so the results table knows to refetch.
  doneVersion: number;
  runSearch: () => void;
  // undefined until the profile fetch resolves — never assume "configured"
  // just because we haven't heard back yet.
  profileConfigured: boolean | undefined;
  // Call after the profile dialog closes, in case the user just configured
  // their search criteria.
  refreshProfile: () => void;
}

const JobSearchSearchContext = createContext<JobSearchSearchContextValue | null>(null);

// The Run Search button lives in JobSearchHeader (page header) while the
// results table lives in JobSearchOverview (page body) — a Next.js layout +
// page pair, so they're separate component trees that can't share state
// through props. This context, provided once around both in the job-search
// layout, is the seam between them.
//
// There's no stream UI anymore — the search runs entirely in the
// background (via dashboard-kit's generic useAgentStream, the same NDJSON
// consumer the resume agents use) and can't be cancelled once started; the
// page just shows a loading indicator while isSearching is true.
export function JobSearchSearchProvider({ children }: { children: ReactNode }) {
  const [usageRefreshKey, setUsageRefreshKey] = useState(0);
  const [doneVersion, setDoneVersion] = useState(0);
  const [profile, setProfile] = useState<JobSearchProfile | null | undefined>(undefined);
  const [profileRefreshKey, setProfileRefreshKey] = useState(0);

  const { status, run } = useAgentStream<JobsAgentResult>({
    onDone: () => {
      setUsageRefreshKey((k) => k + 1);
      setDoneVersion((v) => v + 1);
    },
  });

  const runSearch = useCallback(() => {
    void run({ url: '/api/job-search/agent', body: {} });
  }, [run]);

  const refreshProfile = useCallback(() => {
    setProfileRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/job-search/profile')
      .then((res) =>
        res.ok ? (res.json() as Promise<{ profile: JobSearchProfile | null }>) : null
      )
      .then((data) => {
        if (!cancelled) {
          setProfile(data?.profile ?? null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProfile(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [profileRefreshKey]);

  const profileConfigured =
    profile === undefined ? undefined : Boolean(profile?.targetTitle?.trim());

  const value = useMemo<JobSearchSearchContextValue>(
    () => ({
      isSearching: status === 'streaming',
      usageRefreshKey,
      doneVersion,
      runSearch,
      profileConfigured,
      refreshProfile,
    }),
    [status, usageRefreshKey, doneVersion, runSearch, profileConfigured, refreshProfile]
  );

  return (
    <JobSearchSearchContext.Provider value={value}>{children}</JobSearchSearchContext.Provider>
  );
}

export function useJobSearchSearch(): JobSearchSearchContextValue {
  const ctx = useContext(JobSearchSearchContext);
  if (!ctx) {
    throw new Error('useJobSearchSearch must be used within a JobSearchSearchProvider');
  }
  return ctx;
}
