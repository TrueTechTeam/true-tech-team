import Anthropic from '@anthropic-ai/sdk';
import type { RecipeProfile, AgentStreamEvent, AgentRecipe } from './types';
import type { ScrapeResult } from './scraper';

// ---- Tool definitions ----

const webSearchTool: Anthropic.Tool = {
  name: 'web_search',
  description:
    'Search the web for recipes matching the query. Returns a list of URLs, titles, and snippets. Prefer well-known recipe sites. Use multiple searches to find the best candidates.',
  input_schema: {
    type: 'object' as const,
    properties: {
      query: {
        type: 'string',
        description:
          'Search query, e.g. "healthy mediterranean chicken rice recipe site:seriouseats.com"',
      },
      num_results: {
        type: 'number',
        description: 'Number of results to return (max 10)',
      },
    },
    required: ['query'],
  },
};

const scrapePageTool: Anthropic.Tool = {
  name: 'scrape_page',
  description:
    'Fetch and parse the content of a recipe webpage. Returns structured data (ingredients, directions, times) if schema.org/Recipe markup is found, otherwise returns heuristically extracted content and raw page text.',
  input_schema: {
    type: 'object' as const,
    properties: {
      url: { type: 'string', description: 'Full URL of the recipe page to scrape' },
    },
    required: ['url'],
  },
};

// ---- System prompt builder ----

export function buildSystemPrompt(profile: RecipeProfile | null): string {
  const parts: string[] = [
    'You are a recipe search assistant. Your job is to find real, specific recipes on the internet that match what the user is looking for.',
    '',
    '## How to work',
    '1. Use the web_search tool up to 5 times to find candidate recipe pages.',
    '   - Start with a broad search, then refine based on what you find.',
    '   - Vary your queries: try the exact request, cuisine variants, ingredient combinations.',
    '2. Use scrape_page on up to 5 of the most promising URLs to extract recipe details.',
    '3. Choose the BEST single recipe from what you found.',
    '4. Return it in the EXACT format below — then write a 2-3 sentence explanation of why you chose it.',
    '',
    '## Output format',
    'After scraping, output a fenced code block tagged `recipe-json` containing valid JSON:',
    '```recipe-json',
    '{',
    '  "title": "string",',
    '  "description": "string",',
    '  "ingredients": ["string", ...],',
    '  "directions": ["Step 1: ...", "Step 2: ...", ...],',
    '  "prepTimeMins": number | null,',
    '  "cookTimeMins": number | null,',
    '  "servings": number | null,',
    '  "sourceUrl": "string | null",',
    '  "imageUrl": "string | null",',
    '  "suggestedTags": ["Italian", "low-sodium", "high-protein", "dinner", ...]',
    '}',
    '```',
    '',
    'For suggestedTags, include:',
    '- Cuisine style (e.g. Italian, Mexican, Japanese, Mediterranean)',
    '- Meal type (e.g. breakfast, lunch, dinner, snack, dessert, appetizer)',
    '- Health/diet attributes (e.g. gluten-free, vegan, low-carb, high-protein, low-sodium)',
    '- Cooking method (e.g. slow-cooker, one-pan, grilled, baked)',
    '- Special attributes (e.g. quick, meal-prep, budget-friendly)',
    'Use lowercase kebab-case or simple lowercase words. Keep tags concise.',
  ];

  if (profile) {
    parts.push('', '## User profile — use to bias your search and filter results');

    if (profile.dietaryNeeds.length) {
      parts.push(
        `- **Dietary needs / allergies**: ${profile.dietaryNeeds.join(', ')}`,
        '  → These are HARD requirements. Do not return recipes that violate them.',
        '  → If a recipe might contain an allergen, flag it in your explanation.'
      );
    }
    if (profile.preferences.length) {
      parts.push(`- **Preferences**: ${profile.preferences.join(', ')}`);
    }
    if (profile.goals.length) {
      parts.push(`- **Health goals**: ${profile.goals.join(', ')}`);
    }
    if (profile.preferredSites.length) {
      parts.push(
        `- **Preferred recipe sites**: ${profile.preferredSites.join(', ')}`,
        '  → Search these sites first. Include "site:domain.com" in your queries.'
      );
    }
    if (profile.subscriptionSites.length) {
      parts.push(
        `- **Subscription sites**: ${profile.subscriptionSites.join(', ')}`,
        '  → User has access to these. Include them in searches and attempt to scrape them.'
      );
    }
    if (profile.additionalNotes) {
      parts.push(`- **Additional context**: ${profile.additionalNotes}`);
    }
  }

  return parts.join('\n');
}

// ---- Tool implementations (injected by the API route) ----

export interface AgentTools {
  webSearch: (query: string, numResults: number) => Promise<unknown>;
  scrapePage: (url: string) => Promise<ScrapeResult>;
}

// ---- Core agent runner ----

export async function* runRecipeAgent(
  query: string,
  profile: RecipeProfile | null,
  tools: AgentTools
): AsyncGenerator<AgentStreamEvent> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const messages: Anthropic.MessageParam[] = [{ role: 'user', content: query }];
  const MAX_ITERATIONS = 8;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const stream = client.messages.stream({
      model: 'claude-opus-4-5',
      max_tokens: 4096,
      system: buildSystemPrompt(profile),
      tools: [webSearchTool, scrapePageTool],
      messages,
    });

    let assistantText = '';

    // Stream text deltas to the client in real time
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        assistantText += event.delta.text;
        yield { type: 'text', text: event.delta.text };
      }
    }

    const finalMessage = await stream.finalMessage();
    messages.push({ role: 'assistant', content: finalMessage.content });

    if (finalMessage.stop_reason === 'end_turn') {
      // Try to extract structured recipe JSON
      const recipeMatch = assistantText.match(/```recipe-json\s*([\s\S]*?)```/);
      if (recipeMatch) {
        try {
          const recipe = JSON.parse(recipeMatch[1].trim()) as AgentRecipe;
          yield { type: 'recipe', recipe };
        } catch {
          yield { type: 'error', message: 'Could not parse recipe JSON from agent response.' };
        }
      }
      yield { type: 'done' };
      return;
    }

    // Collect and execute tool calls
    const toolUses = finalMessage.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use'
    );

    if (toolUses.length === 0) {
      yield { type: 'done' };
      return;
    }

    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const toolUse of toolUses) {
      let result: unknown;

      if (toolUse.name === 'web_search') {
        const input = toolUse.input as { query: string; num_results?: number };
        yield {
          type: 'tool_use',
          toolName: 'web_search',
          input: { query: input.query },
        };
        result = await tools.webSearch(input.query, input.num_results ?? 5);
        yield {
          type: 'tool_result',
          toolName: 'web_search',
          summary: `Searched: "${input.query}"`,
        };
      } else if (toolUse.name === 'scrape_page') {
        const input = toolUse.input as { url: string };
        yield {
          type: 'tool_use',
          toolName: 'scrape_page',
          input: { url: input.url },
        };
        result = await tools.scrapePage(input.url);
        yield {
          type: 'tool_result',
          toolName: 'scrape_page',
          summary: `Scraped: ${input.url}`,
        };
      } else {
        result = { error: `Unknown tool: ${toolUse.name}` };
      }

      toolResults.push({
        type: 'tool_result',
        tool_use_id: toolUse.id,
        content: JSON.stringify(result),
      });
    }

    messages.push({ role: 'user', content: toolResults });
  }

  yield { type: 'error', message: 'Agent exceeded maximum iterations without producing a recipe.' };
  yield { type: 'done' };
}
