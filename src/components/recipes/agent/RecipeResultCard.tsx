'use client';

import { useState } from 'react';
import { Button, Badge } from '@true-tech-team/ui-components';
import type { AgentRecipe } from '../../../lib/recipes/types';
import SaveRecipeDialog from './SaveRecipeDialog';
import styles from './RecipeResultCard.module.scss';

interface RecipeResultCardProps {
  recipe: AgentRecipe;
  onSaved: (recipe: AgentRecipe) => void;
}

export default function RecipeResultCard({ recipe, onSaved }: RecipeResultCardProps) {
  const [saveOpen, setSaveOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  const totalMins = (recipe.prepTimeMins ?? 0) + (recipe.cookTimeMins ?? 0);
  const timeStr = totalMins > 0 ? `${totalMins} min` : null;

  const handleSaved = (r: AgentRecipe) => {
    setSaved(true);
    setSaveOpen(false);
    onSaved(r);
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h3 className={styles.title}>{recipe.title}</h3>
          {recipe.sourceUrl && (
            <a
              className={styles.source}
              href={recipe.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              View original recipe ↗
            </a>
          )}
        </div>
        <div className={styles.meta}>
          {timeStr && <span className={styles.metaItem}>{timeStr}</span>}
          {recipe.servings && <span className={styles.metaItem}>{recipe.servings} servings</span>}
        </div>
      </div>

      {recipe.description && <p className={styles.description}>{recipe.description}</p>}

      {recipe.suggestedTags.length > 0 && (
        <div className={styles.tags}>
          {recipe.suggestedTags.map((tag) => (
            <Badge key={tag} variant="info" size="sm">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <div className={styles.body}>
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Ingredients</h4>
          <ul className={styles.list}>
            {recipe.ingredients.map((ing) => (
              <li key={ing}>{ing}</li>
            ))}
          </ul>
        </div>
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Directions</h4>
          <ol className={styles.list}>
            {recipe.directions.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      </div>

      <div className={styles.footer}>
        {saved ? (
          <span className={styles.savedBadge}>✓ Saved to your recipes</span>
        ) : (
          <Button variant="primary" size="sm" onClick={() => setSaveOpen(true)}>
            Save Recipe
          </Button>
        )}
      </div>

      <SaveRecipeDialog
        isOpen={saveOpen}
        recipe={recipe}
        onClose={() => setSaveOpen(false)}
        onSaved={handleSaved}
      />
    </div>
  );
}
