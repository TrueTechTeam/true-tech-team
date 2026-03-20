import { mockSeasons } from './seasons';

export const mockDivisions = mockSeasons.flatMap((season, i) => {
  const divisions = [
    {
      id: `div-${season.id}-a`,
      season_id: season.id,
      name: 'Division A',
      skill_level: 1,
      max_teams: 8,
    },
  ];

  // Give roughly half the seasons a second division
  if (i % 2 === 0) {
    divisions.push({
      id: `div-${season.id}-b`,
      season_id: season.id,
      name: 'Division B',
      skill_level: 2,
      max_teams: 8,
    });
  }

  return divisions;
});
