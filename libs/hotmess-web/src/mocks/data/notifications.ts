export interface MockNotification {
  id: string;
  title: string;
  message: string;
  target: 'all' | 'city' | 'league' | 'team';
  target_id?: string;
  target_name?: string;
  sent_date: string;
  status: 'sent' | 'scheduled' | 'draft';
}

export const mockNotifications: MockNotification[] = [
  {
    id: 'notif-001',
    title: 'Spring 2026 Registration is Open!',
    message:
      'Registration for all Spring 2026 leagues is now open. Sign up early to secure your spot — teams are filling up fast!',
    target: 'all',
    sent_date: '2026-02-01T10:00:00Z',
    status: 'sent',
  },
  {
    id: 'notif-002',
    title: 'Nashville Kickball Schedule Released',
    message:
      'The Spring 2026 Nashville Kickball schedule is live! Check your team page for game times and venues.',
    target: 'league',
    target_id: 'league-nashville-kickball',
    target_name: 'Nashville Kickball',
    sent_date: '2026-02-05T14:00:00Z',
    status: 'sent',
  },
  {
    id: 'notif-003',
    title: 'Weather Delay - St. Pete Sand Volleyball',
    message:
      'Due to thunderstorms, all St. Pete Sand Volleyball games on Feb 12 have been postponed to Feb 19. Same times and venues.',
    target: 'league',
    target_id: 'league-st-pete-sand-volleyball',
    target_name: 'St. Pete Sand Volleyball',
    sent_date: '2026-02-10T09:30:00Z',
    status: 'sent',
  },
  {
    id: 'notif-004',
    title: 'Captain Reminder: Rosters Due Friday',
    message:
      'Team captains, please finalize your rosters by this Friday at 11:59 PM. Any unfilled spots will be opened to free agents.',
    target: 'all',
    sent_date: '2026-02-12T08:00:00Z',
    status: 'scheduled',
  },
  {
    id: 'notif-005',
    title: 'Welcome to Hot Mess, Miami!',
    message:
      'We are thrilled to announce Hot Mess Sports is expanding to Miami! Kickball and Sand Volleyball leagues start this spring.',
    target: 'city',
    target_id: 'city-miami',
    target_name: 'Miami',
    sent_date: '2026-01-28T12:00:00Z',
    status: 'sent',
  },
  {
    id: 'notif-006',
    title: 'Free Agent Spotlight',
    message:
      'Looking for a team? Several squads in your city are requesting free agents. Check the Free Agents board to find your match!',
    target: 'all',
    sent_date: '2026-02-15T10:00:00Z',
    status: 'scheduled',
  },
  {
    id: 'notif-007',
    title: 'Ball Busters - Game Rescheduled',
    message:
      'Your game originally scheduled for March 20 has been moved to March 22 at 7:00 PM. Same venue — East Park Recreation Center.',
    target: 'team',
    target_id: 'team-001',
    target_name: 'Ball Busters',
    sent_date: '2026-03-15T16:00:00Z',
    status: 'draft',
  },
  {
    id: 'notif-008',
    title: 'Summer 2026 Early Bird Pricing',
    message:
      'Register for Summer 2026 leagues before May 15 and save $10 per player. Spread the word to your friends and teammates!',
    target: 'all',
    sent_date: '2026-04-01T09:00:00Z',
    status: 'draft',
  },
  {
    id: 'notif-009',
    title: 'Tulsa Cornhole League Kickoff',
    message:
      'The inaugural Tulsa Cornhole league starts March 15! Join us at Guthrie Green for opening night festivities.',
    target: 'city',
    target_id: 'city-tulsa',
    target_name: 'Tulsa',
    sent_date: '2026-03-10T11:00:00Z',
    status: 'scheduled',
  },
  {
    id: 'notif-010',
    title: 'Playoff Brackets Posted - Cincinnati Cornhole',
    message:
      'Playoffs are here! Check your league page for the bracket and updated schedule. Good luck to all teams!',
    target: 'league',
    target_id: 'league-cincinnati-cornhole',
    target_name: 'Cincinnati Cornhole',
    sent_date: '2026-05-20T13:00:00Z',
    status: 'draft',
  },
];
