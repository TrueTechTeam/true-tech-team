import { type NextRequest } from 'next/server';
import { getAppUsage, recordAppUsage } from '@true-tech-team/project-gateway';
import { createClient } from '../../../../lib/supabase/server';
import {
  runRecipeAgent,
  scrapePage,
  mapProfileRow,
  type AgentStreamEvent,
} from '@true-tech-team/recipes';

const APP_SLUG = 'recipe-agent';

// Allow up to 60s for the agent to run
export const maxDuration = 60;

interface SerperResult {
  title: string;
  link: string;
  snippet: string;
}

interface SerperResponse {
  organic?: SerperResult[];
}

async function webSearch(query: string, numResults: number): Promise<unknown> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    return { error: 'SERPER_API_KEY not configured' };
  }
  try {
    const res = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q: query, num: Math.min(numResults, 10) }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      return { error: `Search API error: ${res.status}` };
    }
    const data = (await res.json()) as SerperResponse;
    return {
      results: (data.organic ?? []).slice(0, numResults).map((r) => ({
        title: r.title,
        url: r.link,
        snippet: r.snippet,
      })),
    };
  } catch (e) {
    return { error: String(e) };
  }
}

export async function POST(request: NextRequest) {
  // 1. Auth check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // 2. Permission check — admin bypasses explicit grant
  const [{ data: perm }, { data: roleRow }] = await Promise.all([
    supabase
      .from('app_permissions')
      .select('id')
      .eq('user_id', user.id)
      .eq('app_slug', APP_SLUG)
      .maybeSingle(),
    supabase.from('user_roles').select('role').eq('user_id', user.id).maybeSingle(),
  ]);

  if (!perm && !roleRow) {
    return new Response('Forbidden', { status: 403 });
  }

  // 2b. Usage limit check
  const usage = await getAppUsage(supabase, user.id, APP_SLUG);
  if (!usage.allowed) {
    return new Response('Usage limit reached for this period', { status: 429 });
  }

  // 3. Parse body
  let query: string;
  try {
    const body = (await request.json()) as { query?: string };
    query = body.query?.trim() ?? '';
  } catch {
    return new Response('Invalid JSON body', { status: 400 });
  }

  if (!query) {
    return new Response('Missing query', { status: 400 });
  }

  // 4. Load recipe profile (nullable — agent handles no profile gracefully)
  const { data: profileRow } = await supabase
    .from('recipe_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  const profile = profileRow ? mapProfileRow(profileRow as Record<string, unknown>) : null;

  // 5. Save to search history and record usage (fire and forget)
  void supabase.from('recipe_searches').insert({ user_id: user.id, query });
  void recordAppUsage(supabase, user.id, APP_SLUG);

  // 6. Stream the agent response
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const agentGen = runRecipeAgent(query, profile, {
          webSearch,
          scrapePage,
        });

        for await (const event of agentGen) {
          const line = `${JSON.stringify(event)}\n`;
          controller.enqueue(encoder.encode(line));
          if (event.type === 'done') {
            break;
          }
        }
      } catch (err) {
        const errorEvent: AgentStreamEvent = {
          type: 'error',
          message: err instanceof Error ? err.message : String(err),
        };
        controller.enqueue(encoder.encode(`${JSON.stringify(errorEvent)}\n`));
        controller.enqueue(encoder.encode(`${JSON.stringify({ type: 'done' })}\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Cache-Control': 'no-cache, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
