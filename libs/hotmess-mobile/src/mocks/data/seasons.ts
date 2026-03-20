import { mockLeagues } from './leagues';
import { mockVenues } from './venues';

const SEASON_CONFIGS = [
  {
    suffix: 'Fall 2025',
    status: 'completed',
    regStart: '2025-08-01',
    regEnd: '2025-09-01',
    start: '2025-09-15',
    end: '2025-11-30',
  },
  {
    suffix: 'Spring 2026',
    status: 'active',
    regStart: '2026-01-01',
    regEnd: '2026-02-01',
    start: '2026-02-15',
    end: '2026-05-31',
  },
  {
    suffix: 'Summer 2026',
    status: 'registration',
    regStart: '2026-05-01',
    regEnd: '2026-06-01',
    start: '2026-06-15',
    end: '2026-08-31',
  },
  {
    suffix: 'Fall 2026',
    status: 'draft',
    regStart: '2026-08-01',
    regEnd: '2026-09-01',
    start: '2026-09-15',
    end: '2026-11-30',
  },
];

const POPULAR_LEAGUE_PREFIXES = [
  'league-nashville-kickball',
  'league-nashville-dodgeball',
  'league-nashville-bowling',
  'league-st-pete-pickleball',
  'league-st-pete-sand-volleyball',
  'league-st-louis-dodgeball',
  'league-st-louis-flag-football',
  'league-okc-bowling',
  'league-okc-basketball',
  'league-birmingham-indoor-volleyball',
  'league-birmingham-cornhole',
  'league-sarasota-sand-volleyball',
  'league-sarasota-pickleball',
  'league-cincinnati-cornhole',
  'league-cincinnati-kickball',
  'league-miami-kickball',
  'league-louisville-bowling',
  'league-charleston-sand-volleyball',
  'league-knoxville-dodgeball',
  'league-tulsa-cornhole',
  'league-colorado-springs-flag-football',
];

const LEAGUE_VENUE_MAP: Record<string, string> = {
  'league-nashville-kickball': 'venue-001',
  'league-nashville-dodgeball': 'venue-002',
  'league-nashville-bowling': 'venue-002',
  'league-st-pete-pickleball': 'venue-003',
  'league-st-pete-sand-volleyball': 'venue-004',
  'league-st-louis-dodgeball': 'venue-005',
  'league-st-louis-flag-football': 'venue-005',
  'league-okc-bowling': 'venue-007',
  'league-okc-basketball': 'venue-008',
  'league-birmingham-indoor-volleyball': 'venue-010',
  'league-birmingham-cornhole': 'venue-009',
  'league-sarasota-sand-volleyball': 'venue-012',
  'league-sarasota-pickleball': 'venue-011',
  'league-cincinnati-cornhole': 'venue-013',
  'league-cincinnati-kickball': 'venue-014',
  'league-miami-kickball': 'venue-031',
  'league-louisville-bowling': 'venue-030',
  'league-charleston-sand-volleyball': 'venue-017',
  'league-knoxville-dodgeball': 'venue-024',
  'league-tulsa-cornhole': 'venue-035',
  'league-colorado-springs-flag-football': 'venue-019',
};

const venueMap = new Map(mockVenues.map((v) => [v.id, v]));

let seasonIdx = 0;

export const mockSeasons = POPULAR_LEAGUE_PREFIXES.flatMap((leagueId) => {
  const league = mockLeagues.find((l) => l.id === leagueId);
  if (!league) {
    return [];
  }

  const venueId = LEAGUE_VENUE_MAP[leagueId];
  const venue = venueId ? venueMap.get(venueId) : undefined;

  return SEASON_CONFIGS.map((cfg) => {
    seasonIdx++;
    return {
      id: `season-${String(seasonIdx).padStart(3, '0')}`,
      name: `${league.name} - ${cfg.suffix}`,
      status: cfg.status,
      registration_start_date: cfg.regStart,
      registration_end_date: cfg.regEnd,
      season_start_date: cfg.start,
      season_end_date: cfg.end,
      league_id: league.id,
      venue_id: venueId ?? null,
      schedule_config: {
        gameDays: [6],
        firstGameTime: '09:00',
        timeSlots: [],
        totalWeeks: 8,
        blackoutDates: [],
        tournamentDate: cfg.end,
        makeupDates: [],
        minTimeBetweenGames: 1.5,
        maxGamesPerDay: 3,
      },
      leagues: {
        name: league.name,
        cities: league.cities,
        sports: league.sports,
      },
      venues: venue
        ? { id: venue.id, name: venue.name, address: venue.address, play_areas: venue.play_areas }
        : null,
    };
  });
});
