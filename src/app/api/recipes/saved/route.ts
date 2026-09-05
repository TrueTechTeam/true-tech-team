import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import { mapRecipeRow, type SaveRecipePayload } from '@true-tech-team/recipes';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const tagsParam = searchParams.get('tags');
  const isFavorite = searchParams.get('isFavorite');
  const tastedStatus = searchParams.get('tastedStatus');
  const minRating = searchParams.get('minRating');
  const search = searchParams.get('search');
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)));
  const offset = (page - 1) * limit;

  let query = supabase.from('recipes').select('*', { count: 'exact' }).eq('user_id', user.id);

  if (tagsParam) {
    const tags = tagsParam
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    if (tags.length > 0) {
      query = query.contains('tags', tags);
    }
  }
  if (isFavorite === 'true') {
    query = query.eq('is_favorite', true);
  }
  if (tastedStatus === 'want_to_try' || tastedStatus === 'tasted') {
    query = query.eq('tasted_status', tastedStatus);
  }
  if (minRating) {
    const rating = parseInt(minRating, 10);
    if (!isNaN(rating)) {
      query = query.gte('rating', rating);
    }
  }
  if (search) {
    query = query.ilike('title', `%${search}%`);
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const total = count ?? 0;
  const totalPages = Math.ceil(total / limit);

  return NextResponse.json({
    recipes: (data ?? []).map((row) => mapRecipeRow(row as Record<string, unknown>)),
    total,
    page,
    totalPages,
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: SaveRecipePayload;
  try {
    payload = (await request.json()) as SaveRecipePayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!payload.title?.trim()) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }

  // Normalise tags: lowercase, trimmed, deduped
  const tags = [
    ...new Set((payload.tags ?? []).map((t) => t.toLowerCase().trim()).filter(Boolean)),
  ];

  const { data, error } = await supabase
    .from('recipes')
    .insert({
      user_id: user.id,
      title: payload.title.trim(),
      description: payload.description?.trim() ?? null,
      ingredients: payload.ingredients ?? [],
      directions: payload.directions ?? [],
      prep_time_mins: payload.prepTimeMins ?? null,
      cook_time_mins: payload.cookTimeMins ?? null,
      servings: payload.servings ?? null,
      source_url: payload.sourceUrl ?? null,
      image_url: payload.imageUrl ?? null,
      tags,
      notes: payload.notes?.trim() ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { recipe: mapRecipeRow(data as Record<string, unknown>) },
    { status: 201 }
  );
}
