/**
 * Status of a scheduled game.
 */
export enum GameStatus {
  /** Game is scheduled but not yet played */
  Scheduled = 'scheduled',
  /** Game is currently in progress */
  InProgress = 'in_progress',
  /** Game has been completed */
  Completed = 'completed',
  /** Game was cancelled */
  Cancelled = 'cancelled',
  /** Game was postponed to a later date */
  Postponed = 'postponed',
}

/**
 * Status of a season.
 */
export enum SeasonStatus {
  /** Season is planned but registration not open */
  Draft = 'draft',
  /** Registration is open */
  Registration = 'registration',
  /** Season is active and games are being played */
  Active = 'active',
  /** Regular season complete, tournament in progress */
  Tournament = 'tournament',
  /** Season has ended */
  Completed = 'completed',
}

/**
 * Status of a team registration.
 */
export enum TeamRegistrationStatus {
  /** Team is being formed */
  Pending = 'pending',
  /** Team registration is complete */
  Confirmed = 'confirmed',
  /** Team was withdrawn */
  Withdrawn = 'withdrawn',
}
