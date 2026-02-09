import type { BaseEntity } from './base';
import type { User } from './user';
import type { Season } from './season';
import type { Team } from './team';

/**
 * A photo uploaded by a user.
 */
export interface Photo extends BaseEntity {
  uploaderId: string;
  seasonId: string;
  imageUrl: string;
  thumbnailUrl: string;
  caption?: string;

  // Relations
  uploader?: User;
  season?: Season;
  tags?: PhotoTag[];
}

/**
 * A tag on a photo (player, team, etc.).
 */
export interface PhotoTag extends BaseEntity {
  photoId: string;
  /** Type of entity being tagged */
  tagType: 'user' | 'team';
  /** ID of the tagged entity */
  taggedId: string;

  // Relations
  photo?: Photo;
  taggedUser?: User;
  taggedTeam?: Team;
}
