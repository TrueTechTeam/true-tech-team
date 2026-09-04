// ---- Recipe Profile ----

export interface RecipeProfile {
  id: string;
  userId: string;
  dietaryNeeds: string[];
  preferences: string[];
  goals: string[];
  preferredSites: string[];
  subscriptionSites: string[];
  additionalNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeProfilePayload {
  dietaryNeeds: string[];
  preferences: string[];
  goals: string[];
  preferredSites: string[];
  subscriptionSites: string[];
  additionalNotes: string | null;
}

// ---- Structured recipe from agent ----

export interface AgentRecipe {
  title: string;
  description: string;
  ingredients: string[];
  directions: string[];
  prepTimeMins: number | null;
  cookTimeMins: number | null;
  servings: number | null;
  sourceUrl: string | null;
  imageUrl: string | null;
  suggestedTags: string[];
}

// ---- Stream event types (newline-delimited JSON) ----

export type AgentStreamEvent =
  | { type: 'tool_use'; toolName: string; input: Record<string, unknown> }
  | { type: 'tool_result'; toolName: string; summary: string }
  | { type: 'recipe'; recipe: AgentRecipe }
  | { type: 'text'; text: string }
  | { type: 'error'; message: string }
  | { type: 'done' };

// ---- Saved recipe (from DB) ----

export interface SavedRecipe {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  ingredients: string[];
  directions: string[];
  prepTimeMins: number | null;
  cookTimeMins: number | null;
  servings: number | null;
  sourceUrl: string | null;
  imageUrl: string | null;
  tags: string[];
  rating: number | null;
  isFavorite: boolean;
  tastedStatus: 'want_to_try' | 'tasted' | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// ---- API shapes ----

export interface SaveRecipePayload {
  title: string;
  description?: string;
  ingredients: string[];
  directions: string[];
  prepTimeMins?: number | null;
  cookTimeMins?: number | null;
  servings?: number | null;
  sourceUrl?: string | null;
  imageUrl?: string | null;
  tags: string[];
  notes?: string | null;
}

export interface UpdateRecipePayload {
  rating?: number | null;
  isFavorite?: boolean;
  tastedStatus?: 'want_to_try' | 'tasted' | null;
  tags?: string[];
  notes?: string | null;
}

export interface SavedRecipesFilters {
  tags?: string[];
  isFavorite?: boolean;
  tastedStatus?: 'want_to_try' | 'tasted';
  minRating?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface SavedRecipesResponse {
  recipes: SavedRecipe[];
  total: number;
  page: number;
  totalPages: number;
}

// ---- DB row helpers ----

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapProfileRow(row: Record<string, any>): RecipeProfile {
  return {
    id: row['id'] as string,
    userId: row['user_id'] as string,
    dietaryNeeds: (row['dietary_needs'] as string[]) ?? [],
    preferences: (row['preferences'] as string[]) ?? [],
    goals: (row['goals'] as string[]) ?? [],
    preferredSites: (row['preferred_sites'] as string[]) ?? [],
    subscriptionSites: (row['subscription_sites'] as string[]) ?? [],
    additionalNotes: (row['additional_notes'] as string | null) ?? null,
    createdAt: row['created_at'] as string,
    updatedAt: row['updated_at'] as string,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapRecipeRow(row: Record<string, any>): SavedRecipe {
  return {
    id: row['id'] as string,
    userId: row['user_id'] as string,
    title: row['title'] as string,
    description: (row['description'] as string | null) ?? null,
    ingredients: (row['ingredients'] as string[]) ?? [],
    directions: (row['directions'] as string[]) ?? [],
    prepTimeMins: (row['prep_time_mins'] as number | null) ?? null,
    cookTimeMins: (row['cook_time_mins'] as number | null) ?? null,
    servings: (row['servings'] as number | null) ?? null,
    sourceUrl: (row['source_url'] as string | null) ?? null,
    imageUrl: (row['image_url'] as string | null) ?? null,
    tags: (row['tags'] as string[]) ?? [],
    rating: (row['rating'] as number | null) ?? null,
    isFavorite: (row['is_favorite'] as boolean) ?? false,
    tastedStatus: (row['tasted_status'] as 'want_to_try' | 'tasted' | null) ?? null,
    notes: (row['notes'] as string | null) ?? null,
    createdAt: row['created_at'] as string,
    updatedAt: row['updated_at'] as string,
  };
}
