import * as cheerio from 'cheerio';

export interface ScrapeResult {
  url: string;
  title: string | null;
  description: string | null;
  ingredients: string[];
  directions: string[];
  prepTimeMins: number | null;
  cookTimeMins: number | null;
  servings: number | null;
  imageUrl: string | null;
  rawText: string;
}

function emptyResult(url: string): ScrapeResult {
  return {
    url,
    title: null,
    description: null,
    ingredients: [],
    directions: [],
    prepTimeMins: null,
    cookTimeMins: null,
    servings: null,
    imageUrl: null,
    rawText: '',
  };
}

function parseDuration(iso: unknown): number | null {
  if (typeof iso !== 'string') {
    return null;
  }
  // ISO 8601 duration: PT1H30M, PT45M, etc.
  const hours = iso.match(/(\d+)H/);
  const mins = iso.match(/(\d+)M/);
  const h = hours ? parseInt(hours[1], 10) : 0;
  const m = mins ? parseInt(mins[1], 10) : 0;
  const total = h * 60 + m;
  return total > 0 ? total : null;
}

function parseServings(val: unknown): number | null {
  if (val == null) {
    return null;
  }
  if (typeof val === 'number') {
    return val;
  }
  if (typeof val === 'string') {
    const n = parseInt(val, 10);
    return isNaN(n) ? null : n;
  }
  return null;
}

function extractTextList(val: unknown): string[] {
  if (!val) {
    return [];
  }
  if (typeof val === 'string') {
    return [val.trim()].filter(Boolean);
  }
  if (Array.isArray(val)) {
    return val.flatMap((item) => {
      if (typeof item === 'string') {
        return [item.trim()].filter(Boolean);
      }
      if (item && typeof item === 'object' && 'text' in item) {
        return [String((item as { text: unknown }).text).trim()].filter(Boolean);
      }
      if (item && typeof item === 'object' && 'name' in item) {
        return [String((item as { name: unknown }).name).trim()].filter(Boolean);
      }
      return [];
    });
  }
  return [];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function findRecipeSchema(data: unknown): Record<string, any> | null {
  if (Array.isArray(data)) {
    for (const item of data) {
      const found = findRecipeSchema(item);
      if (found) {
        return found;
      }
    }
  }
  if (data && typeof data === 'object') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const obj = data as Record<string, any>;
    if (
      obj['@type'] === 'Recipe' ||
      (Array.isArray(obj['@type']) && (obj['@type'] as string[]).includes('Recipe'))
    ) {
      return obj;
    }
    if (obj['@graph']) {
      return findRecipeSchema(obj['@graph']);
    }
  }
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseSchemaRecipe(url: string, recipe: Record<string, any>): ScrapeResult {
  const ingredients = extractTextList(recipe['recipeIngredient']);
  const directions = extractTextList(
    Array.isArray(recipe['recipeInstructions'])
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recipe['recipeInstructions'].map((step: any) =>
          typeof step === 'string' ? step : ((step['text'] as string) ?? '')
        )
      : recipe['recipeInstructions']
  );

  let imageUrl: string | null = null;
  if (typeof recipe['image'] === 'string') {
    imageUrl = recipe['image'];
  } else if (Array.isArray(recipe['image']) && typeof recipe['image'][0] === 'string') {
    imageUrl = recipe['image'][0] as string;
  } else if (recipe['image'] && typeof recipe['image'] === 'object' && 'url' in recipe['image']) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    imageUrl = (recipe['image'] as Record<string, any>)['url'] as string;
  }

  return {
    url,
    title: typeof recipe['name'] === 'string' ? recipe['name'] : null,
    description: typeof recipe['description'] === 'string' ? recipe['description'] : null,
    ingredients,
    directions,
    prepTimeMins: parseDuration(recipe['prepTime']),
    cookTimeMins: parseDuration(recipe['cookTime']),
    servings: parseServings(recipe['recipeYield']),
    imageUrl,
    rawText: [...ingredients, ...directions].join('\n').slice(0, 8000),
  };
}

type CheerioRoot = ReturnType<typeof cheerio.load>;

function heuristicScrape(url: string, $: CheerioRoot): ScrapeResult {
  const title =
    $('h1').first().text().trim() ||
    $('meta[property="og:title"]').attr('content') ||
    $('title').text().trim() ||
    null;

  const description =
    $('meta[name="description"]').attr('content') ||
    $('meta[property="og:description"]').attr('content') ||
    null;

  const imageUrl =
    $('meta[property="og:image"]').attr('content') ||
    $('meta[name="twitter:image"]').attr('content') ||
    null;

  // Common selectors used by recipe sites
  const ingredientSelectors = [
    '[class*="ingredient"] li',
    '[class*="ingredient-list"] li',
    '[itemprop="recipeIngredient"]',
    '.ingredients li',
    '.recipe-ingredients li',
  ];

  const directionSelectors = [
    '[class*="instruction"] li',
    '[class*="direction"] li',
    '[itemprop="recipeInstructions"] li',
    '.instructions li',
    '.directions li',
    '.steps li',
    '[class*="step"] p',
  ];

  let ingredients: string[] = [];
  for (const sel of ingredientSelectors) {
    const found = $(sel)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((_: number, el: any) => $(el).text().trim())
      .get()
      .filter(Boolean);
    if (found.length > 2) {
      ingredients = found;
      break;
    }
  }

  let directions: string[] = [];
  for (const sel of directionSelectors) {
    const found = $(sel)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((_: number, el: any) => $(el).text().trim())
      .get()
      .filter(Boolean);
    if (found.length > 1) {
      directions = found;
      break;
    }
  }

  // Extract raw page text as fallback context for Claude
  const rawText = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 8000);

  return {
    url,
    title,
    description,
    ingredients,
    directions,
    prepTimeMins: null,
    cookTimeMins: null,
    servings: null,
    imageUrl: imageUrl ?? null,
    rawText,
  };
}

export async function scrapePage(url: string): Promise<ScrapeResult> {
  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return emptyResult(url);
  }

  if (!response.ok) {
    return emptyResult(url);
  }

  let html: string;
  try {
    html = await response.text();
  } catch {
    return emptyResult(url);
  }

  const $ = cheerio.load(html);

  // 1. Try JSON-LD schema.org/Recipe
  const jsonLdBlocks = $('script[type="application/ld+json"]').toArray();
  for (const el of jsonLdBlocks) {
    try {
      const raw = $(el).html();
      if (!raw) {
        continue;
      }
      const data: unknown = JSON.parse(raw);
      const recipe = findRecipeSchema(data);
      if (recipe) {
        return parseSchemaRecipe(url, recipe);
      }
    } catch {
      // continue to next block
    }
  }

  // 2. Heuristic fallback
  return heuristicScrape(url, $);
}
