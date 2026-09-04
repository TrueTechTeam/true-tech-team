'use client';

import { useEffect, useRef, useState } from 'react';
import { Spinner, Badge } from '@true-tech-team/ui-components';
import type { AgentStreamEvent, AgentRecipe } from '../../../lib/recipes/types';
import RecipeResultCard from './RecipeResultCard';
import styles from './AgentStreamRenderer.module.scss';

interface ToolActivity {
  id: number;
  toolName: string;
  summary: string;
  done: boolean;
}

type Status = 'loading' | 'streaming' | 'done' | 'error';

interface AgentStreamRendererProps {
  query: string;
  abortSignal: AbortSignal | null;
  onDone: () => void;
  onSaved: (recipe: AgentRecipe) => void;
}

let activityIdCounter = 0;

export default function AgentStreamRenderer({
  query,
  abortSignal,
  onDone,
  onSaved,
}: AgentStreamRendererProps) {
  const [status, setStatus] = useState<Status>('loading');
  const [textChunks, setTextChunks] = useState<string[]>([]);
  const [toolActivity, setToolActivity] = useState<ToolActivity[]>([]);
  const [recipes, setRecipes] = useState<AgentRecipe[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
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
              const event = JSON.parse(trimmed) as AgentStreamEvent;
              handleEvent(event);
            } catch {
              // Skip malformed lines
            }
          }
        }

        // Process any remaining buffer
        if (buffer.trim()) {
          try {
            const event = JSON.parse(buffer.trim()) as AgentStreamEvent;
            handleEvent(event);
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
        case 'text':
          setTextChunks((prev) => {
            const next = [...prev];
            // Append to last chunk if there is one, otherwise create new
            if (next.length > 0) {
              next[next.length - 1] = next[next.length - 1] + event.text;
            } else {
              next.push(event.text);
            }
            return next;
          });
          // Auto-scroll
          setTimeout(() => {
            scrollRef.current?.scrollTo({
              top: scrollRef.current.scrollHeight,
              behavior: 'smooth',
            });
          }, 50);
          break;

        case 'tool_use':
          setToolActivity((prev) => [
            ...prev,
            {
              id: ++activityIdCounter,
              toolName: event.toolName,
              summary:
                event.toolName === 'web_search'
                  ? `Searching: ${(event.input as { query?: string }).query ?? '…'}`
                  : `Scraping: ${(event.input as { url?: string }).url ?? '…'}`,
              done: false,
            },
          ]);
          break;

        case 'tool_result':
          setToolActivity((prev) =>
            prev.map((a) =>
              !a.done && a.toolName === event.toolName
                ? { ...a, done: true, summary: event.summary }
                : a
            )
          );
          break;

        case 'recipe':
          setRecipes((prev) => [...prev, event.recipe]);
          // Strip the recipe-json block from the displayed text
          setTextChunks((prev) =>
            prev.map((c) => c.replace(/```recipe-json[\s\S]*?```/g, '').trim())
          );
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

  const displayText = textChunks
    .join('')
    .replace(/```recipe-json[\s\S]*?```/g, '')
    .trim();

  return (
    <div className={styles.renderer}>
      {/* Tool activity feed */}
      {toolActivity.length > 0 && (
        <div className={styles.activity}>
          {toolActivity.map((a) => (
            <div key={a.id} className={styles.activityItem} data-done={a.done || undefined}>
              {!a.done && <Spinner size="xs" />}
              <Badge variant={a.done ? 'success' : 'info'} size="sm">
                {a.toolName === 'web_search' ? 'Search' : 'Scrape'}
              </Badge>
              <span className={styles.activitySummary}>{a.summary}</span>
            </div>
          ))}
        </div>
      )}

      {/* Streaming text (agent reasoning) */}
      {displayText && (
        <div className={styles.textBox} ref={scrollRef}>
          <p className={styles.streamText}>{displayText}</p>
          {status === 'streaming' && (
            <span className={styles.cursor} aria-hidden="true">
              ▊
            </span>
          )}
        </div>
      )}

      {/* Loading state before first content */}
      {status === 'loading' && (
        <div className={styles.loadingState}>
          <Spinner size="md" />
          <span>Searching for recipes…</span>
        </div>
      )}

      {/* Error state */}
      {status === 'error' && errorMessage && (
        <div className={styles.errorBox}>
          <strong>Error:</strong> {errorMessage}
        </div>
      )}

      {/* Recipe results */}
      {recipes.map((recipe) => (
        <RecipeResultCard key={recipe.title} recipe={recipe} onSaved={onSaved} />
      ))}
    </div>
  );
}
