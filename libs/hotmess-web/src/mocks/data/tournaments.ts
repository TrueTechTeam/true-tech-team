export interface Tournament {
  id: string;
  name: string;
  sport: string;
  sportSlug: string;
  location: string;
  date: string;
  status: 'upcoming' | 'registration-open' | 'in-progress' | 'completed';
  teamsRegistered: number;
  maxTeams: number;
  description: string;
}

export const tournaments: Tournament[] = [
  {
    id: 't-hm-winter-classic',
    name: 'HM Winter Classic 2026',
    sport: 'Sand Volleyball',
    sportSlug: 'sand-volleyball',
    location: 'St. Petersburg, FL',
    date: 'February 28, 2026',
    status: 'registration-open',
    teamsRegistered: 14,
    maxTeams: 24,
    description: 'The HotMess Winter Classic returns to St. Pete! Multi-sport national tournament featuring sand volleyball.',
  },
  {
    id: 't1',
    name: 'Nashville Kickball Showdown',
    sport: 'Kickball',
    sportSlug: 'kickball',
    location: 'Nashville, TN',
    date: 'March 15, 2026',
    status: 'registration-open',
    teamsRegistered: 12,
    maxTeams: 16,
    description: 'The biggest kickball tournament in Nashville! Double-elimination format.',
  },
  {
    id: 't2',
    name: 'St. Pete Beach Volleyball Classic',
    sport: 'Sand Volleyball',
    sportSlug: 'sand-volleyball',
    location: 'St. Petersburg, FL',
    date: 'April 5, 2026',
    status: 'registration-open',
    teamsRegistered: 8,
    maxTeams: 12,
    description: 'Hit the sand for a day of competitive volleyball on the beautiful St. Pete beaches.',
  },
  {
    id: 't3',
    name: 'OKC Cornhole Championship',
    sport: 'Cornhole',
    sportSlug: 'cornhole',
    location: 'Oklahoma City, OK',
    date: 'April 19, 2026',
    status: 'upcoming',
    teamsRegistered: 0,
    maxTeams: 32,
    description: 'Pairs tournament with a round-robin group stage followed by single elimination.',
  },
  {
    id: 't4',
    name: 'Birmingham Bowl-Off',
    sport: 'Bowling',
    sportSlug: 'bowling',
    location: 'Birmingham, AL',
    date: 'May 3, 2026',
    status: 'upcoming',
    teamsRegistered: 0,
    maxTeams: 20,
    description: 'Teams of 4 compete in a bracket-style bowling tournament.',
  },
  {
    id: 't5',
    name: 'Cincinnati Pickleball Open',
    sport: 'Pickleball',
    sportSlug: 'pickleball',
    location: 'Cincinnati, OH',
    date: 'January 20, 2026',
    status: 'completed',
    teamsRegistered: 24,
    maxTeams: 24,
    description: 'Doubles pickleball tournament with beginner and competitive divisions.',
  },
  {
    id: 't6',
    name: 'St. Louis Dodgeball Brawl',
    sport: 'Dodgeball',
    sportSlug: 'dodgeball',
    location: 'St. Louis, MO',
    date: 'December 8, 2025',
    status: 'completed',
    teamsRegistered: 16,
    maxTeams: 16,
    description: 'High-energy dodgeball tournament with themed team costumes encouraged.',
  },
];

export const upcomingTournaments = tournaments.filter(
  (t) => t.status === 'upcoming' || t.status === 'registration-open' || t.status === 'in-progress'
);

export const pastTournaments = tournaments.filter((t) => t.status === 'completed');
