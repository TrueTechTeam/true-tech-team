import type { BaseEntity } from './base';
import type { League } from './league';

/**
 * A city where Hotmess Sports operates.
 */
export interface City extends BaseEntity {
  organizationId: string;
  name: string;
  state?: string;
  timezone: string;
  isActive: boolean;
  leagues?: League[];
}
