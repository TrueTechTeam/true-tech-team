'use client';

import { useEffect, useState } from 'react';
import { GlobalProvider } from '@true-tech-team/react-components';
import { PageRenderer } from '../render/PageRenderer';
import { resolveEffectiveTheme } from '../themes/resolveTheme';
import {
  PREVIEW_READY_MESSAGE,
  PREVIEW_UPDATE_MESSAGE,
  type PreviewReadyMessage,
  type PreviewUpdateMessage,
} from './messages';
import type { PortfolioPage } from '../schema/types';

export function PortfolioPreviewReceiver() {
  const [page, setPage] = useState<PortfolioPage | null>(null);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) {
        return;
      }
      const data = event.data as PreviewUpdateMessage;
      if (data?.type === PREVIEW_UPDATE_MESSAGE) {
        setPage(data.page);
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

  return (
    <GlobalProvider themeConfig={{ theme: resolveEffectiveTheme(page) }}>
      <PageRenderer page={page} />
    </GlobalProvider>
  );
}
