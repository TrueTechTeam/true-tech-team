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
}

export function ImageField({
  value,
  onChange,
  supabase,
  userId,
  label = 'Image',
}: ImageFieldProps) {
  const [assetList, setAssetList] = useState<PortfolioAsset[]>([]);

  useEffect(() => {
    let cancelled = false;
    listPortfolioAssets(supabase, userId).then((result) => {
      if (!cancelled) {
        setAssetList(result.filter((asset) => asset.kind === 'image'));
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
    const uploaded = await uploadPortfolioAsset(supabase, userId, file);
    setAssetList((current) => [uploaded, ...current]);
    onChange(uploaded.publicUrl);
  }

  return (
    <div className={styles.imageField}>
      <p>{label}</p>
      <div className={styles.thumbnailGrid}>
        {assetList.map((asset) => (
          <button
            key={asset.id}
            type="button"
            className={asset.publicUrl === value ? styles.thumbnailSelected : styles.thumbnail}
            onClick={() => onChange(asset.publicUrl)}
          >
            <img src={asset.publicUrl} alt={asset.originalFilename} />
          </button>
        ))}
      </div>
      <label htmlFor="image-field-upload">Upload new image</label>
      <input id="image-field-upload" type="file" accept="image/*" onChange={handleUpload} />
    </div>
  );
}
