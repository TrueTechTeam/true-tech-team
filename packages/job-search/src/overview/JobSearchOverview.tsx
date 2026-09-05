'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Badge,
  Icon,
  IconButton,
  Menu,
  MenuList,
  MenuItem,
  Select,
  Spinner,
  Table,
  useToast,
  type ColumnConfig,
} from '@true-tech-team/react-components';
import { useUsageStatus, useAgentStream } from '@true-tech-team/dashboard-kit';
import type { JobSearchApplication, JobSearchJob } from '../lib/types';
import type { ResumeDocument } from '../resume-builder/lib/types';
import { useJobSearchSearch } from '../JobSearchSearchContext';
import JobDetailDialog from '../search/JobDetailDialog';
import ApplyDialog from '../search/ApplyDialog';
import DismissConfirmDialog from '../search/DismissConfirmDialog';
import RemoveConfirmDialog from '../applications/RemoveConfirmDialog';
import styles from './JobSearchOverview.module.scss';

type EffectiveStatus = JobSearchJob['status'] | JobSearchApplication['status'];

// One row per job — carries its application, if the user has applied to it,
// so the search bar's results and the applications tracker live in a single
// table instead of two separate pages.
interface Row {
  job: JobSearchJob;
  application: JobSearchApplication | null;
}

const STATUS_OPTIONS = [
  { value: '', label: 'Any status' },
  { value: 'suggested', label: 'Suggested' },
  { value: 'applied', label: 'Applied' },
  { value: 'phone_screen', label: 'Phone Screen' },
  { value: 'interview', label: 'Interview' },
  { value: 'offer', label: 'Offer' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' },
  { value: 'dismissed', label: 'Dismissed' },
];

const MATCH_SCORE_OPTIONS = [
  { value: '', label: 'Any match score' },
  { value: '80', label: '80% and up' },
  { value: '60', label: '60% and up' },
  { value: '40', label: '40% and up' },
];

function effectiveStatus(row: Row): EffectiveStatus {
  return row.application?.status ?? row.job.status;
}

function setUpResumeHref(job: JobSearchJob) {
  return `/resume-builder?${new URLSearchParams({
    jobTitle: job.title,
    company: job.company,
    ...(job.description ? { jobDescription: job.description } : {}),
  }).toString()}`;
}

export default function JobSearchOverview() {
  const router = useRouter();
  const toast = useToast();
  const [jobs, setJobs] = useState<JobSearchJob[]>([]);
  const [applications, setApplications] = useState<JobSearchApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const { isSearching, doneVersion, profileConfigured } = useJobSearchSearch();

  const [statusFilter, setStatusFilter] = useState('');
  const [workTypeFilter, setWorkTypeFilter] = useState('');
  const [minMatchScore, setMinMatchScore] = useState('');

  const [viewJob, setViewJob] = useState<JobSearchJob | null>(null);
  const [applyJob, setApplyJob] = useState<JobSearchJob | null>(null);
  const [dismissJob, setDismissJob] = useState<JobSearchJob | null>(null);
  const [removeApplication, setRemoveApplication] = useState<JobSearchApplication | null>(null);

  // Shared across the row menu and the details dialog — fetched once here
  // rather than per-row, since every row's menu needs to know whether a
  // primary resume exists at all.
  const [primaryResumeDoc, setPrimaryResumeDoc] = useState<ResumeDocument | null | undefined>(
    undefined
  );
  const [generatingJobId, setGeneratingJobId] = useState<string | null>(null);
  const [resumeUsageRefreshKey, setResumeUsageRefreshKey] = useState(0);
  const resumeUsage = useUsageStatus(
    '/api/resume-builder/usage?slot=customize',
    resumeUsageRefreshKey
  );
  const resumeUsageExhausted = resumeUsage !== null && !resumeUsage.allowed;

  const {
    run: runGenerate,
    status: generateStatus,
    errorMessage: generateError,
  } = useAgentStream<ResumeDocument>({
    onResult: (document) => {
      toast.success('Tailored resume generated');
      setJobs((prev) =>
        prev.map((j) => (j.id === generatingJobId ? { ...j, tailoredResumeId: document.id } : j))
      );
      router.push(`/resume-print/${document.id}`);
    },
    onDone: () => {
      setGeneratingJobId(null);
      setResumeUsageRefreshKey((k) => k + 1);
    },
  });

  useEffect(() => {
    if (generateStatus === 'error' && generateError) {
      toast.error(generateError);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- useToast() returns a new object every render, only re-run when the error actually changes
  }, [generateStatus, generateError]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [jobsRes, appsRes] = await Promise.all([
        fetch('/api/job-search/jobs'),
        fetch('/api/job-search/applications'),
      ]);
      const jobsData = jobsRes.ok
        ? ((await jobsRes.json()) as { jobs: JobSearchJob[] })
        : { jobs: [] };
      const appsData = appsRes.ok
        ? ((await appsRes.json()) as { applications: JobSearchApplication[] })
        : { applications: [] };
      setJobs(jobsData.jobs);
      setApplications(appsData.applications);
    } catch {
      toast.error('Could not load your jobs');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- useToast() returns a new object every render, this only needs to run on mount/refresh
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // doneVersion starts at 0 and only increments once a search actually
  // completes, so this never double-fires alongside the mount effect above.
  useEffect(() => {
    if (doneVersion > 0) {
      void loadData();
    }
  }, [doneVersion, loadData]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/resume-builder/documents')
      .then((res) => (res.ok ? (res.json() as Promise<{ document: ResumeDocument | null }>) : null))
      .then((data) => {
        if (!cancelled) {
          setPrimaryResumeDoc(data?.document ?? null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPrimaryResumeDoc(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleGenerateResume = useCallback(
    (job: JobSearchJob) => {
      if (!primaryResumeDoc) {
        router.push(setUpResumeHref(job));
        return;
      }
      if (resumeUsageExhausted) {
        toast.error("You've hit your daily AI usage limit for resume tailoring.");
        return;
      }
      setGeneratingJobId(job.id);
      void runGenerate({
        url: '/api/resume-builder/customize',
        body: { sourceDocumentId: primaryResumeDoc.id, jobId: job.id },
      });
    },
    [primaryResumeDoc, resumeUsageExhausted, runGenerate, router, toast]
  );

  const applicationByJobId = useMemo(
    () => new Map(applications.map((a) => [a.jobId, a])),
    [applications]
  );

  const rows: Row[] = useMemo(
    () => jobs.map((job) => ({ job, application: applicationByJobId.get(job.id) ?? null })),
    [jobs, applicationByJobId]
  );

  const workTypeOptions = useMemo(() => {
    const distinct = Array.from(
      new Set(jobs.map((j) => j.workType).filter((w): w is string => Boolean(w)))
    );
    return [
      { value: '', label: 'Any work type' },
      ...distinct.map((w) => ({ value: w, label: w })),
    ];
  }, [jobs]);

  const filteredRows = rows.filter((row) => {
    if (statusFilter && effectiveStatus(row) !== statusFilter) {
      return false;
    }
    if (workTypeFilter && row.job.workType !== workTypeFilter) {
      return false;
    }
    if (minMatchScore) {
      const min = parseInt(minMatchScore, 10);
      if (row.job.matchScore === null || row.job.matchScore < min) {
        return false;
      }
    }
    return true;
  });

  const handleApplicationRemoved = (id: string) => {
    setApplications((prev) => prev.filter((a) => a.id !== id));
    setRemoveApplication(null);
  };

  const handleRowMenuAction = (key: string, row: Row) => {
    switch (key) {
      case 'website': {
        const url = row.job.applicationUrl || row.job.companyWebsite;
        if (url) {
          window.open(url, '_blank', 'noopener,noreferrer');
        }
        break;
      }
      case 'apply':
        setApplyJob(row.job);
        break;
      case 'resume':
        if (row.job.tailoredResumeId) {
          router.push(`/resume-print/${row.job.tailoredResumeId}`);
        } else {
          handleGenerateResume(row.job);
        }
        break;
      case 'delete':
        if (row.application) {
          setRemoveApplication(row.application);
        } else {
          setDismissJob(row.job);
        }
        break;
    }
  };

  const columns: ColumnConfig<Row>[] = [
    {
      key: 'job.title',
      header: 'Job',
      width: '200px',
      render: (_value, row) => (
        <div className={styles.jobCell}>
          <span className={styles.jobTitle}>{row.job.title}</span>
          <span className={styles.jobCompany}>{row.job.company}</span>
        </div>
      ),
    },
    {
      key: 'job.matchScore',
      header: 'Match',
      align: 'right',
      sortable: true,
      render: (_value, row) =>
        row.job.matchScore !== null ? (
          <Badge variant={row.job.matchScore >= 70 ? 'success' : 'info'} size="sm">
            {row.job.matchScore}%
          </Badge>
        ) : (
          '—'
        ),
    },
    {
      key: 'job.location',
      header: 'Location',
      render: (_value, row) => row.job.location ?? '—',
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_value, row) => (
        <div className={styles.actionsCell} onClick={(e) => e.stopPropagation()}>
          <Menu
            trigger={<IconButton icon="more" aria-label="Row actions" variant="ghost" size="sm" />}
            onAction={(key) => handleRowMenuAction(key, row)}
          >
            <MenuList>
              <MenuItem
                itemKey="website"
                disabled={!(row.job.applicationUrl || row.job.companyWebsite)}
              >
                View Website
              </MenuItem>
              {!row.application && <MenuItem itemKey="apply">Mark as Applied</MenuItem>}
              <MenuItem itemKey="resume" disabled={generatingJobId === row.job.id}>
                {row.job.tailoredResumeId
                  ? 'View Generated Resume'
                  : generatingJobId === row.job.id
                    ? 'Generating…'
                    : 'Generate Resume'}
              </MenuItem>
              <MenuItem itemKey="delete">Delete</MenuItem>
            </MenuList>
          </Menu>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.view}>
      {isSearching && (
        <div className={styles.searching}>
          <Spinner size="sm" />
          <span>Searching for jobs…</span>
        </div>
      )}

      {profileConfigured === false && (
        <div className={styles.configBanner}>
          <Icon name="warning" size="sm" />
          <span>Configure your search settings before you can run a search.</span>
        </div>
      )}

      <div className={styles.headerRow}>
        <h3 className={styles.title}>
          Jobs &amp; Applications
          {rows.length > 0 && <span className={styles.count}>{rows.length}</span>}
        </h3>
      </div>

      <div className={styles.filterRow}>
        <div className={styles.filterItem}>
          <label className={styles.filterLabel} htmlFor="jobs-filter-status">
            Status
          </label>
          <Select
            id="jobs-filter-status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_OPTIONS}
          />
        </div>
        <div className={styles.filterItem}>
          <label className={styles.filterLabel} htmlFor="jobs-filter-worktype">
            Work Type
          </label>
          <Select
            id="jobs-filter-worktype"
            value={workTypeFilter}
            onChange={setWorkTypeFilter}
            options={workTypeOptions}
          />
        </div>
        <div className={styles.filterItem}>
          <label className={styles.filterLabel} htmlFor="jobs-filter-score">
            Match Score
          </label>
          <Select
            id="jobs-filter-score"
            value={minMatchScore}
            onChange={setMinMatchScore}
            options={MATCH_SCORE_OPTIONS}
          />
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <Spinner size="md" />
        </div>
      ) : (
        <Table
          data={filteredRows}
          columns={columns}
          rowKey={(row) => row.job.id}
          onRowClick={(row) => setViewJob(row.job)}
          defaultSort={{ column: 'job.matchScore', direction: 'desc' }}
          searchable
          searchPlaceholder="Search title or company…"
          searchFn={(row, query) => {
            const q = query.toLowerCase();
            return (
              row.job.title.toLowerCase().includes(q) || row.job.company.toLowerCase().includes(q)
            );
          }}
          emptyContent="No jobs yet — run a search to find some."
        />
      )}

      <JobDetailDialog
        job={viewJob}
        onClose={() => setViewJob(null)}
        onDelete={(job) => {
          setViewJob(null);
          const application = applicationByJobId.get(job.id) ?? null;
          if (application) {
            setRemoveApplication(application);
          } else {
            setDismissJob(job);
          }
        }}
        onGenerateResume={handleGenerateResume}
        generating={viewJob !== null && generatingJobId === viewJob.id}
        generateTooltip={resumeUsageExhausted ? "You've hit your daily AI usage limit." : ''}
      />

      <ApplyDialog
        job={applyJob}
        onClose={() => setApplyJob(null)}
        onApplied={() => {
          setApplyJob(null);
          void loadData();
        }}
      />

      <DismissConfirmDialog
        job={dismissJob}
        onClose={() => setDismissJob(null)}
        onDismissed={() => {
          setDismissJob(null);
          void loadData();
        }}
      />

      <RemoveConfirmDialog
        application={removeApplication}
        job={
          removeApplication ? (jobs.find((j) => j.id === removeApplication.jobId) ?? null) : null
        }
        onClose={() => setRemoveApplication(null)}
        onRemoved={handleApplicationRemoved}
      />
    </div>
  );
}
