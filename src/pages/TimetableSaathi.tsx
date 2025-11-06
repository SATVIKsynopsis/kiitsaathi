import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, MapPin, Search, Download, AlertCircle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_ABBR = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const DAY_MAP = {
  0: "SUN",
  1: "MON", 
  2: "TUE",
  3: "WED",
  4: "THU",
  5: "FRI",
  6: "SAT"
};

// Import timetable data from JSON file
import timetableDataImport from '@/data/timetable.json';
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function TimetableSaathi() {
  const [selectedSemester, setSelectedSemester] = useState("5");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [searchQuery, setSearchQuery] = useState("");
  const [savePreferences, setSavePreferences] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [data] = useState(timetableDataImport);
  const [electiveSection1, setElectiveSection1] = useState("");
  const [electiveSection2, setElectiveSection2] = useState("");

  // Load saved preferences
  useEffect(() => {
    const saved = JSON.parse(sessionStorage.getItem("timetable-preferences") || "{}");
    if (saved.semester) {
      setSelectedSemester(saved.semester);
      setSelectedSection(saved.section || "");
      setElectiveSection1(saved.electiveSection1 || "");
      setElectiveSection2(saved.electiveSection2 || "");
      setSavePreferences(true);
    }
  }, []);

  // Save preferences
  useEffect(() => {
    if (savePreferences && selectedSection) {
      sessionStorage.setItem("timetable-preferences", JSON.stringify({
        semester: selectedSemester,
        section: selectedSection,
        electiveSection1: electiveSection1,
        electiveSection2: electiveSection2
      }));
    } else if (!savePreferences) {
      sessionStorage.removeItem("timetable-preferences");
    }
  }, [savePreferences, selectedSemester, selectedSection, electiveSection1, electiveSection2]);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  if (!data) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const semesterData = data.semesters[selectedSemester];
  const sections = semesterData?.sections || [];
  const timetable = semesterData?.timetable || {};
  const electiveConfig = semesterData?.electives || null;
  const electiveTimetable = semesterData?.["elective timetable"] || {};

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const parseTimeSlot = (timeStr) => {
    const parts = timeStr.split('-');
    const start = parts[0].replace('.', ':');
    const end = parts[1].replace('.', ':');
    
    const formatTime = (time) => {
      if (!time.includes(':')) {
        return `${time.padStart(2, '0')}:00`;
      }
      const [h, m] = time.split(':');
      return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
    };
    
    return {
      start: formatTime(start),
      end: formatTime(end)
    };
  };

  const getScheduleForDay = () => {
    if (!selectedSection || !timetable[selectedSection]) return [];
    
    const dayKey = DAY_MAP[selectedDay];
    const daySchedule = timetable[selectedSection][dayKey];
    
    if (!daySchedule || !Array.isArray(daySchedule)) return [];
    
    let scheduleEntries = [...daySchedule];
    
    // Add elective classes if elective sections are selected
    if (electiveSection1 && electiveTimetable[electiveSection1]) {
      const elective1Schedule = electiveTimetable[electiveSection1][dayKey];
      if (elective1Schedule && Array.isArray(elective1Schedule)) {
        scheduleEntries = [...scheduleEntries, ...elective1Schedule];
      }
    }
    
    if (electiveSection2 && electiveTimetable[electiveSection2]) {
      const elective2Schedule = electiveTimetable[electiveSection2][dayKey];
      if (elective2Schedule && Array.isArray(elective2Schedule)) {
        scheduleEntries = [...scheduleEntries, ...elective2Schedule];
      }
    }
    
    return scheduleEntries
      .map((entry) => {
        const { start, end } = parseTimeSlot(entry.time);
        const isLab = entry.subject.includes('(L)');
        
        return {
          start_time: start,
          end_time: end,
          course_code: entry.subject.replace('(L)', '').trim(),
          location: entry.room,
          type: isLab ? "Lab" : "Lecture"
        };
      })
      .sort((a, b) => a.start_time.localeCompare(b.start_time))
      .filter((entry) => 
        !searchQuery || 
        entry.course_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
  };

  const getTimeUntil = (targetTime) => {
    const [hours, minutes] = targetTime.split(':').map(Number);
    const target = new Date();
    target.setHours(hours, minutes, 0);
    
    const diff = target.getTime() - currentTime.getTime();
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    
    if (hrs > 0) return `${hrs}h ${remainingMins}m`;
    return `${remainingMins}m`;
  };

  const isCurrentClass = (start, end) => {
    const now = formatTime(currentTime);
    return now >= start && now < end;
  };

  const schedule = getScheduleForDay();
  const currentClass = schedule.find(entry => isCurrentClass(entry.start_time, entry.end_time));
  const upcomingClass = schedule.find(entry => entry.start_time > formatTime(currentTime));

  const exportToICal = () => {
    let ical = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//KIIT Saathi//Timetable//EN\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\nX-WR-CALNAME:KIIT Timetable - ${selectedSection}\nX-WR-TIMEZONE:Asia/Kolkata\n\n`;

    schedule.forEach((entry, idx) => {
      const startDate = new Date();
      startDate.setHours(parseInt(entry.start_time.split(':')[0]), parseInt(entry.start_time.split(':')[1]), 0);
      const endDate = new Date();
      endDate.setHours(parseInt(entry.end_time.split(':')[0]), parseInt(entry.end_time.split(':')[1]), 0);

      ical += `BEGIN:VEVENT\nDTSTART:${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z\nDTEND:${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z\nSUMMARY:${entry.course_code}\nLOCATION:${entry.location}\nUID:${selectedSection}-${idx}@kiitsaathi.com\nEND:VEVENT\n\n`;
    });

    ical += `END:VCALENDAR`;

    const blob = new Blob([ical], { type: 'text/calendar' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `timetable-${selectedSection}-week.ics`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
    <Navbar/>
    <div className="mt-20 min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-white p-4">
      <main className="flex-1 container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-medium mb-4">
            <Calendar className="w-4 h-4" />
            <span>Academic Year 2025-2026</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Timetable Saathi
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your personal class schedule assistant with real-time updates
          </p>
        </div>

        <Card className="p-6 mb-6 bg-white shadow-lg border-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-500">Current Time</p>
                <p className="text-lg font-semibold text-blue-600">{formatTime(currentTime)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50">
              <Switch
                id="save-prefs"
                checked={savePreferences}
                onCheckedChange={setSavePreferences}
              />
              <Label htmlFor="save-prefs" className="text-sm font-medium cursor-pointer">
                Save Preferences
              </Label>
            </div>

            <Select value={selectedSemester} onValueChange={(val) => {
              setSelectedSemester(val);
              setSelectedSection("");
              setElectiveSection1("");
              setElectiveSection2("");
            }}>
              <SelectTrigger className="bg-white border-gray-200">
                <SelectValue placeholder="Select Semester" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(data.semesters).map((sem) => (
                  <SelectItem key={sem} value={sem}>
                    Semester {sem}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger className="bg-white border-gray-200">
                <SelectValue placeholder="Select Section" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {sections.map((section) => (
                  <SelectItem key={section} value={section}>
                    {section}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {electiveConfig && selectedSection && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div>
                <Label htmlFor="elective1" className="text-sm font-medium mb-2 block text-purple-900">
                  {electiveConfig.elective1.label}
                </Label>
                <Select value={electiveSection1} onValueChange={setElectiveSection1}>
                  <SelectTrigger className="bg-white border-purple-200">
                    <SelectValue placeholder={`Select ${electiveConfig.elective1.label} Section`} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {electiveConfig.elective1.options.map((elective) => (
                      <SelectItem key={elective} value={elective}>
                        {elective}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="elective2" className="text-sm font-medium mb-2 block text-purple-900">
                  {electiveConfig.elective2.label}
                </Label>
                <Select value={electiveSection2} onValueChange={setElectiveSection2}>
                  <SelectTrigger className="bg-white border-purple-200">
                    <SelectValue placeholder={`Select ${electiveConfig.elective2.label} Section`} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {electiveConfig.elective2.options.map((elective) => (
                      <SelectItem key={elective} value={elective}>
                        {elective}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by course, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-gray-200"
            />
          </div>
        </Card>

        {selectedSection && (currentClass || upcomingClass) && (
          <Alert className={`mb-6 border-2 ${currentClass ? 'bg-green-50 border-green-500' : 'bg-blue-50 border-blue-500'}`}>
            <Clock className={`h-4 w-4 ${currentClass ? 'text-green-600' : 'text-blue-600'}`} />
            <AlertDescription className="ml-2">
              {currentClass ? (
                <span className="font-semibold text-green-700">
                  Happening Now: {currentClass.course_code} at {currentClass.location}
                </span>
              ) : upcomingClass ? (
                <span className="font-semibold text-blue-700">
                  Next: {upcomingClass.course_code} starts in {getTimeUntil(upcomingClass.start_time)}
                </span>
              ) : null}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {DAY_ABBR.map((day, index) => (
            <Button
              key={day}
              variant={selectedDay === index ? "default" : "outline"}
              onClick={() => setSelectedDay(index)}
              className={`flex-shrink-0 min-w-[80px] ${
                selectedDay === index
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              } ${index === new Date().getDay() ? 'ring-2 ring-green-500' : ''}`}
            >
              <div className="text-center">
                <div className="text-xs opacity-75">{day}</div>
                {index === new Date().getDay() && (
                  <div className="text-[10px] font-bold text-green-500">TODAY</div>
                )}
              </div>
            </Button>
          ))}
        </div>

        {!selectedSection ? (
          <Card className="p-12 text-center bg-white shadow-lg border-0">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Select Your Section
            </h3>
            <p className="text-gray-500">
              Choose your semester and section above to view your class schedule
            </p>
          </Card>
        ) : schedule.length === 0 ? (
          <Card className="p-12 text-center bg-white shadow-lg border-0">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Classes Found
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery 
                ? "No classes match your search. Try a different keyword."
                : `No classes scheduled for ${DAYS[selectedDay]} or data not available.`
              }
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedDay(new Date().getDay());
              }}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reset
            </Button>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 mb-6">
              {schedule.map((entry, idx) => {
                const isCurrent = isCurrentClass(entry.start_time, entry.end_time);
                return (
                  <Card 
                    key={idx} 
                    className={`p-4 bg-white shadow-md border-l-4 transition-all hover:shadow-lg ${
                      isCurrent 
                        ? 'border-l-green-500 bg-green-50 ring-2 ring-green-200' 
                        : 'border-l-blue-500'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 p-2 rounded-lg ${
                        isCurrent ? 'bg-green-500' : 'bg-blue-600'
                      }`}>
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-gray-900">
                            {entry.course_code}
                          </h3>
                          {isCurrent && (
                            <Badge className="bg-green-500 text-white text-xs">
                              LIVE NOW
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {entry.type}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-2">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium text-blue-600">
                              {entry.start_time} - {entry.end_time}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{entry.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="text-center">
              <Button
                onClick={exportToICal}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                <Download className="w-4 h-4" />
                Download Week as iCal
              </Button>
            </div>
          </>
        )}

        {semesterData && (
          <Card className="mt-6 p-4 bg-blue-50 border-blue-200">
            <p className="text-sm text-blue-800 text-center">
              Timetable for Semester {selectedSemester} • {sections.length} sections available
            </p>
          </Card>
        )}
      </main>
    </div>
    <Footer/>
    </>
  );
}