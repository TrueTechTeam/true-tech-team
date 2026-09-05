'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Button, Select, Rating, Spinner, Pagination } from '@true-tech-team/react-components';
import type { SavedRecipe, SavedRecipesFilters } from '../lib/types';
import { cachedGetJSON } from '../lib/fetchCache';
import { FavoriteHeartButton } from '@true-tech-team/dashboard-kit';
import SavedRecipeCard from './SavedRecipeCard';
import SavedRecipeDetail from './SavedRecipeDetail';
import styles from './SavedRecipesView.module.scss';

interface SavedRecipesViewProps {
  // Bump this after saving a recipe elsewhere on the page to refetch the grid.
  refreshKey?: number;
  // Driven by the combined search input above this view (debounced there).
  search?: string;
  // True while that debounce is pending — shown as a loading state here too,
  // so typing never looks like it did nothing.
  searchPending?: boolean;
  onClearSearch?: () => void;
}

export default function SavedRecipesView({
  refreshKey,
  search,
  searchPending,
  onClearSearch,
}: SavedRecipesViewProps) {
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [detailRecipe, setDetailRecipe] = useState<SavedRecipe | null>(null);

  // Filter state (search itself comes from the `search` prop, not local state)
  const [filters, setFilters] = useState<Omit<SavedRecipesFilters, 'search'>>({
    page: 1,
    limit: 20,
  });

  const loadRecipes = useCallback(async (f: SavedRecipesFilters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (f.search) {
        params.set('search', f.search);
      }
      if (f.tags?.length) {
        params.set('tags', f.tags.join(','));
      }
      if (f.isFavorite) {
        params.set('isFavorite', 'true');
      }
      if (f.tastedStatus) {
        params.set('tastedStatus', f.tastedStatus);
      }
      if (f.minRating) {
        params.set('minRating', String(f.minRating));
      }
      params.set('page', String(f.page ?? 1));
      params.set('limit', String(f.limit ?? 20));

      // Short TTL: only meant to collapse near-simultaneous duplicate calls
      // (e.g. React StrictMode's dev-only double-effect-invoke), not to
      // serve genuinely stale data — a save/update explicitly invalidates
      // this endpoint's cache (see AgentSearchView's onSaved handler).
      const data = await cachedGetJSON<{
        recipes: SavedRecipe[];
        total: number;
        totalPages: number;
        page: number;
      }>(`/api/recipes/saved?${params}`, { ttlMs: 500 });
      setRecipes(data.recipes);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } finally {
      setLoading(false);
    }
  }, []);

  // Resets to page 1 when the (already-debounced) search term changes,
  // without double-fetching: the page-reset and the actual load never both
  // happen from the same effect pass.
  const prevSearchRef = useRef(search);
  useEffect(() => {
    const searchChanged = prevSearchRef.current !== search;
    prevSearchRef.current = search;
    if (searchChanged && (filters.page ?? 1) !== 1) {
      setFilters((prev) => ({ ...prev, page: 1 }));
      return;
    }
    void loadRecipes({ ...filters, search: search || undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- loadRecipes is stable ([] deps)
  }, [filters, search, refreshKey]);

  const handleFilterChange = (partial: Partial<Omit<SavedRecipesFilters, 'search'>>) => {
    setFilters((prev) => ({ ...prev, ...partial, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRecipeUpdate = (updated: SavedRecipe) => {
    setRecipes((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    if (detailRecipe?.id === updated.id) {
      setDetailRecipe(updated);
    }
  };

  const handleRecipeDelete = (id: string) => {
    setRecipes((prev) => prev.filter((r) => r.id !== id));
    setDetailRecipe(null);
    setTotal((t) => t - 1);
  };

  const hasActiveFilters = Boolean(
    search || filters.tastedStatus || filters.isFavorite || filters.minRating
  );
  const showLoading = loading || searchPending;

  return (
    <div className={styles.view}>
      <div className={styles.headerRow}>
        <h2 className={styles.title}>
          Saved Recipes
          {total > 0 && <span className={styles.count}>{total}</span>}
        </h2>
      </div>

      {/* Filter bar */}
      <div className={styles.filters}>
        <div className={styles.filterRow}>
          <div className={styles.filterItem}>
            <label className={styles.filterLabel} htmlFor="filter-status">
              Status
            </label>
            <Select
              id="filter-status"
              value={filters.tastedStatus ?? ''}
              onChange={(v) =>
                handleFilterChange({
                  tastedStatus: v ? (v as 'want_to_try' | 'tasted') : undefined,
                })
              }
              options={[
                { value: '', label: 'Any status' },
                { value: 'want_to_try', label: 'Want to try' },
                { value: 'tasted', label: 'Tasted' },
              ]}
            />
          </div>

          <div className={styles.filterItem}>
            <label className={styles.filterLabel} htmlFor="filter-rating">
              Min Rating
            </label>
            <Rating
              id="filter-rating"
              value={filters.minRating ?? 0}
              onChange={(v) => handleFilterChange({ minRating: v || undefined })}
              max={5}
              size="sm"
            />
          </div>

          <div className={styles.filterItem}>
            <FavoriteHeartButton
              isFavorite={filters.isFavorite ?? false}
              onToggle={() => handleFilterChange({ isFavorite: !filters.isFavorite || undefined })}
              aria-label="Favorites only"
            />
            <span className={styles.filterLabel}>Favorites only</span>
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onClearSearch?.();
                setFilters({ page: 1, limit: 20 });
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Results */}
      {showLoading ? (
        <div className={styles.loading}>
          <Spinner size="md" />
        </div>
      ) : recipes.length === 0 ? (
        <div className={styles.empty}>
          <p>No recipes found.</p>
          {hasActiveFilters && <p className={styles.emptyHint}>Try clearing your filters.</p>}
        </div>
      ) : (
        <>
          <div className={styles.grid}>
            {recipes.map((recipe) => (
              <SavedRecipeCard
                key={recipe.id}
                recipe={recipe}
                onClick={() => setDetailRecipe(recipe)}
                onUpdate={handleRecipeUpdate}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <Pagination
                currentPage={filters.page ?? 1}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}

      {detailRecipe && (
        <SavedRecipeDetail
          recipe={detailRecipe}
          onClose={() => setDetailRecipe(null)}
          onUpdate={handleRecipeUpdate}
          onDelete={handleRecipeDelete}
        />
      )}
    </div>
  );
}
