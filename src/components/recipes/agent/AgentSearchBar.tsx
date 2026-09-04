'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button, Input } from '@true-tech-team/ui-components';
import styles from './AgentSearchBar.module.scss';

interface AgentSearchBarProps {
  onSearch: (query: string) => void;
  onStop: () => void;
  isSearching: boolean;
}

const MAX_HISTORY = 8;
const HISTORY_KEY = 'recipe-search-history';

function loadHistory(): string[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]') as string[];
  } catch {
    return [];
  }
}

function saveHistory(history: string[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
}

export default function AgentSearchBar({ onSearch, onStop, isSearching }: AgentSearchBarProps) {
  const [value, setValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const handleSubmit = useCallback(() => {
    const q = value.trim();
    if (!q || isSearching) {
      return;
    }
    const newHistory = [q, ...history.filter((h) => h !== q)].slice(0, MAX_HISTORY);
    setHistory(newHistory);
    saveHistory(newHistory);
    onSearch(q);
  }, [value, history, isSearching, onSearch]);

  const handleHistoryClick = (q: string) => {
    setValue(q);
    onSearch(q);
  };

  return (
    <div className={styles.bar}>
      <div className={styles.inputRow}>
        {/* Wrap in a div to capture keyboard events Input doesn't expose */}
        {}
        <div
          className={styles.input}
          onKeyDown={(e) => {
            if (e.key === 'Escape' && isSearching) {
              onStop();
            }
          }}
        >
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onEnterPress={handleSubmit}
            placeholder='Try "chicken and rice", "quick spanish", "anti-inflammatory dinner"…'
            disabled={isSearching}
            showClearButton
            onClear={() => setValue('')}
          />
        </div>
        {isSearching ? (
          <Button variant="outline" onClick={onStop}>
            Stop
          </Button>
        ) : (
          <Button variant="primary" onClick={handleSubmit} disabled={!value.trim()}>
            Search
          </Button>
        )}
      </div>

      {history.length > 0 && !isSearching && (
        <div className={styles.history}>
          <span className={styles.historyLabel}>Recent:</span>
          {history.map((q) => (
            <button key={q} className={styles.historyChip} onClick={() => handleHistoryClick(q)}>
              {q}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
