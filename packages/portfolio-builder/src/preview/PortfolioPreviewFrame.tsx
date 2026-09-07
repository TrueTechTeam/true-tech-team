'use client';

import { useEffect, useRef, useState } from 'react';
import {
  PREVIEW_READY_MESSAGE,
  PREVIEW_UPDATE_MESSAGE,
  type PreviewReadyMessage,
  type PreviewUpdateMessage,
} from './messages';
import type { PortfolioPage } from '../schema/types';

export interface PortfolioPreviewFrameProps {
  page: PortfolioPage;
  previewPath?: string;
}

export function PortfolioPreviewFrame({
  page,
  previewPath = '/portfolio-builder/preview',
}: PortfolioPreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) {
        return;
      }
      const data = event.data as PreviewReadyMessage;
      if (data?.type === PREVIEW_READY_MESSAGE) {
        setIsReady(true);
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (!isReady || !iframeRef.current?.contentWindow) {
      return;
    }
    const message: PreviewUpdateMessage = { type: PREVIEW_UPDATE_MESSAGE, page };
    iframeRef.current.contentWindow.postMessage(message, window.location.origin);
  }, [isReady, page]);

  return (
    <iframe
      ref={iframeRef}
      src={previewPath}
      title="Portfolio preview"
      style={{ width: '100%', height: '100%', border: 'none' }}
    />
  );
}
