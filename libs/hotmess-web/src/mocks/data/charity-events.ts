export interface CharityEvent {
  id: string;
  name: string;
  date: string;
  location: string;
  beneficiary: string;
  status: 'upcoming' | 'registration-open' | 'completed';
  description: string;
  raised?: number;
  participants?: number;
}

export const charityEvents: CharityEvent[] = [
  {
    id: 'ce1',
    name: 'Kicks for Kids Kickball Tournament',
    date: 'March 22, 2026',
    location: 'Nashville, TN',
    beneficiary: 'Boys & Girls Clubs of Middle Tennessee',
    status: 'registration-open',
    description: 'A fun kickball tournament where all proceeds go to support local youth programs.',
  },
  {
    id: 'ce2',
    name: 'Spike Out Cancer Volleyball Event',
    date: 'April 12, 2026',
    location: 'St. Petersburg, FL',
    beneficiary: 'American Cancer Society',
    status: 'upcoming',
    description: 'Beach volleyball fundraiser to raise awareness and funds for cancer research.',
  },
  {
    id: 'ce3',
    name: 'Bowl for a Cause',
    date: 'May 10, 2026',
    location: 'Birmingham, AL',
    beneficiary: 'United Way of Central Alabama',
    status: 'upcoming',
    description: 'Bowling night fundraiser with raffles, prizes, and all-you-can-eat food.',
  },
  {
    id: 'ce4',
    name: 'Cornhole for Veterans',
    date: 'November 15, 2025',
    location: 'Oklahoma City, OK',
    beneficiary: 'Wounded Warrior Project',
    status: 'completed',
    description: 'Annual cornhole tournament supporting veterans and their families.',
    raised: 2500,
    participants: 120,
  },
  {
    id: 'ce5',
    name: 'Pickle for Paws',
    date: 'September 28, 2025',
    location: 'Cincinnati, OH',
    beneficiary: 'Cincinnati Animal CARE',
    status: 'completed',
    description: 'Pickleball tournament benefiting local animal shelters and rescue organizations.',
    raised: 1800,
    participants: 85,
  },
  {
    id: 'ce6',
    name: 'Dodge Hunger Dodgeball Event',
    date: 'August 3, 2025',
    location: 'St. Louis, MO',
    beneficiary: 'St. Louis Area Foodbank',
    status: 'completed',
    description: 'Dodgeball event collecting canned goods and raising funds for local food banks.',
    raised: 1200,
    participants: 150,
  },
];

export const upcomingCharityEvents = charityEvents.filter(
  (e) => e.status === 'upcoming' || e.status === 'registration-open'
);

export const pastCharityEvents = charityEvents.filter((e) => e.status === 'completed');
