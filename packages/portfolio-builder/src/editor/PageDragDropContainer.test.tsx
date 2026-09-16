import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageDragDropContainer } from './PageDragDropContainer';

describe('PageDragDropContainer', () => {
  it('renders its children inside a DndProvider', () => {
    render(
      <PageDragDropContainer>
        <p>Canvas content</p>
      </PageDragDropContainer>
    );
    expect(screen.getByText('Canvas content')).toBeInTheDocument();
  });
});
