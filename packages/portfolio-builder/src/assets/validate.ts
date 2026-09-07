const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const DOCUMENT_MIME_TYPES = ['application/pdf'];

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024;

export function detectAssetKind(mimeType: string): 'image' | 'document' | null {
  if (IMAGE_MIME_TYPES.includes(mimeType)) {
    return 'image';
  }
  if (DOCUMENT_MIME_TYPES.includes(mimeType)) {
    return 'document';
  }
  return null;
}

export function maxSizeForKind(kind: 'image' | 'document'): number {
  return kind === 'image' ? MAX_IMAGE_SIZE_BYTES : MAX_DOCUMENT_SIZE_BYTES;
}

export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
}
