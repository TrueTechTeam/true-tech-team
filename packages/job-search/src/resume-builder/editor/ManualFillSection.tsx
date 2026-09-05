'use client';

import { Input, Textarea, TagInput, Button } from '@true-tech-team/react-components';
import type {
  ResumeData,
  ResumeEducationEntry,
  ResumeExperienceEntry,
  ResumeSkillGroup,
} from '../lib/types';
import { useStableKeys } from './useStableKeys';
import ExperienceEntryFields from './ExperienceEntryFields';
import EducationEntryFields from './EducationEntryFields';
import styles from './ManualFillSection.module.scss';

interface ManualFillSectionProps {
  draft: ResumeData;
  onChange: (data: ResumeData) => void;
}

function emptySkillGroup(): ResumeSkillGroup {
  return { category: '', items: [] };
}

function emptyExperienceEntry(): ResumeExperienceEntry {
  return { company: '', role: '', location: '', startDate: '', endDate: '', bullets: [] };
}

function emptyEducationEntry(): ResumeEducationEntry {
  return { school: '', degree: '', location: '', startDate: '', endDate: '' };
}

export default function ManualFillSection({ draft, onChange }: ManualFillSectionProps) {
  const skillKeys = useStableKeys(draft.skills.length);
  const experienceKeys = useStableKeys(draft.experience.length);
  const educationKeys = useStableKeys(draft.education.length);

  const updateProfile = (field: keyof ResumeData['profile'], value: string) => {
    onChange({ ...draft, profile: { ...draft.profile, [field]: value } });
  };

  const updateSkillGroup = (index: number, patch: Partial<ResumeSkillGroup>) => {
    onChange({
      ...draft,
      skills: draft.skills.map((g, i) => (i === index ? { ...g, ...patch } : g)),
    });
  };
  const addSkillGroup = () => onChange({ ...draft, skills: [...draft.skills, emptySkillGroup()] });
  const removeSkillGroup = (index: number) =>
    onChange({ ...draft, skills: draft.skills.filter((_, i) => i !== index) });

  const updateExperience = (index: number, entry: ResumeExperienceEntry) => {
    onChange({
      ...draft,
      experience: draft.experience.map((e, i) => (i === index ? entry : e)),
    });
  };
  const addExperience = () =>
    onChange({ ...draft, experience: [...draft.experience, emptyExperienceEntry()] });
  const removeExperience = (index: number) =>
    onChange({ ...draft, experience: draft.experience.filter((_, i) => i !== index) });

  const updateEducation = (index: number, entry: ResumeEducationEntry) => {
    onChange({
      ...draft,
      education: draft.education.map((e, i) => (i === index ? entry : e)),
    });
  };
  const addEducation = () =>
    onChange({ ...draft, education: [...draft.education, emptyEducationEntry()] });
  const removeEducation = (index: number) =>
    onChange({ ...draft, education: draft.education.filter((_, i) => i !== index) });

  return (
    <div className={styles.section}>
      <div className={styles.group}>
        <h3 className={styles.groupTitle}>Profile</h3>
        <div className={styles.grid2}>
          <Input
            label="Full name"
            value={draft.profile.name}
            onChange={(e) => updateProfile('name', e.target.value)}
          />
          <Input
            label="Title"
            value={draft.profile.title}
            onChange={(e) => updateProfile('title', e.target.value)}
          />
          <Input
            label="Phone"
            value={draft.profile.phone}
            onChange={(e) => updateProfile('phone', e.target.value)}
          />
          <Input
            label="Email"
            type="email"
            value={draft.profile.email}
            onChange={(e) => updateProfile('email', e.target.value)}
          />
          <Input
            label="Location"
            value={draft.profile.location}
            onChange={(e) => updateProfile('location', e.target.value)}
          />
          <Input
            label="LinkedIn (optional)"
            value={draft.profile.linkedin ?? ''}
            onChange={(e) => updateProfile('linkedin', e.target.value)}
          />
          <Input
            label="Website (optional)"
            value={draft.profile.website ?? ''}
            onChange={(e) => updateProfile('website', e.target.value)}
          />
        </div>
      </div>

      <div className={styles.group}>
        <h3 className={styles.groupTitle}>Summary</h3>
        <Textarea
          label="Professional summary"
          value={draft.summary}
          onChange={(e) => onChange({ ...draft, summary: e.target.value })}
          rows={4}
        />
      </div>

      <div className={styles.group}>
        <h3 className={styles.groupTitle}>Skills</h3>
        {draft.skills.map((group, i) => (
          <div key={skillKeys[i]} className={styles.skillGroupRow}>
            <Input
              label="Category"
              value={group.category}
              onChange={(e) => updateSkillGroup(i, { category: e.target.value })}
              placeholder="e.g. Programming Languages"
            />
            <TagInput
              label="Skills"
              value={group.items}
              onChange={(items) => updateSkillGroup(i, { items })}
              placeholder="Add a skill…"
            />
            <Button variant="ghost" size="sm" onClick={() => removeSkillGroup(i)}>
              Remove category
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addSkillGroup}>
          Add category
        </Button>
      </div>

      <div className={styles.group}>
        <h3 className={styles.groupTitle}>Experience</h3>
        {draft.experience.map((entry, i) => (
          <ExperienceEntryFields
            key={experienceKeys[i]}
            entry={entry}
            onChange={(updated) => updateExperience(i, updated)}
            onRemove={() => removeExperience(i)}
          />
        ))}
        <Button variant="outline" size="sm" onClick={addExperience}>
          Add experience
        </Button>
      </div>

      <div className={styles.group}>
        <h3 className={styles.groupTitle}>Education</h3>
        {draft.education.map((entry, i) => (
          <EducationEntryFields
            key={educationKeys[i]}
            entry={entry}
            onChange={(updated) => updateEducation(i, updated)}
            onRemove={() => removeEducation(i)}
          />
        ))}
        <Button variant="outline" size="sm" onClick={addEducation}>
          Add education
        </Button>
      </div>
    </div>
  );
}
