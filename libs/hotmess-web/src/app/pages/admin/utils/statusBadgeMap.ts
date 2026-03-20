type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const STATUS_BADGE_MAP: Record<string, BadgeVariant> = {
  active: 'success',
  registration: 'warning',
  completed: 'neutral',
  inactive: 'neutral',
  draft: 'neutral',
  scheduled: 'warning',
  sent: 'success',
  confirmed: 'success',
  pending: 'warning',
};

export function getStatusBadgeVariant(status: string): BadgeVariant {
  return STATUS_BADGE_MAP[status] ?? 'neutral';
}
