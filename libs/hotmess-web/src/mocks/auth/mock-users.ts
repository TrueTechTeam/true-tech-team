import { UserRole } from '@true-tech-team/hotmess-types';
import type { SportsEngineUser } from '../../lib/sports-engine';

export interface MockProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  preferred_name?: string;
  avatar_url?: string;
  is_onboarded: boolean;
  sports_engine_id: string;
}

export interface MockUser {
  sportsEngineUser: SportsEngineUser;
  profile: MockProfile;
  role: UserRole;
}

export const MOCK_USERS: Record<UserRole, MockUser> = {
  [UserRole.Admin]: {
    sportsEngineUser: {
      id: 'mock-admin-001',
      email: 'admin@hotmess.dev',
      first_name: 'Grant',
      last_name: 'Admin',
    },
    profile: {
      id: 'mock-admin-001',
      email: 'admin@hotmess.dev',
      first_name: 'Grant',
      last_name: 'Admin',
      is_onboarded: true,
      sports_engine_id: 'mock-admin-001',
    },
    role: UserRole.Admin,
  },
  [UserRole.Commissioner]: {
    sportsEngineUser: {
      id: 'mock-commissioner-001',
      email: 'commissioner@hotmess.dev',
      first_name: 'Carmen',
      last_name: 'Commissioner',
    },
    profile: {
      id: 'mock-commissioner-001',
      email: 'commissioner@hotmess.dev',
      first_name: 'Carmen',
      last_name: 'Commissioner',
      is_onboarded: true,
      sports_engine_id: 'mock-commissioner-001',
    },
    role: UserRole.Commissioner,
  },
  [UserRole.Manager]: {
    sportsEngineUser: {
      id: 'mock-manager-001',
      email: 'manager@hotmess.dev',
      first_name: 'Morgan',
      last_name: 'Manager',
    },
    profile: {
      id: 'mock-manager-001',
      email: 'manager@hotmess.dev',
      first_name: 'Morgan',
      last_name: 'Manager',
      is_onboarded: true,
      sports_engine_id: 'mock-manager-001',
    },
    role: UserRole.Manager,
  },
  [UserRole.Referee]: {
    sportsEngineUser: {
      id: 'mock-referee-001',
      email: 'referee@hotmess.dev',
      first_name: 'Riley',
      last_name: 'Referee',
    },
    profile: {
      id: 'mock-referee-001',
      email: 'referee@hotmess.dev',
      first_name: 'Riley',
      last_name: 'Referee',
      is_onboarded: true,
      sports_engine_id: 'mock-referee-001',
    },
    role: UserRole.Referee,
  },
  [UserRole.TeamCaptain]: {
    sportsEngineUser: {
      id: 'mock-captain-001',
      email: 'captain@hotmess.dev',
      first_name: 'Casey',
      last_name: 'Captain',
    },
    profile: {
      id: 'mock-captain-001',
      email: 'captain@hotmess.dev',
      first_name: 'Casey',
      last_name: 'Captain',
      is_onboarded: true,
      sports_engine_id: 'mock-captain-001',
    },
    role: UserRole.TeamCaptain,
  },
  [UserRole.Player]: {
    sportsEngineUser: {
      id: 'mock-player-001',
      email: 'player@hotmess.dev',
      first_name: 'Pat',
      last_name: 'Player',
    },
    profile: {
      id: 'mock-player-001',
      email: 'player@hotmess.dev',
      first_name: 'Pat',
      last_name: 'Player',
      is_onboarded: true,
      sports_engine_id: 'mock-player-001',
    },
    role: UserRole.Player,
  },
};

export const DEFAULT_MOCK_USER = MOCK_USERS[UserRole.Admin];
