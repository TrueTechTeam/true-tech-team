'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Accordion,
  Dialog,
  Button,
  CheckboxGroup,
  CheckboxGroupItem,
  Input,
  Select,
  Spinner,
  Textarea,
  Toggle,
  useToast,
} from '@true-tech-team/react-components';
import type { JobSearchProfile, JobSearchProfilePayload } from '../lib/types';
import { mapResumeDataToProfilePayload, mapSuggestedSearchPreferences } from '../lib/resumeImport';
import type {
  ResumeData,
  ResumeDataWithSuggestions,
  ResumeDocument,
} from '../resume-builder/lib/types';
import { TEMPLATES } from '../resume-builder/templates/registry';
import ManualFillSection from '../resume-builder/editor/ManualFillSection';
import { ConfirmDialog, ResumeUploadParse } from '@true-tech-team/dashboard-kit';
import styles from './JobSearchProfileDialog.module.scss';

const ORG_TYPES = [
  'Government',
  'Private sector',
  'Consulting/Engineering',
  'Non-profit',
  'Startup',
  'Large corporation',
];

const PRIORITIES = [
  'Salary/compensation',
  'Career growth',
  'Work-life balance',
  'Remote/flexible work',
  'Company mission',
  'Team culture',
  'Learning opportunities',
  'Job stability',
];

const WORK_TYPE_OPTIONS = [
  { value: 'any', label: 'Any' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'Onsite' },
];

const EXPERIENCE_LEVEL_OPTIONS = [
  { value: 'entry', label: 'Entry' },
  { value: 'mid', label: 'Mid' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' },
];

function fieldValue(value: string | null | undefined) {
  return value ?? '';
}

interface JobSearchProfileDialogProps {
  onClose: () => void;
}

export default function JobSearchProfileDialog({ onClose }: JobSearchProfileDialogProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const [fullName, setFullName] = useState('');
  const [title, setTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [blogUrl, setBlogUrl] = useState('');

  const [targetTitle, setTargetTitle] = useState('');
  const [industry, setIndustry] = useState('');
  const [orgTypes, setOrgTypes] = useState<string[]>([]);
  const [dreamCompanies, setDreamCompanies] = useState('');
  const [priorities, setPriorities] = useState<string[]>([]);
  const [searchLocation, setSearchLocation] = useState('');
  const [workType, setWorkType] = useState<JobSearchProfile['workType']>('any');
  const [willingToRelocate, setWillingToRelocate] = useState(false);
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [experienceLevel, setExperienceLevel] =
    useState<JobSearchProfile['experienceLevel']>('mid');
  const [skillsFocus, setSkillsFocus] = useState('');

  const [excitingWork, setExcitingWork] = useState('');
  const [idealWorkday, setIdealWorkday] = useState('');
  const [careerGoal, setCareerGoal] = useState('');
  const [avoidTypes, setAvoidTypes] = useState('');
  const [openPrompt, setOpenPrompt] = useState('');

  const [resumeImportUsageRefreshKey, setResumeImportUsageRefreshKey] = useState(0);
  // Set once a resume has been parsed and saved this session — lets the
  // "Resume details" accordion below show what got saved, editable in place.
  const [importedResumeData, setImportedResumeData] = useState<ResumeData | null>(null);
  const [importedResumeDocId, setImportedResumeDocId] = useState<string | null>(null);

  const toast = useToast();

  const applyProfile = useCallback((p: JobSearchProfile | null) => {
    setFullName(fieldValue(p?.fullName));
    setTitle(fieldValue(p?.title));
    setPhone(fieldValue(p?.phone));
    setEmail(fieldValue(p?.email));
    setLocation(fieldValue(p?.location));
    setLinkedinUrl(fieldValue(p?.linkedinUrl));
    setBlogUrl(fieldValue(p?.blogUrl));

    setTargetTitle(fieldValue(p?.targetTitle));
    setIndustry(fieldValue(p?.industry));
    setOrgTypes(p?.orgTypes ?? []);
    setDreamCompanies(fieldValue(p?.dreamCompanies));
    setPriorities(p?.priorities ?? []);
    setSearchLocation(fieldValue(p?.searchLocation));
    setWorkType(p?.workType ?? 'any');
    setWillingToRelocate(p?.willingToRelocate ?? false);
    setSalaryMin(fieldValue(p?.salaryMin));
    setSalaryMax(fieldValue(p?.salaryMax));
    setExperienceLevel(p?.experienceLevel ?? 'mid');
    setSkillsFocus(fieldValue(p?.skillsFocus));

    setExcitingWork(fieldValue(p?.excitingWork));
    setIdealWorkday(fieldValue(p?.idealWorkday));
    setCareerGoal(fieldValue(p?.careerGoal));
    setAvoidTypes(fieldValue(p?.avoidTypes));
    setOpenPrompt(fieldValue(p?.openPrompt));
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadProfile() {
      try {
        const res = await fetch('/api/job-search/profile');
        if (!res.ok) {
          throw new Error('Failed to load profile');
        }
        const { profile: p } = (await res.json()) as { profile: JobSearchProfile | null };
        if (!cancelled) {
          applyProfile(p);
        }
      } catch {
        if (!cancelled) {
          toast.error('Could not load your job search profile');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    void loadProfile();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once on mount
  }, []);

  function withDirty<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setDirty(true);
    };
  }

  // Saves the parsed resume as the user's one primary resume document —
  // creating it if they don't have one yet, otherwise updating its content
  // (leaving whatever template they'd already picked alone). Returns the
  // document's id on success, or null on failure.
  async function saveParsedResumeDocument(data: ResumeData): Promise<string | null> {
    try {
      const existingRes = await fetch('/api/resume-builder/documents');
      const existing = existingRes.ok
        ? ((await existingRes.json()) as { document: ResumeDocument | null }).document
        : null;

      if (existing) {
        const res = await fetch(`/api/resume-builder/documents/${existing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data }),
        });
        return res.ok ? existing.id : null;
      }

      const res = await fetch('/api/resume-builder/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'My Resume', templateId: TEMPLATES[0]?.id, data }),
      });
      if (!res.ok) {
        return null;
      }
      const { document: created } = (await res.json()) as { document: ResumeDocument };
      return created.id;
    } catch {
      return null;
    }
  }

  // Persists an in-accordion edit to the already-saved resume document.
  const handleImportedResumeChange = (data: ResumeData) => {
    setImportedResumeData(data);
    if (!importedResumeDocId) {
      return;
    }
    void fetch(`/api/resume-builder/documents/${importedResumeDocId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    }).catch(() => toast.error('Could not save your resume changes'));
  };

  // Only fills in fields the user hasn't already typed something into, so a
  // re-import (or importing after manual edits) never clobbers their work.
  const handleResumeParsed = async (data: ResumeDataWithSuggestions) => {
    const mapped = mapResumeDataToProfilePayload(data);
    if (!fullName && mapped.fullName) {
      setFullName(mapped.fullName);
    }
    if (!title && mapped.title) {
      setTitle(mapped.title);
    }
    if (!phone && mapped.phone) {
      setPhone(mapped.phone);
    }
    if (!email && mapped.email) {
      setEmail(mapped.email);
    }
    if (!location && mapped.location) {
      setLocation(mapped.location);
    }
    if (!linkedinUrl && mapped.linkedinUrl) {
      setLinkedinUrl(mapped.linkedinUrl);
    }
    if (!blogUrl && mapped.blogUrl) {
      setBlogUrl(mapped.blogUrl);
    }

    // Gives the user a starting point for their search preferences too —
    // still just a suggestion, so only fills fields they haven't touched.
    const suggested = mapSuggestedSearchPreferences(data);
    if (!targetTitle && suggested.targetTitle) {
      setTargetTitle(suggested.targetTitle);
    }
    if (!industry && suggested.industry) {
      setIndustry(suggested.industry);
    }
    if (!targetTitle && suggested.experienceLevel) {
      setExperienceLevel(suggested.experienceLevel);
    }
    if (!skillsFocus && suggested.skillsFocus) {
      setSkillsFocus(suggested.skillsFocus);
    }

    setDirty(true);

    const savedId = await saveParsedResumeDocument(data);
    if (savedId) {
      setImportedResumeData(data);
      setImportedResumeDocId(savedId);
    } else {
      setImportedResumeData(null);
      setImportedResumeDocId(null);
      toast.error(
        'Profile fields were updated, but we could not save the full resume to your Resume Template.'
      );
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: JobSearchProfilePayload = {
        fullName: fullName.trim() || null,
        title: title.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
        location: location.trim() || null,
        linkedinUrl: linkedinUrl.trim() || null,
        blogUrl: blogUrl.trim() || null,
        targetTitle: targetTitle.trim() || null,
        industry: industry.trim() || null,
        orgTypes,
        dreamCompanies: dreamCompanies.trim() || null,
        priorities,
        searchLocation: searchLocation.trim() || null,
        workType,
        willingToRelocate,
        salaryMin: salaryMin.trim() || null,
        salaryMax: salaryMax.trim() || null,
        experienceLevel,
        skillsFocus: skillsFocus.trim() || null,
        excitingWork: excitingWork.trim() || null,
        idealWorkday: idealWorkday.trim() || null,
        careerGoal: careerGoal.trim() || null,
        avoidTypes: avoidTypes.trim() || null,
        openPrompt: openPrompt.trim() || null,
      };
      const res = await fetch('/api/job-search/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error('Save failed');
      }
      const { profile: p } = (await res.json()) as { profile: JobSearchProfile };
      applyProfile(p);
      setDirty(false);
      toast.success('Profile saved!');
      onClose();
    } catch {
      toast.error('Could not save your profile');
    } finally {
      setSaving(false);
    }
  };

  const requestClose = () => {
    if (dirty) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  return (
    <>
      <Dialog
        isOpen
        onClose={requestClose}
        onOpenChange={(open) => !open && requestClose()}
        title="My Job Search Profile"
        size="xl"
        actions={
          <>
            <Button variant="outline" onClick={requestClose} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} loading={saving}>
              Save Profile
            </Button>
          </>
        }
      >
        {loading ? (
          <div className={styles.loading}>
            <Spinner size="md" />
          </div>
        ) : (
          <div className={styles.form}>
            <p className={styles.subtitle}>
              This profile is passed to the AI agent when you search for jobs. The more you fill in,
              the better the matches.
            </p>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Import from Resume</h3>
              <p className={styles.sectionHint}>
                Upload an existing resume to fill in the profile fields below and set up your resume
                in the Resume Builder — you can review and edit everything afterward.
              </p>
              <ResumeUploadParse<ResumeDataWithSuggestions>
                uploadUrl="/api/resume-builder/upload"
                usageUrl="/api/resume-builder/usage?slot=fill"
                onParsed={handleResumeParsed}
                onUsed={() => setResumeImportUsageRefreshKey((k) => k + 1)}
                usageRefreshKey={resumeImportUsageRefreshKey}
                successMessage="Resume parsed — profile fields updated and full resume saved to your Resume Template"
              />

              {importedResumeData && (
                <Accordion header="Resume details" defaultOpen={false}>
                  <ManualFillSection
                    draft={importedResumeData}
                    onChange={handleImportedResumeChange}
                  />
                </Accordion>
              )}
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Profile</h3>
              <div className={styles.row}>
                <Input
                  label="Full Name"
                  value={fullName}
                  onChange={(e) => withDirty(setFullName)(e.target.value)}
                />
                <Input
                  label="Current Title"
                  value={title}
                  onChange={(e) => withDirty(setTitle)(e.target.value)}
                />
              </div>
              <div className={styles.row}>
                <Input
                  type="tel"
                  label="Phone"
                  value={phone}
                  onChange={(e) => withDirty(setPhone)(e.target.value)}
                />
                <Input
                  type="email"
                  label="Email"
                  value={email}
                  onChange={(e) => withDirty(setEmail)(e.target.value)}
                />
              </div>
              <div className={styles.row}>
                <Input
                  label="Location"
                  value={location}
                  onChange={(e) => withDirty(setLocation)(e.target.value)}
                />
              </div>
              <div className={styles.row}>
                <Input
                  type="url"
                  label="LinkedIn URL"
                  value={linkedinUrl}
                  onChange={(e) => withDirty(setLinkedinUrl)(e.target.value)}
                />
                <Input
                  type="url"
                  label="Blog / Portfolio URL"
                  value={blogUrl}
                  onChange={(e) => withDirty(setBlogUrl)(e.target.value)}
                />
              </div>
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Search Preferences</h3>
              <div className={styles.row}>
                <Input
                  label="Target Title(s)"
                  placeholder="e.g. Product Manager, Senior PM"
                  value={targetTitle}
                  onChange={(e) => withDirty(setTargetTitle)(e.target.value)}
                />
                <Input
                  label="Industry"
                  value={industry}
                  onChange={(e) => withDirty(setIndustry)(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <span className={styles.fieldLabel}>Preferred Organization Types</span>
                <CheckboxGroup
                  value={orgTypes}
                  onChange={withDirty(setOrgTypes)}
                  orientation="horizontal"
                >
                  {ORG_TYPES.map((t) => (
                    <CheckboxGroupItem key={t} value={t} label={t} />
                  ))}
                </CheckboxGroup>
              </div>

              <div className={styles.row}>
                <Input
                  label="Dream Companies"
                  placeholder="e.g. Acme Corp, Globex"
                  value={dreamCompanies}
                  onChange={(e) => withDirty(setDreamCompanies)(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <span className={styles.fieldLabel}>Priorities</span>
                <CheckboxGroup
                  value={priorities}
                  onChange={withDirty(setPriorities)}
                  orientation="horizontal"
                >
                  {PRIORITIES.map((p) => (
                    <CheckboxGroupItem key={p} value={p} label={p} />
                  ))}
                </CheckboxGroup>
              </div>

              <div className={styles.row}>
                <Input
                  label="Search Location"
                  value={searchLocation}
                  onChange={(e) => withDirty(setSearchLocation)(e.target.value)}
                />
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Work Type</span>
                  <Select
                    value={workType}
                    onChange={withDirty((v) => setWorkType(v as JobSearchProfile['workType']))}
                    options={WORK_TYPE_OPTIONS}
                  />
                </div>
              </div>

              <div className={styles.field}>
                <Toggle
                  checked={willingToRelocate}
                  onChange={withDirty(setWillingToRelocate)}
                  label="Willing to relocate"
                />
              </div>

              <div className={styles.row}>
                <Input
                  label="Minimum Salary"
                  placeholder="e.g. 90k"
                  value={salaryMin}
                  onChange={(e) => withDirty(setSalaryMin)(e.target.value)}
                />
                <Input
                  label="Maximum Salary"
                  placeholder="e.g. 120k"
                  value={salaryMax}
                  onChange={(e) => withDirty(setSalaryMax)(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <span className={styles.fieldLabel}>Experience Level</span>
                <Select
                  value={experienceLevel}
                  onChange={withDirty((v) =>
                    setExperienceLevel(v as JobSearchProfile['experienceLevel'])
                  )}
                  options={EXPERIENCE_LEVEL_OPTIONS}
                />
              </div>

              <div className={styles.field}>
                <Textarea
                  label="Skills to Focus On"
                  value={skillsFocus}
                  onChange={(e) => withDirty(setSkillsFocus)(e.target.value)}
                  rows={2}
                />
              </div>
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>About You</h3>
              <p className={styles.sectionHint}>
                Extra context the agent uses to judge how well a job really fits you, beyond the
                structured fields above.
              </p>
              <div className={styles.field}>
                <Textarea
                  label="What excites you about work?"
                  value={excitingWork}
                  onChange={(e) => withDirty(setExcitingWork)(e.target.value)}
                  rows={2}
                />
              </div>
              <div className={styles.field}>
                <Textarea
                  label="What does your ideal workday look like?"
                  value={idealWorkday}
                  onChange={(e) => withDirty(setIdealWorkday)(e.target.value)}
                  rows={2}
                />
              </div>
              <div className={styles.field}>
                <Textarea
                  label="What's your career goal?"
                  value={careerGoal}
                  onChange={(e) => withDirty(setCareerGoal)(e.target.value)}
                  rows={2}
                />
              </div>
              <div className={styles.field}>
                <Textarea
                  label="Roles or companies to avoid"
                  value={avoidTypes}
                  onChange={(e) => withDirty(setAvoidTypes)(e.target.value)}
                  rows={2}
                />
              </div>
              <div className={styles.field}>
                <Textarea
                  label="Anything else the agent should know?"
                  value={openPrompt}
                  onChange={(e) => withDirty(setOpenPrompt)(e.target.value)}
                  rows={3}
                />
              </div>
            </section>
          </div>
        )}
      </Dialog>

      {showDiscardConfirm && (
        <ConfirmDialog
          title="Discard changes?"
          message="You have unsaved changes to your profile. If you close now, they'll be lost."
          confirmLabel="Discard"
          danger
          onConfirm={() => {
            setShowDiscardConfirm(false);
            setDirty(false);
            onClose();
          }}
          onCancel={() => setShowDiscardConfirm(false)}
        />
      )}
    </>
  );
}
