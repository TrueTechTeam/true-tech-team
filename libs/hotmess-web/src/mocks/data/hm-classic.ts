export interface HMClassicEvent {
  id: string;
  name: string;
  date: string;
  location: string;
  status: 'upcoming' | 'registration-open' | 'completed';
  teamsRegistered: number;
  maxTeams: number;
  winner?: string;
  description: string;
}

export const hmClassicEvents: HMClassicEvent[] = [
  {
    id: 'hmc1',
    name: 'The HM Classic 2026',
    date: 'June 14, 2026',
    location: 'Nashville, TN',
    status: 'registration-open',
    teamsRegistered: 10,
    maxTeams: 24,
    description:
      'The 4th annual HM Classic returns to Nashville! Double-elimination kickball tournament with teams from all HotMess cities competing for the championship.',
  },
  {
    id: 'hmc2',
    name: 'The HM Classic 2025',
    date: 'June 21, 2025',
    location: 'Nashville, TN',
    status: 'completed',
    teamsRegistered: 20,
    maxTeams: 24,
    winner: 'Nash Bashers',
    description:
      'An incredible day of kickball with 20 teams battling it out. The Nash Bashers took home the trophy in an epic finals match.',
  },
  {
    id: 'hmc3',
    name: 'The HM Classic 2024',
    date: 'June 15, 2024',
    location: 'Nashville, TN',
    status: 'completed',
    teamsRegistered: 16,
    maxTeams: 16,
    winner: 'Kick Flips',
    description:
      'The second annual HM Classic saw 16 teams compete in a full day of kickball action. Kick Flips dominated the bracket.',
  },
  {
    id: 'hmc4',
    name: 'The HM Classic 2023',
    date: 'June 17, 2023',
    location: 'Nashville, TN',
    status: 'completed',
    teamsRegistered: 12,
    maxTeams: 12,
    winner: 'Ball Busters',
    description:
      'The inaugural HM Classic kicked off with 12 teams and set the stage for what has become an annual tradition.',
  },
];

export const nextClassic = hmClassicEvents.find(
  (e) => e.status === 'upcoming' || e.status === 'registration-open'
);

export const pastClassics = hmClassicEvents.filter((e) => e.status === 'completed');
