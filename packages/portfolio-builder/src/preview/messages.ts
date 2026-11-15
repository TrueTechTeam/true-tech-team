import type { PortfolioPage } from '../schema/types';

export const PREVIEW_READY_MESSAGE = 'portfolio-builder:preview-ready';
export const PREVIEW_UPDATE_MESSAGE = 'portfolio-builder:preview-update';

export interface PreviewReadyMessage {
  type: typeof PREVIEW_READY_MESSAGE;
}

export interface PreviewUpdateMessage {
  type: typeof PREVIEW_UPDATE_MESSAGE;
  page: PortfolioPage;
}

export function isPreviewReadyMessage(data: unknown): data is PreviewReadyMessage {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as { type?: unknown }).type === PREVIEW_READY_MESSAGE
  );
}

export function isPreviewUpdateMessage(data: unknown): data is PreviewUpdateMessage {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as { type?: unknown }).type === PREVIEW_UPDATE_MESSAGE
  );
}
