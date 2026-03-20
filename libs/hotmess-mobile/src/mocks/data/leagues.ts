import { mockCities } from './cities';
import { mockSports } from './sports';

export const mockLeagues = mockCities.flatMap((city) =>
  mockSports.map((sport) => ({
    id: `league-${city.slug}-${sport.slug}`,
    name: `${city.name} ${sport.name}`,
    city_id: city.id,
    sport_id: sport.id,
    is_active: true,
    cities: { name: city.name, state: city.state },
    sports: { name: sport.name, config: sport.config },
  }))
);
