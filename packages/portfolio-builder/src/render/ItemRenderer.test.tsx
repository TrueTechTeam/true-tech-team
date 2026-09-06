import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ItemRenderer } from './ItemRenderer';
import type { GridItem } from '../schema/types';

describe('ItemRenderer', () => {
  it('renders a known, validly-configured component', () => {
    const item: GridItem = {
      id: 'item-1',
      component: 'heading',
      span: 6,
      props: { text: 'Hello' },
    };
    render(<ItemRenderer item={item} />);
    expect(screen.getByRole('heading')).toHaveTextContent('Hello');
  });

  it('sets the responsive span CSS custom properties', () => {
    const item: GridItem = { id: 'item-1', component: 'heading', span: 4, props: { text: 'Hi' } };
    render(<ItemRenderer item={item} />);
    const wrapper = screen.getByRole('heading').parentElement;
    expect(wrapper).toHaveStyle({
      '--span-desktop': '4',
      '--span-tablet': '6',
      '--span-mobile': '12',
    });
  });

  it('renders a placeholder for an unknown component type', () => {
    // @ts-expect-error -- deliberately invalid for the test
    const item: GridItem = { id: 'item-1', component: 'not-a-real-component', span: 6, props: {} };
    render(<ItemRenderer item={item} />);
    expect(screen.getByTestId('item-1')).toHaveAttribute('data-placeholder', 'true');
  });

  it('renders a placeholder when props fail validation', () => {
    const item: GridItem = { id: 'item-1', component: 'heading', span: 6, props: {} };
    render(<ItemRenderer item={item} />);
    expect(screen.getByTestId('item-1')).toHaveAttribute('data-placeholder', 'true');
  });
});
