import * as XLSX from 'xlsx';

let cachedDataMap = {}; // cache per semester key ('4', '6', 'mse4')

/**
 * Determine semester key from roll number or year+section:
 * - starts with '24' => 4th semester (CSE/IT)
 * - starts with '23' => 6th semester (CSE/IT)
 * - year '2nd' => 4th semester (CSE/IT)
 * - year '3rd' => 6th semester (CSE/IT)
 * - section contains 'M1', 'M2', 'M3', 'M4' or 'ME' => MSE 4th semester
 * - roll numbers: 2402001-2402110, 2409001-2409023, 2426001-2426021, 2502601-2502616, 2526301-2526304 => MSE
 */
const semesterKeyFromInput = (input) => {
  const s = String(input || '').trim().toUpperCase();
  
  // Check if it's a year|section format
  if (s.includes('|')) {
    const [year, section] = s.split('|');
    
    // Check if it's Mechanical Engineering (M1, M2, M3, M4, ME-A, etc.)
    if (/M[1-4](?![A-Z])/.test(section) || section.includes('ME-') || section.includes('MSE')) {
      return 'mse4';
    }
    
    if (year === '2ND') return '4';
    if (year === '3RD') return '6';
    return '6'; // default
  }
  
  // Check roll number patterns for Mechanical Engineering
  const rollNum = s.replace(/\D+/g, '');
  if (rollNum) {
    const num = parseInt(rollNum);
    
    // MSE roll number ranges
    if ((num >= 2402001 && num <= 2402110) ||  // M1 & M2
        (num >= 2409001 && num <= 2409023) ||  // M3
        (num >= 2426001 && num <= 2426021) ||  // M4
        (num >= 2502601 && num <= 2502616) ||  // M1 & M2 (2nd batch)
        (num >= 2526301 && num <= 2526304)) {  // M4 (2nd batch)
      return 'mse4';
    }
  }
  
  // Otherwise treat as standard roll number
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
      '6': { 
        filepath: '/data/6th_sem_Time-Table_and_Section_Detail.xlsx', 
        name: 'CSE/IT 6th Sem',
        attendanceFile: null
      },
      '4': { 
        filepath: 'data/4th_semester_TT_and_Section_Detail.xlsx', 
        name: 'CSE/IT 4th Sem',
        attendanceFile: 'data/Attendance4thStudentlist-2024AB(1).XLSX'
      },
      'mse4': { 
        filepath: 'data/SME_4th_Semester_Timetable_Spring_20252026_WEF_01122025.xlsx', 
        name: 'MSE 4th Sem',
        attendanceFile: null
      }
    };

    const chosen = files[semKey] || files['6'];
    console.log(`Loading Excel file for ${chosen.name}: ${chosen.filepath}`);
    
    const response = await fetch(chosen.filepath);

    if (!response.ok) {
      throw new Error(`Failed to fetch Excel file: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });

    console.log('Available sheets:', workbook.SheetNames);

    // MSE file might have different structure
    const ttSheet = workbook.Sheets[workbook.SheetNames[0]]; // Time Table
    const sdSheet = workbook.SheetNames.length > 1 ? workbook.Sheets[workbook.SheetNames[1]] : null;

    const ttData = XLSX.utils.sheet_to_json(ttSheet, { header: 1, defval: '' });
    const sdData = sdSheet ? XLSX.utils.sheet_to_json(sdSheet, { header: 1, defval: '' }) : [];

    const timetable = parseTimetable(ttData, semKey);
    let sections = sdData.length > 0 ? parseSections(sdData) : {};

    // For MSE, add hardcoded roll number mappings if no section data exists
    if (semKey === 'mse4' && Object.keys(sections).length === 0) {
      console.log('Adding MSE roll number mappings...');
      sections = getMSERollNumberMappings();
    }

    // Load additional attendance/student list file if available
    if (chosen.attendanceFile) {
      console.log(`Loading attendance file: ${chosen.attendanceFile}`);
      try {
        const attendanceResponse = await fetch(chosen.attendanceFile);
        if (attendanceResponse.ok) {
          const attendanceBuffer = await attendanceResponse.arrayBuffer();
          const attendanceWorkbook = XLSX.read(attendanceBuffer, { type: 'array' });
          
          console.log('Attendance file sheets:', attendanceWorkbook.SheetNames);
          
          // Parse all sheets in the attendance file
          const attendanceSections = parseAttendanceFile(attendanceWorkbook);
          
          // Merge with existing sections
          sections = { ...sections, ...attendanceSections };
          console.log(`Merged attendance data: ${Object.keys(attendanceSections).length} new roll numbers`);
        }
      } catch (attendanceError) {
        console.warn('Could not load attendance file:', attendanceError);
      }
    }

    console.log(`Total parsed ${Object.keys(sections).length} roll numbers for ${chosen.name}`);
    console.log(`Parsed ${Object.keys(timetable).length} sections for ${chosen.name}`);

    const result = { sections, timetable, semKey };
    cachedDataMap[semKey] = result;
    return result;
  } catch (error) {
    console.error('Error parsing Excel files:', error);
    return { sections: {}, timetable: {} };
  }
};

/** --------------------------- MSE ROLL NUMBER MAPPINGS ---------------------------- */

const getMSERollNumberMappings = () => {
  const sections = {};
  
  // M1: 2402001-2402052 + 2502601-2502607
  for (let i = 2402001; i <= 2402052; i++) {
    sections[i.toString()] = 'M1';
  }
  for (let i = 2502601; i <= 2502607; i++) {
    sections[i.toString()] = 'M1';
  }
  
  // M2: 2402053-2402110 + 2502608-2502616
  for (let i = 2402053; i <= 2402110; i++) {
    sections[i.toString()] = 'M2';
  }
  for (let i = 2502608; i <= 2502616; i++) {
    sections[i.toString()] = 'M2';
  }
  
  // M3: 2409001-2409023
  for (let i = 2409001; i <= 2409023; i++) {
    sections[i.toString()] = 'M3';
  }
  
  // M4: 2426001-2426021 + 2526301-2526304
  for (let i = 2426001; i <= 2426021; i++) {
    sections[i.toString()] = 'M4';
  }
  for (let i = 2526301; i <= 2526304; i++) {
    sections[i.toString()] = 'M4';
  }
  
  console.log(`Generated ${Object.keys(sections).length} MSE roll number mappings`);
  return sections;
};

/** --------------------------- PARSE ATTENDANCE FILE ---------------------------- */

const parseAttendanceFile = (workbook) => {
  const sections = {};
  
  // The attendance file might have multiple sheets, one per section
  for (const sheetName of workbook.SheetNames) {
    console.log(`Parsing attendance sheet: ${sheetName}`);
    
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    
    // Try to detect the section name from sheet name or content
    let detectedSection = null;
    
    // Pattern 1: Section in sheet name (M1, M2, M3, M4, ME-A, CSE-A, IT-1)
    const sheetNameMatch = sheetName.match(/M[1-4](?![A-Z])|(?:ME|MSE|CSE|IT|CE|EE)-[A-Z0-9]+/i);
    if (sheetNameMatch) {
      detectedSection = sheetNameMatch[0].toUpperCase();
    }
    
    // Pattern 2: Look for section in first few rows
    if (!detectedSection) {
      for (let i = 0; i < Math.min(10, data.length); i++) {
        const row = data[i];
        for (let j = 0; j < Math.min(10, row.length); j++) {
          const cell = row[j]?.toString().trim();
          const cellMatch = cell?.match(/M[1-4](?![A-Z])|(?:ME|MSE|CSE|IT|CE|EE)-[A-Z0-9]+/i);
          if (cellMatch) {
            detectedSection = cellMatch[0].toUpperCase();
            break;
          }
        }
        if (detectedSection) break;
      }
    }
    
    console.log(`Detected section from ${sheetName}: ${detectedSection}`);
    
    // Find roll numbers in the sheet
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      for (let j = 0; j < row.length; j++) {
        const cell = row[j]?.toString().trim();
        
        // Look for roll number patterns (6-10 digits)
        if (cell && /^\d{6,10}$/.test(cell)) {
          const rollNumber = cell;
          
          // If we have a detected section, use it
          if (detectedSection) {
            sections[rollNumber] = detectedSection;
            console.log(`Mapped roll ${rollNumber} -> ${detectedSection}`);
          } else {
            // Try to find section in the same row or nearby
            for (let k = 0; k < row.length; k++) {
              const nearbyCell = row[k]?.toString().trim();
              const sectionMatch = nearbyCell?.match(/M[1-4](?![A-Z])|(?:ME|MSE|CSE|IT|CE|EE)-[A-Z0-9]+/i);
              if (sectionMatch) {
                const foundSection = sectionMatch[0].toUpperCase();
                sections[rollNumber] = foundSection;
                console.log(`Mapped roll ${rollNumber} -> ${foundSection} (from row)`);
                break;
              }
            }
          }
        }
      }
    }
  }
  
  return sections;
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

  console.log(`Parsing periods for semester ${semKey}, row:`, row.slice(0, 25));

  // Different column mappings for different file formats
  let slots;
  
  if (semKey === 'mse4') {
    // MSE format - need to determine actual column structure
    // Logging first row to understand structure
    console.log('Full MSE row for analysis:', row);
    
    // Common MSE format patterns (adjust based on actual file)
    // Pattern 1: Subject and Room together in same cell
    // Pattern 2: Subject in one column, Room in next
    // Pattern 3: Time header row with subject/room below
    
    // Try to detect format by looking at row structure
    const hasTimeHeaders = row.some(cell => 
      cell?.toString().match(/\d{1,2}:\d{2}/)
    );
    
    if (hasTimeHeaders) {
      // Format with time headers - parse accordingly
      console.log('Detected MSE format with time headers');
      slots = parseMSEWithTimeHeaders(row);
    } else {
      // Standard format - adjust indices based on MSE structure
      console.log('Using standard MSE column mapping');
      slots = [
        { time: "8:00-9:00",    subject: 2,  room: 3  },
        { time: "9:00-10:00",   subject: 4,  room: 5  },
        { time: "10:00-11:00",  subject: 6,  room: 7  },
        { time: "11:00-12:00",  subject: 8,  room: 9  },
        { time: "12:00-1:00",   subject: 10, room: 11 },
        { time: "1:00-2:00",    subject: 12, room: 13 },
        { time: "2:00-3:00",    subject: 14, room: 15 },
        { time: "3:00-4:00",    subject: 16, room: 17 },
        { time: "4:00-5:00",    subject: 18, room: 19 },
      ];
    }
  } else {
    // CSE/IT format (4th and 6th semester)
    console.log('Using CSE/IT column mapping');
    slots = [
      { time: "8:00-9:00",    subject: 3,  room: 2  },
      { time: "9:00-10:00",   subject: 5,  room: 4  },
      { time: "10:00-11:00",  subject: 6,  room: 4  },
      { time: "11:00-12:00",  subject: 8,  room: 7  },
      { time: "12:00-1:00",   subject: 10, room: 9  },
      { time: "1:00-2:00",    subject: 11, room: 9  },
      { time: "2:00-3:00",    subject: 13, room: 12 },
      { time: "3:15-4:15",    subject: 15, room: 14 },
      { time: "4:15-5:15",    subject: 17, room: 16 },
      { time: "5:15-6:15",    subject: 18, room: 16 }
    ];
  }

  for (const slot of slots) {
    const subject = row[slot.subject]?.toString().trim();
    let room = row[slot.room]?.toString().trim();

    console.log(`  Slot ${slot.time}: Col${slot.subject}="${subject}", Col${slot.room}="${room}"`);

    if (!subject || subject === "" || subject === "---" || subject === "undefined") {
      console.log(`    -> Skipping (empty/invalid)`);
      continue;
    }

    // Handle lunch/break
    if (subject.toLowerCase().includes('lunch') || subject.toLowerCase().includes('break')) {
      periods.push({
        time: slot.time,
        subject: "Break",
        room: "-",
        faculty: "-"
      });
      console.log(`    -> Added Break`);
      continue;
    }

    if (subject === "X" || subject.toLowerCase() === "free") {
      periods.push({
        time: slot.time,
        subject: "Free Period",
        room: room || "-",
        faculty: "-"
      });
      console.log(`    -> Added Free Period`);
      continue;
    }

    // Extract room number
    if (room && room !== '-' && room !== '---' && room !== 'undefined') {
      const patterns = [
        /([A-Z]\d+-[A-Z]-\d+)/i,           // C25-A-118
        /([A-Z]\d+-[A-Z]\d+)/i,            // C25-A118
        /([A-Z]-\d+)/i,                     // A-118
        /(Room\s*[A-Z]?\d+)/i,             // Room A123
        /([A-Z]\d+)/i,                      // C118
        /(\d{3,})/                          // 118
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
    } else {
      room = "-";
    }

    periods.push({
      time: slot.time,
      subject,
      room: room || "-",
      faculty: "-"
    });
    console.log(`    -> Added: ${subject} in ${room}`);
  }

  console.log(`Total periods parsed: ${periods.length}`);
  return periods;
};

// Helper function for MSE format with time headers
const parseMSEWithTimeHeaders = (row) => {
  // This function would parse MSE files that have time slots in the header row
  // Return appropriate slot mappings based on detected structure
  const slots = [];
  
  // Scan row to find time patterns and build slot mapping
  for (let i = 0; i < row.length; i++) {
    const cell = row[i]?.toString().trim();
    const timeMatch = cell?.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
    
    if (timeMatch) {
      // Found a time slot, assume subject is in same or next column
      slots.push({
        time: cell,
        subject: i,
        room: i + 1  // Room typically follows subject
      });
    }
  }
  
  console.log('Detected MSE time header slots:', slots);
  return slots;
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
  
  // Don't modify M1, M2, M3, M4 - they're already in correct format
  if (/^M[1-4]$/.test(section)) {
    return section;
  }
  
  let normalized = section
    .replace(/CSCE-0?/, 'CSCE-')
    .replace(/CSE-0/, 'CSE-')
    .replace(/IT-0/, 'IT-')
    .replace(/ME-0/, 'ME-')
    .replace(/MSE-0/, 'MSE-');
  
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

/** --------------------------- DETECT BRANCH FROM SECTION ---------------------------- */

const detectBranchFromSection = (section) => {
  const s = section.toUpperCase();
  // Match M1, M2, M3, M4 (without following letters) or ME-A style sections
  if (/M[1-4](?![A-Z])/.test(s) || s.includes('ME-') || s.includes('MSE')) {
    return 'mse4';
  }
  return null;
};

/** --------------------------- TODAY TIMETABLE ---------------------------- */

export const getTodayTimetable = async (input) => {
  let { sections, timetable, semKey } = await parseExcelFiles(input);

  let section;

  // Check if input is year|section format
  if (input.includes('|')) {
    const [year, sec] = input.split('|');
    section = sec.trim();
    console.log(`Using year+section input: ${year} ${section}`);
    
    // Re-fetch with correct semester if it's MSE
    const branch = detectBranchFromSection(section);
    if (branch && branch !== semKey) {
      console.log(`Re-fetching data for branch: ${branch}`);
      const newData = await parseExcelFiles(section);
      sections = newData.sections;
      timetable = newData.timetable;
      semKey = newData.semKey;
    }
  } else {
    // Roll number lookup
    const { raw: lookupRaw, digits: lookupDigits } = normalizeRoll(input);
    section = sections[lookupRaw] || sections[lookupDigits];
    console.log(`Roll number: ${input}, Found section: ${section}`);
    
    // Re-fetch with correct semester if it's MSE
    if (section) {
      const branch = detectBranchFromSection(section);
      if (branch && branch !== semKey) {
        console.log(`Re-fetching data for branch: ${branch}`);
        const newData = await parseExcelFiles(section);
        sections = newData.sections;
        timetable = newData.timetable;
        semKey = newData.semKey;
      }
    }
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
  let { sections, timetable, semKey } = await parseExcelFiles(input);

  let section;

  // Check if input is year|section format
  if (input.includes('|')) {
    const [year, sec] = input.split('|');
    section = sec.trim();
    console.log(`Using year+section input: ${year} ${section}`);
    
    // Re-fetch with correct semester if it's MSE
    const branch = detectBranchFromSection(section);
    if (branch && branch !== semKey) {
      console.log(`Re-fetching data for branch: ${branch}`);
      const newData = await parseExcelFiles(section);
      sections = newData.sections;
      timetable = newData.timetable;
      semKey = newData.semKey;
    }
  } else {
    // Roll number lookup
    const { raw: lookupRaw, digits: lookupDigits } = normalizeRoll(input);
    section = sections[lookupRaw] || sections[lookupDigits];
    console.log(`Roll number: ${input}, Found section: ${section}`);
    
    // Re-fetch with correct semester if it's MSE
    if (section) {
      const branch = detectBranchFromSection(section);
      if (branch && branch !== semKey) {
        console.log(`Re-fetching data for branch: ${branch}`);
        const newData = await parseExcelFiles(section);
        sections = newData.sections;
        timetable = newData.timetable;
        semKey = newData.semKey;
      }
    }
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