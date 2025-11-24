// Dummy data for Study Materials
export interface StudyMaterialItem {
  id: number;
  title: string;
  subject: string;
  semester: string;
  year: string;
  type: 'note' | 'pyq';
  downloadUrl: string;
  views: number;
  uploadedBy: string;
  uploadDate: string;
}


export const semesters = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];

export const years = ["2024", "2023", "2022", "2021", "2020"];

export const semesterSubjects = [
  {
    semester: "1st",
    subjects: [
      "Physics",
      "Differential Equations and Linear Algebra",
      "ENvironmental Science",
      "Biology for Engineers",
      "Science of Living Systems",
      "Environmental Science",
      "Physics Lab",
      "C Programming Laboratory",
      "Engineering Drawing & Graphics",
    ],
  },
  {
    semester: "2nd",
    subjects: [
      "Chemistry",
      "Mathematics II",
      "BETC",
      "BEE",
      "Communicative English",
      "Yoga",
      "BETC Lab",
      "Chemistry Lab",
      "BEE Lab",
      "Workshop Practice",
      "Communication Lab",
    ],
  },
  {
    semester: "3rd",
    subjects: [
      "Data Structures",
      "Industry 4.0 Technologies",
      "Scientific and Technical Writing",
      "Probability & Statistics",
      "AFL",
      "DSD",
      "Data Structures Lab",
      "DSD Lab",
    ],
  },
  {
    semester: "4th",
    subjects: [
      "Computer Architecture and Organization",
      "Discrete Mathematics",
      "Database Management Systems",
      "Operating Systems",
      "OOP using JAVA",
      "DBMS Lab",
      "OOPJ Lab",
      "Operating Systems Lab",
    ],
  },
  {
    semester: "5th",
    subjects: [
      "Computer Networks",
      "Software Engineering",
      "Data Algorithms and Analysis",
      "Distributed Operating Systems",
      "Engineering  Economics",
      "Computer Network Lab",
      "DAA Lab",
      "Image Processing",
      "High Performance Computing",
      "K-Explore Elective",
    ],
  },
  {
    semester: "6th",
    subjects: [
      "Artificial Intelligence",
      "Machine Learning",
      "Software Project Management",
      "Cloud Computing",
      "NLP",
      "Computer Vision",
      "Engineering Professional Practice",
      "AI Lab",
      "Compiler Lab",
      "App Development Lab",
    ],
  },
  {
    semester: "7th",
    subjects: [
      "Cloud Computing",
      "Cyber Security",
      "Research Methods and Ethics",
      "Minor Project",
      "Open Elective III",
    ],
  },
  {
    semester: "8th",
    subjects: [
      "Project/Dissertation",
      "Internship/Seminar",
      "Open Elective IV",
    ],
  },
];