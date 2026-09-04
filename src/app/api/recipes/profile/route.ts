import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import { mapProfileRow, type RecipeProfilePayload } from '../../../../lib/recipes/types';

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('recipe_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    profile: data ? mapProfileRow(data as Record<string, unknown>) : null,
  });
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: RecipeProfilePayload;
  try {
    payload = (await request.json()) as RecipeProfilePayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('recipe_profiles')
    .upsert(
      {
        user_id: user.id,
        dietary_needs: payload.dietaryNeeds ?? [],
        preferences: payload.preferences ?? [],
        goals: payload.goals ?? [],
        preferred_sites: payload.preferredSites ?? [],
        subscription_sites: payload.subscriptionSites ?? [],
        additional_notes: payload.additionalNotes ?? null,
      },
      { onConflict: 'user_id' }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile: mapProfileRow(data as Record<string, unknown>) });
}
