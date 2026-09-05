'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button, Input } from '@true-tech-team/react-components';
import type { AgentRecipe } from '../lib/types';
import { invalidateCachedGetPrefix } from '../lib/fetchCache';
import AgentStreamRenderer from './AgentStreamRenderer';
import SavedRecipesView from '../saved/SavedRecipesView';
import styles from './AgentSearchView.module.scss';

const DEBOUNCE_MS = 400;

export default function AgentSearchView() {
  const [inputValue, setInputValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [searchPending, setSearchPending] = useState(false);

  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [streamKey, setStreamKey] = useState(0); // increment to reset the renderer
  const [savedRefreshKey, setSavedRefreshKey] = useState(0);

  // Debounce the saved-recipes filter as the user types.
  useEffect(() => {
    setSearchPending(true);
    const timeout = setTimeout(() => {
      setDebouncedSearch(inputValue.trim());
      setSearchPending(false);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [inputValue]);

  const handleFindRecipes = useCallback(() => {
    const q = inputValue.trim();
    if (!q || isSearching) {
      return;
    }
    // Cancel any in-flight search
    abortController?.abort();
    const ac = new AbortController();
    setAbortController(ac);
    setQuery(q);
    setIsSearching(true);
    setStreamKey((k) => k + 1);
  }, [inputValue, isSearching, abortController]);

  const handleStop = useCallback(() => {
    abortController?.abort();
    setAbortController(null);
    setIsSearching(false);
  }, [abortController]);

  const handleDone = useCallback(() => {
    setIsSearching(false);
    setAbortController(null);
  }, []);

  const handleSaved = useCallback((_recipe: AgentRecipe) => {
    invalidateCachedGetPrefix('/api/recipes/saved');
    setSavedRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className={styles.view}>
      <div className={styles.intro}>
        <p className={styles.subtitle}>
          Type to instantly filter your saved recipes, or describe what you&apos;re craving —{' '}
          <em>&quot;chicken and rice&quot;</em>, <em>&quot;mediterranean&quot;</em> — and hit{' '}
          <strong>Find Recipes</strong> to have the AI agent search the web for something new.
        </p>
      </div>

      <div className={styles.searchRow}>
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onEnterPress={handleFindRecipes}
          placeholder='Try "chicken and rice", "quick spanish", "anti-inflammatory dinner"…'
          disabled={isSearching}
          showClearButton
          onClear={() => setInputValue('')}
          className={styles.searchInput}
        />
        {isSearching ? (
          <Button variant="outline" onClick={handleStop}>
            Stop
          </Button>
        ) : (
          <Button variant="primary" onClick={handleFindRecipes} disabled={!inputValue.trim()}>
            Find Recipes
          </Button>
        )}
      </div>

      {query && (
        <AgentStreamRenderer
          key={streamKey}
          query={query}
          abortSignal={abortController?.signal ?? null}
          onDone={handleDone}
          onSaved={handleSaved}
        />
      )}

      <SavedRecipesView
        refreshKey={savedRefreshKey}
        search={debouncedSearch}
        searchPending={searchPending}
        onClearSearch={() => setInputValue('')}
      />
    </div>
  );
}
