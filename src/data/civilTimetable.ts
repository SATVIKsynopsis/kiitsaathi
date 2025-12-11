/**
 * Civil Engineering - 2nd Year (4th Semester) Timetable
 * B.Tech Civil Engineering
 * Time: 9:00 AM to 6:00 PM
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

interface SectionData {
  sectionName: string;
  rollRange?: {
    batch1?: { start: number; end: number };
    batch2?: { start: number; end: number };
    
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
  courseCredits?: {
    Lab?: string;
    Theory?: string;
  };
}

interface Metadata {
  program: string;
  year: string;
  semester: string;
  effectiveFrom: string;
  timings: Timings;
}

interface CivilTimetableData {
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
export const civilTimetable: CivilTimetableData = {
  metadata: {
    program: "B.Tech Civil Engineering",
    year: "2nd Year",
    semester: "4th Semester",
    effectiveFrom: "2025-2026",
    timings: {
      start: "9:00 AM",
      end: "6:00 PM",
      slotDuration: "1 hour"
    }
  },

  sections: {
    "CE": {
      sectionName: "CE",
      timetable: {
        Monday: [
          { time: "9:00-10:00", subject: "VPCA (SKS) C1 [Odd] / HASS-II (OB) (NM) C2 [Even]  ", room: "C1", faculty: "---" },
          { time: "10:00-11:00", subject: "SM (BGM) C1 / SM (BP) C2", room: "C1", faculty: "---" },
          { time: "11:00-12:00", subject: "SA (TBM) C1 / SA (DKB) C2 ", room: "C1", faculty: "---" },
          { time: "12:00-2:00", subject: "I4T (RRT) C1 [Odd] / VPCA (SKS) C2 [Even]", room: "C1", faculty: "---" },
          { time: "1:00-2:00", subject: "---", room: "---", faculty: "---" },
          { time: "2:00-3:00", subject: "---", room: "---", faculty: "---" },
          { time: "3:00-4:00", subject: "---", room: "---", faculty: "---" },
          { time: "4:00-6:00", subject: "Kareer Class C1 / Kareer Class C2 ", room: "---", faculty: "---" },
          
        ],
        Tuesday: [
          { time: "9:00-10:00", subject: "SA (TBM) C1 / SA (DKB) C2 ", room: "C1", faculty: "---" },
          { time: "10:00-11:00", subject: "WRE (KPS) C1 / WRE (BD) C2 ", room: "C1", faculty: "---" },
          { time: "11:00-12:00", subject: "Kareer Class C1 / Kareer Class C2", room: "C1", faculty: "---" },
          { time: "12:00-2:00", subject: "SMLaRGR-3 (RC) / FMLabGR-2 (KPS) / WSSUDGR-1 (SM) C1", room: "C1", faculty: "---" },
          { time: "1:00-2:00", subject: "---", room: "---", faculty: "---" },
          { time: "2:00-3:00", subject: "---", room: "---", faculty: "---" },
          { time: "3:00-4:00", subject: "---", room: "---", faculty: "---" },
          { time: "4:00-6:00", subject: "HASS-II (OB) (DN) C1 [Odd] / I4T (RRT) C2 [Even] ", room: "C1", faculty: "---" },
          
        ],
        Wednesday: [
          { time: "9:00-10:00", subject: "WRE (KPS) C1 / WRE (BD) C2", room: "C1", faculty: "---" },
          { time: "10:00-11:00", subject: "SM (BGM) C1 / SM (BP) C2 ", room: "C1", faculty: "---" },
          { time: "11:00-12:00", subject: "HASS-II (OB) (DN) C1 / HASS-II (OB) (NM) C2", room: "C1", faculty: "---" },
          { time: "12:00-2:00", subject: "SFWGR-1 (GU) / FM Lab GR-3 (PMC) / WSSUDGR-2 (KS) C1 ", room: "C1", faculty: "---" },
          { time: "1:00-2:00", subject: "---", room: "---", faculty: "---" },
          { time: "2:00-3:00", subject: "---", room: "---", faculty: "---" },
          { time: "3:00-4:00", subject: "---", room: "---", faculty: "---" },
          { time: "4:00-6:00", subject: "VPCA (SKS) C1 [Odd]", room: "C1", faculty: "---" }
        ],
        Thursday: [
          { time: "9:00-10:00", subject: "SM (BGM) C1 / SM (BP) C2 ", room: "C1", faculty: "---" },
          { time: "10:00-11:00", subject: "SA (TBM) C1 / SA (DKB) C2 ", room: "C1", faculty: "---" },
          { time: "11:00-12:00", subject: "WRE (KPS) C1 / WRE (BD) C2", room: "C1", faculty: "---" },
          { time: "12:00-2:00", subject: "SMLab GR-2 (PNN) / FM Lab GR-1 (KPS) / SFWLabGR-3 (SRS) ", room: "C1", faculty: "---" },
          { time: "1:00-2:00", subject: "---", room: "---", faculty: "---" },
          { time: "2:00-3:00", subject: "---", room: "---", faculty: "---" },
          { time: "3:00-4:00", subject: "---", room: "---", faculty: "---" },
          { time: "4:00-6:00", subject: "VPCA (SKS) C2 [Even]", room: "C1", faculty: "---" },
          
        ],
        Friday: [
          { time: "9:00-10:00", subject: "VPCA (SKS) C1 [Odd] / HASS-II (OB) (NM) C2 ", room: "C1", faculty: "---" },
          { time: "10:00-11:00", subject: "SA (TBM) C1 / SA (DKB) C2", room: "C1", faculty: "---" },
          { time: "11:00-12:00", subject: "WRE (KPS) C1 / WRE (BD) C2 ", room: "C1", faculty: "---" },
          { time: "12:00-2:00", subject: "SMLaRGR-1(MCM) / SFW GR-2 (PNN) / WSSUDGR-3(KS) C1 ", room: "C1", faculty: "---" },
          { time: "1:00-2:00", subject: "---", room: "---", faculty: "---" },
          { time: "2:00-3:00", subject: "---", room: "---", faculty: "---" },
          { time: "3:00-4:00", subject: "---", room: "---", faculty: "---" },
          { time: "4:00-5:00", subject: "---", room: "---", faculty: "---" },
          { time: "5:00-6:00", subject: "---", room: "---", faculty: "---" }
        ],
        Saturday: [
          { time: "9:00-6:00", subject: "Weekend", room: "---", faculty: "---" }
        ],
        Sunday: [
          { time: "9:00-6:00", subject: "Weekend", room: "---", faculty: "---" }
        ]
      }
    },

    
  },

  // Course/Subject codes
  courses: {
    "VPCA": "Value and Process Chain Analysis",
    "SM": "Strength of Materials",
    "SA": "Structural Analysis",
    "I4T": "Industry 4.0 Technology",
    "WRE": "Water Resources Engineering",
    "HASS-II": "Humanities and Social Sciences - II",
    "SMLabGR": "Soil Mechanics and Laboratory",
    "FMLabGR": "Fluid Mechanics and Laboratory",
    "SFWGR": "Surface and Fluid Water Resources",
    "FM Lab": "Fluid Mechanics Lab",
    "WSSU(DGR": "Water Supply and Sanitation (Design)"
  },

  // Lab locations and notes
  notes: {
    lab: "Laboratory sessions conducted in designated lab rooms",
    classroom: "Theory classes conducted in classroom halls C1, C2",
    break: "Lunch break from 1:00-2:00 PM",
    weeklySchedule: "Monday to Friday (5 days)",
    courseCredits: {
      "Lab": "2 credits",
      "Theory": "3-4 credits"
    }
  }
};

/**
 * Helper function to get timetable for a specific section
 * @param sectionCode - Section code (C1, C2)
 * @returns Section data or null if not found
 */
export const getCivilSectionTimetable = (sectionCode: string): SectionData | null => {
  const section = civilTimetable.sections[sectionCode.toUpperCase()];
  if (!section) {
    console.error(`Section ${sectionCode} not found in civil timetable`);
    return null;
  }
  return section;
};

/**
 * Helper function to get today's timetable
 * @param sectionCode - Section code (C1, C2)
 * @returns Today's timetable or null if section not found
 */
export const getTodayCivilTimetable = (sectionCode: string): TodaySchedule | null => {
  const section = getCivilSectionTimetable(sectionCode);
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

export default civilTimetable;
