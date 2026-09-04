'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  Button,
  Input,
  Select,
  Toggle,
  Rating,
  Spinner,
  Pagination,
} from '@true-tech-team/ui-components';
import type { SavedRecipe, SavedRecipesFilters } from '../../../lib/recipes/types';
import SavedRecipeCard from './SavedRecipeCard';
import SavedRecipeDetail from './SavedRecipeDetail';
import styles from './SavedRecipesView.module.scss';

export default function SavedRecipesView() {
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [detailRecipe, setDetailRecipe] = useState<SavedRecipe | null>(null);

  // Filter state
  const [filters, setFilters] = useState<SavedRecipesFilters>({ page: 1, limit: 20 });
  const [searchInput, setSearchInput] = useState('');

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

      const res = await fetch(`/api/recipes/saved?${params}`);
      if (!res.ok) {
        throw new Error('Failed to load');
      }
      const data = (await res.json()) as {
        recipes: SavedRecipe[];
        total: number;
        totalPages: number;
        page: number;
      };
      setRecipes(data.recipes);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRecipes(filters);
  }, [filters, loadRecipes]);

  const handleFilterChange = (partial: Partial<SavedRecipesFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial, page: 1 }));
  };

  const handleSearch = () => {
    handleFilterChange({ search: searchInput.trim() || undefined });
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
        <div className={styles.searchRow}>
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onEnterPress={handleSearch}
            placeholder="Search saved recipes…"
            showClearButton
            onClear={() => {
              setSearchInput('');
              handleFilterChange({ search: undefined });
            }}
            className={styles.searchInput}
          />
          <Button variant="outline" onClick={handleSearch}>
            Search
          </Button>
        </div>

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
            <Toggle
              checked={filters.isFavorite ?? false}
              onChange={(v) => handleFilterChange({ isFavorite: v || undefined })}
              label="Favorites only"
            />
          </div>

          {(filters.search || filters.tastedStatus || filters.isFavorite || filters.minRating) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchInput('');
                setFilters({ page: 1, limit: 20 });
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className={styles.loading}>
          <Spinner size="md" />
        </div>
      ) : recipes.length === 0 ? (
        <div className={styles.empty}>
          <p>No recipes found.</p>
          {(filters.search || filters.tastedStatus || filters.isFavorite || filters.minRating) && (
            <p className={styles.emptyHint}>Try clearing your filters.</p>
          )}
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
