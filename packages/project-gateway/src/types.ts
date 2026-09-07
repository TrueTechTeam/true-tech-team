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

export interface ModelPricing {
  inputPerMTok: number;
  outputPerMTok: number;
}

export interface RecordedUsage {
  model: string;
  inputTokens: number;
  outputTokens: number;
}

export interface UsageEventRow {
  user_id: string;
  model: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  created_at: string;
}

export interface DailyUsage {
  date: string; // 'YYYY-MM-DD', UTC
  cost: number | null;
  inputTokens: number;
  outputTokens: number;
}

export interface UserUsageHistory {
  totalCost: number | null;
  totalInputTokens: number;
  totalOutputTokens: number;
  daily: DailyUsage[]; // ascending by date
}
