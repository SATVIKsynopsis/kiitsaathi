export interface SocietyInterview {
  id: string;
  title: string;
  society: string;
  category: "Technical" | "Cultural" | "Sports" | "Literary" | "Fest" | "Business" | "Social";
  date: Date;
  startTime: string;
  endTime: string;
  venue: string;
  isOnline: boolean;
  onlineLink?: string;
  status: "upcoming" | "ongoing" | "completed";
  description: string;
  contactPerson: string;
  contactEmail: string;
  requirements: string[];
  logo: string;
  color: string;
  reminderSet?: boolean;
}

export const mockInterviews: SocietyInterview[] = [
  {
    id: "1",
    title: "Core Team Interview Round 1",
    society: "KIIT Robotics Society",
    category: "Technical",
    date: new Date(2025, 8, 12, 16, 0), // Sept 12, 4:00 PM
    startTime: "4:00 PM",
    endTime: "6:00 PM",
    venue: "Campus 7 Auditorium",
    isOnline: false,
    status: "upcoming",
    description: "Technical interview for core team positions. Focus on robotics, programming, and project experience.",
    contactPerson: "Arjun Patel",
    contactEmail: "arjun@kiitrobotics.com",
    requirements: ["Programming Knowledge", "Electronics Basics", "Team Leadership"],
    logo: "🤖",
    color: "#10B981"
  },
  {
    id: "2", 
    title: "Onboarding Session",
    society: "KIIT Dance Club",
    category: "Cultural",
    date: new Date(2025, 8, 14, 18, 30), // Sept 14, 6:30 PM
    startTime: "6:30 PM",
    endTime: "8:00 PM",
    venue: "Campus 5 Seminar Hall",
    isOnline: false,
    status: "upcoming",
    description: "Welcome session for new members. Learn about different dance forms and upcoming events.",
    contactPerson: "Priya Sharma",
    contactEmail: "priya@kiitdance.com",
    requirements: ["Dance Interest", "Performance Skills", "Time Commitment"],
    logo: "💃",
    color: "#F59E0B"
  },
  {
    id: "3",
    title: "Core Team Interviews",
    society: "Kshitij Fest",
    category: "Fest",
    date: new Date(2025, 8, 18, 14, 0), // Sept 18, 2:00 PM
    startTime: "2:00 PM",
    endTime: "5:00 PM",
    venue: "Online (Google Meet)",
    isOnline: true,
    onlineLink: "https://meet.google.com/kshitij-interviews",
    status: "upcoming",
    description: "Leadership interviews for Kshitij fest organizing committee. Event management and coordination focus.",
    contactPerson: "Rohan Kumar",
    contactEmail: "rohan@kshitij.com",
    requirements: ["Event Management", "Leadership", "Communication Skills"],
    logo: "🎪",
    color: "#8B5CF6"
  },
  {
    id: "4",
    title: "Selection Trials",
    society: "KIIT Athletics",
    category: "Sports",
    date: new Date(2025, 8, 20, 7, 0), // Sept 20, 7:00 AM
    startTime: "7:00 AM",
    endTime: "10:00 AM",
    venue: "KIIT Stadium",
    isOnline: false,
    status: "upcoming",
    description: "Athletic trials for track and field events. Bring your own sports gear and water bottle.",
    contactPerson: "Coach Rakesh",
    contactEmail: "rakesh@kiitathletics.com",
    requirements: ["Physical Fitness", "Prior Sports Experience", "Medical Certificate"],
    logo: "🏃",
    color: "#EF4444"
  },
  {
    id: "5",
    title: "Technical Round",
    society: "KIIT Quiz Society",
    category: "Literary",
    date: new Date(2025, 8, 16, 15, 0), // Sept 16, 3:00 PM
    startTime: "3:00 PM",
    endTime: "4:30 PM",
    venue: "Campus 3 Library Hall",
    isOnline: false,
    status: "upcoming",
    description: "General knowledge and current affairs quiz for new members. Covering diverse topics.",
    contactPerson: "Anjali Singh",
    contactEmail: "anjali@kiitquiz.com",
    requirements: ["General Knowledge", "Current Affairs", "Quick Thinking"],
    logo: "❓",
    color: "#06B6D4"
  },
  {
    id: "6",
    title: "Audition Round",
    society: "KIIT Music Society",
    category: "Cultural",
    date: new Date(2025, 8, 15, 17, 0), // Sept 15, 5:00 PM
    startTime: "5:00 PM",
    endTime: "7:00 PM",
    venue: "Campus 4 Music Room",
    isOnline: false,
    status: "upcoming",
    description: "Musical auditions for vocalists and instrumentalists. Prepare one song of your choice.",
    contactPerson: "Rahul Mehta",
    contactEmail: "rahul@kiitmusic.com",
    requirements: ["Musical Talent", "Performance Ability", "Dedication"],
    logo: "🎵",
    color: "#F97316"
  },
  {
    id: "7",
    title: "Team Selection",
    society: "KIIT Basketball",
    category: "Sports",
    date: new Date(2025, 8, 19, 16, 30), // Sept 19, 4:30 PM
    startTime: "4:30 PM",
    endTime: "6:30 PM",
    venue: "KIIT Basketball Court",
    isOnline: false,
    status: "upcoming",
    description: "Basketball team selection tryouts. Demonstrate your skills and teamwork abilities.",
    contactPerson: "Coach Suresh",
    contactEmail: "suresh@kiitbasketball.com",
    requirements: ["Basketball Skills", "Team Spirit", "Physical Fitness"],
    logo: "🏀",
    color: "#DC2626"
  },
  {
    id: "8",
    title: "Acting Workshop & Selection",
    society: "KIIT Drama Club",
    category: "Cultural",
    date: new Date(2025, 8, 22, 18, 0), // Sept 22, 6:00 PM
    startTime: "6:00 PM",
    endTime: "8:30 PM",
    venue: "Campus 6 Drama Hall",
    isOnline: false,
    status: "upcoming",
    description: "Acting workshop followed by selection for upcoming theatrical productions.",
    contactPerson: "Meera Gupta",
    contactEmail: "meera@kiitdrama.com",
    requirements: ["Acting Interest", "Expression Skills", "Stage Presence"],
    logo: "🎭",
    color: "#7C3AED"
  },
  {
    id: "9",
    title: "Writing Contest & Interview",
    society: "KIIT Literary Society",
    category: "Literary",
    date: new Date(2025, 8, 17, 14, 30), // Sept 17, 2:30 PM
    startTime: "2:30 PM",
    endTime: "4:00 PM",
    venue: "Campus 2 Conference Room",
    isOnline: false,
    status: "upcoming",
    description: "Creative writing contest followed by interviews for editorial positions.",
    contactPerson: "Kavya Joshi",
    contactEmail: "kavya@kiitliterary.com",
    requirements: ["Writing Skills", "Creativity", "Language Proficiency"],
    logo: "📚",
    color: "#059669"
  },
  {
    id: "10",
    title: "Fashion Show Auditions",
    society: "KIIT Fashion Society",
    category: "Cultural",
    date: new Date(2025, 8, 21, 16, 0), // Sept 21, 4:00 PM
    startTime: "4:00 PM",
    endTime: "6:00 PM",
    venue: "Campus 8 Fashion Studio",
    isOnline: false,
    status: "upcoming",
    description: "Auditions for upcoming fashion shows and modeling events. Bring your portfolio.",
    contactPerson: "Ishita Rao",
    contactEmail: "ishita@kiitfashion.com",
    requirements: ["Confidence", "Style Sense", "Runway Experience"],
    logo: "👗",
    color: "#EC4899"
  },
  {
    id: "11",
    title: "Portfolio Review",
    society: "KIIT Art Club",
    category: "Cultural",
    date: new Date(2025, 8, 23, 15, 30), // Sept 23, 3:30 PM
    startTime: "3:30 PM",
    endTime: "5:00 PM",
    venue: "Campus 1 Art Studio",
    isOnline: false,
    status: "upcoming",
    description: "Art portfolio review and discussion for new members. Bring your best artworks.",
    contactPerson: "Vikram Das",
    contactEmail: "vikram@kiitart.com",
    requirements: ["Artistic Skills", "Portfolio", "Creativity"],
    logo: "🎨",
    color: "#0EA5E9"
  }
];

export const getCategoryColor = (category: SocietyInterview['category']): string => {
  const colors = {
    Technical: "#10B981",
    Cultural: "#F59E0B", 
    Sports: "#EF4444",
    Literary: "#059669",
    Fest: "#8B5CF6",
    Business: "#06B6D4",
    Social: "#EC4899"
  };
  return colors[category];
};