import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ImageField } from './ImageField';
import * as assets from '../assets/upload';
import type { PortfolioAsset } from '../assets/types';

const fakeSupabase = {} as SupabaseClient;

function makeAsset(overrides: Partial<PortfolioAsset> = {}): PortfolioAsset {
  return {
    id: 'a1',
    userId: 'user-1',
    storagePath: 'user-1/a1.png',
    originalFilename: 'a1.png',
    mimeType: 'image/png',
    sizeBytes: 1000,
    kind: 'image',
    createdAt: '2026-01-01T00:00:00.000Z',
    publicUrl: 'https://cdn.example.com/a1.png',
    ...overrides,
  };
}

describe('ImageField', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('lists only image-kind assets as thumbnails', async () => {
    vi.spyOn(assets, 'listPortfolioAssets').mockResolvedValue([
      makeAsset({ id: 'img1', kind: 'image', publicUrl: 'https://cdn.example.com/img1.png' }),
      makeAsset({ id: 'doc1', kind: 'document', publicUrl: 'https://cdn.example.com/doc1.pdf' }),
    ]);
    render(<ImageField value="" onChange={vi.fn()} supabase={fakeSupabase} userId="user-1" />);
    await waitFor(() => expect(screen.getByAltText('a1.png')).toBeInTheDocument());
    expect(screen.queryByAltText('doc1.pdf')).not.toBeInTheDocument();
  });

  it('calls onChange with the asset publicUrl when a thumbnail is clicked', async () => {
    const asset = makeAsset({ publicUrl: 'https://cdn.example.com/picked.png' });
    vi.spyOn(assets, 'listPortfolioAssets').mockResolvedValue([asset]);
    const onChange = vi.fn();
    render(<ImageField value="" onChange={onChange} supabase={fakeSupabase} userId="user-1" />);
    const thumb = await screen.findByAltText('a1.png');
    fireEvent.click(thumb);
    expect(onChange).toHaveBeenCalledWith('https://cdn.example.com/picked.png');
  });

  it('uploads a new file and selects the result', async () => {
    vi.spyOn(assets, 'listPortfolioAssets').mockResolvedValue([]);
    const uploaded = makeAsset({ publicUrl: 'https://cdn.example.com/new.png' });
    vi.spyOn(assets, 'uploadPortfolioAsset').mockResolvedValue(uploaded);
    const onChange = vi.fn();
    render(<ImageField value="" onChange={onChange} supabase={fakeSupabase} userId="user-1" />);
    const file = new File(['x'], 'new.png', { type: 'image/png' });
    const input = await screen.findByLabelText('Upload new image');
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => expect(onChange).toHaveBeenCalledWith('https://cdn.example.com/new.png'));
    expect(assets.uploadPortfolioAsset).toHaveBeenCalledWith(fakeSupabase, 'user-1', file);
  });

  it('shows an error message and does not crash when uploadPortfolioAsset rejects', async () => {
    vi.spyOn(assets, 'listPortfolioAssets').mockResolvedValue([]);
    vi.spyOn(assets, 'uploadPortfolioAsset').mockRejectedValue(
      new Error('Unsupported file type: image/heic')
    );
    const onChange = vi.fn();
    render(<ImageField value="" onChange={onChange} supabase={fakeSupabase} userId="user-1" />);
    const file = new File(['x'], 'new.heic', { type: 'image/heic' });
    const input = await screen.findByLabelText('Upload new image');
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() =>
      expect(screen.getByText('Unsupported file type: image/heic')).toBeInTheDocument()
    );
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not crash when listPortfolioAssets rejects', async () => {
    vi.spyOn(assets, 'listPortfolioAssets').mockRejectedValue(new Error('network error'));
    render(<ImageField value="" onChange={vi.fn()} supabase={fakeSupabase} userId="user-1" />);
    await waitFor(() => expect(screen.getByText("Couldn't load your images")).toBeInTheDocument());
  });
});
