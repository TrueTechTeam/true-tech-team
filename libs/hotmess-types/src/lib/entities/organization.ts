import type { BaseEntity } from './base';
import type { City } from './city';

/**
 * Top-level organization (Hotmess Sports).
 */
export interface Organization extends BaseEntity {
  name: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  contactEmail?: string;
  cities?: City[];
}
