import type { BreadcrumbItemConfig } from '@true-tech-team/ui-components';

/**
 * Build breadcrumb items for admin pages.
 * The last item is automatically marked `current: true`.
 */
export function buildAdminBreadcrumbs(
  items: Array<{ label: string; href?: string }>
): BreadcrumbItemConfig[] {
  return [
    { label: 'Dashboard', href: '/admin/dashboard' },
    ...items.map((item, idx) => ({
      label: item.label,
      href: idx === items.length - 1 ? undefined : item.href,
      current: idx === items.length - 1,
    })),
  ];
}
