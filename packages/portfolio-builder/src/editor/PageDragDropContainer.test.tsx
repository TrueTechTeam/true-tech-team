import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useDndContextOptional } from '@true-tech-team/react-components';
import { PageDragDropContainer } from './PageDragDropContainer';

/** Reports whether a real `DndProvider` context is reachable from where it's rendered.
 * `useDndContextOptional` returns `null` outside a provider, so this distinguishes "the children
 * rendered" from "the children rendered *inside a working DndProvider*" - which, after this
 * component shrank to a bare provider wrapper, is its entire remaining purpose. */
function DndContextProbe() {
  const context = useDndContextOptional();
  return <span data-testid="dnd-context">{context ? 'provided' : 'missing'}</span>;
}

describe('PageDragDropContainer', () => {
  it('renders its children inside a DndProvider', () => {
    render(
      <PageDragDropContainer>
        <p>Canvas content</p>
        <DndContextProbe />
      </PageDragDropContainer>
    );
    expect(screen.getByText('Canvas content')).toBeInTheDocument();
    expect(screen.getByTestId('dnd-context')).toHaveTextContent('provided');
  });

  it('a child rendered without the container has no drag context (pins the assertion above)', () => {
    render(<DndContextProbe />);
    expect(screen.getByTestId('dnd-context')).toHaveTextContent('missing');
  });
});
