export type UsagePeriod = 'day' | 'month' | 'all_time';

export interface UsageLimitConfig {
  appSlug: string;
  period: UsagePeriod;
  maxUses: number;
}

export interface UsageStatus {
  appSlug: string;
  used: number;
  limit: number | null;
  remaining: number | null;
  allowed: boolean;
}
