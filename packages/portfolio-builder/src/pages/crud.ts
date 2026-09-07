import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import type { PortfolioPage } from '../schema/types';
import { validatePortfolioPage } from '../schema/validate';
import type { PortfolioPageRecord } from './types';
import { mapRowToRecord, pageToColumns, type PortfolioPageRow } from './mapping';

const TABLE = 'portfolio_pages';

/** Postgres error code for a unique-constraint violation. */
const UNIQUE_VIOLATION = '23505';

function isUniqueViolation(error: unknown): error is PostgrestError {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { code?: unknown }).code === UNIQUE_VIOLATION
  );
}

export async function savePortfolioPage(
  supabase: SupabaseClient,
  userId: string,
  page: PortfolioPage,
  existingId?: string
): Promise<PortfolioPageRecord> {
  const result = validatePortfolioPage(page);
  if (!result.valid) {
    throw new Error(`Invalid portfolio page: ${result.errors.join('; ')}`);
  }

  const columns = pageToColumns(userId, page);

  if (existingId !== undefined) {
    const { data: row, error } = await supabase
      .from(TABLE)
      .update(columns)
      .eq('id', existingId)
      .eq('user_id', userId)
      .select()
      .single();
    if (error || !row) {
      if (isUniqueViolation(error)) {
        throw new Error('That slug is already taken. Please choose a different one.');
      }
      throw error ?? new Error('Failed to update portfolio page');
    }
    return mapRowToRecord(row as PortfolioPageRow);
  }

  const { data: row, error } = await supabase.from(TABLE).insert(columns).select().single();
  if (error || !row) {
    if (isUniqueViolation(error)) {
      throw new Error('That slug is already taken. Please choose a different one.');
    }
    throw error ?? new Error('Failed to create portfolio page');
  }
  return mapRowToRecord(row as PortfolioPageRow);
}

export async function loadPortfolioPage(
  supabase: SupabaseClient,
  id: string
): Promise<PortfolioPageRecord | null> {
  const { data: row, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
  if (error) {
    throw error;
  }
  return row ? mapRowToRecord(row as PortfolioPageRow) : null;
}

export async function listPortfolioPages(
  supabase: SupabaseClient,
  userId: string
): Promise<PortfolioPageRecord[]> {
  const { data: rows, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  if (error || !rows) {
    throw error ?? new Error('Failed to list portfolio pages');
  }
  return (rows as PortfolioPageRow[]).map(mapRowToRecord);
}

export async function deletePortfolioPage(supabase: SupabaseClient, id: string): Promise<void> {
  const { data: deletedRows, error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', id)
    .select('id');
  if (error) {
    throw error;
  }
  if (!deletedRows || (deletedRows as unknown[]).length === 0) {
    throw new Error('Portfolio page could not be deleted');
  }
}

export async function setPortfolioPagePublished(
  supabase: SupabaseClient,
  id: string,
  published: boolean
): Promise<PortfolioPageRecord> {
  const { data: row, error } = await supabase
    .from(TABLE)
    .update({ published })
    .eq('id', id)
    .select()
    .single();
  if (error || !row) {
    throw error ?? new Error('Failed to update publish status');
  }
  return mapRowToRecord(row as PortfolioPageRow);
}

/**
 * Checks whether `slug` is free to claim, from THIS caller's point of view. Because this query
 * runs under RLS as a user-scoped client, it can only see rows the caller may read — their own
 * rows, plus any row that is currently published. If another user holds `slug` on an unpublished
 * draft, this may incorrectly report the slug as available; the database's UNIQUE constraint on
 * `slug` is the actual source of truth and will reject the eventual insert/update with a
 * `duplicate key value violates unique constraint` error (Postgres code 23505) — see
 * `savePortfolioPage`, which surfaces that case with a friendlier message.
 */
export async function checkSlugAvailable(
  supabase: SupabaseClient,
  slug: string,
  excludePageId?: string
): Promise<boolean> {
  let query = supabase.from(TABLE).select('id').eq('slug', slug);
  if (excludePageId) {
    query = query.neq('id', excludePageId);
  }
  const { data: rows, error } = await query;
  if (error) {
    throw error;
  }
  return !rows || (rows as unknown[]).length === 0;
}
