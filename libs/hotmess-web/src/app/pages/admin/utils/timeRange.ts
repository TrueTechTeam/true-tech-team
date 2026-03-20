export const TIME_RANGE_OPTIONS = [
  { value: '3', label: 'Last 3 Months' },
  { value: '6', label: 'Last 6 Months' },
  { value: '12', label: 'Last 12 Months' },
  { value: 'all', label: 'All Time' },
];

export function getMonthsAgo(months: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d;
}
