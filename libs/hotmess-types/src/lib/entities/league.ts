import type { BaseEntity } from './base';
import type { City } from './city';
import type { Sport } from './sport';
import type { Season } from './season';

/**
 * A league combines a city and a sport.
 * Example: Miami Kickball League
 */
export interface League extends BaseEntity {
  cityId: string;
  sportId: string;
  name: string;
  description?: string;
  isActive: boolean;

  // Relations
  city?: City;
  sport?: Sport;
  seasons?: Season[];
}
