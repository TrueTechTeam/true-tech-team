'use client';

import { useState } from 'react';
import {
  Dialog,
  Button,
  TagInput,
  Textarea,
  Rating,
  Select,
  Toggle,
  useToast,
} from '@true-tech-team/react-components';
import type { AgentRecipe, SaveRecipePayload, SavedRecipe } from '../lib/types';
import styles from './SaveRecipeDialog.module.scss';

interface SaveRecipeDialogProps {
  isOpen: boolean;
  recipe: AgentRecipe;
  onClose: () => void;
  onSaved: (recipe: AgentRecipe) => void;
}

function normalizeTag(tag: string) {
  return tag.toLowerCase().trim();
}

export default function SaveRecipeDialog({
  isOpen,
  recipe,
  onClose,
  onSaved,
}: SaveRecipeDialogProps) {
  const [tags, setTags] = useState<string[]>(recipe.suggestedTags.map(normalizeTag));
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [tastedStatus, setTastedStatus] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: SaveRecipePayload = {
        title: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients,
        directions: recipe.directions,
        prepTimeMins: recipe.prepTimeMins,
        cookTimeMins: recipe.cookTimeMins,
        servings: recipe.servings,
        sourceUrl: recipe.sourceUrl,
        imageUrl: recipe.imageUrl,
        tags,
        notes: notes.trim() || null,
      };

      const res = await fetch('/api/recipes/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Save failed');
      }

      const { recipe: saved } = (await res.json()) as { recipe: SavedRecipe };

      // Apply rating/favorite/tasted if set
      if (rating > 0 || isFavorite || tastedStatus) {
        await fetch(`/api/recipes/saved/${saved.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...(rating > 0 ? { rating } : {}),
            isFavorite,
            ...(tastedStatus ? { tastedStatus } : {}),
          }),
        });
      }

      toast.success(`"${recipe.title}" saved!`);
      onSaved(recipe);
    } catch {
      toast.error('Could not save the recipe');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      onOpenChange={(open) => !open && onClose()}
      title={`Save "${recipe.title}"`}
      size="lg"
      actions={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} loading={saving}>
            Save Recipe
          </Button>
        </>
      }
    >
      <div className={styles.body}>
        <div className={styles.field}>
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label className={styles.label}>Tags</label>
          <p className={styles.hint}>Pre-filled from AI suggestions — edit as you like.</p>
          <TagInput
            value={tags}
            onChange={setTags}
            transformTag={normalizeTag}
            placeholder="Add a tag…"
          />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="save-rating">
              Your Rating
            </label>
            <Rating id="save-rating" value={rating} onChange={setRating} max={5} />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="save-status">
              Status
            </label>
            <Select
              id="save-status"
              value={tastedStatus}
              onChange={(v) => setTastedStatus(v as string)}
              options={[
                { value: '', label: '— Not set —' },
                { value: 'want_to_try', label: 'Want to try' },
                { value: 'tasted', label: 'Tasted' },
              ]}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="save-favorite">
              Favorite
            </label>
            <Toggle
              id="save-favorite"
              checked={isFavorite}
              onChange={setIsFavorite}
              label="Mark as favorite"
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="save-notes">
            Personal Notes
          </label>
          <Textarea
            id="save-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any tweaks, substitutions, or reminders…"
            rows={3}
          />
        </div>
      </div>
    </Dialog>
  );
}
