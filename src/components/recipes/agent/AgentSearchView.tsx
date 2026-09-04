'use client';

import { useState, useCallback } from 'react';
import type { AgentRecipe } from '../../../lib/recipes/types';
import AgentSearchBar from './AgentSearchBar';
import AgentStreamRenderer from './AgentStreamRenderer';
import styles from './AgentSearchView.module.scss';

export default function AgentSearchView() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [streamKey, setStreamKey] = useState(0); // increment to reset the renderer

  const handleSearch = useCallback(
    (q: string) => {
      // Cancel any in-flight search
      abortController?.abort();
      const ac = new AbortController();
      setAbortController(ac);
      setQuery(q);
      setIsSearching(true);
      setStreamKey((k) => k + 1);
    },
    [abortController]
  );

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
    // Could show a toast or update some saved-count indicator
  }, []);

  return (
    <div className={styles.view}>
      <div className={styles.intro}>
        <h2 className={styles.title}>Recipe AI Agent</h2>
        <p className={styles.subtitle}>
          Describe what you&apos;re looking for — an ingredient base like{' '}
          <em>&quot;chicken and rice&quot;</em> or a style like <em>&quot;mediterranean&quot;</em>.
          The agent will search the web and find you the best match for your profile.
        </p>
      </div>

      <AgentSearchBar onSearch={handleSearch} onStop={handleStop} isSearching={isSearching} />

      {query && (
        <AgentStreamRenderer
          key={streamKey}
          query={query}
          abortSignal={abortController?.signal ?? null}
          onDone={handleDone}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
