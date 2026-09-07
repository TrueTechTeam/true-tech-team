import { describe, it, expect } from 'vitest';
import { detectAssetKind, maxSizeForKind, sanitizeFilename } from './validate';

describe('detectAssetKind', () => {
  it('detects image MIME types', () => {
    expect(detectAssetKind('image/jpeg')).toBe('image');
    expect(detectAssetKind('image/png')).toBe('image');
    expect(detectAssetKind('image/webp')).toBe('image');
    expect(detectAssetKind('image/gif')).toBe('image');
  });

  it('detects document MIME types', () => {
    expect(detectAssetKind('application/pdf')).toBe('document');
  });

  it('returns null for unsupported types', () => {
    expect(detectAssetKind('application/zip')).toBeNull();
    expect(detectAssetKind('text/plain')).toBeNull();
  });
});

describe('maxSizeForKind', () => {
  it('returns 5MB for images', () => {
    expect(maxSizeForKind('image')).toBe(5 * 1024 * 1024);
  });

  it('returns 10MB for documents', () => {
    expect(maxSizeForKind('document')).toBe(10 * 1024 * 1024);
  });
});

describe('sanitizeFilename', () => {
  it('replaces unsafe characters with underscores', () => {
    expect(sanitizeFilename('my photo (1).jpg')).toBe('my_photo__1_.jpg');
  });

  it('leaves safe characters unchanged', () => {
    expect(sanitizeFilename('resume-2024.pdf')).toBe('resume-2024.pdf');
  });
});
