/**
 * Course Structure Data
 * 
 * This file contains the complete course structure for Computer Science and Engineering
 * Data extracted verbatim from semester-wise attachments
 * 
 * Schema:
 * - semester: Semester number (1-6)
 * - sections: Array of course sections (Theory, Practical, Sessional)
 *   - type: Section type ("Theory" | "Practical" | "Sessional")
 *   - courses: Array of courses
 *     - code: Course code
 *     - title: Course title
 *     - credits: Number of credits
 */

export interface Course {
  code: string;
  title: string;
  credits: number;
}

export interface CourseSection {
  type: "Theory" | "Practical" | "Sessional";
  courses: Course[];
}

export interface Semester {
  semester: number;
  sections: CourseSection[];
}

export interface BranchCourseStructure {
  [branch: string]: Semester[];
}

// Common semesters 1-4 for all branches
const commonSemesters: Semester[] = [
  {
    semester: 1,
    sections: [
      {
        type: "Theory",
        courses: [
          { code: "PH10001", title: "Physics", credits: 3 },
          { code: "MA11001", title: "Differential Equations and Linear Algebra", credits: 4 },
          { code: "Science Elective", title: "Science Elective", credits: 2 },
          { code: "Engineering Elective II", title: "Engineering Elective II", credits: 2 },
          { code: "LS10001", title: "Science of Living Systems", credits: 2 },
          { code: "CH10003", title: "Environmental Science", credits: 2 }
        ]
      },
      {
        type: "Practical",
        courses: [
          { code: "PH19001", title: "Physics Lab", credits: 1 },
          { code: "CS13001", title: "Programming Lab", credits: 4 }
        ]
      },
      {
        type: "Sessional",
        courses: [
          { code: "CE18001", title: "Engineering Drawing & Graphics", credits: 1 }
        ]
      }
    ]
  },
  {
    semester: 2,
    sections: [
      {
        type: "Theory",
        courses: [
          { code: "CH10001", title: "Chemistry", credits: 3 },
          { code: "MA11002", title: "Transform Calculus and Numerical Analysis", credits: 4 },
          { code: "HS10001", title: "English", credits: 2 },
          { code: "EC10001", title: "Basic Electronics", credits: 2 },
          { code: "Engineering Elective I", title: "Engineering Elective I", credits: 2 },
          { code: "HASS Elective I", title: "HASS Elective I", credits: 2 }
        ]
      },
      {
        type: "Practical",
        courses: [
          { code: "CH19001", title: "Chemistry Lab", credits: 1 },
          { code: "EX19001", title: "Engineering Lab", credits: 1 }
        ]
      },
      {
        type: "Sessional",
        courses: [
          { code: "ME18001", title: "Workshop", credits: 1 },
          { code: "YG18001", title: "Yoga", credits: 1 },
          { code: "HS18001", title: "Communication Lab", credits: 1 }
        ]
      }
    ]
  },
  {
    semester: 3,
    sections: [
      {
        type: "Theory",
        courses: [
          { code: "EX20003", title: "Scientific & Technical Writing OR HASS Elective-II", credits: 2 },
          { code: "MA21001", title: "Probability and Statistics", credits: 4 },
          { code: "EX20001", title: "Industry 4.0 Technologies", credits: 3 },
          { code: "CS21001", title: "Data Structures", credits: 3 },
          { code: "EC20005", title: "Digital Systems Design", credits: 3 },
          { code: "CS21003", title: "Automata Theory and Formal Languages", credits: 4 }
        ]
      },
      {
        type: "Practical",
        courses: [
          { code: "CS29001", title: "Data Structures Laboratory", credits: 1 },
          { code: "EC29005", title: "Digital Systems Design Laboratory", credits: 1 }
        ]
      }
    ]
  },
  {
    semester: 4,
    sections: [
      {
        type: "Theory",
        courses: [
          { code: "EX20003", title: "Scientific and Technical Writing OR HASS Elective-II", credits: 2 },
          { code: "MA21002", title: "Discrete Structures", credits: 4 },
          { code: "CS20002", title: "Operating Systems", credits: 3 },
          { code: "CS20004", title: "Object-Oriented Programming using Java", credits: 3 },
          { code: "CS20006", title: "Database Management Systems", credits: 3 },
          { code: "CS21002", title: "Computer Organization and Architecture", credits: 4 }
        ]
      },
      {
        type: "Practical",
        courses: [
          { code: "CS29002", title: "Operating Systems Laboratory", credits: 1 },
          { code: "CS29004", title: "Java Programming Laboratory", credits: 1 },
          { code: "CS29006", title: "Database Management Systems Laboratory", credits: 1 }
        ]
      }
    ]
  }
];

// Branch-specific course structure
export const branchCourseStructure: BranchCourseStructure = {
  "Computer Science and Engineering": [
    ...commonSemesters,
    {
      semester: 5,
      sections: [
        {
          type: "Theory",
          courses: [
            { code: "HS30101", title: "Engineering Economics", credits: 3 },
            { code: "CS30001", title: "Design and Analysis of Algorithms", credits: 3 },
            { code: "CS31001", title: "Software Engineering", credits: 3 },
            { code: "CS30003", title: "Computer Networks", credits: 3 },
            { code: "PE1", title: "Professional Elective-I", credits: 3 },
            { code: "PE2", title: "Professional Elective-II", credits: 3 }
          ]
        },
        {
          type: "Practical",
          courses: [
            { code: "CS39001", title: "Algorithms Laboratory", credits: 1 },
            { code: "CS39003", title: "Computer Networks Laboratory", credits: 1 },
            { code: "KE1", title: "K-Explore Open Elective-I", credits: 1 }
          ]
        }
      ]
    },
    {
      semester: 6,
      sections: [
        {
          type: "Theory",
          courses: [
            { code: "HASS3", title: "HASS Elective-III", credits: 3 },
            { code: "CS31002", title: "Machine Learning", credits: 3 },
            { code: "CS30002", title: "Artificial Intelligence", credits: 3 },
            { code: "PE3", title: "Professional Elective-III", credits: 3 },
            { code: "OE2", title: "Open Elective-II/MLI", credits: 3 },
            { code: "HS30401", title: "Universal Human Values", credits: 3 }
          ]
        },
        {
          type: "Practical",
          courses: [
            { code: "CS39002", title: "Machine Learning Laboratory", credits: 1 },
            { code: "CS39004", title: "Artificial Intelligence Laboratory", credits: 1 },
            { code: "KE30002", title: "K-Explore Open Elective-II", credits: 1 }
          ]
        }
      ]
    }
  ],
  "Information Technology": [
    ...commonSemesters,
    {
      semester: 5,
      sections: [
        {
          type: "Theory",
          courses: [
            { code: "HASS2", title: "HASS Elective-II", credits: 3 },
            { code: "CS30001", title: "Design and Analysis of Algorithms", credits: 3 },
            { code: "CS31001", title: "Software Engineering", credits: 4 },
            { code: "CS30003", title: "Computer Networks", credits: 3 },
            { code: "PE1", title: "Professional Elective-I", credits: 3 },
            { code: "PE2", title: "Professional Elective-II", credits: 3 }
          ]
        },
        {
          type: "Practical",
          courses: [
            { code: "CS39001", title: "Algorithms Laboratory", credits: 1 },
            { code: "CS39003", title: "Computer Networks Laboratory", credits: 1 },
            { code: "KE1", title: "K-Explore Open Elective-I", credits: 1 }
          ]
        }
      ]
    },
    {
      semester: 6,
      sections: [
        {
          type: "Theory",
          courses: [
            { code: "HASS3", title: "HASS Elective-III", credits: 3 },
            { code: "CS31002", title: "Machine Learning", credits: 4 },
            { code: "CS30004", title: "Data Science and Analytics", credits: 3 },
            { code: "PE3", title: "Professional Elective-III", credits: 3 },
            { code: "OE2", title: "Open Elective-II / MI-I", credits: 3 },
            { code: "HS30401", title: "Universal Human Values", credits: 3 }
          ]
        },
        {
          type: "Practical",
          courses: [
            { code: "CS39004", title: "Data Analytics Laboratory", credits: 1 },
            { code: "CS39006", title: "Advance Programming Laboratory", credits: 2 },
            { code: "CS37001", title: "Mini Project", credits: 2 }
          ]
        }
      ]
    }
  ],
  "Computer Science and Communication Engineering": [
    ...commonSemesters,
    {
      semester: 5,
      sections: [
        {
          type: "Theory",
          courses: [
            { code: "HASS2", title: "HASS Elective-II", credits: 3 },
            { code: "CS30001", title: "Design and Analysis of Algorithms", credits: 3 },
            { code: "CS31001", title: "Software Engineering", credits: 4 },
            { code: "CS30003", title: "Computer Networks", credits: 3 },
            { code: "PE1", title: "Professional Elective-I", credits: 3 },
            { code: "PE2", title: "Professional Elective-II", credits: 3 }
          ]
        },
        {
          type: "Practical",
          courses: [
            { code: "CS39001", title: "Algorithms Laboratory", credits: 1 },
            { code: "CS39003", title: "Computer Networks Laboratory", credits: 1 },
            { code: "KE1", title: "K-Explore Open Elective-I", credits: 1 }
          ]
        }
      ]
    },
    {
      semester: 6,
      sections: [
        {
          type: "Theory",
          courses: [
            { code: "HASS3", title: "HASS Elective-III", credits: 3 },
            { code: "CS30010", title: "Cloud Computing", credits: 3 },
            { code: "EC30002", title: "Wireless Mobile Communication", credits: 3 },
            { code: "PE3", title: "Professional Elective-III", credits: 3 },
            { code: "OE2", title: "Open Elective-II / MI-I", credits: 3 },
            { code: "HS30401", title: "Universal Human Values", credits: 3 }
          ]
        },
        {
          type: "Practical",
          courses: [
            { code: "EC39002", title: "Wireless Communication & Networking Lab", credits: 1 },
            { code: "CS39006", title: "Advance Programming Laboratory", credits: 2 },
            { code: "CS37001", title: "Mini Project", credits: 2 }
          ]
        }
      ]
    }
  ],
  "Computer Science and Systems Engineering": [
    ...commonSemesters,
    {
      semester: 5,
      sections: [
        {
          type: "Theory",
          courses: [
            { code: "HASS2", title: "HASS Elective-II", credits: 3 },
            { code: "CS30001", title: "Design and Analysis of Algorithms", credits: 3 },
            { code: "CS31001", title: "Software Engineering", credits: 4 },
            { code: "CS30003", title: "Computer Networks", credits: 3 },
            { code: "PE1", title: "Professional Elective-I", credits: 3 },
            { code: "PE2", title: "Professional Elective-II", credits: 3 }
          ]
        },
        {
          type: "Practical",
          courses: [
            { code: "CS39001", title: "Algorithms Laboratory", credits: 1 },
            { code: "CS39003", title: "Computer Networks Laboratory", credits: 1 },
            { code: "KE1", title: "K-Explore Open Elective-I", credits: 1 }
          ]
        }
      ]
    },
    {
      semester: 6,
      sections: [
        {
          type: "Theory",
          courses: [
            { code: "HASS3", title: "HASS Elective-III", credits: 3 },
            { code: "CS30006", title: "Compilers", credits: 3 },
            { code: "EC30007", title: "ARM and Advanced Microprocessors", credits: 3 },
            { code: "PE3", title: "Professional Elective-III", credits: 3 },
            { code: "OE2", title: "Open Elective-II / MI-I", credits: 3 },
            { code: "HS30401", title: "Universal Human Values", credits: 3 }
          ]
        },
        {
          type: "Practical",
          courses: [
            { code: "EC39006", title: "ARM Laboratory", credits: 1 },
            { code: "CS39006", title: "Advance Programming Laboratory", credits: 2 },
            { code: "CS37001", title: "Mini Project", credits: 2 }
          ]
        }
      ]
    }
  ]
};

// For backward compatibility, default to CSE
export const courseStructure: Semester[] = branchCourseStructure["Computer Science and Engineering"];

export const branches = [
  "Computer Science and Engineering",
  "Information Technology",
  "Computer Science and Communication Engineering",
  "Computer Science and Systems Engineering"
];
