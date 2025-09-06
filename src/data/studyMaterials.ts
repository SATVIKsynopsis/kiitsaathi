// Dummy data for Study Materials
export interface StudyMaterialItem {
  id: number;
  title: string;
  subject: string;
  semester: string;
  year: string;
  type: 'note' | 'pyq';
  downloadUrl: string; // placeholder for now
  views: number;
  uploadedBy: string;
  uploadDate: string;
}

export const dummyStudyMaterials: StudyMaterialItem[] = [
  // Notes Data
  {
    id: 1,
    title: "Mathematics-I Complete Notes",
    subject: "Mathematics",
    semester: "1st",
    year: "2024",
    type: "note",
    downloadUrl: "#",
    views: 1234,
    uploadedBy: "Dr. Sharma",
    uploadDate: "2024-01-15"
  },
  {
    id: 2,
    title: "Physics Fundamentals Notes",
    subject: "Physics",
    semester: "1st",
    year: "2024",
    type: "note",
    downloadUrl: "#",
    views: 987,
    uploadedBy: "Prof. Kumar",
    uploadDate: "2024-01-20"
  },
  {
    id: 3,
    title: "Chemistry Organic Compounds",
    subject: "Chemistry",
    semester: "2nd",
    year: "2024",
    type: "note",
    downloadUrl: "#",
    views: 756,
    uploadedBy: "Dr. Patel",
    uploadDate: "2024-02-10"
  },
  {
    id: 4,
    title: "Data Structures and Algorithms",
    subject: "Computer Science",
    semester: "3rd",
    year: "2024",
    type: "note",
    downloadUrl: "#",
    views: 2156,
    uploadedBy: "Prof. Singh",
    uploadDate: "2024-03-05"
  },
  {
    id: 5,
    title: "Digital Signal Processing Notes",
    subject: "Electronics",
    semester: "5th",
    year: "2023",
    type: "note",
    downloadUrl: "#",
    views: 890,
    uploadedBy: "Dr. Gupta",
    uploadDate: "2023-08-15"
  },
  {
    id: 6,
    title: "Operating Systems Concepts",
    subject: "Computer Science",
    semester: "4th",
    year: "2024",
    type: "note",
    downloadUrl: "#",
    views: 1567,
    uploadedBy: "Prof. Reddy",
    uploadDate: "2024-04-12"
  },
  {
    id: 7,
    title: "Thermodynamics Notes",
    subject: "Mechanical Engineering",
    semester: "3rd",
    year: "2023",
    type: "note",
    downloadUrl: "#",
    views: 678,
    uploadedBy: "Dr. Mehta",
    uploadDate: "2023-09-20"
  },
  {
    id: 8,
    title: "Linear Algebra Complete Guide",
    subject: "Mathematics",
    semester: "2nd",
    year: "2024",
    type: "note",
    downloadUrl: "#",
    views: 1345,
    uploadedBy: "Prof. Joshi",
    uploadDate: "2024-02-28"
  },

  // PYQs Data
  {
    id: 9,
    title: "Mathematics-I Mid Semester Exam",
    subject: "Mathematics",
    semester: "1st",
    year: "2023",
    type: "pyq",
    downloadUrl: "#",
    views: 2345,
    uploadedBy: "Exam Cell",
    uploadDate: "2023-10-15"
  },
  {
    id: 10,
    title: "Physics End Semester PYQ",
    subject: "Physics",
    semester: "1st",
    year: "2023",
    type: "pyq",
    downloadUrl: "#",
    views: 1876,
    uploadedBy: "Exam Cell",
    uploadDate: "2023-12-20"
  },
  {
    id: 11,
    title: "Chemistry Practical Exam Questions",
    subject: "Chemistry",
    semester: "2nd",
    year: "2023",
    type: "pyq",
    downloadUrl: "#",
    views: 1234,
    uploadedBy: "Lab Department",
    uploadDate: "2023-11-30"
  },
  {
    id: 12,
    title: "DSA End Semester Questions",
    subject: "Computer Science",
    semester: "3rd",
    year: "2023",
    type: "pyq",
    downloadUrl: "#",
    views: 3456,
    uploadedBy: "CS Department",
    uploadDate: "2023-12-15"
  },
  {
    id: 13,
    title: "Electronics Mid Sem PYQ",
    subject: "Electronics",
    semester: "5th",
    year: "2022",
    type: "pyq",
    downloadUrl: "#",
    views: 987,
    uploadedBy: "ECE Department",
    uploadDate: "2022-10-20"
  },
  {
    id: 14,
    title: "Operating Systems Final Exam",
    subject: "Computer Science",
    semester: "4th",
    year: "2023",
    type: "pyq",
    downloadUrl: "#",
    views: 2134,
    uploadedBy: "CS Department",
    uploadDate: "2023-12-18"
  },
  {
    id: 15,
    title: "Thermodynamics Theory Questions",
    subject: "Mechanical Engineering",
    semester: "3rd",
    year: "2022",
    type: "pyq",
    downloadUrl: "#",
    views: 876,
    uploadedBy: "Mech Department",
    uploadDate: "2022-11-25"
  },
  {
    id: 16,
    title: "Linear Algebra Mid Semester",
    subject: "Mathematics",
    semester: "2nd",
    year: "2023",
    type: "pyq",
    downloadUrl: "#",
    views: 1543,
    uploadedBy: "Math Department",
    uploadDate: "2023-10-10"
  },
  {
    id: 17,
    title: "Database Management Systems PYQ",
    subject: "Computer Science",
    semester: "4th",
    year: "2022",
    type: "pyq",
    downloadUrl: "#",
    views: 2098,
    uploadedBy: "CS Department",
    uploadDate: "2022-12-12"
  },
  {
    id: 18,
    title: "Circuit Analysis End Semester",
    subject: "Electronics",
    semester: "3rd",
    year: "2023",
    type: "pyq",
    downloadUrl: "#",
    views: 1321,
    uploadedBy: "ECE Department",
    uploadDate: "2023-12-08"
  },
  {
    id: 19,
    title: "Software Engineering PYQ",
    subject: "Computer Science",
    semester: "6th",
    year: "2023",
    type: "pyq",
    downloadUrl: "#",
    views: 1765,
    uploadedBy: "CS Department",
    uploadDate: "2023-11-15"
  },
  {
    id: 20,
    title: "Machine Learning Mid Semester",
    subject: "Computer Science",
    semester: "7th",
    year: "2023",
    type: "pyq",
    downloadUrl: "#",
    views: 2543,
    uploadedBy: "CS Department",
    uploadDate: "2023-10-25"
  }
];

export const subjects = [
  "Mathematics",
  "Physics", 
  "Chemistry",
  "Computer Science",
  "Electronics",
  "Mechanical Engineering"
];

export const semesters = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];

export const years = ["2024", "2023", "2022", "2021", "2020"];