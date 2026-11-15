'use client';

import { useEffect, useRef } from 'react';
import {
  PREVIEW_UPDATE_MESSAGE,
  isPreviewReadyMessage,
  type PreviewUpdateMessage,
} from './messages';
import type { PortfolioPage } from '../schema/types';

export interface PortfolioPreviewFrameProps {
  page: PortfolioPage;
  previewPath?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function PortfolioPreviewFrame({
  page,
  previewPath = '/portfolio-preview',
  className,
  style,
}: PortfolioPreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const pageRef = useRef(page);
  const hasReceivedReadyRef = useRef(false);
  pageRef.current = page;

  useEffect(() => {
    function postUpdate() {
      const contentWindow = iframeRef.current?.contentWindow;
      if (!contentWindow) {
        return;
      }
      const message: PreviewUpdateMessage = {
        type: PREVIEW_UPDATE_MESSAGE,
        page: pageRef.current,
      };
      contentWindow.postMessage(message, window.location.origin);
    }

    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) {
        return;
      }
      if (event.source !== iframeRef.current?.contentWindow) {
        return;
      }
      if (isPreviewReadyMessage(event.data)) {
        // Always post on every ready message, not just the first ever received -
        // the iframe may reload and re-announce readiness.
        hasReceivedReadyRef.current = true;
        postUpdate();
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    // Don't push before the iframe has ever signalled ready - it isn't listening yet.
    if (!hasReceivedReadyRef.current) {
      return;
    }
    const contentWindow = iframeRef.current?.contentWindow;
    if (!contentWindow) {
      return;
    }
    const message: PreviewUpdateMessage = { type: PREVIEW_UPDATE_MESSAGE, page };
    contentWindow.postMessage(message, window.location.origin);
  }, [page]);

  return (
    <iframe
      ref={iframeRef}
      src={previewPath}
      title="Portfolio preview"
      className={className}
      style={{ width: '100%', height: '100%', border: 'none', ...style }}
    />
  );
}
