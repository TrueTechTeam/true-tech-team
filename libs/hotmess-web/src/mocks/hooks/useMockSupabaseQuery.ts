import { mockCities } from '../data/cities';
import { mockSports } from '../data/sports';
import { mockLeagues } from '../data/leagues';
import { mockSeasons } from '../data/seasons';
import { mockDivisions } from '../data/divisions';
import { mockTeams } from '../data/teams';
import { mockTeamMembers } from '../data/team-members';
import { mockGames } from '../data/games';
import { mockBrackets } from '../data/brackets';

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
  return mockResult(
    mockCities as unknown as Array<{
      id: string;
      name: string;
      state: string;
      is_active: boolean;
      slug: string;
    }>
  );
}

export function useMockSports() {
  return mockResult(
    mockSports as unknown as Array<{
      id: string;
      name: string;
      description: string;
      config: Record<string, unknown>;
      is_active: boolean;
    }>
  );
}

export function useMockLeagues(cityId?: string) {
  const filtered = cityId ? mockLeagues.filter((l) => l.city_id === cityId) : [...mockLeagues];
  return mockResult(filtered);
}

export function useMockSeasons(leagueId?: string) {
  const filtered = leagueId
    ? mockSeasons.filter((s) => s.league_id === leagueId)
    : [...mockSeasons];
  return mockResult(filtered);
}

export function useMockTeams(divisionId?: string) {
  const filtered = divisionId
    ? mockTeams.filter((t) => t.division_id === divisionId)
    : [...mockTeams];
  return mockResult(filtered);
}

export function useMockUpcomingGames() {
  return mockResult(mockGames.slice(0, 10));
}

export function useMockUpcomingLeagues() {
  const upcoming = mockSeasons.filter((s) => s.status === 'registration' || s.status === 'draft');
  return mockResult(upcoming.slice(0, 6));
}

export function useMockCity(cityId?: string) {
  const city = cityId ? (mockCities.find((c) => c.id === cityId) ?? null) : null;
  return mockResult(city);
}

export function useMockLeague(leagueId?: string) {
  const league = leagueId ? (mockLeagues.find((l) => l.id === leagueId) ?? null) : null;
  if (!league) {
    return mockResult(null);
  }
  // Enrich cities with id for breadcrumb links
  const city = mockCities.find((c) => c.id === league.city_id);
  const sport = mockSports.find((s) => s.id === league.sport_id);
  return mockResult({
    ...league,
    cities: {
      id: city?.id ?? league.city_id,
      name: league.cities.name,
      state: league.cities.state,
    },
    sports: { id: sport?.id ?? league.sport_id, name: league.sports.name },
  });
}

export function useMockSeason(seasonId?: string) {
  const season = seasonId ? (mockSeasons.find((s) => s.id === seasonId) ?? null) : null;
  if (!season) {
    return mockResult(null);
  }
  // Enrich leagues with id, city_id, sport_id for breadcrumb resolution
  const league = mockLeagues.find((l) => l.id === season.league_id);
  const sport = league ? mockSports.find((s) => s.id === league.sport_id) : null;
  return mockResult({
    ...season,
    leagues: league
      ? {
          id: league.id,
          name: league.name,
          city_id: league.city_id,
          sport_id: league.sport_id,
          cities: league.cities,
          sports: { ...league.sports, config: sport?.config ?? {} },
        }
      : season.leagues,
  });
}

export function useMockTeam(teamId?: string) {
  const team = teamId ? (mockTeams.find((t) => t.id === teamId) ?? null) : null;
  if (!team) {
    return mockResult(null);
  }

  const division = mockDivisions.find((d) => d.id === team.division_id);
  const season = division ? mockSeasons.find((s) => s.id === division.season_id) : null;
  const league = season ? mockLeagues.find((l) => l.id === season.league_id) : null;

  return mockResult({
    ...team,
    divisions: division
      ? {
          ...division,
          seasons: season
            ? {
                ...season,
                leagues: league ?? null,
              }
            : null,
        }
      : null,
  });
}

export function useMockDivisions(seasonId?: string) {
  const filtered = seasonId
    ? mockDivisions.filter((d) => d.season_id === seasonId)
    : [...mockDivisions];
  return mockResult(filtered);
}

export function useMockTeamMembers(teamId?: string) {
  const filtered = teamId
    ? mockTeamMembers.filter((m) => m.team_id === teamId)
    : [...mockTeamMembers];
  return mockResult(filtered);
}

export function useMockAllTeamsEnriched() {
  const enriched = mockTeams.map((team) => {
    const division = mockDivisions.find((d) => d.id === team.division_id);
    const season = division ? mockSeasons.find((s) => s.id === division.season_id) : null;
    const league = season ? mockLeagues.find((l) => l.id === season.league_id) : null;

    return {
      ...team,
      divisions: division
        ? {
            id: division.id,
            name: division.name,
            season_id: division.season_id,
            seasons: season
              ? {
                  id: season.id,
                  name: season.name,
                  status: season.status,
                  season_start_date: season.season_start_date,
                  season_end_date: season.season_end_date,
                  league_id: season.league_id,
                  leagues: league
                    ? {
                        id: league.id,
                        name: league.name,
                        city_id: league.city_id,
                        sport_id: league.sport_id,
                        cities: { id: league.city_id, name: league.cities.name },
                        sports: { id: league.sport_id, name: league.sports.name },
                      }
                    : null,
                }
              : null,
          }
        : null,
    };
  });
  return mockResult(enriched);
}

export function useMockAllBrackets() {
  const enriched = mockBrackets.map((bracket) => {
    const division = mockDivisions.find((d) => d.id === bracket.division_id);
    const season = division ? mockSeasons.find((s) => s.id === division.season_id) : null;
    const league = season ? mockLeagues.find((l) => l.id === season.league_id) : null;

    return {
      ...bracket,
      divisions: division
        ? {
            id: division.id,
            name: division.name,
            season_id: division.season_id,
            seasons: season
              ? {
                  id: season.id,
                  name: season.name,
                  status: season.status,
                  league_id: season.league_id,
                  leagues: league
                    ? {
                        id: league.id,
                        name: league.name,
                        city_id: league.city_id,
                        cities: { id: league.city_id, name: league.cities.name },
                      }
                    : null,
                }
              : null,
          }
        : null,
    };
  });
  return mockResult(enriched);
}

export function useMockBracket(bracketId?: string) {
  const bracket = bracketId ? (mockBrackets.find((b) => b.id === bracketId) ?? null) : null;
  if (!bracket) {
    return mockResult(null);
  }

  const division = mockDivisions.find((d) => d.id === bracket.division_id);
  const season = division ? mockSeasons.find((s) => s.id === division.season_id) : null;
  const league = season ? mockLeagues.find((l) => l.id === season.league_id) : null;

  return mockResult({
    ...bracket,
    divisions: division
      ? {
          id: division.id,
          name: division.name,
          season_id: division.season_id,
          seasons: season
            ? {
                id: season.id,
                name: season.name,
                league_id: season.league_id,
                leagues: league
                  ? {
                      id: league.id,
                      name: league.name,
                      city_id: league.city_id,
                    }
                  : null,
              }
            : null,
        }
      : null,
  });
}

export function useMockSeasonBrackets(seasonId?: string) {
  if (!seasonId) {
    return mockResult([]);
  }
  const seasonDivisions = mockDivisions.filter((d) => d.season_id === seasonId);
  const brackets = mockBrackets.filter((b) => seasonDivisions.some((d) => d.id === b.division_id));
  const enriched = brackets.map((bracket) => {
    const division = mockDivisions.find((d) => d.id === bracket.division_id);
    return {
      ...bracket,
      divisions: division
        ? { id: division.id, name: division.name, season_id: division.season_id }
        : null,
    };
  });
  return mockResult(enriched);
}
