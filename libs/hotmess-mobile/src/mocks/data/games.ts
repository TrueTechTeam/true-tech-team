import { mockTeams } from './teams';
import { mockVenues } from './venues';
import { mockDivisions } from './divisions';

function futureDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(
    18 + Math.floor(seededRandom(daysFromNow * 7) * 3),
    seededRandom(daysFromNow * 11) > 0.5 ? 0 : 30,
    0,
    0
  );
  return d.toISOString();
}

function pastDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(
    18 + Math.floor(seededRandom(daysAgo * 7) * 3),
    seededRandom(daysAgo * 11) > 0.5 ? 0 : 30,
    0,
    0
  );
  return d.toISOString();
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const teamsByDivision = new Map<string, typeof mockTeams>();
for (const team of mockTeams) {
  const existing = teamsByDivision.get(team.division_id) || [];
  existing.push(team);
  teamsByDivision.set(team.division_id, existing);
}

const scheduledGames = Array.from({ length: 30 }, (_, i) => {
  const divisionsWithTeams = mockDivisions.filter((d) => {
    const teams = teamsByDivision.get(d.id);
    return teams && teams.length >= 2;
  });
  const divIndex = i % divisionsWithTeams.length;
  const division = divisionsWithTeams[divIndex];
  const divTeams = teamsByDivision.get(division.id) ?? [];

  const homeIdx = i % divTeams.length;
  let awayIdx = (i + 1) % divTeams.length;
  if (awayIdx === homeIdx) {
    awayIdx = (homeIdx + 2) % divTeams.length;
  }

  const venueIdx = i % mockVenues.length;

  return {
    id: `game-${String(i + 1).padStart(3, '0')}`,
    scheduled_at: futureDate(7 + i * 2),
    status: 'scheduled' as const,
    home_team: { id: divTeams[homeIdx].id, name: divTeams[homeIdx].name },
    away_team: { id: divTeams[awayIdx].id, name: divTeams[awayIdx].name },
    home_team_id: divTeams[homeIdx].id,
    away_team_id: divTeams[awayIdx].id,
    venue: {
      name: mockVenues[venueIdx].name,
      address: mockVenues[venueIdx].address as string | undefined,
    },
    play_area: mockVenues[venueIdx].play_areas[0],
    division_id: division.id,
    home_score: null as number | null,
    away_score: null as number | null,
    referee_id: null as string | null,
  };
});

const completedGames = Array.from({ length: 15 }, (_, i) => {
  const divisionsWithTeams = mockDivisions.filter((d) => {
    const teams = teamsByDivision.get(d.id);
    return teams && teams.length >= 2;
  });
  const divIndex = (i + 5) % divisionsWithTeams.length;
  const division = divisionsWithTeams[divIndex];
  const divTeams = teamsByDivision.get(division.id) ?? [];

  const homeIdx = (i * 2) % divTeams.length;
  let awayIdx = (i * 2 + 1) % divTeams.length;
  if (awayIdx === homeIdx) {
    awayIdx = (homeIdx + 2) % divTeams.length;
  }

  const venueIdx = (i + 3) % mockVenues.length;
  const seed = i + 100;
  const homeScore = Math.floor(seededRandom(seed * 7) * 15) + 1;
  const awayScore = Math.floor(seededRandom(seed * 13) * 15) + 1;

  return {
    id: `game-${String(i + 31).padStart(3, '0')}`,
    scheduled_at: pastDate(3 + i * 3),
    status: 'completed' as const,
    home_team: { id: divTeams[homeIdx].id, name: divTeams[homeIdx].name },
    away_team: { id: divTeams[awayIdx].id, name: divTeams[awayIdx].name },
    home_team_id: divTeams[homeIdx].id,
    away_team_id: divTeams[awayIdx].id,
    venue: {
      name: mockVenues[venueIdx].name,
      address: mockVenues[venueIdx].address as string | undefined,
    },
    play_area: mockVenues[venueIdx].play_areas[0],
    division_id: division.id,
    home_score: homeScore,
    away_score: awayScore,
    referee_id: null as string | null,
  };
});

// Assign referee to some games for mock referee features
scheduledGames.slice(0, 10).forEach((game) => {
  game.referee_id = 'mock-referee-001';
});
completedGames.slice(0, 5).forEach((game) => {
  game.referee_id = 'mock-referee-001';
});

export const mockGames = [...completedGames, ...scheduledGames];
