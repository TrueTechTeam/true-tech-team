'use client';

import { useState } from 'react';
import { Dialog, Button, Badge } from '@true-tech-team/react-components';
import type { AgentRecipe } from '../lib/types';
import SaveRecipeDialog from './SaveRecipeDialog';
import styles from './RecipeResultDetailDialog.module.scss';

interface RecipeResultDetailDialogProps {
  recipe: AgentRecipe;
  saved: boolean;
  onClose: () => void;
  onSaved: (recipe: AgentRecipe) => void;
}

type ActiveTab = 'overview' | 'ingredients' | 'directions';

export default function RecipeResultDetailDialog({
  recipe,
  saved,
  onClose,
  onSaved,
}: RecipeResultDetailDialogProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [saveOpen, setSaveOpen] = useState(false);

  const totalMins = (recipe.prepTimeMins ?? 0) + (recipe.cookTimeMins ?? 0);

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
        saved ? (
          <Badge variant="success" size="sm">
            ✓ Saved to your recipes
          </Badge>
        ) : (
          <>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button variant="primary" onClick={() => setSaveOpen(true)}>
              Save Recipe
            </Button>
          </>
        )
      }
    >
      <div className={styles.content}>
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

        {activeTab === 'overview' && (
          <div className={styles.tabPanel}>
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

            {recipe.suggestedTags.length > 0 && (
              <div className={styles.tagsRow}>
                {recipe.suggestedTags.map((tag) => (
                  <Badge key={tag} variant="info" size="sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

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

      {saveOpen && (
        <SaveRecipeDialog
          isOpen
          recipe={recipe}
          onClose={() => setSaveOpen(false)}
          onSaved={(r) => {
            setSaveOpen(false);
            onSaved(r);
          }}
        />
      )}
    </Dialog>
  );
}
