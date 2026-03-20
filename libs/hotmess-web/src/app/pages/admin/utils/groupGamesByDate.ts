interface GameLike {
  scheduled_at: string;
  venue: { name: string };
  [key: string]: unknown;
}

export interface DateGroup<T extends GameLike> {
  dateLabel: string;
  games: T[];
}

/**
 * Groups games by date and sorts within each group by time, then venue name.
 */
export function groupGamesByDate<T extends GameLike>(games: T[]): Array<DateGroup<T>> {
  // Sort all games by date, then time, then venue
  const sorted = [...games].sort((a, b) => {
    const dateA = new Date(a.scheduled_at);
    const dateB = new Date(b.scheduled_at);
    const diff = dateA.getTime() - dateB.getTime();
    if (diff !== 0) {return diff;}
    return a.venue.name.localeCompare(b.venue.name);
  });

  const groups = new Map<string, T[]>();

  for (const game of sorted) {
    const dateKey = new Date(game.scheduled_at).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    const existing = groups.get(dateKey);
    if (existing) {
      existing.push(game);
    } else {
      groups.set(dateKey, [game]);
    }
  }

  return Array.from(groups.entries()).map(([dateLabel, games]) => ({
    dateLabel,
    games,
  }));
}
