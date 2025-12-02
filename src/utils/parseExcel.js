import * as XLSX from 'xlsx';

let cachedDataMap = {}; // cache per semester key ('4' or '6')

/**
 * Determine semester key from roll number or year+section:
 * - starts with '24' => 4th semester
 * - starts with '23' => 6th semester
 * - year '2nd' => 4th semester
 * - year '3rd' => 6th semester
 */
const semesterKeyFromInput = (input) => {
  const s = String(input || '').trim();
  
  // Check if it's a year|section format
  if (s.includes('|')) {
    const [year] = s.split('|');
    if (year === '2nd') return '4';
    if (year === '3rd') return '6';
    return '6'; // default
  }
  
  // Otherwise treat as roll number
  if (s.startsWith('24')) return '4';
  if (s.startsWith('23')) return '6';
  return '6';
};

/** Normalize roll number */
const normalizeRoll = (r) => {
  if (!r) return { raw: '', digits: '' };
  const s = r.toString().trim();
  const digits = s.replace(/\D+/g, '');
  return { raw: s, digits };
};

/** --------------------------- PARSE EXCEL ---------------------------- */
export const parseExcelFiles = async (input) => {
  const semKey = semesterKeyFromInput(input);
  if (cachedDataMap[semKey]) {
    console.log(`Using cached data for semester ${semKey}`);
    return cachedDataMap[semKey];
  }

  try {
    const files = {
      '6': { filepath: '/data/6th_sem_Time-Table_and_Section_Detail.xlsx' },
      '4': { filepath: 'data/4th_semester_TT_and_Section_Detail.xlsx'}
    };

    const chosen = files[semKey] || files['6'];
    console.log(`Loading Excel file for semester ${semKey}: ${chosen.filepath}`);
    
    const response = await fetch(chosen.filepath);

    if (!response.ok) {
      throw new Error(`Failed to fetch Excel file: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });

    const ttSheet = workbook.Sheets[workbook.SheetNames[0]]; // Time Table
    const sdSheet = workbook.Sheets[workbook.SheetNames[1]]; // Section detail

    const ttData = XLSX.utils.sheet_to_json(ttSheet, { header: 1, defval: '' });
    const sdData = XLSX.utils.sheet_to_json(sdSheet, { header: 1, defval: '' });

    const timetable = parseTimetable(ttData, semKey);
    const sections = parseSections(sdData);

    console.log(`Parsed ${Object.keys(sections).length} roll numbers for semester ${semKey}`);
    console.log(`Parsed ${Object.keys(timetable).length} sections for semester ${semKey}`);

    const result = { sections, timetable, semKey };
    cachedDataMap[semKey] = result;
    return result;
  } catch (error) {
    console.error('Error parsing Excel files:', error);
    return { sections: {}, timetable: {} };
  }
};

/** --------------------------- PARSE TIMETABLE ---------------------------- */

const parseTimetable = (data, semKey) => {
  const timetable = {};
  
  const dayPatterns = [
    ['MON', 'TUE', 'WED', 'THU', 'FRI'],
    ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
    ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    ['MON(1)', 'TUE(1)', 'WED(1)', 'THU(1)', 'FRI(1)']
  ];

  let usedPattern = dayPatterns[0];
  for (const pattern of dayPatterns) {
    for (let i = 0; i < Math.min(50, data.length); i++) {
      const col0 = data[i][0]?.toString().toUpperCase().trim();
      if (pattern.some(day => col0?.includes(day))) {
        usedPattern = pattern.map(d => d.toUpperCase());
        console.log(`Detected day pattern:`, usedPattern);
        break;
      }
    }
  }

  console.log(`Parsing timetable for semester ${semKey}...`);
  console.log(`Using day pattern:`, usedPattern);

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const col0 = row[0]?.toString().toUpperCase().trim();
    
    const matchedDay = usedPattern.find(day => col0?.includes(day));
    
    if (matchedDay) {
      const day = matchedDay.substring(0, 3);
      const section = row[1]?.toString().trim();

      console.log(`Found day at row ${i}: ${day}, section: ${section}`);

      if (!section || section === 'Section' || section === '') continue;

      if (!timetable[section]) {
        timetable[section] = {};
      }

      const dayMap = {
        'MON': 'Monday',
        'TUE': 'Tuesday', 
        'WED': 'Wednesday',
        'THU': 'Thursday',
        'FRI': 'Friday'
      };

      const fullDay = dayMap[day] || day;
      const periods = parsePeriods(row, semKey);
      timetable[section][fullDay] = periods;
    }
  }

  console.log(`Sections created:`, Object.keys(timetable));

  Object.keys(timetable).forEach(sec => {
    timetable[sec]['Saturday'] = [];
    timetable[sec]['Sunday'] = [];
  });

  return timetable;
};

/** --------------------------- PARSE PERIODS ---------------------------- */

const parsePeriods = (row, semKey) => {
  const periods = [];

  console.log(`Parsing periods for row:`, row.slice(0, 20));

  const slots = [
    { time: "8:00-9:00",    subject: 3,  room: 2  },
    { time: "9:00-10:00",   subject: 5,  room: 4  },
    { time: "10:00-11:00",  subject: 6,  room: 4  },
    { time: "11:00-12:00",  subject: 8,  room: 7  },
    { time: "12:00-1:00",   subject:10,  room: 9  },
    { time: "1:00-2:00",    subject:11,  room: 9  },
    { time: "2:00-3:00",    subject:13,  room:12 },
    { time: "3:15-4:15",    subject:15,  room:14 },
    { time: "4:15-5:15",    subject:17,  room:16 },
    { time: "5:15-6:15",    subject:18,  room:16 }
  ];

  for (const slot of slots) {
    const subject = row[slot.subject]?.toString().trim();
    let room = row[slot.room]?.toString().trim();

    console.log(`Slot ${slot.time}: subject="${subject}" (col ${slot.subject}), room="${room}" (col ${slot.room})`);

    if (!subject || subject === "" || subject === "---") {
      console.log(`  -> Skipping (empty subject)`);
      continue;
    }

    if (subject === "X") {
      periods.push({
        time: slot.time,
        subject: "Free Period",
        room: room || "-",
        faculty: "-"
      });
      console.log(`  -> Added Free Period with room: ${room || "-"}`);
      continue;
    }

    if (room && room !== '-' && room !== '---') {
      const patterns = [
        /([A-Z]\d+-[A-Z]-\d+)/i,
        /([A-Z]\d+-[A-Z]\d+)/i,
        /([A-Z]-\d+)/i,
        /(Room\s*[A-Z]?\d+)/i,
        /([A-Z]\d+)/i,
        /(\d+)/
      ];

      let extractedRoom = room;
      for (const pattern of patterns) {
        const match = room.match(pattern);
        if (match) {
          extractedRoom = match[1];
          break;
        }
      }

      room = extractedRoom;
      console.log(`  -> Extracted room: "${room}"`);
    } else {
      room = "-";
      console.log(`  -> No room found, using "-"`);
    }

    periods.push({
      time: slot.time,
      subject,
      room: room || "-",
      faculty: "-"
    });
    console.log(`  -> Added period: ${subject} in ${room}`);
  }

  console.log(`Total periods parsed: ${periods.length}`);
  return periods;
};

/** --------------------------- PARSE SECTIONS ---------------------------- */

const parseSections = (data) => {
  const sections = {};

  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    if (row[0] && row[1]) {
      const rawRoll = row[0].toString().trim();
      const section = row[1].toString().trim();

      const { raw, digits } = normalizeRoll(rawRoll);

      if (raw.match(/^\d{6,10}$/)) {
        sections[raw] = section;
        if (digits && digits !== raw) sections[digits] = section;
      }
    }
  }

  return sections;
};

/** --------------------------- NORMALIZE SECTION NAME ---------------------------- */

const normalizeSectionName = (section) => {
  if (!section) return section;
  
  let normalized = section
    .replace(/CSCE-0?/, 'CSCE-')
    .replace(/CSE-0/, 'CSE-')
    .replace(/IT-0/, 'IT-');
  
  normalized = normalized.replace(/(\D+)0+(\d+)/, '$1$2');
  
  return normalized;
};

/** --------------------------- FIND SECTION IN TIMETABLE ---------------------------- */

const findSectionInTimetable = (timetable, section) => {
  const normalizedSection = normalizeSectionName(section);
  console.log(`Looking for section: ${section} (normalized: ${normalizedSection})`);
  console.log(`Available sections:`, Object.keys(timetable));

  // Try direct match
  let sectionTT = timetable[section] || timetable[normalizedSection];
  
  // Try case-insensitive match
  if (!sectionTT) {
    const exactMatch = Object.keys(timetable).find(
      key => key.toLowerCase() === section.toLowerCase()
    );
    if (exactMatch) {
      sectionTT = timetable[exactMatch];
      console.log(`Found section via case-insensitive match: ${exactMatch}`);
    }
  }

  // Try fuzzy matching (remove dashes, spaces)
  if (!sectionTT) {
    const cleanSection = section.replace(/[-\s]/g, '').toLowerCase();
    const fuzzyMatch = Object.keys(timetable).find(
      key => key.replace(/[-\s]/g, '').toLowerCase() === cleanSection
    );
    if (fuzzyMatch) {
      sectionTT = timetable[fuzzyMatch];
      console.log(`Found section via fuzzy match: ${fuzzyMatch}`);
    }
  }

  return sectionTT;
};

/** --------------------------- TODAY TIMETABLE ---------------------------- */

export const getTodayTimetable = async (input) => {
  const { sections, timetable, semKey } = await parseExcelFiles(input);

  let section;

  // Check if input is year|section format
  if (input.includes('|')) {
    const [year, sec] = input.split('|');
    section = sec.trim();
    console.log(`Using year+section input: ${year} ${section}`);
  } else {
    // Roll number lookup
    const { raw: lookupRaw, digits: lookupDigits } = normalizeRoll(input);
    section = sections[lookupRaw] || sections[lookupDigits];
    console.log(`Roll number: ${input}, Found section: ${section}`);
  }

  if (!section) {
    throw new Error("Section not found. Please check your roll number or year+section.");
  }

  const sectionTT = findSectionInTimetable(timetable, section);

  if (!sectionTT) {
    console.error(`Section ${section} not found in timetable`);
    throw new Error(`Section ${section} not found in timetable`);
  }

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const today = days[new Date().getDay()] || "Monday";

  const todaySchedule = sectionTT[today] || [];

  console.log(`Today (${today}) schedule for ${section}:`, todaySchedule);

  if (todaySchedule.length === 0) {
    return {
      day: today,
      section: normalizeSectionName(section),
      timetable: [],
      message: "No classes today. Enjoy your break! 🎉"
    };
  }

  return { day: today, section: normalizeSectionName(section), timetable: todaySchedule };
};

/** --------------------------- FULL WEEK TIMETABLE ---------------------------- */

export const getFullWeekTimetable = async (input) => {
  const { sections, timetable, semKey } = await parseExcelFiles(input);

  let section;

  // Check if input is year|section format
  if (input.includes('|')) {
    const [year, sec] = input.split('|');
    section = sec.trim();
    console.log(`Using year+section input: ${year} ${section}`);
  } else {
    // Roll number lookup
    const { raw: lookupRaw, digits: lookupDigits } = normalizeRoll(input);
    section = sections[lookupRaw] || sections[lookupDigits];
    console.log(`Roll number: ${input}, Found section: ${section}`);
  }

  if (!section) {
    throw new Error("Section not found. Please check your roll number or year+section.");
  }

  const fullTimetable = findSectionInTimetable(timetable, section);

  if (!fullTimetable) {
    console.error(`Section ${section} not found in timetable`);
    throw new Error(`Section ${section} not found in timetable`);
  }

  return { section: normalizeSectionName(section), fullTimetable };
};