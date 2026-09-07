import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  UsagePeriod,
  UsageStatus,
  RecordedUsage,
  UsageEventRow,
  UserUsageHistory,
} from './types';
import { estimateCost } from './pricing';

function periodStart(period: UsagePeriod): string | null {
  const now = new Date();
  if (period === 'day') {
    return new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    ).toISOString();
  }
  if (period === 'month') {
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
  }
  return null;
}

// Looks up the configured limit for an app (if any) and counts this user's
// usage events within the current period. Apps with no row in
// app_usage_limits are treated as unlimited. Admins bypass limits entirely —
// callers pass their own already-resolved isAdmin flag rather than this
// module knowing anything about the permission model.
export async function getAppUsage(
  supabase: SupabaseClient,
  userId: string,
  appSlug: string,
  isAdmin = false
): Promise<UsageStatus> {
  if (isAdmin) {
    return { appSlug, used: 0, limit: null, remaining: null, allowed: true };
  }

  const { data: limitRow } = await supabase
    .from('app_usage_limits')
    .select('period, max_uses')
    .eq('app_slug', appSlug)
    .maybeSingle();

  if (!limitRow) {
    return { appSlug, used: 0, limit: null, remaining: null, allowed: true };
  }

  const since = periodStart(limitRow.period as UsagePeriod);
  let query = supabase
    .from('app_usage_events')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('app_slug', appSlug);
  if (since) {
    query = query.gte('created_at', since);
  }

  const { count } = await query;
  const used = count ?? 0;
  const limit = limitRow.max_uses as number;

  return {
    appSlug,
    used,
    limit,
    remaining: Math.max(limit - used, 0),
    allowed: used < limit,
  };
}

// Records one unit of usage. Call this at the point where the user actually
// consumes the app's functionality (e.g. an agent run), not on page view.
// `usage` carries token/model data when known (an agent call); omitted for
// any future non-agent usage event, which keeps those columns null.
export async function recordAppUsage(
  supabase: SupabaseClient,
  userId: string,
  appSlug: string,
  usage?: RecordedUsage
): Promise<void> {
  const { error } = await supabase.from('app_usage_events').insert({
    user_id: userId,
    app_slug: appSlug,
    model: usage?.model ?? null,
    input_tokens: usage?.inputTokens ?? null,
    output_tokens: usage?.outputTokens ?? null,
  });
  if (error) {
    console.error('recordAppUsage: failed to insert usage event', error);
  }
}

interface UsageStreamEvent {
  type: string;
  model?: unknown;
  inputTokens?: unknown;
  outputTokens?: unknown;
}

function asRecordedUsage(event: UsageStreamEvent): RecordedUsage | undefined {
  if (
    event.type === 'usage' &&
    typeof event.model === 'string' &&
    typeof event.inputTokens === 'number' &&
    typeof event.outputTokens === 'number'
  ) {
    return { model: event.model, inputTokens: event.inputTokens, outputTokens: event.outputTokens };
  }
  return undefined;
}

// Wraps an agent event generator: forwards every event unchanged, and once
// the generator finishes (successfully or by throwing) records app usage
// with whatever usage event was captured along the way (or none, if the
// generator never got that far). Works with agent-kit's AgentStreamEvent
// and with recipes' own independent event type — anything with a `type`
// field structurally compatible with the `usage` event shape.
export async function* recordUsageFromStream<E extends UsageStreamEvent>(
  generator: AsyncGenerator<E>,
  supabase: SupabaseClient,
  userId: string,
  appSlug: string
): AsyncGenerator<E> {
  let captured: RecordedUsage | undefined;
  try {
    for await (const event of generator) {
      const usage = asRecordedUsage(event);
      if (usage) {
        captured = usage;
      }
      yield event;
    }
  } finally {
    await recordAppUsage(supabase, userId, appSlug, captured);
  }
}

// Pure aggregation — no Supabase dependency, so it's fully unit-testable.
// Groups raw app_usage_events rows by user and by UTC calendar day, summing
// tokens and estimated cost. A day's (and therefore a user's) total cost is
// null if any contributing row used a model with no entry in PRICING —
// better to show "unknown" than a silently-wrong partial total.
export function aggregateUsageRows(rows: UsageEventRow[]): Record<string, UserUsageHistory> {
  const byUser: Record<
    string,
    Record<string, { cost: number | null; inputTokens: number; outputTokens: number }>
  > = {};

  for (const row of rows) {
    if (row.model === null || row.input_tokens === null || row.output_tokens === null) {
      continue;
    }
    const date = row.created_at.slice(0, 10);
    const cost = estimateCost(row.model, row.input_tokens, row.output_tokens);

    const userDays = (byUser[row.user_id] ??= {});
    const day = (userDays[date] ??= { cost: 0, inputTokens: 0, outputTokens: 0 });
    day.inputTokens += row.input_tokens;
    day.outputTokens += row.output_tokens;
    day.cost = day.cost === null || cost === null ? null : day.cost + cost;
  }

  const result: Record<string, UserUsageHistory> = {};
  for (const [userId, days] of Object.entries(byUser)) {
    const daily = Object.entries(days)
      .map(([date, d]) => ({ date, ...d }))
      .sort((a, b) => a.date.localeCompare(b.date));

    let totalCost: number | null = 0;
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    for (const d of daily) {
      totalCost = totalCost === null || d.cost === null ? null : totalCost + d.cost;
      totalInputTokens += d.inputTokens;
      totalOutputTokens += d.outputTokens;
    }

    result[userId] = { totalCost, totalInputTokens, totalOutputTokens, daily };
  }

  return result;
}

// Fetches the last `sinceDays` of usage events (across all users the
// caller's RLS grants access to — admins see everyone, a regular user sees
// only their own) and aggregates them. Thin wrapper over aggregateUsageRows;
// not unit-tested directly since it's a straight DB call with no branching
// logic of its own.
export async function getUsageHistory(
  supabase: SupabaseClient,
  sinceDays = 30
): Promise<Record<string, UserUsageHistory>> {
  const since = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000);
  const { data, error } = await supabase
    .from('app_usage_events')
    .select('user_id, model, input_tokens, output_tokens, created_at')
    .gte('created_at', since.toISOString());

  if (error) {
    console.error('getUsageHistory: failed to fetch usage events', error);
  }

  return aggregateUsageRows((data ?? []) as UsageEventRow[]);
}
