import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { PortfolioPreviewFrame } from './PortfolioPreviewFrame';
import { PREVIEW_READY_MESSAGE, PREVIEW_UPDATE_MESSAGE } from './messages';
import type { PortfolioPage } from '../schema/types';

function makePage(): PortfolioPage {
  return {
    schemaVersion: 2,
    slug: 'jtrue',
    title: 'Justin True',
    templateId: 'developer-01',
    sections: [],
  };
}

function dispatchReady(source: MessageEventSource | null) {
  window.dispatchEvent(
    new MessageEvent('message', {
      origin: window.location.origin,
      data: { type: PREVIEW_READY_MESSAGE },
      source,
    })
  );
}

/**
 * jsdom (and React's act()) flushes mount effects synchronously inside render(),
 * so a postMessage spy installed on `iframe.contentWindow` AFTER render() can never
 * observe a call made during mount - it would already have happened. To genuinely
 * assert "nothing posted on mount", intercept the `contentWindow` getter itself
 * (installed before render) so the spy exists at the moment the component's own
 * effects first read `iframeRef.current?.contentWindow`.
 */
function spyOnContentWindowPostMessageBeforeMount() {
  const descriptor = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'contentWindow');
  const originalGet = descriptor!.get!;
  let spy: ReturnType<typeof vi.spyOn> | undefined;
  vi.spyOn(HTMLIFrameElement.prototype, 'contentWindow', 'get').mockImplementation(function (
    this: HTMLIFrameElement
  ) {
    const contentWindow = originalGet.call(this);
    if (contentWindow && !spy) {
      spy = vi.spyOn(contentWindow, 'postMessage');
    }
    return contentWindow;
  });
  return () => spy;
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

  it('does not post an update before any ready message is received', () => {
    const page = makePage();
    // Install the spy before render so a mount-time post (if the ready-gate were
    // deleted) would actually be observed, not missed because it already fired.
    const getSpy = spyOnContentWindowPostMessageBeforeMount();
    render(<PortfolioPreviewFrame page={page} />);
    const postMessageSpy = getSpy();
    // The correct implementation never even reads `contentWindow` before a ready
    // message arrives, so the spy may never get installed (undefined) - but if it
    // *is* installed (e.g. the ready-gate was removed), it must not have been called.
    expect(postMessageSpy === undefined || postMessageSpy.mock.calls.length === 0).toBe(true);
  });

  it('posts the current page to the iframe after receiving a ready message', () => {
    const page = makePage();
    render(<PortfolioPreviewFrame page={page} />);
    const iframe = screen.getByTitle('Portfolio preview') as HTMLIFrameElement;
    const postMessageSpy = vi.spyOn(iframe.contentWindow as Window, 'postMessage');

    act(() => {
      dispatchReady(iframe.contentWindow);
    });

    expect(postMessageSpy).toHaveBeenCalledWith(
      { type: PREVIEW_UPDATE_MESSAGE, page },
      window.location.origin
    );
  });

  it('ignores a ready message from an unexpected origin', () => {
    const page = makePage();
    render(<PortfolioPreviewFrame page={page} />);
    const iframe = screen.getByTitle('Portfolio preview') as HTMLIFrameElement;
    const postMessageSpy = vi.spyOn(iframe.contentWindow as Window, 'postMessage');

    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: 'https://evil.example.com',
          data: { type: PREVIEW_READY_MESSAGE },
          source: iframe.contentWindow,
        })
      );
    });

    expect(postMessageSpy).not.toHaveBeenCalled();
  });

  it("ignores a ready message whose source isn't this frame's own iframe", () => {
    const page = makePage();
    render(<PortfolioPreviewFrame page={page} />);
    const iframe = screen.getByTitle('Portfolio preview') as HTMLIFrameElement;
    const postMessageSpy = vi.spyOn(iframe.contentWindow as Window, 'postMessage');

    act(() => {
      // A message claiming to be ready, but originating from some other window
      // (e.g. a second PortfolioPreviewFrame instance's iframe).
      dispatchReady(window);
    });

    expect(postMessageSpy).not.toHaveBeenCalled();
  });

  it('posts an updated page again after the page prop changes once already ready', () => {
    const initialPage = makePage();
    const { rerender } = render(<PortfolioPreviewFrame page={initialPage} />);
    const iframe = screen.getByTitle('Portfolio preview') as HTMLIFrameElement;
    const postMessageSpy = vi.spyOn(iframe.contentWindow as Window, 'postMessage');

    act(() => {
      dispatchReady(iframe.contentWindow);
    });
    expect(postMessageSpy).toHaveBeenCalledWith(
      { type: PREVIEW_UPDATE_MESSAGE, page: initialPage },
      window.location.origin
    );

    const updatedPage: PortfolioPage = { ...initialPage, title: 'Updated Title' };
    rerender(<PortfolioPreviewFrame page={updatedPage} />);

    expect(postMessageSpy).toHaveBeenLastCalledWith(
      { type: PREVIEW_UPDATE_MESSAGE, page: updatedPage },
      window.location.origin
    );
  });

  it('posts the current page again on a second ready message (e.g. after an iframe reload)', () => {
    const page = makePage();
    render(<PortfolioPreviewFrame page={page} />);
    const iframe = screen.getByTitle('Portfolio preview') as HTMLIFrameElement;
    const postMessageSpy = vi.spyOn(iframe.contentWindow as Window, 'postMessage');

    act(() => {
      dispatchReady(iframe.contentWindow);
    });
    expect(postMessageSpy).toHaveBeenCalledTimes(1);

    act(() => {
      dispatchReady(iframe.contentWindow);
    });
    expect(postMessageSpy).toHaveBeenCalledTimes(2);
    expect(postMessageSpy).toHaveBeenLastCalledWith(
      { type: PREVIEW_UPDATE_MESSAGE, page },
      window.location.origin
    );
  });
});
