export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar?: string;
}

export const team: TeamMember[] = [
  {
    id: '1',
    name: 'True Tech Team',
    role: 'Development Team',
    bio: 'A passionate group of developers building innovative solutions and modern web applications.',
  },
  // Add more team members as needed
];
