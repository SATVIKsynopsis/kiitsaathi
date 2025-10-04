import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, MapPin, Search, Download, AlertCircle, RefreshCw } from "lucide-react";
import timetableData from "@/data/timetables.json";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_ABBR = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export default function TimetableSaathi() {
  const [selectedSemester, setSelectedSemester] = useState<string>("1");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [savePreferences, setSavePreferences] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Load saved preferences
  useEffect(() => {
    const saved = localStorage.getItem("timetable-preferences");
    if (saved) {
      const prefs = JSON.parse(saved);
      setSelectedSemester(prefs.semester || "1");
      setSelectedSection(prefs.section || "");
      setSavePreferences(true);
    }
  }, []);

  // Save preferences
  useEffect(() => {
    if (savePreferences && selectedSection) {
      localStorage.setItem("timetable-preferences", JSON.stringify({
        semester: selectedSemester,
        section: selectedSection
      }));
    } else if (!savePreferences) {
      localStorage.removeItem("timetable-preferences");
    }
  }, [savePreferences, selectedSemester, selectedSection]);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const semesterData = timetableData.semesters[selectedSemester as keyof typeof timetableData.semesters];
  const sections = semesterData?.sections || [];
  const courses = semesterData?.courses || {};

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const getTimeUntil = (targetTime: string) => {
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

  const isCurrentClass = (start: string, end: string) => {
    const now = formatTime(currentTime);
    return now >= start && now < end;
  };

  // Sample schedule data (placeholder - in production would parse from timetableData)
  const getScheduleForDay = () => {
    if (!selectedSection) return [];
    
    // Demo data for Semester 3 CSE-1 Monday
    return [
      { start_time: "10:20", end_time: "11:20", course_code: "DS", location: "C25-B-107", type: "Lecture" },
      { start_time: "11:20", end_time: "12:20", course_code: "AFL", location: "C25-B-107", type: "Lecture" },
      { start_time: "14:00", end_time: "15:15", course_code: "DSD", location: "C25-B-018", type: "Lab" },
      { start_time: "15:15", end_time: "16:15", course_code: "DSD", location: "C25-B-018", type: "Lab" }
    ].filter(entry => 
      !searchQuery || 
      entry.course_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (courses[entry.course_code]?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
    );
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

      ical += `BEGIN:VEVENT\nDTSTART:${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z\nDTEND:${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z\nSUMMARY:${entry.course_code} - ${courses[entry.course_code] || entry.course_code}\nLOCATION:${entry.location}\nUID:${selectedSection}-${idx}@kiitsaathi.com\nEND:VEVENT\n\n`;
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#F5F7FA] to-white">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 mt-20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0066FF]/10 text-[#0066FF] font-medium mb-4">
            <Calendar className="w-4 h-4" />
            <span>Academic Year 2025-2026</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-4">
            Timetable Saathi
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your personal class schedule assistant with real-time updates
          </p>
        </div>

        <Card className="p-6 mb-6 bg-white shadow-lg border-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-[#0066FF]/5">
              <Clock className="w-5 h-5 text-[#0066FF]" />
              <div>
                <p className="text-xs text-gray-500">Current Time</p>
                <p className="text-lg font-semibold text-[#0066FF]">{formatTime(currentTime)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-[#00C896]/5">
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
            }}>
              <SelectTrigger className="bg-white border-gray-200">
                <SelectValue placeholder="Select Semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Semester 1</SelectItem>
                <SelectItem value="2">Semester 2</SelectItem>
                <SelectItem value="3">Semester 3</SelectItem>
                <SelectItem value="5">Semester 5</SelectItem>
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

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by course, location, or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-gray-200"
            />
          </div>
        </Card>

        {selectedSection && (currentClass || upcomingClass) && (
          <Alert className={`mb-6 border-2 ${currentClass ? 'bg-[#00C896]/10 border-[#00C896]' : 'bg-[#0066FF]/10 border-[#0066FF]'}`}>
            <Clock className={`h-4 w-4 ${currentClass ? 'text-[#00C896]' : 'text-[#0066FF]'}`} />
            <AlertDescription className="ml-2">
              {currentClass ? (
                <span className="font-semibold text-[#00C896]">
                  Happening Now: {currentClass.course_code} - {courses[currentClass.course_code]} at {currentClass.location}
                </span>
              ) : upcomingClass ? (
                <span className="font-semibold text-[#0066FF]">
                  Next: {upcomingClass.course_code} - {courses[upcomingClass.course_code]} starts in {getTimeUntil(upcomingClass.start_time)}
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
                  ? 'bg-[#0066FF] hover:bg-[#0052CC] text-white'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              } ${index === new Date().getDay() ? 'ring-2 ring-[#00C896]' : ''}`}
            >
              <div className="text-center">
                <div className="text-xs opacity-75">{day}</div>
                {index === new Date().getDay() && (
                  <div className="text-[10px] font-bold text-[#00C896]">TODAY</div>
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
                        ? 'border-l-[#00C896] bg-[#00C896]/5 ring-2 ring-[#00C896]/20' 
                        : 'border-l-[#0066FF]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 p-2 rounded-lg ${
                        isCurrent ? 'bg-[#00C896]' : 'bg-[#0066FF]'
                      }`}>
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-[#1A1A1A]">
                            {entry.course_code}
                          </h3>
                          {isCurrent && (
                            <Badge className="bg-[#00C896] text-white text-xs">
                              LIVE NOW
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {entry.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {courses[entry.course_code] || entry.course_code}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium text-[#0066FF]">
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
                className="bg-[#0066FF] hover:bg-[#0052CC] text-white gap-2"
              >
                <Download className="w-4 h-4" />
                Download Week as iCal
              </Button>
            </div>
          </>
        )}

        {semesterData && 'effective_from' in semesterData && (
          <Card className="mt-6 p-4 bg-blue-50 border-blue-200">
            <p className="text-sm text-blue-800 text-center">
              <strong>Effective from:</strong> {semesterData.effective_from}
              {'scheme' in semesterData && semesterData.scheme && ` • Scheme ${semesterData.scheme}`}
            </p>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}
