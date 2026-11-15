import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorComponent from './error';

describe('Error', () => {
  it('renders a generic error message', () => {
    render(<ErrorComponent error={new Error('boom')} reset={vi.fn()} />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('calls reset when the retry button is clicked', async () => {
    const reset = vi.fn();
    render(<ErrorComponent error={new Error('boom')} reset={reset} />);
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
