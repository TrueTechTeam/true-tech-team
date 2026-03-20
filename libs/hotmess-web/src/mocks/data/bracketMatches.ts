import type { BracketMatch } from '../../hooks/useBracketMatches';

/**
 * Mutable in-memory store for mock bracket matches.
 * Populated when "Generate Brackets" is clicked in mock mode.
 */
let store: BracketMatch[] = [];
let nextId = 1;

export function getMockBracketMatches(bracketId?: string): BracketMatch[] {
  if (!bracketId) { return []; }
  return store.filter((m) => m.bracket_id === bracketId);
}

export function getAllMockBracketMatches(): BracketMatch[] {
  return [...store];
}

export function getMockBracketMatchesByIds(bracketIds: string[]): BracketMatch[] {
  const idSet = new Set(bracketIds);
  return store.filter((m) => idSet.has(m.bracket_id));
}

export function addMockBracketMatches(matches: BracketMatch[]): void {
  store.push(...matches);
}

export function updateMockBracketMatch(matchId: string, updates: Partial<BracketMatch>): void {
  const idx = store.findIndex((m) => m.id === matchId);
  if (idx >= 0) {
    store[idx] = { ...store[idx], ...updates };
  }
}

export function generateMockId(): string {
  return `mock-match-${String(nextId++).padStart(4, '0')}`;
}

export function clearMockBracketMatches(): void {
  store = [];
  nextId = 1;
}
