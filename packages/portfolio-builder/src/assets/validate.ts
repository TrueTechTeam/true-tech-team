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

const MAX_SANITIZED_FILENAME_LENGTH = 100;

export function sanitizeFilename(filename: string): string {
  const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  if (sanitized.length <= MAX_SANITIZED_FILENAME_LENGTH) {
    return sanitized;
  }

  const lastDotIndex = sanitized.lastIndexOf('.');
  const hasExtension = lastDotIndex > 0 && lastDotIndex < sanitized.length - 1;
  const extension = hasExtension ? sanitized.slice(lastDotIndex) : '';
  const base = hasExtension ? sanitized.slice(0, lastDotIndex) : sanitized;

  const maxBaseLength = Math.max(MAX_SANITIZED_FILENAME_LENGTH - extension.length, 0);
  return base.slice(0, maxBaseLength) + extension;
}
