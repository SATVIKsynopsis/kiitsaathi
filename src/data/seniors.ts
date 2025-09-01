// Demo Senior Mentors Data - Anonymous but with warm mentorship tags
export interface Senior {
  id: number;
  mentorCode: string; // Anonymous identifier
  branch: string;
  year: string;
  profileImage: string; // Placeholder images with backgrounds
  mentorshipTags: string[];
  specialties: string[];
  availability: string;
  rating: number;
  totalSessions: number;
  bio: string;
  languages: string[];
}

export const seniors: Senior[] = [
  {
    id: 1,
    mentorCode: "M001",
    branch: "CSE",
    year: "4th Year",
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    mentorshipTags: ["Coding Mentor", "Placement Guide", "Society Expert"],
    specialties: ["Data Structures", "Web Development", "Interview Prep", "GDSC Leadership"],
    availability: "Evenings 5-8 PM",
    rating: 4.9,
    totalSessions: 45,
    bio: "Your friendly neighborhood coder who loves helping juniors crack their first internship! 🚀",
    languages: ["English", "Hindi"]
  },
  {
    id: 2,
    mentorCode: "M002", 
    branch: "EEE",
    year: "Alumni",
    profileImage: "https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=400&h=400&fit=crop&crop=face",
    mentorshipTags: ["Mental Health Advocate", "Study Abroad Guide", "Life Coach"],
    specialties: ["Stress Management", "MS Applications", "Work-Life Balance", "Hostel Life"],
    availability: "Weekends",
    rating: 4.8,
    totalSessions: 62,
    bio: "Here to remind you that it's okay to not be okay sometimes. Let's talk! 💙",
    languages: ["English", "Hindi", "Odia"]
  },
  {
    id: 3,
    mentorCode: "M003",
    branch: "Law", 
    year: "3rd Year",
    profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    mentorshipTags: ["Legal Eagle", "Moot Court Pro", "Career Navigator"],
    specialties: ["Constitutional Law", "Moot Competitions", "Legal Research", "Internship Hunt"],
    availability: "Flexible",
    rating: 4.7,
    totalSessions: 28,
    bio: "Law can be intimidating, but together we'll make it feel like home! ⚖️",
    languages: ["English", "Hindi"]
  },
  {
    id: 4,
    mentorCode: "M004",
    branch: "MBBS",
    year: "4th Year", 
    profileImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face",
    mentorshipTags: ["Medical Mentor", "Study Techniques", "Exam Strategy"],
    specialties: ["NEET Strategy", "Medical Entrance", "Study Planning", "Time Management"],
    availability: "Late evenings",
    rating: 4.9,
    totalSessions: 56,
    bio: "Medicine is tough, but you're tougher! Let me share some study hacks! 🩺",
    languages: ["English", "Hindi"]
  },
  {
    id: 5,
    mentorCode: "M005",
    branch: "Mechanical",
    year: "Alumni",
    profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
    mentorshipTags: ["Industry Expert", "Project Guide", "Startup Mentor"],
    specialties: ["CAD/CAM", "Industry Projects", "Entrepreneurship", "Technical Skills"],
    availability: "Weekends",
    rating: 4.8,
    totalSessions: 41,
    bio: "From engineering drawings to real-world impact - let's build something amazing! 🔧",
    languages: ["English", "Hindi"]
  },
  {
    id: 6,
    mentorCode: "M006",
    branch: "IT",
    year: "3rd Year",
    profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    mentorshipTags: ["Tech Innovator", "Open Source Contributor", "Hackathon Queen"],
    specialties: ["Full Stack Development", "Machine Learning", "Open Source", "Competitive Programming"],
    availability: "Afternoons 2-5 PM",
    rating: 4.9,
    totalSessions: 38,
    bio: "Code, coffee, and lots of debugging sessions ahead! Ready to dive in? 💻",
    languages: ["English", "Hindi"]
  }
];

// Mentorship interaction types
export interface MentorshipMode {
  id: string;
  name: string;
  icon: string;
  description: string;
  duration: string;
  availability: string;
}

export const mentorshipModes: MentorshipMode[] = [
  {
    id: "chat",
    name: "Chat Talk",
    icon: "MessageCircle",
    description: "Quick text-based conversations",
    duration: "15-30 mins",
    availability: "24/7"
  },
  {
    id: "voice",
    name: "Voice Call", 
    icon: "Phone",
    description: "Heart-to-heart voice conversations",
    duration: "30-45 mins",
    availability: "Based on mentor schedule"
  },
  {
    id: "video",
    name: "Video Call",
    icon: "Video",
    description: "Face-to-face mentoring sessions",
    duration: "45-60 mins", 
    availability: "Scheduled in advance"
  },
  {
    id: "meetup",
    name: "Physical Meetup",
    icon: "MapPin",
    description: "In-person campus meetings",
    duration: "1-2 hours",
    availability: "Weekends preferred"
  }
];