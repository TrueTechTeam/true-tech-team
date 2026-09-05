'use client';

import { useEffect, useRef, useState } from 'react';
import { Spinner } from '@true-tech-team/react-components';
import type { AgentStreamEvent, AgentRecipe } from '../lib/types';
import RecipeResultCard from './RecipeResultCard';
import styles from './AgentStreamRenderer.module.scss';

type Status = 'loading' | 'streaming' | 'done' | 'error';

interface AgentStreamRendererProps {
  query: string;
  abortSignal: AbortSignal | null;
  onDone: () => void;
  onSaved: (recipe: AgentRecipe) => void;
}

export default function AgentStreamRenderer({
  query,
  abortSignal,
  onDone,
  onSaved,
}: AgentStreamRendererProps) {
  const [status, setStatus] = useState<Status>('loading');
  const [statusMessage, setStatusMessage] = useState('Starting search…');
  const [recipe, setRecipe] = useState<AgentRecipe | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) {
      return;
    }
    hasFetched.current = true;

    let buffer = '';
    const decoder = new TextDecoder();

    async function runStream() {
      setStatus('loading');
      try {
        const response = await fetch('/api/recipes/agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
          signal: abortSignal ?? undefined,
        });

        if (!response.ok) {
          const text = await response.text();
          setErrorMessage(text || `Error ${response.status}`);
          setStatus('error');
          onDone();
          return;
        }

        if (!response.body) {
          setErrorMessage('No response body');
          setStatus('error');
          onDone();
          return;
        }

        setStatus('streaming');
        const reader = response.body.getReader();

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) {
              continue;
            }
            try {
              handleEvent(JSON.parse(trimmed) as AgentStreamEvent);
            } catch {
              // Skip malformed lines
            }
          }
        }

        if (buffer.trim()) {
          try {
            handleEvent(JSON.parse(buffer.trim()) as AgentStreamEvent);
          } catch {
            // ignore
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          setStatus('done');
        } else {
          setErrorMessage(err instanceof Error ? err.message : String(err));
          setStatus('error');
        }
        onDone();
      }
    }

    function handleEvent(event: AgentStreamEvent) {
      switch (event.type) {
        case 'tool_use':
          setStatusMessage(
            event.toolName === 'web_search'
              ? `Searching: ${(event.input as { query?: string }).query ?? '…'}`
              : `Reading: ${(event.input as { url?: string }).url ?? '…'}`
          );
          break;

        case 'tool_result':
          setStatusMessage(
            event.toolName === 'web_search'
              ? 'Reviewing search results…'
              : 'Reviewing page content…'
          );
          break;

        case 'recipe':
          setRecipe(event.recipe);
          break;

        case 'error':
          setErrorMessage(event.message);
          setStatus('error');
          onDone();
          break;

        case 'done':
          setStatus('done');
          onDone();
          break;
      }
    }

    void runStream();
  }, [query, abortSignal, onDone]);

  if (status === 'error' && errorMessage) {
    return (
      <div className={styles.errorBox}>
        <strong>Error:</strong> {errorMessage}
      </div>
    );
  }

  if (status === 'done' && recipe) {
    return <RecipeResultCard recipe={recipe} onSaved={onSaved} />;
  }

  return (
    <div className={styles.loadingState}>
      <Spinner size="md" />
      <span>{statusMessage}</span>
    </div>
  );
}
