'use client';

import { useCallback, useRef, useState } from 'react';
import type { AgentStreamEvent } from '@true-tech-team/agent-kit';

// Shared NDJSON stream consumer for the resume-fill and resume-critique
// agents (and anything else built the same way — a pure single-turn JSON
// generator on agent-kit's generic AgentStreamEvent<TResult> with no
// tools). That means, unlike the recipe agent's AgentStreamRenderer.tsx, we
// never need to render tool_use/tool_result activity here — this hook only
// tracks text/result/error/done, but the fetch/reader/buffer/split/parse
// loop below is otherwise the exact same pattern as AgentStreamRenderer.tsx,
// factored out once since it's shared across the job-search and
// resume-builder packages (ResumeUploadParse, AIAssistFillButton,
// CritiquePanel, JobSearchOverview's resume-generation flow, and the
// job-search agent itself via JobSearchSearchContext).
export type AgentStreamStatus = 'idle' | 'streaming' | 'done' | 'error';

export interface RunAgentStreamOptions {
  url: string;
  body: unknown;
  signal?: AbortSignal;
}

interface UseAgentStreamOptions<TResult> {
  onResult?: (result: TResult) => void;
  // Called once the stream finishes, whether it ended in a result, an error,
  // or a plain "done" — mirrors AgentStreamRenderer.tsx's onDone contract, and
  // is used by callers to bump a UsageIndicator's refreshKey.
  onDone?: () => void;
}

export function useAgentStream<TResult>({ onResult, onDone }: UseAgentStreamOptions<TResult> = {}) {
  const [status, setStatus] = useState<AgentStreamStatus>('idle');
  const [textChunks, setTextChunks] = useState<string[]>([]);
  const [result, setResult] = useState<TResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const runningRef = useRef(false);

  const run = useCallback(
    async ({ url, body, signal }: RunAgentStreamOptions) => {
      if (runningRef.current) {
        return;
      }
      runningRef.current = true;
      setStatus('streaming');
      setTextChunks([]);
      setResult(null);
      setErrorMessage(null);

      const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
      let buffer = '';
      const decoder = new TextDecoder();

      const handleEvent = (event: AgentStreamEvent<TResult>) => {
        switch (event.type) {
          case 'text':
            setTextChunks((prev) => [...prev, event.text]);
            break;
          case 'result':
            setResult(event.result);
            onResult?.(event.result);
            break;
          case 'error':
            setErrorMessage(event.message);
            setStatus('error');
            break;
          case 'done':
            setStatus((prev) => (prev === 'error' ? prev : 'done'));
            break;
          case 'tool_use':
          case 'tool_result':
            // Never actually fires for the resume agents (tools: []), but
            // handled for type completeness.
            break;
        }
      };

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: isFormData ? undefined : { 'Content-Type': 'application/json' },
          body: isFormData ? (body as FormData) : JSON.stringify(body),
          signal,
        });

        if (!response.ok) {
          const text = await response.text();
          setErrorMessage(text || `Error ${response.status}`);
          setStatus('error');
          return;
        }
        if (!response.body) {
          setErrorMessage('No response body');
          setStatus('error');
          return;
        }

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
              handleEvent(JSON.parse(trimmed) as AgentStreamEvent<TResult>);
            } catch {
              // Skip malformed lines
            }
          }
        }

        if (buffer.trim()) {
          try {
            handleEvent(JSON.parse(buffer.trim()) as AgentStreamEvent<TResult>);
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
      } finally {
        runningRef.current = false;
        onDone?.();
      }
    },
    [onResult, onDone]
  );

  return { status, textChunks, result, errorMessage, run };
}
