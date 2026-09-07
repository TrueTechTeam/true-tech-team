import { describe, it, expect, vi } from 'vitest';
import { recordAppUsage, recordUsageFromStream, aggregateUsageRows } from './usage';

describe('recordAppUsage', () => {
  it('writes null model/token columns when usage is omitted', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    const supabase = { from: vi.fn().mockReturnValue({ insert }) } as any;

    await recordAppUsage(supabase, 'user-1', 'job-search');

    expect(insert).toHaveBeenCalledWith({
      user_id: 'user-1',
      app_slug: 'job-search',
      model: null,
      input_tokens: null,
      output_tokens: null,
    });
  });

  it('writes model/token columns when usage is provided', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    const supabase = { from: vi.fn().mockReturnValue({ insert }) } as any;

    await recordAppUsage(supabase, 'user-1', 'job-search', {
      model: 'claude-opus-4-5',
      inputTokens: 100,
      outputTokens: 20,
    });

    expect(insert).toHaveBeenCalledWith({
      user_id: 'user-1',
      app_slug: 'job-search',
      model: 'claude-opus-4-5',
      input_tokens: 100,
      output_tokens: 20,
    });
  });
});

describe('recordUsageFromStream', () => {
  async function* fakeGenerator(events: Array<{ type: string; [k: string]: unknown }>) {
    for (const event of events) {
      yield event;
    }
  }

  it('records the captured usage event once the stream completes', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    const supabase = { from: vi.fn().mockReturnValue({ insert }) } as any;

    const events = [
      { type: 'text', text: 'hi' },
      { type: 'usage', model: 'claude-opus-4-5', inputTokens: 50, outputTokens: 10 },
      { type: 'done' },
    ];

    const seen = [];
    for await (const event of recordUsageFromStream(
      fakeGenerator(events),
      supabase,
      'user-1',
      'job-search'
    )) {
      seen.push(event);
    }

    expect(seen).toEqual(events); // forwards every event unchanged
    expect(insert).toHaveBeenCalledWith({
      user_id: 'user-1',
      app_slug: 'job-search',
      model: 'claude-opus-4-5',
      input_tokens: 50,
      output_tokens: 10,
    });
  });

  it('still records (with null usage) if the generator throws before a usage event', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    const supabase = { from: vi.fn().mockReturnValue({ insert }) } as any;

    async function* throwingGenerator() {
      yield { type: 'text', text: 'hi' };
      throw new Error('boom');
    }

    await expect(async () => {
      for await (const _event of recordUsageFromStream(
        throwingGenerator(),
        supabase,
        'user-1',
        'job-search'
      )) {
        // drain
      }
    }).rejects.toThrow('boom');

    expect(insert).toHaveBeenCalledWith({
      user_id: 'user-1',
      app_slug: 'job-search',
      model: null,
      input_tokens: null,
      output_tokens: null,
    });
  });
});

describe('aggregateUsageRows', () => {
  it('groups by user and day, summing tokens and cost', () => {
    const result = aggregateUsageRows([
      {
        user_id: 'user-1',
        model: 'claude-opus-4-5',
        input_tokens: 200_000,
        output_tokens: 40_000,
        created_at: '2026-09-01T10:00:00Z',
      },
      {
        user_id: 'user-1',
        model: 'claude-opus-4-5',
        input_tokens: 200_000,
        output_tokens: 40_000,
        created_at: '2026-09-01T18:00:00Z',
      },
      {
        user_id: 'user-1',
        model: 'claude-opus-4-5',
        input_tokens: 1_000_000,
        output_tokens: 0,
        created_at: '2026-09-02T09:00:00Z',
      },
      {
        user_id: 'user-2',
        model: 'claude-opus-4-5',
        input_tokens: 1_000_000,
        output_tokens: 1_000_000,
        created_at: '2026-09-01T00:00:00Z',
      },
    ]);

    expect(result['user-1'].daily).toEqual([
      { date: '2026-09-01', cost: 4, inputTokens: 400_000, outputTokens: 80_000 },
      { date: '2026-09-02', cost: 5, inputTokens: 1_000_000, outputTokens: 0 },
    ]);
    expect(result['user-1'].totalCost).toBeCloseTo(9, 5);
    expect(result['user-1'].totalInputTokens).toBe(1_400_000);
    expect(result['user-1'].totalOutputTokens).toBe(80_000);

    expect(result['user-2'].totalCost).toBeCloseTo(30, 5);
  });

  it('skips rows with null token data (pre-migration or non-agent usage events)', () => {
    const result = aggregateUsageRows([
      {
        user_id: 'user-1',
        model: null,
        input_tokens: null,
        output_tokens: null,
        created_at: '2026-09-01T00:00:00Z',
      },
    ]);

    expect(result['user-1']).toBeUndefined();
  });

  it('reports null total cost for a user if any row used an unpriced model', () => {
    const result = aggregateUsageRows([
      {
        user_id: 'user-1',
        model: 'claude-unknown-model',
        input_tokens: 1000,
        output_tokens: 1000,
        created_at: '2026-09-01T00:00:00Z',
      },
    ]);

    expect(result['user-1'].daily[0].cost).toBeNull();
    expect(result['user-1'].totalCost).toBeNull();
  });
});
