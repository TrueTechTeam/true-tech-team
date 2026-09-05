import type Anthropic from '@anthropic-ai/sdk';
import { runAgentLoop, type ToolExecutorEntry } from '@true-tech-team/agent-kit';
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
  const toolExecutors: Record<string, ToolExecutorEntry> = {
    web_search: {
      executor: (input) => {
        const { query: q, num_results } = input as { query: string; num_results?: number };
        return tools.webSearch(q, num_results ?? 5);
      },
      describeInput: (input) => ({ query: (input as { query: string }).query }),
      describeResult: (input) => `Searched: "${(input as { query: string }).query}"`,
    },
    scrape_page: {
      executor: (input) => tools.scrapePage((input as { url: string }).url),
      describeInput: (input) => ({ url: (input as { url: string }).url }),
      describeResult: (input) => `Scraped: ${(input as { url: string }).url}`,
    },
  };

  const generator = runAgentLoop<AgentRecipe>({
    apiKey: process.env.ANTHROPIC_API_KEY ?? '',
    model: 'claude-opus-4-5',
    systemPrompt: buildSystemPrompt(profile),
    tools: [webSearchTool, scrapePageTool],
    toolExecutors,
    initialMessage: query,
    resultFenceTag: 'recipe-json',
    parseResult: (json) => json as AgentRecipe,
  });

  for await (const event of generator) {
    switch (event.type) {
      case 'result':
        yield { type: 'recipe', recipe: event.result };
        break;
      case 'text':
        yield { type: 'text', text: event.text };
        break;
      case 'tool_use':
        yield { type: 'tool_use', toolName: event.toolName, input: event.input };
        break;
      case 'tool_result':
        yield { type: 'tool_result', toolName: event.toolName, summary: event.summary };
        break;
      case 'error':
        yield { type: 'error', message: event.message };
        break;
      case 'done':
        yield { type: 'done' };
        break;
    }
  }
}
