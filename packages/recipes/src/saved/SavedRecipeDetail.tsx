'use client';

import { useState } from 'react';
import {
  Dialog,
  Button,
  Badge,
  TagInput,
  Textarea,
  Rating,
  Select,
  useToast,
} from '@true-tech-team/react-components';
import type { SavedRecipe, UpdateRecipePayload } from '../lib/types';
import { FavoriteHeartButton } from '@true-tech-team/dashboard-kit';
import styles from './SavedRecipeDetail.module.scss';

interface SavedRecipeDetailProps {
  recipe: SavedRecipe;
  onClose: () => void;
  onUpdate: (updated: SavedRecipe) => void;
  onDelete: (id: string) => void;
}

type ActiveTab = 'overview' | 'ingredients' | 'directions';

function normalizeTag(t: string) {
  return t.toLowerCase().trim();
}

export default function SavedRecipeDetail({
  recipe,
  onClose,
  onUpdate,
  onDelete,
}: SavedRecipeDetailProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [tags, setTags] = useState<string[]>(recipe.tags);
  const [notes, setNotes] = useState(recipe.notes ?? '');
  const [rating, setRating] = useState(recipe.rating ?? 0);
  const [isFavorite, setIsFavorite] = useState(recipe.isFavorite);
  const [tastedStatus, setTastedStatus] = useState(recipe.tastedStatus ?? '');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const toast = useToast();

  const totalMins = (recipe.prepTimeMins ?? 0) + (recipe.cookTimeMins ?? 0);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: UpdateRecipePayload = {
        tags,
        notes: notes.trim() || null,
        rating: rating || null,
        isFavorite,
        tastedStatus: (tastedStatus as 'want_to_try' | 'tasted') || null,
      };
      const res = await fetch(`/api/recipes/saved/${recipe.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error('Save failed');
      }
      const { recipe: updated } = (await res.json()) as { recipe: SavedRecipe };
      onUpdate(updated);
      toast.success('Recipe updated');
    } catch {
      toast.error('Could not save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/recipes/saved/${recipe.id}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error('Delete failed');
      }
      onDelete(recipe.id);
      toast.success('Recipe deleted');
      onClose();
    } catch {
      toast.error('Could not delete recipe');
      setSaving(false);
    }
  };

  const TABS: Array<{ id: ActiveTab; label: string }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'ingredients', label: `Ingredients (${recipe.ingredients.length})` },
    { id: 'directions', label: `Directions (${recipe.directions.length})` },
  ];

  return (
    <Dialog
      isOpen
      onClose={onClose}
      onOpenChange={(open) => !open && onClose()}
      title={recipe.title}
      size="xl"
      actions={
        <div className={styles.dialogActions}>
          <Button variant="danger" size="sm" onClick={handleDelete} disabled={saving}>
            {confirmDelete ? 'Confirm Delete' : 'Delete'}
          </Button>
          <div className={styles.actionRight}>
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} loading={saving}>
              Save Changes
            </Button>
          </div>
        </div>
      }
    >
      <div className={styles.content}>
        {/* Tab nav */}
        <div className={styles.tabNav}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={[styles.tabBtn, activeTab === tab.id ? styles.tabBtnActive : ''].join(' ')}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab: Overview */}
        {activeTab === 'overview' && (
          <div className={styles.tabPanel}>
            {/* Meta */}
            <div className={styles.metaRow}>
              {totalMins > 0 && (
                <span className={styles.metaItem}>
                  <strong>Time:</strong> {totalMins} min
                </span>
              )}
              {recipe.servings && (
                <span className={styles.metaItem}>
                  <strong>Servings:</strong> {recipe.servings}
                </span>
              )}
              {recipe.sourceUrl && (
                <a
                  href={recipe.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.sourceLink}
                >
                  View original recipe ↗
                </a>
              )}
            </div>

            {recipe.description && <p className={styles.description}>{recipe.description}</p>}

            <div className={styles.editSection}>
              {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
              <label className={styles.editLabel}>Tags</label>
              <TagInput
                value={tags}
                onChange={setTags}
                transformTag={normalizeTag}
                placeholder="Add a tag…"
              />
            </div>

            <div className={styles.editRow}>
              <div className={styles.editSection}>
                <label className={styles.editLabel} htmlFor="detail-rating">
                  Rating
                </label>
                <Rating id="detail-rating" value={rating} onChange={setRating} max={5} />
              </div>

              <div className={styles.editSection}>
                <label className={styles.editLabel} htmlFor="detail-status">
                  Status
                </label>
                <Select
                  id="detail-status"
                  value={tastedStatus}
                  onChange={(v) => setTastedStatus(v)}
                  options={[
                    { value: '', label: '— Not set —' },
                    { value: 'want_to_try', label: 'Want to try' },
                    { value: 'tasted', label: 'Tasted' },
                  ]}
                />
              </div>

              <div className={styles.editSection}>
                <span className={styles.editLabel}>Favorite</span>
                <FavoriteHeartButton
                  isFavorite={isFavorite}
                  onToggle={() => setIsFavorite((v) => !v)}
                />
              </div>
            </div>

            <div className={styles.editSection}>
              <label className={styles.editLabel} htmlFor="detail-notes">
                Notes
              </label>
              <Textarea
                id="detail-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Personal notes, tweaks, substitutions…"
                rows={3}
              />
            </div>

            {recipe.tags.length > 0 && (
              <div className={styles.tagsRow}>
                {recipe.tags.map((tag) => (
                  <Badge key={tag} variant="info" size="sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Ingredients */}
        {activeTab === 'ingredients' && (
          <div className={styles.tabPanel}>
            <ul className={styles.ingredientList}>
              {recipe.ingredients.map((ing) => (
                <li key={ing} className={styles.ingredientItem}>
                  {ing}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tab: Directions */}
        {activeTab === 'directions' && (
          <div className={styles.tabPanel}>
            <ol className={styles.directionList}>
              {recipe.directions.map((step) => (
                <li key={step} className={styles.directionItem}>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </Dialog>
  );
}
