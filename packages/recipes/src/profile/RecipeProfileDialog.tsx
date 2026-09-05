'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  Button,
  TagInput,
  Textarea,
  Spinner,
  useToast,
} from '@true-tech-team/react-components';
import type { RecipeProfile, RecipeProfilePayload } from '../lib/types';
import { ConfirmDialog } from '@true-tech-team/dashboard-kit';
import styles from './RecipeProfileDialog.module.scss';

const DIETARY_SUGGESTIONS = [
  'vegan',
  'vegetarian',
  'gluten-free',
  'dairy-free',
  'nut-free',
  'shellfish-free',
  'soy-free',
  'egg-free',
  'halal',
  'kosher',
  'paleo',
  'keto',
];

const PREFERENCE_SUGGESTIONS = [
  'spicy',
  'mild',
  'mediterranean',
  'asian',
  'mexican',
  'italian',
  'american',
  'middle-eastern',
  'indian',
  'thai',
  'japanese',
  'greek',
  'french',
  'comfort food',
];

const GOAL_SUGGESTIONS = [
  'weight loss',
  'high protein',
  'low carb',
  'low sodium',
  'anti-inflammatory',
  'heart healthy',
  'muscle gain',
  'low fat',
  'high fiber',
  'blood sugar friendly',
  'budget friendly',
  'meal prep',
  'quick meals',
];

function normalizeTag(tag: string) {
  return tag.toLowerCase().trim();
}

interface RecipeProfileDialogProps {
  onClose: () => void;
}

export default function RecipeProfileDialog({ onClose }: RecipeProfileDialogProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const [dietaryNeeds, setDietaryNeeds] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [preferredSites, setPreferredSites] = useState<string[]>([]);
  const [subscriptionSites, setSubscriptionSites] = useState<string[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState('');

  const toast = useToast();

  const applyProfile = useCallback((p: RecipeProfile | null) => {
    setDietaryNeeds(p?.dietaryNeeds ?? []);
    setPreferences(p?.preferences ?? []);
    setGoals(p?.goals ?? []);
    setPreferredSites(p?.preferredSites ?? []);
    setSubscriptionSites(p?.subscriptionSites ?? []);
    setAdditionalNotes(p?.additionalNotes ?? '');
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadProfile() {
      try {
        const res = await fetch('/api/recipes/profile');
        if (!res.ok) {
          throw new Error('Failed to load profile');
        }
        const { profile: p } = (await res.json()) as { profile: RecipeProfile | null };
        if (!cancelled) {
          applyProfile(p);
        }
      } catch {
        if (!cancelled) {
          toast.error('Could not load your recipe profile');
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

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: RecipeProfilePayload = {
        dietaryNeeds,
        preferences,
        goals,
        preferredSites: preferredSites.map((s) => s.toLowerCase().trim()),
        subscriptionSites: subscriptionSites.map((s) => s.toLowerCase().trim()),
        additionalNotes: additionalNotes.trim() || null,
      };
      const res = await fetch('/api/recipes/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error('Save failed');
      }
      const { profile: p } = (await res.json()) as { profile: RecipeProfile };
      applyProfile(p);
      setDirty(false);
      toast.success('Profile saved!');
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
        title="My Recipe Profile"
        size="lg"
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
              This profile is passed to the AI agent when you search for recipes. The more you fill
              in, the better the results.
            </p>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Dietary Needs &amp; Allergies</h3>
              <p className={styles.sectionHint}>
                The agent treats these as hard requirements and will warn you if a recipe may
                violate them.
              </p>
              <TagInput
                value={dietaryNeeds}
                onChange={withDirty(setDietaryNeeds)}
                suggestions={DIETARY_SUGGESTIONS}
                placeholder="e.g. gluten-free, nut-free"
                transformTag={normalizeTag}
              />
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Cuisine &amp; Flavor Preferences</h3>
              <p className={styles.sectionHint}>Styles and flavors you generally enjoy.</p>
              <TagInput
                value={preferences}
                onChange={withDirty(setPreferences)}
                suggestions={PREFERENCE_SUGGESTIONS}
                placeholder="e.g. mediterranean, spicy"
                transformTag={normalizeTag}
              />
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Health Goals</h3>
              <p className={styles.sectionHint}>
                The agent will bias towards recipes that align with these goals.
              </p>
              <TagInput
                value={goals}
                onChange={withDirty(setGoals)}
                suggestions={GOAL_SUGGESTIONS}
                placeholder="e.g. high protein, low sodium"
                transformTag={normalizeTag}
              />
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Preferred Recipe Sites</h3>
              <p className={styles.sectionHint}>
                The agent will search these sites first (e.g. <em>seriouseats.com</em>,{' '}
                <em>budgetbytes.com</em>).
              </p>
              <TagInput
                value={preferredSites}
                onChange={withDirty(setPreferredSites)}
                placeholder="e.g. seriouseats.com"
              />
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Subscription Sites</h3>
              <p className={styles.sectionHint}>
                Sites you have a paid subscription to (e.g. <em>cooking.nytimes.com</em>). The agent
                will include them in searches and attempt to access them.
              </p>
              <TagInput
                value={subscriptionSites}
                onChange={withDirty(setSubscriptionSites)}
                placeholder="e.g. cooking.nytimes.com"
              />
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Additional Notes</h3>
              <p className={styles.sectionHint}>
                Any other context for the agent — cooking skill level, equipment, time constraints,
                etc.
              </p>
              <Textarea
                value={additionalNotes}
                onChange={(e) => withDirty(setAdditionalNotes)(e.target.value)}
                placeholder="e.g. I only have 30 minutes on weeknights. I have an air fryer and instant pot."
                rows={3}
              />
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
