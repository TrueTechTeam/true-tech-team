import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GlobalProvider } from '@true-tech-team/react-components';
import AdminUserRow from './AdminUserRow';
import type { UserUsageHistory } from '@true-tech-team/project-gateway';

const baseUser = {
  id: 'user-1',
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
};

const noop = () => {};

function renderRow(usageHistory?: UserUsageHistory) {
  return render(
    <GlobalProvider>
      <AdminUserRow
        user={baseUser}
        isCurrentUser={false}
        isAdmin={false}
        grantedSlugs={new Set()}
        usage={[]}
        usageHistory={usageHistory}
        onToggleAdmin={noop}
        onSaveAppAccess={noop}
      />
    </GlobalProvider>
  );
}

describe('AdminUserRow — AI usage cost', () => {
  it('shows no cost section when there is no usage history', () => {
    renderRow(undefined);
    expect(screen.queryByText(/total/i)).not.toBeInTheDocument();
  });

  it('shows the total cost and opens the daily breakdown dialog', () => {
    const history: UserUsageHistory = {
      totalCost: 1.23456,
      totalInputTokens: 200_000,
      totalOutputTokens: 40_000,
      daily: [{ date: '2026-09-01', cost: 1.23456, inputTokens: 200_000, outputTokens: 40_000 }],
    };
    renderRow(history);

    expect(screen.getByText('$1.23 (30d)')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /view usage/i }));

    expect(screen.getByText('2026-09-01')).toBeInTheDocument();
  });

  it('shows "—" for total cost when the model is unpriced', () => {
    const history: UserUsageHistory = {
      totalCost: null,
      totalInputTokens: 1000,
      totalOutputTokens: 1000,
      daily: [{ date: '2026-09-01', cost: null, inputTokens: 1000, outputTokens: 1000 }],
    };
    renderRow(history);

    expect(screen.getByText('— (30d)')).toBeInTheDocument();
  });
});
