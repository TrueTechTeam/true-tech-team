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
