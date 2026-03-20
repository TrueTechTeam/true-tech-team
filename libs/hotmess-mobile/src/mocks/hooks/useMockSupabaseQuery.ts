import { mockCities, mockSports, mockLeagues, mockSeasons, mockDivisions, mockTeams, mockTeamMembers, mockGames, mockVenues, mockThreads, mockMessages, mockSuperlativeCategories, mockSuperlativeNominations, mockSuperlativeVotes } from '../data';

interface QueryResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const noop = async () => {};

function mockResult<T>(data: T): QueryResult<T> {
  return { data, loading: false, error: null, refetch: noop };
}

export function useMockCities() {
  return mockResult([...mockCities]);
}

export function useMockSports() {
  return mockResult([...mockSports]);
}

export function useMockLeagues() {
  return mockResult([...mockLeagues]);
}

export function useMockLeaguesByCity(cityId?: string) {
  const filtered = cityId ? mockLeagues.filter((l) => l.city_id === cityId) : [...mockLeagues];
  return mockResult(filtered);
}

export function useMockSeasons() {
  return mockResult([...mockSeasons]);
}

export function useMockActiveSeasons() {
  const filtered = mockSeasons.filter((s) => s.status === 'registration' || s.status === 'active');
  return mockResult(filtered);
}

export function useMockTeams() {
  return mockResult([...mockTeams]);
}

export function useMockVenues() {
  return mockResult([...mockVenues]);
}

export function useMockMyTeams(userId?: string) {
  if (!userId) {return mockResult([]);}

  // For mock users, return specific team assignments
  const userTeamIds = getUserTeamIds(userId);
  const memberships = mockTeamMembers.filter(
    (m) => userTeamIds.includes(m.team_id ?? '') || m.user_id === userId
  );

  const enriched = memberships.map((m) => {
    const team = mockTeams.find((t) => t.id === m.team_id);
    const division = team ? mockDivisions.find((d) => d.id === team.division_id) : null;
    const season = division ? mockSeasons.find((s) => s.id === division.season_id) : null;
    const league = season ? mockLeagues.find((l) => l.id === season.league_id) : null;

    return {
      ...m,
      teams: team ? {
        id: team.id,
        name: team.name,
        divisions: division ? {
          id: division.id,
          name: division.name,
          seasons: season ? {
            id: season.id,
            name: season.name,
            status: season.status,
            leagues: league ? {
              name: league.name,
              sports: { name: league.sports.name },
              cities: { name: league.cities.name },
            } : undefined,
          } : undefined,
        } : undefined,
      } : undefined,
    };
  });

  return mockResult(enriched);
}

function getUserTeamIds(userId: string): string[] {
  // Map mock user IDs to teams for the dual-hook pattern
  // team-010 to team-015 are in active season (season-002)
  // team-016 to team-019 are in registration season (season-003)
  // team-001 to team-004 are in completed season (season-001)
  switch (userId) {
    case 'mock-captain-001': return ['team-010', 'team-011', 'team-001'];
    case 'mock-player-001': return ['team-010', 'team-012', 'team-016'];
    case 'mock-admin-001': return [];
    case 'mock-commissioner-001': return [];
    case 'mock-manager-001': return [];
    case 'mock-referee-001': return [];
    default: return [];
  }
}

export function useMockUpcomingGames(userId?: string) {
  if (!userId) {return mockResult([]);}

  const userTeamIds = getUserTeamIds(userId);
  const now = new Date().toISOString();

  // For referees, also include games they're assigned to
  const isReferee = userId === 'mock-referee-001';

  const upcoming = mockGames.filter((g) => {
    if (g.scheduled_at < now) {return false;}
    if (isReferee && g.referee_id === userId) {return true;}
    return userTeamIds.includes(g.home_team.id) || userTeamIds.includes(g.away_team.id);
  });

  return mockResult(upcoming);
}

export function useMockRefereeGames(userId?: string) {
  if (!userId) {return mockResult([]);}

  const games = mockGames.filter((g) => g.referee_id === userId);
  return mockResult(games);
}

export function useMockPendingJoinRequests(_teamIds: string[]) {
  // Mock pending requests for captain features
  return mockResult([
    { id: 'request-001', user_id: 'user-fa-001', first_name: 'Olivia', last_name: 'Chen', team_id: 'team-010', status: 'requested' },
    { id: 'request-002', user_id: 'user-fa-002', first_name: 'Liam', last_name: 'Patel', team_id: 'team-010', status: 'requested' },
  ]);
}

export function useMockMessageThreads(userId?: string) {
  if (!userId) {return mockResult([]);}

  // Filter threads based on mock user role
  const filtered = mockThreads.filter((t) => {
    // Everyone sees DMs and announcements
    if (t.type === 'direct' || t.type === 'announcement') return true;
    // Team chats: visible to players and captains
    if (t.type === 'team') {
      return ['mock-captain-001', 'mock-player-001'].includes(userId);
    }
    // Captain chats: visible to captains and managers
    if (t.type === 'captain') {
      return ['mock-captain-001', 'mock-manager-001', 'mock-admin-001', 'mock-commissioner-001'].includes(userId);
    }
    // Referee chats: visible to refs and managers
    if (t.type === 'referee') {
      return ['mock-referee-001', 'mock-manager-001', 'mock-admin-001', 'mock-commissioner-001'].includes(userId);
    }
    return true;
  });

  return mockResult(filtered);
}

export function useMockThreadMessages(threadId?: string) {
  if (!threadId) {return mockResult([]);}
  const messages = mockMessages[threadId] ?? [];
  return mockResult(messages);
}

export function useMockTeamMembers(teamId?: string) {
  if (!teamId) {return mockResult([]);}
  const filtered = mockTeamMembers.filter((m) => m.team_id === teamId);
  return mockResult(filtered);
}

export function useMockDivisions(seasonId?: string) {
  const filtered = seasonId
    ? mockDivisions.filter((d) => d.season_id === seasonId)
    : [...mockDivisions];
  return mockResult(filtered);
}

export function useMockSuperlativeCategories(seasonId?: string) {
  const filtered = seasonId
    ? mockSuperlativeCategories.filter((c) => c.seasonId === seasonId)
    : [...mockSuperlativeCategories];
  return mockResult(filtered);
}

export function useMockSuperlativeNominations(categoryId?: string) {
  const filtered = categoryId
    ? mockSuperlativeNominations.filter((n) => n.categoryId === categoryId)
    : [...mockSuperlativeNominations];
  return mockResult(filtered);
}

export function useMockSuperlativeVotes(nominationId?: string) {
  const filtered = nominationId
    ? mockSuperlativeVotes.filter((v) => v.nominationId === nominationId)
    : [...mockSuperlativeVotes];
  return mockResult(filtered);
}

export function useMockSuperlativeResults(seasonId?: string) {
  const categories = seasonId
    ? mockSuperlativeCategories.filter((c) => c.seasonId === seasonId)
    : [...mockSuperlativeCategories];

  const results = categories.map((category) => {
    const nominations = mockSuperlativeNominations.filter(
      (n) => n.categoryId === category.id
    );

    const nominationsWithVotes = nominations.map((nom) => {
      const voteCount = mockSuperlativeVotes.filter(
        (v) => v.nominationId === nom.id
      ).length;
      return { ...nom, voteCount };
    });

    nominationsWithVotes.sort((a, b) => b.voteCount - a.voteCount);

    return {
      category,
      nominations: nominationsWithVotes,
      winner: nominationsWithVotes[0] ?? null,
    };
  });

  return mockResult(results);
}
