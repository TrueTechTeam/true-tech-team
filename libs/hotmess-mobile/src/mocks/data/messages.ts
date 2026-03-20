export interface MockThread {
  id: string;
  type: 'team' | 'captain' | 'referee' | 'announcement' | 'direct';
  name: string;
  referenceId?: string;
  referenceType?: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

export interface MockMessage {
  id: string;
  thread_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  created_at: string;
  isSystem?: boolean;
}

export const mockThreads: MockThread[] = [
  // Team chats
  {
    id: 'thread-team-001',
    type: 'team',
    name: 'Ball Busters',
    referenceId: 'team-010',
    referenceType: 'team',
    last_message: 'See everyone Saturday at East Park!',
    last_message_at: new Date(Date.now() - 3600000).toISOString(),
    unread_count: 3,
  },
  {
    id: 'thread-team-002',
    type: 'team',
    name: 'Kick Tease',
    referenceId: 'team-011',
    referenceType: 'team',
    last_message: 'Who is bringing the cooler?',
    last_message_at: new Date(Date.now() - 7200000).toISOString(),
    unread_count: 0,
  },
  // Captain chat
  {
    id: 'thread-captains-001',
    type: 'captain',
    name: 'Division A Captains',
    referenceId: 'div-season-002-a',
    referenceType: 'division',
    last_message: 'Reminder: roster lock deadline is Friday',
    last_message_at: new Date(Date.now() - 86400000).toISOString(),
    unread_count: 1,
  },
  // Referee chat
  {
    id: 'thread-refs-001',
    type: 'referee',
    name: 'Nashville Refs',
    referenceId: 'season-002',
    referenceType: 'season',
    last_message: 'Updated rulebook is posted. Check the dodgeball section.',
    last_message_at: new Date(Date.now() - 172800000).toISOString(),
    unread_count: 0,
  },
  // Announcements (admins/commissioners/managers can send to these)
  {
    id: 'thread-announce-001',
    type: 'announcement',
    name: 'Nashville Kickball Announcements',
    referenceId: 'season-002',
    referenceType: 'season',
    last_message: 'Week 3 schedule is now live! Check your games.',
    last_message_at: new Date(Date.now() - 43200000).toISOString(),
    unread_count: 1,
  },
  {
    id: 'thread-announce-002',
    type: 'announcement',
    name: 'St. Pete Pickleball Updates',
    referenceId: 'season-014',
    referenceType: 'season',
    last_message: 'Registration closes next Friday. Invite your friends!',
    last_message_at: new Date(Date.now() - 259200000).toISOString(),
    unread_count: 0,
  },
  // Direct messages
  {
    id: 'thread-dm-001',
    type: 'direct',
    name: 'Morgan Manager',
    last_message: 'Can you send me the updated team roster?',
    last_message_at: new Date(Date.now() - 14400000).toISOString(),
    unread_count: 1,
  },
];

export const mockMessages: Record<string, MockMessage[]> = {
  'thread-team-001': [
    { id: 'msg-001', thread_id: 'thread-team-001', sender_id: 'mock-captain-001', sender_name: 'Casey', content: 'Hey team! Ready for this Saturday?', created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: 'msg-002', thread_id: 'thread-team-001', sender_id: 'user-0002', sender_name: 'Mary', content: 'Yes! What time should we get there?', created_at: new Date(Date.now() - 82800000).toISOString() },
    { id: 'msg-003', thread_id: 'thread-team-001', sender_id: 'mock-captain-001', sender_name: 'Casey', content: 'Game is at 10am, warm up at 9:30', created_at: new Date(Date.now() - 79200000).toISOString() },
    { id: 'msg-004', thread_id: 'thread-team-001', sender_id: 'user-0003', sender_name: 'Robert', content: 'I will be a few minutes late, save me a spot!', created_at: new Date(Date.now() - 7200000).toISOString() },
    { id: 'msg-005', thread_id: 'thread-team-001', sender_id: 'mock-captain-001', sender_name: 'Casey', content: 'See everyone Saturday at East Park!', created_at: new Date(Date.now() - 3600000).toISOString() },
  ],
  'thread-captains-001': [
    { id: 'msg-010', thread_id: 'thread-captains-001', sender_id: 'mock-manager-001', sender_name: 'Morgan', content: 'Captains, roster lock deadline is this Friday at midnight.', created_at: new Date(Date.now() - 172800000).toISOString() },
    { id: 'msg-011', thread_id: 'thread-captains-001', sender_id: 'mock-captain-001', sender_name: 'Casey', content: 'Got it, thanks for the heads up!', created_at: new Date(Date.now() - 90000000).toISOString() },
    { id: 'msg-012', thread_id: 'thread-captains-001', sender_id: 'mock-manager-001', sender_name: 'Morgan', content: 'Reminder: roster lock deadline is Friday', created_at: new Date(Date.now() - 86400000).toISOString() },
  ],
  'thread-refs-001': [
    { id: 'msg-030', thread_id: 'thread-refs-001', sender_id: 'mock-manager-001', sender_name: 'Morgan', content: 'Welcome to the Nashville refs chat! Use this for scheduling and questions.', created_at: new Date(Date.now() - 604800000).toISOString() },
    { id: 'msg-031', thread_id: 'thread-refs-001', sender_id: 'mock-referee-001', sender_name: 'Riley', content: 'Thanks! Quick question - do we need to arrive 15 min early?', created_at: new Date(Date.now() - 345600000).toISOString() },
    { id: 'msg-032', thread_id: 'thread-refs-001', sender_id: 'mock-manager-001', sender_name: 'Morgan', content: 'Updated rulebook is posted. Check the dodgeball section.', created_at: new Date(Date.now() - 172800000).toISOString() },
  ],
  'thread-announce-001': [
    { id: 'msg-020', thread_id: 'thread-announce-001', sender_id: 'mock-manager-001', sender_name: 'Hotmess Sports', content: 'Week 3 schedule is now live! Check your games.', created_at: new Date(Date.now() - 43200000).toISOString(), isSystem: true },
    { id: 'msg-021', thread_id: 'thread-announce-001', sender_id: 'mock-manager-001', sender_name: 'Hotmess Sports', content: 'Rain policy: Games will be played unless lightning is present. Check weather updates on game day.', created_at: new Date(Date.now() - 259200000).toISOString(), isSystem: true },
  ],
};
