import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { PortfolioPreviewReceiver } from './PortfolioPreviewReceiver';
import { PREVIEW_READY_MESSAGE, PREVIEW_UPDATE_MESSAGE } from './messages';
import type { PortfolioPage } from '../schema/types';

function makePage(): PortfolioPage {
  return {
    schemaVersion: 2,
    slug: 'jtrue',
    title: 'Justin True',
    templateId: 'developer-01',
    sections: [
      {
        id: 'about',
        type: 'navbar',
        name: 'About',
        showInNav: false,
        props: { brand: 'Hello preview' },
      },
    ],
  };
}

describe('PortfolioPreviewReceiver', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends a ready message to window.parent on mount', () => {
    const postMessageSpy = vi.spyOn(window.parent, 'postMessage');
    render(<PortfolioPreviewReceiver />);
    expect(postMessageSpy).toHaveBeenCalledWith(
      { type: PREVIEW_READY_MESSAGE },
      window.location.origin
    );
  });

  it('renders nothing before any update message arrives', () => {
    render(<PortfolioPreviewReceiver />);
    expect(screen.queryByText('Hello preview')).not.toBeInTheDocument();
  });

  it('renders the received page after a same-origin update message', () => {
    render(<PortfolioPreviewReceiver />);
    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: window.location.origin,
          data: { type: PREVIEW_UPDATE_MESSAGE, page: makePage() },
        })
      );
    });
    expect(screen.getByText('Hello preview')).toBeInTheDocument();
  });

  it('ignores an update message from an unexpected origin', () => {
    render(<PortfolioPreviewReceiver />);
    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: 'https://evil.example.com',
          data: { type: PREVIEW_UPDATE_MESSAGE, page: makePage() },
        })
      );
    });
    expect(screen.queryByText('Hello preview')).not.toBeInTheDocument();
  });

  it('ignores an update message carrying a structurally invalid page', () => {
    render(<PortfolioPreviewReceiver />);
    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: window.location.origin,
          data: { type: PREVIEW_UPDATE_MESSAGE, page: { schemaVersion: 1 } },
        })
      );
    });
    expect(screen.queryByText('Hello preview')).not.toBeInTheDocument();
  });
});
