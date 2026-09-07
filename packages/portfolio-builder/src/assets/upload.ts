import type { SupabaseClient } from '@supabase/supabase-js';
import type { PortfolioAsset } from './types';
import { detectAssetKind, maxSizeForKind, sanitizeFilename } from './validate';

const BUCKET = 'portfolio-assets';
const TABLE = 'portfolio_assets';

interface PortfolioAssetRow {
  id: string;
  user_id: string;
  storage_path: string;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
  kind: 'image' | 'document';
  created_at: string;
}

function mapRow(row: PortfolioAssetRow, publicUrl: string): PortfolioAsset {
  return {
    id: row.id,
    userId: row.user_id,
    storagePath: row.storage_path,
    originalFilename: row.original_filename,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    kind: row.kind,
    createdAt: row.created_at,
    publicUrl,
  };
}

export async function uploadPortfolioAsset(
  supabase: SupabaseClient,
  userId: string,
  file: File
): Promise<PortfolioAsset> {
  const kind = detectAssetKind(file.type);
  if (!kind) {
    throw new Error(`Unsupported file type: ${file.type}`);
  }

  const maxSize = maxSizeForKind(kind);
  if (file.size > maxSize) {
    throw new Error(`File exceeds the ${maxSize / (1024 * 1024)}MB limit for ${kind} uploads`);
  }

  const assetId = crypto.randomUUID();
  const storagePath = `${userId}/${assetId}-${sanitizeFilename(file.name)}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storagePath, file);
  if (uploadError) {
    throw uploadError;
  }

  const { data: row, error: insertError } = await supabase
    .from(TABLE)
    .insert({
      id: assetId,
      user_id: userId,
      storage_path: storagePath,
      original_filename: file.name,
      mime_type: file.type,
      size_bytes: file.size,
      kind,
    })
    .select()
    .single();

  if (insertError || !row) {
    await supabase.storage.from(BUCKET).remove([storagePath]);
    throw insertError ?? new Error('Failed to record uploaded asset');
  }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return mapRow(row as PortfolioAssetRow, urlData.publicUrl);
}

export async function deletePortfolioAsset(
  supabase: SupabaseClient,
  assetId: string
): Promise<void> {
  const { data: row, error: selectError } = await supabase
    .from(TABLE)
    .select('storage_path')
    .eq('id', assetId)
    .single();

  if (selectError || !row) {
    throw selectError ?? new Error('Asset not found');
  }

  const { error: deleteRowError } = await supabase.from(TABLE).delete().eq('id', assetId);
  if (deleteRowError) {
    throw deleteRowError;
  }

  await supabase.storage.from(BUCKET).remove([(row as { storage_path: string }).storage_path]);
}

export async function listPortfolioAssets(
  supabase: SupabaseClient,
  userId: string
): Promise<PortfolioAsset[]> {
  const { data: rows, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !rows) {
    throw error ?? new Error('Failed to list assets');
  }

  return (rows as PortfolioAssetRow[]).map((row) => {
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(row.storage_path);
    return mapRow(row, urlData.publicUrl);
  });
}
