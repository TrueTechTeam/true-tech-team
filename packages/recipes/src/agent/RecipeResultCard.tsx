'use client';

import { useState } from 'react';
import { Badge, Button } from '@true-tech-team/react-components';
import type { AgentRecipe } from '../lib/types';
import RecipeResultDetailDialog from './RecipeResultDetailDialog';
import styles from './RecipeResultCard.module.scss';

interface RecipeResultCardProps {
  recipe: AgentRecipe;
  onSaved: (recipe: AgentRecipe) => void;
}

export default function RecipeResultCard({ recipe, onSaved }: RecipeResultCardProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSaved = (r: AgentRecipe) => {
    setSaved(true);
    onSaved(r);
  };

  const visibleTags = recipe.suggestedTags.slice(0, 3);
  const extraTags = recipe.suggestedTags.length - visibleTags.length;

  return (
    <>
      <div
        className={styles.card}
        onClick={() => setDetailOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setDetailOpen(true)}
        aria-label={recipe.title}
      >
        <div className={styles.header}>
          <h3 className={styles.title}>{recipe.title}</h3>
          {saved && (
            <Badge variant="success" size="sm">
              Saved
            </Badge>
          )}
        </div>

        {recipe.description && <p className={styles.description}>{recipe.description}</p>}

        {visibleTags.length > 0 && (
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
          <span className={styles.hint}>Click to view full recipe</span>
          {!saved && (
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setDetailOpen(true);
              }}
            >
              Save Recipe
            </Button>
          )}
        </div>
      </div>

      {detailOpen && (
        <RecipeResultDetailDialog
          recipe={recipe}
          saved={saved}
          onClose={() => setDetailOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
