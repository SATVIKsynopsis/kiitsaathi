/**
 * Mechanical Engineering (MSE) - 4th Semester Timetable
 * Spring 2025-26 | Effective from: 01-12-2025
 * 
 * Sections: M1, M2, M3, M4
 * Timings: 8:00 AM to 6:00 PM
 */

// Type definitions
interface TimingSlot {
  time: string;
  subject: string;
  room: string;
  faculty: string;
}

interface WeeklyTimetable {
  [day: string]: TimingSlot[];
}

interface RollRange {
  start: number;
  end: number;
}

interface SectionData {
  sectionName: string;
  rollRange: {
    batch1: RollRange;
    batch2?: RollRange;
  };
  timetable: WeeklyTimetable;
}

interface CourseMapping {
  [courseCode: string]: string;
}

interface Timings {
  start: string;
  end: string;
  slotDuration: string;
}

interface Notes {
  lab: string;
  classroom: string;
  break: string;
  weeklySchedule: string;
  courseCredits: {
    Lab: string;
    Theory: string;
  };
}

interface Metadata {
  program: string;
  semester: string;
  year: string;
  effectiveFrom: string;
  timings: Timings;
}

interface MechanicalTimetableData {
  metadata: Metadata;
  sections: {
    [sectionCode: string]: SectionData;
  };
  courses: CourseMapping;
  notes: Notes;
}

interface TodaySchedule {
  day: string;
  section: string;
  timetable: TimingSlot[];
}

// Main data object
export const mechanicalTimetable: MechanicalTimetableData = {
  metadata: {
    program: "B. Tech in Mechanical Engineering",
    semester: "4th Semester",
    year: "2025-2026",
    effectiveFrom: "01-12-2025",
    timings: {
      start: "8:00 AM",
      end: "6:00 PM",
      slotDuration: "1 hour"
    }
  },

  sections: {
    
    M1: {
      sectionName: "M1",
      rollRange: {
        batch1: { start: 2402001, end: 2402052 },
        batch2: { start: 2502601, end: 2502607 }
      },
      timetable: {
        Monday: [
          { time: "8:00-9:00", subject: "---", room: "---", faculty: "---" },
          { time: "9:00-11:00", subject: "MKD Lab (M11) / CP Lab (M12)", room: "Lab", faculty: "---" },
          { time: "11:00-12:00", subject: "MT-II", room: "301", faculty: "---" },
          { time: "12:00-1:00", subject: "VPCA", room: "301", faculty: "---" },
          { time: "1:00-2:00", subject: "OB", room: "301", faculty: "---" },
          { time: "2:00-3:00", subject: "LUNCH BREAK", room: "---", faculty: "---" },
          { time: "3:00-4:00", subject: "---", room: "---", faculty: "---" },
          { time: "4:00-5:00", subject: "---", room: "---", faculty: "---" },
          { time: "5:00-6:00", subject: "---", room: "---", faculty: "---" }
        ],
        Tuesday: [
          { time: "8:00-9:00", subject: "---", room: "---", faculty: "---" },
          { time: "9:00-11:00", subject: "CP Lab (M11) / MP-II Sessional (M12)", room: "Lab", faculty: "---" },
          { time: "11:00-12:00", subject: "ET", room: "301", faculty: "---" },
          { time: "12:00-1:00", subject: "KDM", room: "301", faculty: "---" },
          { time: "1:00-2:00", subject: "OB", room: "301", faculty: "---" },
          { time: "2:00-3:00", subject: "---", room: "---", faculty: "---" },
          { time: "3:00-4:00", subject: "---", room: "---", faculty: "---" },
          { time: "4:00-5:00", subject: "---", room: "---", faculty: "---" },
          { time: "5:00-6:00", subject: "---", room: "---", faculty: "---" }
        ],
        Wednesday: [
          { time: "8:00-9:00", subject: "Ind 4.0 Tech.", room: "301", faculty: "---" },
          { time: "9:00-10:00", subject: "VPCA", room: "301", faculty: "---" },
          { time: "10:00-11:00", subject: "MT-II", room: "301", faculty: "---" },
          { time: "11:00-12:00", subject: "KDM", room: "301", faculty: "---" },
          { time: "12:00-1:00", subject: "ET", room: "301", faculty: "---" },
          { time: "1:00-2:00", subject: "OB", room: "301", faculty: "---" },
          { time: "2:00-3:00", subject: "---", room: "---", faculty: "---" },
          { time: "3:00-5:00", subject: "MDSM Sessional (M11) / MKD Lab (M12)", room: "Lab", faculty: "---" },
          { time: "5:00-6:00", subject: "---", room: "---", faculty: "---" }
        ],
        Thursday: [
          { time: "8:00-9:00", subject: "VPCA", room: "301", faculty: "---" },
          { time: "9:00-10:00", subject: "ET", room: "301", faculty: "---" },
          { time: "10:00-11:00", subject: "Ind 4.0 Tech.", room: "301", faculty: "---" },
          { time: "11:00-12:00", subject: "KDM", room: "301", faculty: "---" },
          { time: "12:00-1:00", subject: "MT-II", room: "301", faculty: "---" },
          { time: "1:00-2:00", subject: "---", room: "---", faculty: "---" },
          { time: "2:00-3:00", subject: "---", room: "---", faculty: "---" },
          { time: "3:00-4:00", subject: "---", room: "---", faculty: "---" },
          { time: "4:00-5:00", subject: "---", room: "---", faculty: "---" },
          { time: "5:00-6:00", subject: "---", room: "---", faculty: "---" }
        ],
        Friday: [
          { time: "8:00-9:00", subject: "VPCA", room: "301", faculty: "---" },
          { time: "9:00-11:00", subject: "MP-II Sessional (M11) / MDSM Sessional (M12)", room: "Lab", faculty: "---" },
          { time: "11:00-12:00", subject: "MT-II", room: "301", faculty: "---" },
          { time: "12:00-1:00", subject: "ET", room: "301", faculty: "---" },
          { time: "1:00-2:00", subject: "---", room: "---", faculty: "---" },
          { time: "2:00-3:00", subject: "---", room: "---", faculty: "---" },
          { time: "3:00-4:00", subject: "---", room: "---", faculty: "---" },
          { time: "4:00-5:00", subject: "---", room: "---", faculty: "---" },
          { time: "5:00-6:00", subject: "---", room: "---", faculty: "---" }
        ],
        Saturday: [
          { time: "8:00-6:00", subject: "Weekend", room: "---", faculty: "---" }
        ],
        Sunday: [
          { time: "8:00-6:00", subject: "Weekend", room: "---", faculty: "---" }
        ]
      }
    },

    M2: {
      sectionName: "M2",
      rollRange: {
        batch1: { start: 2402053, end: 2402110 },
        batch2: { start: 2502608, end: 2502616 }
      },
      timetable: {
        Monday: [
          { time: "8:00-9:00", subject: "---", room: "---", faculty: "---" },
          { time: "9:00-10:00", subject: "KDM", room: "302", faculty: "---" },
          { time: "10:00-11:00", subject: "MT-II", room: "302", faculty: "---" },
          { time: "11:00-12:00", subject: "VPCA", room: "302", faculty: "---" },
          { time: "12:00-1:00", subject: "OB", room: "302", faculty: "---" },
          { time: "1:00-2:00", subject: "ET", room: "302", faculty: "---" },
          { time: "2:00-3:00", subject: "LUNCH BREAK", room: "---", faculty: "---" },
          { time: "3:00-5:00", subject: "MP-II Sessional (M21) / MDSM Sessional (M22)", room: "Lab", faculty: "---" },
          { time: "5:00-6:00", subject: "---", room: "---", faculty: "---" }
        ],
        Tuesday: [
          { time: "8:00-9:00", subject: "VPCA", room: "302", faculty: "---" },
          { time: "9:00-10:00", subject: "ET", room: "302", faculty: "---" },
          { time: "10:00-11:00", subject: "KDM", room: "302", faculty: "---" },
          { time: "11:00-12:00", subject: "MT-II", room: "302", faculty: "---" },
          { time: "12:00-1:00", subject: "OB", room: "302", faculty: "---" },
          { time: "1:00-2:00", subject: "Ind 4.0 Tech.", room: "302", faculty: "---" },
          { time: "2:00-3:00", subject: "---", room: "---", faculty: "---" },
          { time: "3:00-4:00", subject: "---", room: "---", faculty: "---" },
          { time: "4:00-5:00", subject: "---", room: "---", faculty: "---" },
          { time: "5:00-6:00", subject: "---", room: "---", faculty: "---" }
        ],
        Wednesday: [
          { time: "8:00-9:00", subject: "---", room: "---", faculty: "---" },
          { time: "9:00-11:00", subject: "MKD Lab (M21) / CP Lab (M22)", room: "Lab", faculty: "---" },
          { time: "11:00-12:00", subject: "MT-II", room: "302", faculty: "---" },
          { time: "12:00-1:00", subject: "ET", room: "302", faculty: "---" },
          { time: "1:00-2:00", subject: "OB", room: "302", faculty: "---" },
          { time: "2:00-3:00", subject: "---", room: "---", faculty: "---" },
          { time: "3:00-4:00", subject: "---", room: "---", faculty: "---" },
          { time: "4:00-5:00", subject: "---", room: "---", faculty: "---" },
          { time: "5:00-6:00", subject: "---", room: "---", faculty: "---" }
        ],
        Thursday: [
          { time: "8:00-11:00", subject: "CP Lab (M21) / MP-II Sessional (M22)", room: "Lab", faculty: "---" },
          { time: "11:00-12:00", subject: "MT-II", room: "302", faculty: "---" },
          { time: "12:00-1:00", subject: "VPCA", room: "302", faculty: "---" },
          { time: "1:00-2:00", subject: "OB", room: "302", faculty: "---" },
          { time: "2:00-3:00", subject: "---", room: "---", faculty: "---" },
          { time: "3:00-4:00", subject: "MKD Lab (M12)", room: "---", faculty: "---" },
          { time: "4:00-5:00", subject: "---", room: "---", faculty: "---" },
          { time: "5:00-6:00", subject: "---", room: "---", faculty: "---" }
        ],
        Friday: [
          { time: "8:00-9:00", subject: "---", room: "---", faculty: "---" },
          { time: "9:00-10:00", subject: "VPCA", room: "302", faculty: "---" },
          { time: "10:00-12:00", subject: "Ind 4.0 Tech.", room: "302", faculty: "---" },
          { time: "12:00-1:00", subject: "ET", room: "302", faculty: "---" },
          { time: "1:00-2:00", subject: "KDM", room: "302", faculty: "---" },
          { time: "2:00-3:00", subject: "---", room: "---", faculty: "---" },
          { time: "3:00-5:00", subject: "MDSM Sessional (M21) / MKD Lab (M22)", room: "Lab", faculty: "---" },
          { time: "5:00-6:00", subject: "---", room: "---", faculty: "---" }
        ],
        Saturday: [
          { time: "8:00-6:00", subject: "Weekend", room: "---", faculty: "---" }
        ],
        Sunday: [
          { time: "8:00-6:00", subject: "Weekend", room: "---", faculty: "---" }
        ]
      }
    },

    M3: {
      sectionName: "M3",
      rollRange: {
        batch1: { start: 2409001, end: 2409023 }
      },
      timetable: {
        Monday: [
          { time: "8:00-9:00", subject: "---", room: "---", faculty: "---" },
          { time: "9:00-11:00", subject: "MP Sessional (M3)", room: "Lab", faculty: "---" },
          { time: "11:00-12:00", subject: "MPA", room: "303", faculty: "---" },
          { time: "12:00-1:00", subject: "OB", room: "302", faculty: "---" },
          { time: "1:00-2:00", subject: "ET", room: "303", faculty: "---" },
          { time: "2:00-3:00", subject: "LUNCH BREAK", room: "---", faculty: "---" },
          { time: "3:00-4:00", subject: "---", room: "---", faculty: "---" },
          { time: "4:00-5:00", subject: "---", room: "---", faculty: "---" },
          { time: "5:00-6:00", subject: "---", room: "---", faculty: "---" }
        ],
        Tuesday: [
          { time: "8:00-10:00", subject: "AMCT Lab (M3)", room: "Lab", faculty: "---" },
          { time: "10:00-11:00", subject: "VPCA", room: "303", faculty: "---" },
          { time: "11:00-12:00", subject: "MPA", room: "303", faculty: "---" },
          { time: "12:00-1:00", subject: "OB", room: "302", faculty: "---" },
          { time: "1:00-2:00", subject: "ASTS", room: "303", faculty: "---" },
          { time: "2:00-3:00", subject: "---", room: "---", faculty: "---" },
          { time: "3:00-4:00", subject: "---", room: "---", faculty: "---" },
          { time: "4:00-5:00", subject: "---", room: "---", faculty: "---" },
          { time: "5:00-6:00", subject: "---", room: "---", faculty: "---" }
        ],
        Wednesday: [
          { time: "8:00-9:00", subject: "ASTS", room: "303", faculty: "---" },
          { time: "9:00-10:00", subject: "Ind 4.0 Tech.", room: "303", faculty: "---" },
          { time: "10:00-11:00", subject: "VPCA", room: "303", faculty: "---" },
          { time: "11:00-12:00", subject: "ET", room: "303", faculty: "---" },
          { time: "12:00-1:00", subject: "MPA", room: "303", faculty: "---" },
          { time: "1:00-2:00", subject: "OB", room: "303", faculty: "---" },
          { time: "2:00-3:00", subject: "---", room: "---", faculty: "---" },
          { time: "3:00-4:00", subject: "---", room: "---", faculty: "---" },
          { time: "4:00-5:00", subject: "---", room: "---", faculty: "---" },
          { time: "5:00-6:00", subject: "---", room: "---", faculty: "---" }
        ],
        Thursday: [
          { time: "8:00-9:00", subject: "ASTS", room: "303", faculty: "---" },
          { time: "9:00-10:00", subject: "Ind 4.0 Tech.", room: "303", faculty: "---" },
          { time: "10:00-11:00", subject: "VPCA", room: "303", faculty: "---" },
          { time: "11:00-12:00", subject: "ET", room: "303", faculty: "---" },
          { time: "12:00-1:00", subject: "OB", room: "302", faculty: "---" },
          { time: "1:00-2:00", subject: "---", room: "---", faculty: "---" },
          { time: "2:00-3:00", subject: "---", room: "---", faculty: "---" },
          { time: "3:00-5:00", subject: "CP Lab (M3)", room: "Lab", faculty: "---" },
          { time: "5:00-6:00", subject: "---", room: "---", faculty: "---" }
        ],
        Friday: [
          { time: "8:00-10:00", subject: "MKD Lab (M3)", room: "Lab", faculty: "---" },
          { time: "10:00-11:00", subject: "VPCA", room: "303", faculty: "---" },
          { time: "11:00-12:00", subject: "MPA", room: "303", faculty: "---" },
          { time: "12:00-1:00", subject: "ET", room: "303", faculty: "---" },
          { time: "1:00-2:00", subject: "---", room: "---", faculty: "---" },
          { time: "2:00-3:00", subject: "---", room: "---", faculty: "---" },
          { time: "3:00-4:00", subject: "---", room: "---", faculty: "---" },
          { time: "4:00-5:00", subject: "---", room: "---", faculty: "---" },
          { time: "5:00-6:00", subject: "---", room: "---", faculty: "---" }
        ],
        Saturday: [
          { time: "8:00-6:00", subject: "Weekend", room: "---", faculty: "---" }
        ],
        Sunday: [
          { time: "8:00-6:00", subject: "Weekend", room: "---", faculty: "---" }
        ]
      }
    },

    M4: {
      sectionName: "M4",
      rollRange: {
        batch1: { start: 2426001, end: 2426021 },
        batch2: { start: 2526301, end: 2526304 }
      },
      timetable: {
        Monday: [
          { time: "8:00-9:00", subject: "---", room: "---", faculty: "---" },
          { time: "9:00-10:00", subject: "---", room: "---", faculty: "---" },
          { time: "10:00-11:00", subject: "KDM", room: "304", faculty: "---" },
          { time: "11:00-12:00", subject: "EC", room: "304", faculty: "---" },
          { time: "12:00-1:00", subject: "MES", room: "304", faculty: "---" },
          { time: "1:00-2:00", subject: "OB", room: "301", faculty: "---" },
          { time: "2:00-3:00", subject: "LUNCH BREAK", room: "---", faculty: "---" },
          { time: "3:00-5:00", subject: "MKD Lab (M4)", room: "Lab", faculty: "---" },
          { time: "5:00-6:00", subject: "---", room: "---", faculty: "---" }
        ],
        Tuesday: [
          { time: "8:00-9:00", subject: "---", room: "---", faculty: "---" },
          { time: "9:00-10:00", subject: "CP Lab (M12)", room: "---", faculty: "---" },
          { time: "10:00-11:00", subject: "VPCA", room: "303", faculty: "---" },
          { time: "11:00-12:00", subject: "EC", room: "304", faculty: "---" },
          { time: "12:00-1:00", subject: "MES", room: "304", faculty: "---" },
          { time: "1:00-2:00", subject: "OB", room: "301", faculty: "---" },
          { time: "2:00-3:00", subject: "---", room: "---", faculty: "---" },
          { time: "3:00-5:00", subject: "MES Lab (M4)", room: "Lab", faculty: "---" },
          { time: "5:00-6:00", subject: "---", room: "---", faculty: "---" }
        ],
        Wednesday: [
          { time: "8:00-9:00", subject: "---", room: "---", faculty: "---" },
          { time: "9:00-10:00", subject: "Ind 4.0 Tech.", room: "303", faculty: "---" },
          { time: "10:00-11:00", subject: "VPCA", room: "303", faculty: "---" },
          { time: "11:00-12:00", subject: "EC", room: "304", faculty: "---" },
          { time: "12:00-1:00", subject: "KDM", room: "304", faculty: "---" },
          { time: "1:00-2:00", subject: "OB", room: "304", faculty: "---" },
          { time: "2:00-3:00", subject: "---", room: "---", faculty: "---" },
          { time: "3:00-4:00", subject: "---", room: "---", faculty: "---" },
          { time: "4:00-5:00", subject: "---", room: "---", faculty: "---" },
          { time: "5:00-6:00", subject: "---", room: "---", faculty: "---" }
        ],
        Thursday: [
          { time: "8:00-9:00", subject: "---", room: "---", faculty: "---" },
          { time: "9:00-10:00", subject: "Ind 4.0 Tech.", room: "303", faculty: "---" },
          { time: "10:00-11:00", subject: "VPCA", room: "303", faculty: "---" },
          { time: "11:00-12:00", subject: "MES", room: "304", faculty: "---" },
          { time: "12:00-1:00", subject: "KDM", room: "304", faculty: "---" },
          { time: "1:00-2:00", subject: "OB", room: "301", faculty: "---" },
          { time: "2:00-3:00", subject: "---", room: "---", faculty: "---" },
          { time: "3:00-5:00", subject: "DSM Sessional (M4)", room: "Lab", faculty: "---" },
          { time: "5:00-6:00", subject: "---", room: "---", faculty: "---" }
        ],
        Friday: [
          { time: "8:00-9:00", subject: "---", room: "---", faculty: "---" },
          { time: "9:00-10:00", subject: "MP-II Sessional (M12)", room: "301", faculty: "---" },
          { time: "10:00-11:00", subject: "VPCA", room: "303", faculty: "---" },
          { time: "11:20-1:20", subject: "EC Lab (M4)", room: "Lab", faculty: "---" },
          { time: "1:20-2:00", subject: "---", room: "---", faculty: "---" },
          { time: "2:00-3:00", subject: "---", room: "---", faculty: "---" },
          { time: "3:00-4:00", subject: "---", room: "---", faculty: "---" },
          { time: "4:00-5:00", subject: "---", room: "---", faculty: "---" },
          { time: "5:00-6:00", subject: "---", room: "---", faculty: "---" }
        ],
        Saturday: [
          { time: "8:00-6:00", subject: "Weekend", room: "---", faculty: "---" }
        ],
        Sunday: [
          { time: "8:00-6:00", subject: "Weekend", room: "---", faculty: "---" }
        ]
      }
    }
  },

  // Course/Subject codes
  courses: {
    "MT-II": "Manufacturing Technology - II",
    "VPCA": "Value and Process Chain Analysis",
    "OB": "Operations Management",
    "ET": "Engineering Technology",
    "KDM": "Knowledge Discovery & Mining",
    "MKD": "Modern Knowledge Discovery",
    "CP": "Critical Processes",
    "MDSM": "Material Design & Strength Modeling",
    "MP-II": "Manufacturing Processes - II",
    "Ind 4.0 Tech.": "Industry 4.0 Technology"
  },

  // Lab locations and notes
  notes: {
    lab: "All lab sessions conducted in designated lab rooms",
    classroom: "Theory classes conducted in rooms 301 onwards",
    break: "Lunch break from 2:00-3:00 PM",
    weeklySchedule: "Monday to Friday (5 days)",
    courseCredits: {
      "Lab": "2 credits",
      "Theory": "3-4 credits"
    }
  }
};

/**
 * Helper function to get timetable for a specific section
 * @param sectionCode - Section code (M1, M2, M3, M4)
 * @returns Section data or null if not found
 */
export const getMechanicalSectionTimetable = (sectionCode: string): SectionData | null => {
  const section = mechanicalTimetable.sections[sectionCode.toUpperCase()];
  if (!section) {
    console.error(`Section ${sectionCode} not found in mechanical timetable`);
    return null;
  }
  return section;
};

/**
 * Helper function to get section from roll number
 * @param rollNumber - Student roll number
 * @returns Section code (M1, M2, M3, M4) or null if not found
 */
export const getMechanicalSectionFromRoll = (rollNumber: string | number): string | null => {
  const roll = parseInt(rollNumber.toString());
  
  for (const [sectionCode, sectionData] of Object.entries(mechanicalTimetable.sections)) {
    const batchValues = Object.values(sectionData.rollRange);
    for (const batch of batchValues) {
      if (roll >= batch.start && roll <= batch.end) {
        return sectionCode;
      }
    }
  }
  
  return null;
};

/**
 * Helper function to get today's timetable
 * @param sectionCode - Section code (M1, M2, M3, M4)
 * @returns Today's timetable or null if section not found
 */
export const getTodayMechanicalTimetable = (sectionCode: string): TodaySchedule | null => {
  const section = getMechanicalSectionTimetable(sectionCode);
  if (!section) return null;
  
  const days: string[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const todayIndex = new Date().getDay();
  const todayName = days[todayIndex];
  
  return {
    day: todayName,
    section: sectionCode,
    timetable: section.timetable[todayName] || []
  };
};

export default mechanicalTimetable;
