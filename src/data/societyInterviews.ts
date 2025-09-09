export interface SocietyInterview {
  id: string;
  society: string;
  title: string;
  description: string;
  date: Date;
  venue: string;
  category: 'Technical' | 'Cultural' | 'Sports' | 'Literary' | 'Fest' | 'Management';
  status: 'upcoming' | 'ongoing' | 'completed';
  contactPerson: string;
  contactEmail: string;
  meetingLink?: string;
  logo: string;
  requirements: string[];
  duration: string;
  maxParticipants?: number;
  registrationDeadline?: Date;
  color: string;
}

// Demo data for KIIT society interviews and events
export const societyInterviews: SocietyInterview[] = [
  {
    id: '1',
    society: 'KIIT Robotics Society',
    title: 'Technical Interview Round 1',
    description: 'First round of technical interviews for core team positions. Focus on robotics fundamentals, programming, and innovation.',
    date: new Date('2025-02-12T16:00:00'),
    venue: 'Campus 7 Auditorium',
    category: 'Technical',
    status: 'upcoming',
    contactPerson: 'Arjun Patel',
    contactEmail: 'arjun.patel@robotics.kiit.ac.in',
    logo: '🤖',
    requirements: ['Basic Programming', 'Electronics Knowledge', 'Robotics Interest'],
    duration: '2 hours',
    maxParticipants: 50,
    registrationDeadline: new Date('2025-02-10T23:59:59'),
    color: '#3B82F6'
  },
  {
    id: '2',
    society: 'KIIT Dance Club',
    title: 'Onboarding Session',
    description: 'Welcome session for new members. Learn about club activities, upcoming events, and performance opportunities.',
    date: new Date('2025-02-14T18:30:00'),
    venue: 'Campus 5 Seminar Hall',
    category: 'Cultural',
    status: 'upcoming',
    contactPerson: 'Priya Sharma',
    contactEmail: 'priya.sharma@dance.kiit.ac.in',
    logo: '💃',
    requirements: ['Passion for Dance', 'No Experience Required'],
    duration: '1.5 hours',
    color: '#EC4899'
  },
  {
    id: '3',
    society: 'Kshitij (Techno-Management Fest)',
    title: 'Core Team Interviews',
    description: 'Virtual interviews for core organizing committee positions. Leadership and management skills assessment.',
    date: new Date('2025-02-18T14:00:00'),
    venue: 'Online (Google Meet)',
    category: 'Fest',
    status: 'upcoming',
    contactPerson: 'Rohit Kumar',
    contactEmail: 'rohit.kumar@kshitij.kiit.ac.in',
    meetingLink: 'https://meet.google.com/kshitij-core-2025',
    logo: '🚀',
    requirements: ['Leadership Experience', 'Event Management', 'Team Building'],
    duration: '45 minutes per candidate',
    maxParticipants: 100,
    registrationDeadline: new Date('2025-02-16T23:59:59'),
    color: '#10B981'
  },
  {
    id: '4',
    society: 'KIIT Athletics',
    title: 'Selection Trials',
    description: 'Athletic performance trials for university sports team selection. Various track and field events.',
    date: new Date('2025-02-20T07:00:00'),
    venue: 'KIIT Stadium',
    category: 'Sports',
    status: 'upcoming',
    contactPerson: 'Coach Ramesh',
    contactEmail: 'ramesh.coach@sports.kiit.ac.in',
    logo: '🏃',
    requirements: ['Physical Fitness', 'Sports Equipment', 'Medical Certificate'],
    duration: '4 hours',
    color: '#F59E0B'
  },
  {
    id: '5',
    society: 'KIIT Music Society',
    title: 'Auditions for Annual Concert',
    description: 'Musical auditions for the annual concert. All instruments and vocal categories welcome.',
    date: new Date('2025-02-15T17:00:00'),
    venue: 'Campus 3 Music Room',
    category: 'Cultural',
    status: 'upcoming',
    contactPerson: 'Anita Singh',
    contactEmail: 'anita.singh@music.kiit.ac.in',
    logo: '🎵',
    requirements: ['Musical Instrument/Voice', 'Prepared Song (5 min)'],
    duration: '3 hours',
    maxParticipants: 30,
    color: '#8B5CF6'
  },
  {
    id: '6',
    society: 'KIIT Quiz Society',
    title: 'Knowledge Assessment',
    description: 'General knowledge and domain-specific quiz for society membership selection.',
    date: new Date('2025-02-16T15:30:00'),
    venue: 'Campus 1 Lecture Hall 5',
    category: 'Literary',
    status: 'upcoming',
    contactPerson: 'Vikash Jha',
    contactEmail: 'vikash.jha@quiz.kiit.ac.in',
    logo: '🧠',
    requirements: ['General Knowledge', 'Current Affairs', 'Domain Knowledge'],
    duration: '2 hours',
    maxParticipants: 80,
    color: '#06B6D4'
  },
  {
    id: '7',
    society: 'KIIT International MUN',
    title: 'Committee Allocation Interview',
    description: 'Interviews for committee allocation in upcoming Model United Nations conference.',
    date: new Date('2025-02-19T10:00:00'),
    venue: 'Campus 11 Conference Room',
    category: 'Literary',
    status: 'upcoming',
    contactPerson: 'Shreya Gupta',
    contactEmail: 'shreya.gupta@mun.kiit.ac.in',
    logo: '🌍',
    requirements: ['Research Skills', 'Public Speaking', 'International Affairs Knowledge'],
    duration: '30 minutes per candidate',
    maxParticipants: 60,
    registrationDeadline: new Date('2025-02-17T23:59:59'),
    color: '#DC2626'
  },
  {
    id: '8',
    society: 'KIIT Basketball',
    title: 'Team Selection Trials',
    description: 'Basketball skills assessment and team formation for inter-college tournaments.',
    date: new Date('2025-02-21T16:00:00'),
    venue: 'Campus Basketball Court',
    category: 'Sports',
    status: 'upcoming',
    contactPerson: 'Coach Suresh',
    contactEmail: 'suresh.coach@basketball.kiit.ac.in',
    logo: '🏀',
    requirements: ['Basketball Skills', 'Team Spirit', 'Physical Fitness'],
    duration: '3 hours',
    maxParticipants: 40,
    color: '#F97316'
  },
  {
    id: '9',
    society: 'KIIT Drama Club',
    title: 'Acting Workshop & Selection',
    description: 'Acting workshop followed by auditions for upcoming drama productions.',
    date: new Date('2025-02-22T18:00:00'),
    venue: 'Campus 2 Auditorium',
    category: 'Cultural',
    status: 'upcoming',
    contactPerson: 'Neha Kapoor',
    contactEmail: 'neha.kapoor@drama.kiit.ac.in',
    logo: '🎭',
    requirements: ['Acting Interest', 'Script Reading', 'Improvisation'],
    duration: '4 hours',
    maxParticipants: 25,
    color: '#84CC16'
  },
  {
    id: '10',
    society: 'KIIT Literary Society',
    title: 'Creative Writing Contest',
    description: 'Writing competition and recruitment drive for budding writers and poets.',
    date: new Date('2025-02-23T14:30:00'),
    venue: 'Campus 6 Library Hall',
    category: 'Literary',
    status: 'upcoming',
    contactPerson: 'Ravi Mehta',
    contactEmail: 'ravi.mehta@literary.kiit.ac.in',
    logo: '📝',
    requirements: ['Writing Portfolio', 'Creative Thinking', 'Language Skills'],
    duration: '2.5 hours',
    maxParticipants: 45,
    color: '#6366F1'
  },
  {
    id: '11',
    society: 'KIIT Fashion Society',
    title: 'Designer Showcase Interview',
    description: 'Portfolio review and interview for fashion design team positions.',
    date: new Date('2025-02-24T11:00:00'),
    venue: 'Campus 4 Design Studio',
    category: 'Cultural',
    status: 'upcoming',
    contactPerson: 'Kavya Reddy',
    contactEmail: 'kavya.reddy@fashion.kiit.ac.in',
    logo: '👗',
    requirements: ['Design Portfolio', 'Fashion Sense', 'Creativity'],
    duration: '1 hour per candidate',
    maxParticipants: 20,
    color: '#EC4899'
  },
  {
    id: '12',
    society: 'KIIT Art Club',
    title: 'Artistic Skills Assessment',
    description: 'Art portfolio review and live sketching/painting session for club membership.',
    date: new Date('2025-02-25T15:00:00'),
    venue: 'Campus 8 Art Studio',
    category: 'Cultural',
    status: 'upcoming',
    contactPerson: 'Amit Das',
    contactEmail: 'amit.das@art.kiit.ac.in',
    logo: '🎨',
    requirements: ['Art Portfolio', 'Drawing Materials', 'Creative Vision'],
    duration: '3 hours',
    maxParticipants: 35,
    color: '#F59E0B'
  }
];

// Filter functions
export const filterByCategory = (interviews: SocietyInterview[], category: string) => {
  if (category === 'All') return interviews;
  return interviews.filter(interview => interview.category === category);
};

export const filterBySearch = (interviews: SocietyInterview[], searchQuery: string) => {
  const query = searchQuery.toLowerCase();
  return interviews.filter(interview => 
    interview.society.toLowerCase().includes(query) ||
    interview.title.toLowerCase().includes(query) ||
    interview.description.toLowerCase().includes(query)
  );
};

export const getUpcomingInterviews = (interviews: SocietyInterview[]) => {
  return interviews
    .filter(interview => interview.status === 'upcoming')
    .sort((a, b) => a.date.getTime() - b.date.getTime());
};

export const getInterviewsByDateRange = (interviews: SocietyInterview[], startDate: Date, endDate: Date) => {
  return interviews.filter(interview => 
    interview.date >= startDate && interview.date <= endDate
  );
};