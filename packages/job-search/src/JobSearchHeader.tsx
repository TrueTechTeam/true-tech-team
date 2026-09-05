'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, ButtonGroup, IconButton, Tooltip } from '@true-tech-team/react-components';
import { useUsageStatus } from '@true-tech-team/dashboard-kit';
import { useJobSearchSearch } from './JobSearchSearchContext';
import JobSearchProfileDialog from './settings/JobSearchProfileDialog';
import styles from './JobSearchHeader.module.scss';

// Title + actions for the Job Search page. Job Search is now a single page
// (no more Overview/Search/Applications tabs), so this is just a header, not
// a nav. The Run Search / Configure Profile button group replaces what used
// to be a standalone "Search for Jobs" section on the page plus a separate
// Settings button here — jobs and applications are now the only content on
// the page itself.
export default function JobSearchHeader() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { isSearching, runSearch, usageRefreshKey, profileConfigured, refreshProfile } =
    useJobSearchSearch();
  const usage = useUsageStatus('/api/job-search/usage', usageRefreshKey);
  // Default to disabled/unknown until we've positively confirmed both
  // signals — never assume "allowed" or "configured" just because we
  // haven't heard back yet.
  const usageKnown = usage !== null;
  const usageAllowed = usageKnown && usage.allowed;
  const profileKnown = profileConfigured !== undefined;

  // Disabled by default — only enabled once both checks have actually come
  // back and confirmed the search can run. Also disabled (with no tooltip)
  // while a search is already in flight — there's no way to cancel one once
  // started.
  const runDisabled = isSearching || !(usageAllowed && profileConfigured);
  const runTooltip = isSearching
    ? ''
    : usageKnown && !usageAllowed
      ? 'You have reached your daily limit of searches.'
      : profileKnown && !profileConfigured
        ? 'Configure your search criteria before running a search.'
        : '';

  return (
    <>
      <div className={styles.header}>
        <div className={styles.topRow}>
          <h1 className={styles.title}>Job Search</h1>
          <div className={styles.topRowActions}>
            <Link href="/resume-builder">
              <Button variant="ghost" size="sm">
                Manage Resume Template
              </Button>
            </Link>

            {/* Plain flex, not ButtonGroup — ButtonGroup's `>button` CSS selectors and variant-cloning break once Tooltip wraps a child in its own trigger span. */}
            <Tooltip content={runTooltip} disabled={!runTooltip}>
              <ButtonGroup>
                <Button size="sm" onClick={runSearch} disabled={runDisabled} loading={isSearching}>
                  Run Search
                </Button>
                <IconButton
                  icon="settings"
                  aria-label="Configure Profile"
                  onClick={() => setSettingsOpen(true)}
                />
              </ButtonGroup>
            </Tooltip>
          </div>
        </div>
      </div>

      {settingsOpen && (
        <JobSearchProfileDialog
          onClose={() => {
            setSettingsOpen(false);
            refreshProfile();
          }}
        />
      )}
    </>
  );
}
