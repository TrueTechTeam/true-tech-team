'use client';

import { useState } from 'react';
import { Badge, Rating, Toggle } from '@true-tech-team/ui-components';
import type { SavedRecipe, UpdateRecipePayload } from '../../../lib/recipes/types';
import styles from './SavedRecipeCard.module.scss';

interface SavedRecipeCardProps {
  recipe: SavedRecipe;
  onClick: () => void;
  onUpdate: (updated: SavedRecipe) => void;
}

const STATUS_LABELS: Record<string, string> = {
  want_to_try: 'Want to try',
  tasted: 'Tasted',
};

async function patchRecipe(id: string, payload: UpdateRecipePayload): Promise<SavedRecipe | null> {
  const res = await fetch(`/api/recipes/saved/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    return null;
  }
  const data = (await res.json()) as { recipe: SavedRecipe };
  return data.recipe;
}

export default function SavedRecipeCard({ recipe, onClick, onUpdate }: SavedRecipeCardProps) {
  const [updating, setUpdating] = useState(false);

  const handleFavoriteToggle = async (checked: boolean, e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setUpdating(true);
    const updated = await patchRecipe(recipe.id, { isFavorite: checked });
    if (updated) {
      onUpdate(updated);
    }
    setUpdating(false);
  };

  const handleRatingChange = async (value: number) => {
    setUpdating(true);
    const updated = await patchRecipe(recipe.id, { rating: value || null });
    if (updated) {
      onUpdate(updated);
    }
    setUpdating(false);
  };

  const visibleTags = recipe.tags.slice(0, 3);
  const extraTags = recipe.tags.length - visibleTags.length;

  return (
    <div
      className={[styles.card, updating ? styles.cardUpdating : ''].join(' ')}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      aria-label={recipe.title}
    >
      <div className={styles.header}>
        <h3 className={styles.title}>{recipe.title}</h3>
        <div onClick={(e) => e.stopPropagation()}>
          <Toggle
            checked={recipe.isFavorite}
            onChange={handleFavoriteToggle}
            aria-label="Favorite"
            size="sm"
          />
        </div>
      </div>

      {recipe.description && <p className={styles.description}>{recipe.description}</p>}

      {/* Tags */}
      {recipe.tags.length > 0 && (
        <div className={styles.tags}>
          {visibleTags.map((tag) => (
            <Badge key={tag} variant="info" size="sm">
              {tag}
            </Badge>
          ))}
          {extraTags > 0 && <span className={styles.extraTags}>+{extraTags}</span>}
        </div>
      )}

      <div className={styles.footer}>
        <div onClick={(e) => e.stopPropagation()}>
          <Rating value={recipe.rating ?? 0} onChange={handleRatingChange} max={5} size="sm" />
        </div>
        {recipe.tastedStatus && (
          <Badge variant={recipe.tastedStatus === 'tasted' ? 'success' : 'warning'} size="sm">
            {STATUS_LABELS[recipe.tastedStatus]}
          </Badge>
        )}
      </div>
    </div>
  );
}
