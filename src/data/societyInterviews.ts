export interface SocietyInterview {
  id: string;
  societyName: string;
  category: 'Technical' | 'Cultural' | 'Sports' | 'Literary' | 'Social' | 'Business';
  eventType: 'Interview' | 'Onboarding' | 'Selection Trial' | 'Workshop';
  title: string;
  date: Date;
  time: string;
  venue: string;
  isOnline: boolean;
  meetLink?: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  description: string;
  requirements: string[];
  contactPerson?: string;
  contactEmail?: string;
  logo: string;
  color: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  positions: number;
  applicants: number;
}

export const societyInterviews: SocietyInterview[] = [
  {
    id: '1',
    societyName: 'KIIT Robotics Society',
    category: 'Technical',
    eventType: 'Interview',
    title: 'Core Team Selection - Round 1',
    date: new Date('2025-02-12'),
    time: '4:00 PM',
    venue: 'Campus 7 Auditorium',
    isOnline: false,
    status: 'upcoming',
    description: 'Technical interview for core team positions. Focus on robotics fundamentals, programming, and project experience.',
    requirements: ['Arduino/Raspberry Pi', 'C++/Python', 'Circuit Design', 'Project Portfolio'],
    contactPerson: 'Rahul Kumar',
    contactEmail: 'rahul@kiitrobotics.org',
    logo: '🤖',
    color: 'from-emerald-400 via-green-500 to-teal-600',
    difficulty: 'Hard',
    positions: 15,
    applicants: 120
  },
  {
    id: '2',
    societyName: 'KIIT Dance Club',
    category: 'Cultural',
    eventType: 'Onboarding',
    title: 'New Member Induction',
    date: new Date('2025-02-14'),
    time: '6:30 PM',
    venue: 'Campus 5 Seminar Hall',
    isOnline: false,
    status: 'upcoming',
    description: 'Welcome session for new dance club members. Introduction to different dance forms and practice schedules.',
    requirements: ['Basic Dance Skills', 'Enthusiasm', 'Team Spirit'],
    contactPerson: 'Priya Sharma',
    contactEmail: 'priya@kiitdance.org',
    logo: '💃',
    color: 'from-pink-500 via-red-500 to-yellow-500',
    difficulty: 'Easy',
    positions: 50,
    applicants: 85
  },
  {
    id: '3',
    societyName: 'Kshitij (Techno-Management Fest)',
    category: 'Technical',
    eventType: 'Interview',
    title: 'Core Team Interviews',
    date: new Date('2025-02-18'),
    time: '2:00 PM',
    venue: 'Online',
    isOnline: true,
    meetLink: 'https://meet.google.com/xyz-abc-def',
    status: 'upcoming',
    description: 'Comprehensive interview for Kshitij core team positions. Leadership, event management, and technical skills assessment.',
    requirements: ['Event Management', 'Leadership', 'Technical Skills', 'Communication'],
    contactPerson: 'Arjun Patel',
    contactEmail: 'arjun@kshitij.org',
    logo: '🚀',
    color: 'from-blue-600 via-purple-600 to-indigo-700',
    difficulty: 'Hard',
    positions: 25,
    applicants: 200
  },
  {
    id: '4',
    societyName: 'KIIT Athletics',
    category: 'Sports',
    eventType: 'Selection Trial',
    title: 'Track & Field Trials',
    date: new Date('2025-02-20'),
    time: '7:00 AM',
    venue: 'KIIT Stadium',
    isOnline: false,
    status: 'upcoming',
    description: 'Athletic trials for track and field events. Physical fitness tests and skill demonstrations.',
    requirements: ['Physical Fitness', 'Athletic Experience', 'Medical Certificate'],
    contactPerson: 'Coach Ramesh',
    contactEmail: 'coach@kiitathletics.org',
    logo: '🏃‍♂️',
    color: 'from-orange-400 via-amber-500 to-yellow-600',
    difficulty: 'Medium',
    positions: 30,
    applicants: 75
  },
  {
    id: '5',
    societyName: 'KIIT International MUN',
    category: 'Literary',
    eventType: 'Interview',
    title: 'Executive Board Selection',
    date: new Date('2025-02-16'),
    time: '3:00 PM',
    venue: 'Campus 12 Conference Room',
    isOnline: false,
    status: 'upcoming',
    description: 'Interview for MUN Executive Board positions. Focus on diplomatic skills, research, and public speaking.',
    requirements: ['Public Speaking', 'Research Skills', 'Diplomacy', 'Current Affairs'],
    contactPerson: 'Sneha Gupta',
    contactEmail: 'sneha@kiitmun.org',
    logo: '🌍',
    color: 'from-blue-400 via-indigo-500 to-purple-600',
    difficulty: 'Hard',
    positions: 12,
    applicants: 90
  },
  {
    id: '6',
    societyName: 'KIIT Quiz Society',
    category: 'Literary',
    eventType: 'Workshop',
    title: 'Quiz Masters Workshop',
    date: new Date('2025-02-15'),
    time: '5:00 PM',
    venue: 'Campus 1 LT-1',
    isOnline: false,
    status: 'upcoming',
    description: 'Workshop on quiz hosting, question framing, and quiz management techniques.',
    requirements: ['General Knowledge', 'Quick Thinking', 'Presentation Skills'],
    contactPerson: 'Rohit Singh',
    contactEmail: 'rohit@kiitquiz.org',
    logo: '❓',
    color: 'from-green-400 via-emerald-500 to-teal-600',
    difficulty: 'Medium',
    positions: 25,
    applicants: 45
  },
  {
    id: '7',
    societyName: 'KIIT Music Society',
    category: 'Cultural',
    eventType: 'Interview',
    title: 'Band Member Auditions',
    date: new Date('2025-02-22'),
    time: '4:30 PM',
    venue: 'Music Room, Campus 5',
    isOnline: false,
    status: 'upcoming',
    description: 'Auditions for various band positions including vocals, guitar, drums, keyboard, and bass.',
    requirements: ['Musical Instrument Proficiency', 'Performance Experience', 'Team Collaboration'],
    contactPerson: 'Ankit Mehta',
    contactEmail: 'ankit@kiitmusic.org',
    logo: '🎵',
    color: 'from-purple-500 via-pink-500 to-red-500',
    difficulty: 'Medium',
    positions: 20,
    applicants: 65
  },
  {
    id: '8',
    societyName: 'KIIT Basketball',
    category: 'Sports',
    eventType: 'Selection Trial',
    title: 'Team Selection Trials',
    date: new Date('2025-02-25'),
    time: '6:00 AM',
    venue: 'Basketball Court, Sports Complex',
    isOnline: false,
    status: 'upcoming',
    description: 'Basketball team selection trials. Skills assessment, game play, and physical fitness tests.',
    requirements: ['Basketball Skills', 'Physical Fitness', 'Team Play', 'Height Preference 5\'8"'],
    contactPerson: 'Coach Prasad',
    contactEmail: 'coach@kiitbasketball.org',
    logo: '🏀',
    color: 'from-orange-500 via-red-600 to-pink-600',
    difficulty: 'Hard',
    positions: 15,
    applicants: 50
  },
  {
    id: '9',
    societyName: 'KIIT Drama Club',
    category: 'Cultural',
    eventType: 'Interview',
    title: 'Actor & Director Auditions',
    date: new Date('2025-02-19'),
    time: '7:00 PM',
    venue: 'Amphitheatre, Campus 1',
    isOnline: false,
    status: 'upcoming',
    description: 'Auditions for upcoming theatrical productions. Both acting and directing positions available.',
    requirements: ['Acting Skills', 'Voice Modulation', 'Stage Presence', 'Creative Thinking'],
    contactPerson: 'Kavya Nair',
    contactEmail: 'kavya@kiitdrama.org',
    logo: '🎭',
    color: 'from-purple-600 via-indigo-600 to-blue-700',
    difficulty: 'Medium',
    positions: 40,
    applicants: 80
  },
  {
    id: '10',
    societyName: 'KIIT Literary Society',
    category: 'Literary',
    eventType: 'Workshop',
    title: 'Creative Writing Workshop',
    date: new Date('2025-02-21'),
    time: '3:30 PM',
    venue: 'Library Seminar Hall',
    isOnline: false,
    status: 'upcoming',
    description: 'Workshop on creative writing techniques, poetry, and storytelling for aspiring writers.',
    requirements: ['Writing Samples', 'Language Proficiency', 'Creativity', 'Reading Habit'],
    contactPerson: 'Dr. Meera Joshi',
    contactEmail: 'meera@kiitliterary.org',
    logo: '✒️',
    color: 'from-fuchsia-400 via-purple-500 to-indigo-600',
    difficulty: 'Easy',
    positions: 35,
    applicants: 60
  },
  {
    id: '11',
    societyName: 'KIIT Fashion Society',
    category: 'Cultural',
    eventType: 'Interview',
    title: 'Fashion Show Coordinator Selection',
    date: new Date('2025-02-24'),
    time: '5:30 PM',
    venue: 'Fashion Design Lab, Campus 2',
    isOnline: false,
    status: 'upcoming',
    description: 'Selection for fashion show coordinators and design team members. Portfolio review and creative skills assessment.',
    requirements: ['Fashion Sense', 'Design Portfolio', 'Event Coordination', 'Creativity'],
    contactPerson: 'Riya Kapoor',
    contactEmail: 'riya@kiitfashion.org',
    logo: '👗',
    color: 'from-rose-500 via-pink-600 to-purple-700',
    difficulty: 'Medium',
    positions: 18,
    applicants: 40
  },
  {
    id: '12',
    societyName: 'KIIT Art Club',
    category: 'Cultural',
    eventType: 'Interview',
    title: 'Art Exhibition Team Selection',
    date: new Date('2025-02-17'),
    time: '4:00 PM',
    venue: 'Art Studio, Campus 3',
    isOnline: false,
    status: 'upcoming',
    description: 'Selection for art exhibition planning and execution team. Portfolio review and creative assessment.',
    requirements: ['Art Portfolio', 'Creative Skills', 'Event Planning', 'Artistic Vision'],
    contactPerson: 'Aakash Jain',
    contactEmail: 'aakash@kiitart.org',
    logo: '🎨',
    color: 'from-green-400 via-teal-500 to-blue-600',
    difficulty: 'Medium',
    positions: 22,
    applicants: 55
  }
];

export const categoryColors = {
  Technical: 'from-blue-500 to-cyan-600',
  Cultural: 'from-pink-500 to-purple-600',
  Sports: 'from-orange-500 to-red-600',
  Literary: 'from-green-500 to-teal-600',
  Social: 'from-purple-500 to-indigo-600',
  Business: 'from-yellow-500 to-orange-600'
};

export const eventTypeColors = {
  Interview: 'bg-red-100 text-red-800',
  Onboarding: 'bg-green-100 text-green-800',
  'Selection Trial': 'bg-orange-100 text-orange-800',
  Workshop: 'bg-blue-100 text-blue-800'
};