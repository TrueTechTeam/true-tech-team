import { mockDivisions } from './divisions';

const TEAM_NAMES = [
  'Ball Busters', 'Kick Tease', 'Sets on the Beach', 'Net Gains', 'The Underdodges',
  'Pitch Please', 'Rumble in the Jungle', 'The Replacements', 'Balls of Fury', 'Inglorious Batters',
  'One Hit Wonders', 'Gutter Done', 'Pin Pals', 'The Alley Cats', 'Turkey Lurkeys',
  'Spiked Punch', 'Block Party', 'Ace Holes', 'Dink Dynasty', 'Kitchen Nightmares',
  'Off the Wall', 'Bag Daddies', 'Corn Stars', 'Toss Bosses', 'Board Certified',
  'Swish Kebabs', 'Air Balls', 'Hoop Dreams', 'Fast Break Fever', 'Nothing But Net',
  'Flag Yeah', 'Touchdown Syndrome', 'Rush Hour', 'Blitz Kids', 'End Zone Dancers',
  'Smash Bros', 'Love Means Nothing', 'Court Jesters', 'Volley Llamas', 'Grass Stains',
  'Game of Throws', 'No Hit Sherlock', 'Cereal Killers', 'Mean Muggers', 'The Comebacks',
  'Victorious Secret', 'Multiple Scoregasms', 'The Benchwarmers', 'Last Pick All Stars', 'Average Joes',
];

const SHIRT_COLORS = [
  'Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple', 'Black', 'White',
  'Pink', 'Teal', 'Navy', 'Maroon', 'Lime', 'Coral', 'Slate', 'Gold',
];

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

let teamIdx = 0;

export const mockTeams = mockDivisions.flatMap((division, divIdx) => {
  const teamCount = 4 + (divIdx % 3);

  return Array.from({ length: teamCount }, (_, _teamInDiv) => {
    const nameIdx = teamIdx % TEAM_NAMES.length;
    const colorIdx = teamIdx % SHIRT_COLORS.length;
    const seed = teamIdx + 1;

    const wins = Math.floor(seededRandom(seed * 7) * 10);
    const losses = Math.floor(seededRandom(seed * 13) * 8);
    const ties = Math.floor(seededRandom(seed * 19) * 3);
    const pointsFor = wins * Math.floor(seededRandom(seed * 23) * 15 + 5) + ties * Math.floor(seededRandom(seed * 29) * 5 + 1);
    const pointsAgainst = losses * Math.floor(seededRandom(seed * 31) * 15 + 5) + ties * Math.floor(seededRandom(seed * 37) * 5 + 1);

    const wantsFreeAgents = seededRandom(seed * 41) < 0.35;
    const freeAgentsRequested = wantsFreeAgents ? Math.floor(seededRandom(seed * 43) * 3) + 1 : 0;

    const team = {
      id: `team-${String(teamIdx + 1).padStart(3, '0')}`,
      name: TEAM_NAMES[nameIdx],
      shirt_color: SHIRT_COLORS[colorIdx],
      status: 'confirmed' as 'confirmed' | 'pending',
      wins,
      losses,
      ties,
      points_for: pointsFor,
      points_against: pointsAgainst,
      division_id: division.id,
      free_agents_requested: freeAgentsRequested,
    };

    teamIdx++;
    return team;
  });
});
