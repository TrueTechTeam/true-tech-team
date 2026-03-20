import { mockDivisions } from './divisions';

export const mockBrackets = mockDivisions.map((division) => ({
  id: `bracket-${division.id}`,
  division_id: division.id,
  type: 'single_elimination',
  name: `${division.name} Playoffs`,
  team_count: 8,
}));
