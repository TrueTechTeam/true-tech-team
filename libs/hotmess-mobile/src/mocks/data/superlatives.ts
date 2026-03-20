import { mockTeamMembers } from './team-members';
import { mockTeams } from './teams';

export interface MockSuperlativeCategory {
  id: string;
  seasonId: string;
  name: string;
  description: string;
  eligibility: {
    rookiesOnly?: boolean;
    minGamesPlayed?: number;
    allowedRoles?: string[];
  };
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface MockSuperlativeNomination {
  id: string;
  categoryId: string;
  nomineeId: string;
  nominatedById: string;
  teamId: string;
  nomineeName: string;
  nomineeTeamName: string;
  createdAt: string;
  updatedAt: string;
}

export interface MockSuperlativeVote {
  id: string;
  nominationId: string;
  voterId: string;
  createdAt: string;
  updatedAt: string;
}

const CATEGORY_DEFINITIONS = [
  { name: 'MVP', description: 'Most Valuable Player of the season', eligibility: { minGamesPlayed: 3 } },
  { name: 'Best Dressed', description: 'Always looking fly on game day', eligibility: {} },
  { name: 'Most Spirited', description: 'Brings the energy every single game', eligibility: {} },
  { name: 'Best Teammate', description: 'Always has your back', eligibility: {} },
  { name: 'Most Improved', description: 'Biggest glow-up this season', eligibility: {} },
  { name: 'Party MVP', description: 'Life of the after-party', eligibility: {} },
  { name: 'Rookie of the Season', description: 'Best first-season player', eligibility: { rookiesOnly: true } },
  { name: 'Best Team Name', description: 'The most creative team name', eligibility: {} },
];

// Generate categories for a couple of seasons
const TARGET_SEASON_IDS = ['season-001', 'season-002'];

let catIdx = 0;

export const mockSuperlativeCategories: MockSuperlativeCategory[] = TARGET_SEASON_IDS.flatMap(
  (seasonId) =>
    CATEGORY_DEFINITIONS.map((def, order) => {
      catIdx++;
      return {
        id: `superlative-cat-${String(catIdx).padStart(3, '0')}`,
        seasonId,
        name: def.name,
        description: def.description,
        eligibility: def.eligibility,
        displayOrder: order + 1,
        createdAt: '2025-10-01T00:00:00Z',
        updatedAt: '2025-10-01T00:00:00Z',
      };
    })
);

// Build nominations from real team members (first 50 teams are populated)
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

let nomIdx = 0;

export const mockSuperlativeNominations: MockSuperlativeNomination[] =
  mockSuperlativeCategories.flatMap((category) => {
    // Pick 3 nominees per category from different teams
    const nomineesPerCategory = 3;
    const nominations: MockSuperlativeNomination[] = [];

    for (let i = 0; i < nomineesPerCategory; i++) {
      nomIdx++;
      const seed = nomIdx * 37 + category.displayOrder;
      const memberIndex = Math.floor(seededRandom(seed) * Math.min(mockTeamMembers.length, 200));
      const member = mockTeamMembers[memberIndex];
      if (!member) continue;

      const team = mockTeams.find((t) => t.id === member.team_id);

      // Skip if rookie-only and not a rookie
      if (category.eligibility.rookiesOnly && !member.is_rookie) continue;

      // Find the captain of that team (nominatedBy)
      const captain = mockTeamMembers.find(
        (m) => m.team_id === member.team_id && m.role === 'team_captain'
      );

      nominations.push({
        id: `superlative-nom-${String(nomIdx).padStart(3, '0')}`,
        categoryId: category.id,
        nomineeId: member.user_id,
        nominatedById: captain?.user_id ?? member.user_id,
        teamId: member.team_id ?? '',
        nomineeName: `${member.first_name} ${member.last_name}`,
        nomineeTeamName: team?.name ?? 'Unknown Team',
        createdAt: '2025-10-15T00:00:00Z',
        updatedAt: '2025-10-15T00:00:00Z',
      });
    }

    return nominations;
  });

// Generate some votes for nominations
let voteIdx = 0;

export const mockSuperlativeVotes: MockSuperlativeVote[] =
  mockSuperlativeNominations.flatMap((nomination) => {
    // Each nomination gets 2-8 random votes
    const seed = voteIdx + 1;
    const voteCount = 2 + Math.floor(seededRandom(seed * 41) * 7);
    const votes: MockSuperlativeVote[] = [];

    for (let v = 0; v < voteCount; v++) {
      voteIdx++;
      const voterSeed = voteIdx * 53;
      const voterIndex = Math.floor(seededRandom(voterSeed) * Math.min(mockTeamMembers.length, 200));
      const voter = mockTeamMembers[voterIndex];
      if (!voter) continue;

      votes.push({
        id: `superlative-vote-${String(voteIdx).padStart(4, '0')}`,
        nominationId: nomination.id,
        voterId: voter.user_id,
        createdAt: '2025-11-01T00:00:00Z',
        updatedAt: '2025-11-01T00:00:00Z',
      });
    }

    return votes;
  });
