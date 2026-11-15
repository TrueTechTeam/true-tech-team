'use client';

import { useEffect, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { FilePicker, type FileError } from '@true-tech-team/react-components';
import { listPortfolioAssets, uploadPortfolioAsset } from '../assets/upload';
import { maxSizeForKind } from '../assets/validate';
import type { PortfolioAsset } from '../assets/types';
import styles from './PropertyPanel.module.scss';

export interface ImageFieldProps {
  value: string;
  onChange: (url: string) => void;
  supabase: SupabaseClient;
  userId: string;
  label?: string;
  /** Accepted for call-site parity with the other fields; FilePicker's props do not expose `id`. */
  id?: string;
}

const ACCEPTED_IMAGE_MIME_TYPES = 'image/jpeg,image/png,image/webp,image/gif';
const MAX_IMAGE_BYTES = maxSizeForKind('image');

export function ImageField({
  value,
  onChange,
  supabase,
  userId,
  label = 'Image',
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

  async function handleFiles(files: File[]) {
    // FilePicker also reports an empty selection (every file was rejected, and `onError` follows
    // with the reasons), so there is nothing to upload and the error must not be cleared here.
    const file = files[0];
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

  function handleRejected(errors: FileError[]) {
    setUploadError(errors[0]?.message ?? 'That file cannot be uploaded');
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
      <FilePicker
        aria-label="Upload new image"
        accept={ACCEPTED_IMAGE_MIME_TYPES}
        maxSize={MAX_IMAGE_BYTES}
        showPreview={false}
        showFileList={false}
        onChange={handleFiles}
        onError={handleRejected}
      />
      {uploadError && <p className={styles.uploadError}>{uploadError}</p>}
    </div>
  );
}
