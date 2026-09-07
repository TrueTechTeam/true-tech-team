import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { PortfolioPreviewFrame } from './PortfolioPreviewFrame';
import { PREVIEW_READY_MESSAGE, PREVIEW_UPDATE_MESSAGE } from './messages';
import type { PortfolioPage } from '../schema/types';

function makePage(): PortfolioPage {
  return {
    schemaVersion: 1,
    slug: 'jtrue',
    title: 'Justin True',
    templateId: 'developer-01',
    showNav: true,
    sections: [],
  };
}

describe('PortfolioPreviewFrame', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders an iframe pointed at the given previewPath', () => {
    render(<PortfolioPreviewFrame page={makePage()} previewPath="/custom-preview" />);
    const iframe = screen.getByTitle('Portfolio preview') as HTMLIFrameElement;
    expect(iframe.getAttribute('src')).toBe('/custom-preview');
  });

  it('defaults previewPath to /portfolio-builder/preview', () => {
    render(<PortfolioPreviewFrame page={makePage()} />);
    const iframe = screen.getByTitle('Portfolio preview') as HTMLIFrameElement;
    expect(iframe.getAttribute('src')).toBe('/portfolio-builder/preview');
  });

  it('does not post an update before the iframe signals ready', () => {
    render(<PortfolioPreviewFrame page={makePage()} />);
    const iframe = screen.getByTitle('Portfolio preview') as HTMLIFrameElement;
    const postMessageSpy = vi.spyOn(iframe.contentWindow as Window, 'postMessage');
    expect(postMessageSpy).not.toHaveBeenCalled();
  });

  it('posts the page to the iframe after receiving the ready message', () => {
    render(<PortfolioPreviewFrame page={makePage()} />);
    const iframe = screen.getByTitle('Portfolio preview') as HTMLIFrameElement;
    const postMessageSpy = vi.spyOn(iframe.contentWindow as Window, 'postMessage');

    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: window.location.origin,
          data: { type: PREVIEW_READY_MESSAGE },
        })
      );
    });

    expect(postMessageSpy).toHaveBeenCalledWith(
      { type: PREVIEW_UPDATE_MESSAGE, page: makePage() },
      window.location.origin
    );
  });
});
