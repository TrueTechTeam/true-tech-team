import { featureFlags } from '../lib/feature-flags';
import { useMockUpcomingLeagues } from '../mocks/hooks/useMockSupabaseQuery';
import { useSupabaseQuery } from './useSupabaseQuery';

const USE_MOCK = featureFlags.useMockData;

export function useUpcomingLeagues() {
  const mock = useMockUpcomingLeagues();
  const real = useSupabaseQuery<
    Array<{
      id: string;
      name: string;
      status: string;
      season_start_date: string;
      registration_start_date: string;
      registration_end_date: string;
      league_id: string;
      leagues: {
        name: string;
        cities: { name: string; state: string };
        sports: { name: string };
      };
    }>
  >('seasons', {
    select: '*, leagues(name, cities(name, state), sports(name))',
    filter: [{ column: 'status', value: 'registration' }],
    orderBy: { column: 'season_start_date', ascending: true },
    limit: 6,
    enabled: !USE_MOCK,
  });

  return USE_MOCK ? mock : real;
}
