import { mockTeams } from './teams';
import { mockDivisions } from './divisions';

const FIRST_NAMES = [
  'James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda',
  'David', 'Elizabeth', 'William', 'Barbara', 'Tyler', 'Susan', 'Chris', 'Jessica',
  'Daniel', 'Sarah', 'Matthew', 'Karen', 'Anthony', 'Lisa', 'Mark', 'Nancy',
  'Steven', 'Betty', 'Andrew', 'Margaret', 'Joshua', 'Sandra', 'Kevin', 'Ashley',
  'Brian', 'Kimberly', 'Ryan', 'Emily', 'Jake', 'Donna', 'Brandon', 'Michelle',
  'Justin', 'Carol', 'Nathan', 'Amanda', 'Zach', 'Melissa', 'Cody', 'Deborah',
  'Dylan', 'Stephanie', 'Trevor', 'Rebecca', 'Kyle', 'Sharon', 'Sean', 'Laura',
  'Aaron', 'Cynthia', 'Adam', 'Kathleen', 'Derek', 'Amy', 'Eric', 'Angela',
  'Luke', 'Heather', 'Jordan', 'Anna', 'Chase', 'Brenda', 'Alex', 'Rachel',
  'Caleb', 'Samantha', 'Hunter', 'Megan', 'Austin', 'Andrea', 'Ethan', 'Nicole',
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
  'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
  'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
  'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
  'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker',
  'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris', 'Morales', 'Murphy',
];

// Deterministic pseudo-random using a seed
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export interface MockTeamMember {
  id: string;
  team_id: string | null;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'player' | 'team_captain';
  status: 'active';
  is_rookie: boolean;
  season_id?: string;
}

let memberIdx = 0;

// Generate team members for a subset of teams (first 50 teams to keep data manageable)
const teamsToPopulate = mockTeams.slice(0, 50);

export const mockTeamMembers: MockTeamMember[] = teamsToPopulate.flatMap((team, teamIndex) => {
  // 5-10 members per team
  const memberCount = 5 + Math.floor(seededRandom((teamIndex + 1) * 53) * 6);

  return Array.from({ length: memberCount }, (_, memberInTeam) => {
    const seed = memberIdx + 1;
    const firstIdx = Math.floor(seededRandom(seed * 7) * FIRST_NAMES.length);
    const lastIdx = Math.floor(seededRandom(seed * 11) * LAST_NAMES.length);
    const firstName = FIRST_NAMES[firstIdx];
    const lastName = LAST_NAMES[lastIdx];
    const isCaptain = memberInTeam === 0;
    const isRookie = seededRandom(seed * 17) < 0.25;

    const member: MockTeamMember = {
      id: `member-${String(memberIdx + 1).padStart(4, '0')}`,
      team_id: team.id,
      user_id: `user-${String(memberIdx + 1).padStart(4, '0')}`,
      first_name: firstName,
      last_name: lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${seed}@example.com`,
      role: isCaptain ? 'team_captain' : 'player',
      status: 'active',
      is_rookie: isRookie,
    };

    memberIdx++;
    return member;
  });
});

// Generate free agents (not on any team, registered for specific seasons)
const FREE_AGENT_FIRST_NAMES = [
  'Olivia', 'Liam', 'Emma', 'Noah', 'Ava', 'Elijah', 'Sophia', 'Lucas',
  'Isabella', 'Mason', 'Mia', 'Logan', 'Charlotte', 'Aiden', 'Amelia', 'Jackson',
  'Harper', 'Sebastian', 'Evelyn', 'Mateo', 'Luna', 'Owen', 'Camila', 'Wyatt',
  'Gianna',
];

const FREE_AGENT_LAST_NAMES = [
  'Chen', 'Patel', 'Kim', 'Okafor', 'Ivanov', 'Silva', 'Nakamura', 'Mueller',
  'Kowalski', 'Johansson', 'O\'Brien', 'Dubois', 'Rossi', 'Santos', 'Tanaka',
  'Gupta', 'Petrov', 'Fischer', 'Larsson', 'Costa',
];

// Pick a selection of seasons for free agents to register under
const seasonIdsForFreeAgents = mockDivisions
  .filter((_, i) => i % 5 === 0)
  .map((div) => div.season_id);

// Ensure we have at least a few season IDs
const freeAgentSeasonIds = seasonIdsForFreeAgents.length > 0
  ? seasonIdsForFreeAgents
  : ['season-001', 'season-002', 'season-003'];

export const mockFreeAgents: MockTeamMember[] = Array.from({ length: 20 }, (_, i) => {
  const seed = i + 1000;
  const firstIdx = i % FREE_AGENT_FIRST_NAMES.length;
  const lastIdx = i % FREE_AGENT_LAST_NAMES.length;
  const firstName = FREE_AGENT_FIRST_NAMES[firstIdx];
  const lastName = FREE_AGENT_LAST_NAMES[lastIdx];
  const isRookie = seededRandom(seed * 17) < 0.4;
  const seasonId = freeAgentSeasonIds[i % freeAgentSeasonIds.length];

  return {
    id: `free-agent-${String(i + 1).padStart(3, '0')}`,
    team_id: null,
    user_id: `user-fa-${String(i + 1).padStart(3, '0')}`,
    first_name: firstName,
    last_name: lastName,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${seed}@example.com`,
    role: 'player' as const,
    status: 'active' as const,
    is_rookie: isRookie,
    season_id: seasonId,
  };
});
