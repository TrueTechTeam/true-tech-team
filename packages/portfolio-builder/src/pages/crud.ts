import type { SupabaseClient } from '@supabase/supabase-js';
import type { PortfolioPage } from '../schema/types';
import type { PortfolioPageRecord } from './types';
import { mapRowToRecord, pageToColumns, type PortfolioPageRow } from './mapping';

const TABLE = 'portfolio_pages';

export async function savePortfolioPage(
  supabase: SupabaseClient,
  userId: string,
  page: PortfolioPage,
  existingId?: string
): Promise<PortfolioPageRecord> {
  const columns = pageToColumns(userId, page);

  if (existingId) {
    const { data: row, error } = await supabase
      .from(TABLE)
      .update(columns)
      .eq('id', existingId)
      .select()
      .single();
    if (error || !row) {
      throw error ?? new Error('Failed to update portfolio page');
    }
    return mapRowToRecord(row as PortfolioPageRow);
  }

  const { data: row, error } = await supabase.from(TABLE).insert(columns).select().single();
  if (error || !row) {
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
