'use client';

import { useEffect, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { listPortfolioAssets, uploadPortfolioAsset } from '../assets/upload';
import type { PortfolioAsset } from '../assets/types';
import styles from './PropertyPanel.module.scss';

export interface ImageFieldProps {
  value: string;
  onChange: (url: string) => void;
  supabase: SupabaseClient;
  userId: string;
  label?: string;
  id?: string;
}

const ACCEPTED_IMAGE_MIME_TYPES = 'image/jpeg,image/png,image/webp,image/gif';

export function ImageField({
  value,
  onChange,
  supabase,
  userId,
  label = 'Image',
  id = 'image-field-upload',
}: ImageFieldProps) {
  const [assetList, setAssetList] = useState<PortfolioAsset[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listPortfolioAssets(supabase, userId)
      .then((result) => {
        if (!cancelled) {
          setAssetList(result.filter((asset) => asset.kind === 'image'));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUploadError("Couldn't load your images");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [supabase, userId]);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setUploadError(null);
    try {
      const uploaded = await uploadPortfolioAsset(supabase, userId, file);
      setAssetList((current) => [uploaded, ...current]);
      onChange(uploaded.publicUrl);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to upload image');
    }
  }

  return (
    <div className={styles.imageField}>
      <p>{label}</p>
      <div className={styles.thumbnailGrid}>
        {assetList.map((asset) => (
          <button
            key={asset.id}
            type="button"
            aria-pressed={asset.publicUrl === value}
            className={asset.publicUrl === value ? styles.thumbnailSelected : styles.thumbnail}
            onClick={() => onChange(asset.publicUrl)}
          >
            <img src={asset.publicUrl} alt={asset.originalFilename} />
          </button>
        ))}
      </div>
      <label htmlFor={id}>Upload new image</label>
      <input id={id} type="file" accept={ACCEPTED_IMAGE_MIME_TYPES} onChange={handleUpload} />
      {uploadError && <p className={styles.uploadError}>{uploadError}</p>}
    </div>
  );
}
