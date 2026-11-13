'use client';

import { useEffect, useState } from 'react';
import { ThemedPageView } from '../render/ThemedPageView';
import {
  PREVIEW_READY_MESSAGE,
  isPreviewUpdateMessage,
  type PreviewReadyMessage,
} from './messages';
import { validatePortfolioPage } from '../schema/validate';
import type { PortfolioPage } from '../schema/types';

export function PortfolioPreviewReceiver() {
  const [page, setPage] = useState<PortfolioPage | null>(null);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) {
        return;
      }
      if (isPreviewUpdateMessage(event.data) && validatePortfolioPage(event.data.page).valid) {
        setPage(event.data.page);
      }
    }

    window.addEventListener('message', handleMessage);
    const readyMessage: PreviewReadyMessage = { type: PREVIEW_READY_MESSAGE };
    window.parent.postMessage(readyMessage, window.location.origin);

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (!page) {
    return null;
  }

  return <ThemedPageView page={page} />;
}
