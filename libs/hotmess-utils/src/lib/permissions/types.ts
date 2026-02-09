import type { UserRole } from '@true-tech-team/hotmess-types';

/**
 * Actions that can be performed in the system.
 */
export enum Permission {
  // Organization management
  ManageOrganization = 'manage:organization',
  ViewOrganization = 'view:organization',

  // City management
  ManageCities = 'manage:cities',
  ViewCities = 'view:cities',

  // Sport management
  ManageSports = 'manage:sports',
  ViewSports = 'view:sports',

  // League management
  ManageLeagues = 'manage:leagues',
  ViewLeagues = 'view:leagues',

  // Season management
  ManageSeasons = 'manage:seasons',
  ViewSeasons = 'view:seasons',

  // Division management
  ManageDivisions = 'manage:divisions',
  ViewDivisions = 'view:divisions',

  // Team management
  ManageAllTeams = 'manage:all_teams',
  ManageOwnTeam = 'manage:own_team',
  ViewTeams = 'view:teams',

  // Player management
  ManageAllPlayers = 'manage:all_players',
  InviteToTeam = 'invite:team',
  ViewPlayers = 'view:players',

  // Game management
  ManageAllGames = 'manage:all_games',
  UpdateAssignedGameScore = 'update:assigned_game_score',
  ViewGames = 'view:games',

  // Schedule management
  ManageSchedules = 'manage:schedules',
  ViewSchedules = 'view:schedules',

  // Bracket management
  ManageBrackets = 'manage:brackets',
  ViewBrackets = 'view:brackets',

  // Messaging
  SendAnnouncements = 'send:announcements',
  MessageAllTeams = 'message:all_teams',
  MessageOwnTeam = 'message:own_team',
  ViewMessages = 'view:messages',

  // Photos
  ManageAllPhotos = 'manage:all_photos',
  UploadPhotos = 'upload:photos',
  ViewPhotos = 'view:photos',

  // Superlatives
  ManageSuperlatives = 'manage:superlatives',
  NominateSuperlatives = 'nominate:superlatives',
  VoteSuperlatives = 'vote:superlatives',

  // Notifications
  SendNotifications = 'send:notifications',

  // Reports
  ViewReports = 'view:reports',
  ExportData = 'export:data',
}

/**
 * Context for permission checking.
 */
export interface PermissionContext {
  /** The user's role for the current context */
  role: UserRole;
  /** The team ID if checking team-specific permissions */
  teamId?: string;
  /** The user's team IDs for ownership checks */
  userTeamIds?: string[];
  /** The game ID if checking game-specific permissions */
  gameId?: string;
  /** Games assigned to the user (for refs) */
  assignedGameIds?: string[];
}
