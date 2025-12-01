import * as XLSX from 'xlsx';

/**
 * Parses the uploaded Excel files and generates JSON data
 * Run this script once to generate the JSON files from Excel
 */

export const generateJsonFromExcel = async () => {
  try {
    // Fetch and parse the timetable Excel file
    const ttResponse = await fetch('/data/6th_semester_TT.xlsx');
    const ttBuffer = await ttResponse.arrayBuffer();
    const ttWorkbook = XLSX.read(ttBuffer, { type: 'array' });
    const ttSheet = ttWorkbook.Sheets[ttWorkbook.SheetNames[0]];
    const ttData = XLSX.utils.sheet_to_json(ttSheet, { header: 1 });
    console.log(ttData);
    // Fetch and parse the section detail Excel file
    const sdResponse = await fetch('/data/6th_sem_Time-Table_and_Section_Detail.xlsx');
    const sdBuffer = await sdResponse.arrayBuffer();
    const sdWorkbook = XLSX.read(sdBuffer, { type: 'array' });
    const sdSheet = sdWorkbook.Sheets[sdWorkbook.SheetNames[1]];
    const sdData = XLSX.utils.sheet_to_json(sdSheet, { header: 1, defval: '' });
    console.log(sdData);

    // Parse timetable
    const timetable = parseTimetable(ttData);

    // Parse sections (roll number to section mapping)
    const sections = parseSections(sdData);

    console.log('Generated Timetable:', timetable);
    console.log('Generated Sections:', sections);

    return { timetable, sections };
  } catch (error) {
    console.error('Error generating JSON from Excel:', error);
    return null;
  }
};

const parseTimetable = (data) => {
  const timetable = {};
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI'];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    // Check if this row has a day
    if (row[0] && days.includes(row[0].toString().toUpperCase())) {
      const day = row[0].toString();
      const section = row[1]?.toString().trim();

      if (!section || section === 'Section') continue;

      // Initialize section if not exists
      if (!timetable[section]) {
        timetable[section] = {};
      }

      // Map day names
      const dayMap = {
        'MON': 'Monday',
        'TUE': 'Tuesday',
        'WED': 'Wednesday',
        'THU': 'Thursday',
        'FRI': 'Friday'
      };

      const fullDay = dayMap[day.toUpperCase()] || day;

      // Parse the periods for this day
      const periods = parsePeriods(row);
      timetable[section][fullDay] = periods;
    }
  }

  return timetable;
};

const parsePeriods = (row) => {
  const periods = [];

  // Time slot mappings based on Excel structure
  const timeSlots = [
    { index: 3, room: 2, time: "8:00-9:00" },         // ROOM1 + 8-9
    { index: 5, room: 4, time: "9:00-10:00" },        // ROOM2 + 9-10
    { index: 6, room: 4, time: "10:00-11:00" },       // ROOM2 + 10-11
    { index: 8, room: 7, time: "11:00-12:00" },       // ROOM3 + 11-12
    { index: 10, room: 9, time: "12:00-1:00" },       // ROOM4 + 12-1
    { index: 11, room: 9, time: "1:00-2:00" },        // ROOM4 + 1-2
    { index: 13, room: 12, time: "2:00-3:00" },       // ROOM5 + 2-3
    { index: 15, room: 14, time: "3:15-4:15" },       // ROOM6 + 3:15-4:15
    { index: 17, room: 16, time: "4:15-5:15" },       // ROOM7 + 4:15-5:15
    { index: 18, room: 16, time: "5:15-6:15" },       // ROOM7 + 5:15-6:15
  ];

  for (const slot of timeSlots) {
    const subject = row[slot.index]?.toString().trim();
    const room = row[slot.room]?.toString().trim();

    if (!subject || subject === "---") {
      continue; // empty cell
    }

    if (subject === "X") {
      periods.push({
        time: slot.time,
        subject: "Free Period",
        room: room || "-",
        faculty: "-"
      });
      continue;
    }
    {
      // Check if it's a break
      if (subject.toLowerCase().includes('break')) {
        periods.push({
          time: slot.time,
          subject: 'Break',
          room: '-',
          faculty: '-'
        });
      } else {
        periods.push({
          time: slot.time,
          subject: subject,
          room: room || '-',
          faculty: '-' // Faculty info not in Excel
        });
      }
    }
  }

  return periods;
};

const parseSections = (data) => {
  const sections = {};
  let foundMapping = false;

  // Find where the roll number mapping starts
  // It usually starts after blank rows and has format: Roll Number | Section
  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    // Check if we found the mapping section
    if (row[0]?.toString().match(/^\d{6,8}$/)) {
      foundMapping = true;
    }

    if (foundMapping && row[0] && row[1]) {
      const rollNumber = row[0].toString().trim();
      const section = row[1].toString().trim();

      // Validate roll number format (6-8 digits)
      if (rollNumber.match(/^\d{6,8}$/) && section) {
        sections[rollNumber] = section;
      }
    }
  }

  return sections;
};
