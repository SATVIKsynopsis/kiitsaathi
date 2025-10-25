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
      "Science Elective",
      "Engineering Elective II",
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
      "Electronics",
      "Engineering Elective I",
      "Communicative English",
      "Yoga",
      "Electronics Lab",
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
      "Discrete Mathematics",
      "AFL",
      "DSD",
      "Data Structures Lab",
      "DSD Lab",
    ],
  },
  {
    semester: "4th",
    subjects: [
      "Algorithms Design & Analysis",
      "Theory of Computation",
      "Database Management Systems",
      "Operating Systems",
      "Object-Oriented Programming",
      "COA",
      "DBMS Lab",
      "OOP Lab",
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
      "Open Elective I",
    ],
  },
  {
    semester: "6th",
    subjects: [
      "Compiler Design",
      "Machine Learning",
      "Project Management",
      "Engineering Professional Practice",
      "Machine Learning Lab",
      "Compiler Lab",
      "Open Elective II",
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