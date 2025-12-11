import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Clock, MapPin, Calendar, User, BookOpen, Loader2, AlertCircle, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_URL = "https://kiitsaathi-timetable-teacher.onrender.com" 


interface TimetableEntry {
  semester: number;
  section: string;
  day: string;
  timeSlot: string;
  subject: string;
  teacher: string;
  cabin: string;
  classroom?: string;
}

interface TeacherStatus {
  teacher: string;
  cabin: string;
  currentTime: string;
  currentDay: string;
  currentSlot: string;
  current: TimetableEntry | null;
  next: TimetableEntry | null;
  today: TimetableEntry[];
}

const TeacherTimetable = () => {
  const [teacherName, setTeacherName] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [teacherSuggestions, setTeacherSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchResults, setSearchResults] = useState<TimetableEntry[]>([]);
  const [teacherStatus, setTeacherStatus] = useState<TeacherStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("search");
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const { toast } = useToast();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check backend health on mount
  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        console.log('Checking backend health at:', `${API_URL}/api/teacher/health`);
        const response = await fetch(`${API_URL}/api/teacher/health`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Backend health check:', data);
          setBackendStatus(data.dataLoaded && data.totalEntries > 0 ? 'online' : 'offline');
          
          if (!data.dataLoaded || data.totalEntries === 0) {
            toast({
              title: "Warning",
              description: "Server is running but timetable data is not loaded.",
              variant: "destructive",
            });
          }
        } else {
          console.error('Health check failed:', response.status);
          setBackendStatus('offline');
          toast({
            title: "Server Offline",
            description: "Unable to connect to the timetable server. Please try again later.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Backend health check error:', error);
        setBackendStatus('offline');
        toast({
          title: "Connection Error",
          description: "Cannot reach the server. Please check your internet connection.",
          variant: "destructive",
        });
      }
    };
    
    checkBackendHealth();
  }, [toast]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch teacher suggestions as user types
  const fetchTeacherSuggestions = async (query: string) => {
    if (query.length < 2) {
      setTeacherSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/teacher?name=${encodeURIComponent(query)}`);
      console.log('Suggestions API response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Suggestions data:', data);
        // Extract unique teacher names
        const uniqueTeachers = [...new Set(data.schedule.map((entry: TimetableEntry) => entry.teacher))];
        setTeacherSuggestions(uniqueTeachers as string[]);
        setShowSuggestions(uniqueTeachers.length > 0);
      } else {
        const errorText = await response.text();
        console.error('Suggestions API error:', response.status, errorText);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      toast({
        title: "Connection Error",
        description: "Unable to connect to the server. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (value: string) => {
    setTeacherName(value);
    setSelectedTeacher("");
    fetchTeacherSuggestions(value);
  };

  const handleSelectTeacher = (teacher: string) => {
    setTeacherName(teacher);
    setSelectedTeacher(teacher);
    setShowSuggestions(false);
  };

  const handleSearch = async () => {
    const searchName = selectedTeacher || teacherName.trim();
    if (!searchName) {
      toast({
        title: "Error",
        description: "Please enter a teacher name",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const url = `${API_URL}/api/teacher?name=${encodeURIComponent(searchName)}`;
      console.log('Fetching teacher data from:', url);
      const response = await fetch(url);
      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error("Teacher not found");
      }

      const data = await response.json();
      console.log('Received data:', data);
      
      // Filter results to match only the selected teacher (exact match)
      const filteredResults = selectedTeacher 
        ? data.schedule.filter((entry: TimetableEntry) => entry.teacher === selectedTeacher)
        : data.schedule || [];
      
      setSearchResults(filteredResults);

      if (filteredResults.length === 0) {
        toast({
          title: "No Results",
          description: "No timetable found for this teacher. Please check the spelling.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Error",
        description: "Failed to fetch teacher timetable. Server may be offline.",
        variant: "destructive",
      });
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusCheck = async () => {
    if (!teacherName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a teacher name",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const url = `${API_URL}/api/teacher/status?name=${encodeURIComponent(teacherName)}`;
      console.log('Fetching teacher status from:', url);
      const response = await fetch(url);
      console.log('Status response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Status API error response:', errorText);
        throw new Error("Teacher not found");
      }

      const data = await response.json();
      console.log('Status data received:', data);
      setTeacherStatus(data);
    } catch (error) {
      console.error("Status error:", error);
      toast({
        title: "Error",
        description: "Failed to fetch teacher status. Server may be offline.",
        variant: "destructive",
      });
      setTeacherStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const groupByDay = (entries: TimetableEntry[]) => {
    const grouped: { [key: string]: TimetableEntry[] } = {};
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    // Map abbreviated day names to full names
    const dayMap: { [key: string]: string } = {
      'MON': 'Monday',
      'TUE': 'Tuesday', 
      'WED': 'Wednesday',
      'THU': 'Thursday',
      'FRI': 'Friday',
      'SAT': 'Saturday',
      'SUN': 'Sunday'
    };

    days.forEach((day) => {
      grouped[day] = entries.filter((e) => {
        // Extract day abbreviation from formats like 'MON(1)', 'TUE(0)', etc.
        const entryDay = e.day.toUpperCase().replace(/\(.*\)/, '').trim();
        return dayMap[entryDay] === day;
      });
    });

    return grouped;
  };

  const getDayColor = (day: string) => {
    const colors: { [key: string]: string } = {
      Monday: "bg-blue-100 text-blue-800 border-blue-300",
      Tuesday: "bg-green-100 text-green-800 border-green-300",
      Wednesday: "bg-purple-100 text-purple-800 border-purple-300",
      Thursday: "bg-orange-100 text-orange-800 border-orange-300",
      Friday: "bg-pink-100 text-pink-800 border-pink-300",
      Saturday: "bg-indigo-100 text-indigo-800 border-indigo-300",
    };
    return colors[day] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-campus-blue/10 to-kiit-green/10">
      <Navbar />

      <div className="container mx-auto px-4 py-8 mt-16">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-4">
            Teacher Timetable Finder
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Search for any teacher's schedule and find out where they are teaching right now
          </p>
          
          {/* Backend Status Indicator */}
          {backendStatus !== 'online' && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className={`w-2 h-2 rounded-full ${backendStatus === 'checking' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600">
                {backendStatus === 'checking' ? 'Connecting to server...' : 'Server offline - some features may not work'}
              </span>
            </div>
          )}
        </div>

        {/* Search Section */}
        <Card className="mb-8 shadow-lg border-2 border-kiit-green/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-6 h-6 text-kiit-green" />
              Find Teacher
            </CardTitle>
            <CardDescription>
              Enter the teacher's name to view their complete schedule
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative" ref={dropdownRef}>
                <Input
                  placeholder="Enter teacher name (e.g., Dr. Aditya Sharma)"
                  value={teacherName}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  onFocus={() => teacherSuggestions.length > 0 && setShowSuggestions(true)}
                  className="pr-10"
                />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                
                {/* Autocomplete Dropdown */}
                {showSuggestions && teacherSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {teacherSuggestions.map((teacher, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelectTeacher(teacher)}
                        className="w-full text-left px-4 py-3 hover:bg-kiit-green/10 border-b border-gray-100 last:border-b-0 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-kiit-green" />
                          <span className="font-medium text-gray-800">{teacher}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSearch}
                  disabled={loading}
                  className="bg-kiit-green hover:bg-kiit-green-dark"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  <span className="ml-2">Search Schedule</span>
                </Button>
                <Button
                  onClick={handleStatusCheck}
                  disabled={loading}
                  variant="outline"
                  className="border-kiit-green text-kiit-green hover:bg-kiit-green/10"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                  <span className="ml-2 hidden sm:inline">Live Status</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="search">Full Schedule</TabsTrigger>
            <TabsTrigger value="status">Live Status</TabsTrigger>
          </TabsList>

          {/* Full Schedule Tab */}
          <TabsContent value="search">
            {searchResults.length > 0 ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-kiit-green-dark">
                    Schedule for {teacherName}
                  </h2>
                  <Badge className="bg-kiit-green text-white">
                    {searchResults.length} Classes
                  </Badge>
                </div>

                {Object.entries(groupByDay(searchResults)).map(([day, classes]) => (
                  classes.length > 0 && (
                    <Card key={day} className="overflow-hidden border-2">
                      <CardHeader className={`${getDayColor(day)} border-b-2`}>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="w-5 h-5" />
                          {day}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="grid gap-3">
                          {classes
                            .sort((a, b) => {
                              const timeA = parseInt(a.timeSlot.split("-")[0]);
                              const timeB = parseInt(b.timeSlot.split("-")[0]);
                              return timeA - timeB;
                            })
                            .map((entry, idx) => (
                              <div
                                key={idx}
                                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-lg border hover:shadow-md transition-shadow"
                              >
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-kiit-green" />
                                    <span className="font-semibold text-lg">
                                      {entry.timeSlot}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <BookOpen className="w-4 h-4" />
                                    <span>{entry.subject}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <User className="w-4 h-4" />
                                    <span>Section: {entry.section}</span>
                                    <Badge variant="outline" className="ml-2">
                                      Semester {entry.semester}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="mt-2 sm:mt-0 flex flex-col gap-2">
                                  {entry.classroom && entry.classroom !== entry.cabin && (
                                    <div className="flex items-center gap-2 text-blue-600 font-semibold">
                                      <MapPin className="w-4 h-4" />
                                      <span>Class: {entry.classroom}</span>
                                    </div>
                                  )}
                                  {entry.cabin && (
                                    <div className="flex items-center gap-2 text-kiit-green font-semibold">
                                      <MapPin className="w-4 h-4" />
                                      <span>{entry.classroom === entry.cabin ? 'Class/Cabin' : 'Cabin'}: {entry.cabin}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  Enter a teacher's name and click "Search Schedule" to view their timetable
                </p>
              </Card>
            )}
          </TabsContent>

          {/* Live Status Tab */}
          <TabsContent value="status">
            {teacherStatus ? (
              <div className="space-y-6">
                {/* Current Status Card */}
                <Card className="border-2 border-kiit-green shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-kiit-green to-kiit-green-dark text-white">
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-6 h-6" />
                      Current Status - {teacherStatus.currentDay}
                    </CardTitle>
                    <CardDescription className="text-white/90">
                      As of {teacherStatus.currentTime} • Time Slot: {teacherStatus.currentSlot || "Between classes"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Current Class */}
                      <div>
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                          Currently Teaching
                        </h3>
                        {teacherStatus.current ? (
                          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 space-y-2">
                            <p className="text-xl font-bold text-green-800">
                              {teacherStatus.current.subject}
                            </p>
                            <p className="text-green-700">
                              Section: {teacherStatus.current.section} (Sem {teacherStatus.current.semester})
                            </p>
                            <p className="text-green-600 flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {teacherStatus.current.timeSlot}
                            </p>
                            {teacherStatus.current.classroom && teacherStatus.current.classroom !== teacherStatus.current.cabin && (
                              <p className="text-blue-600 flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                Class: {teacherStatus.current.classroom}
                              </p>
                            )}
                            {teacherStatus.current.cabin && (
                              <p className="text-green-600 flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                {teacherStatus.current.classroom === teacherStatus.current.cabin ? 'Class/Cabin' : 'Cabin'}: {teacherStatus.current.cabin}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                            <p className="text-gray-600">No class at the moment</p>
                            {teacherStatus.cabin && (
                              <p className="text-gray-600 flex items-center gap-2 mt-2">
                                <MapPin className="w-4 h-4" />
                                Available at Cabin: {teacherStatus.cabin}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Next Class */}
                      <div>
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          Next Class
                        </h3>
                        {teacherStatus.next ? (
                          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 space-y-2">
                            <p className="text-xl font-bold text-blue-800">
                              {teacherStatus.next.subject}
                            </p>
                            <p className="text-blue-700">
                              Section: {teacherStatus.next.section} (Sem {teacherStatus.next.semester})
                            </p>
                            <p className="text-blue-600 flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {teacherStatus.next.timeSlot}
                            </p>
                            {teacherStatus.next.classroom && teacherStatus.next.classroom !== teacherStatus.next.cabin && (
                              <p className="text-blue-600 flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                Class: {teacherStatus.next.classroom}
                              </p>
                            )}
                            {teacherStatus.next.cabin && (
                              <p className="text-green-600 flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                {teacherStatus.next.classroom === teacherStatus.next.cabin ? 'Class/Cabin' : 'Cabin'}: {teacherStatus.next.cabin}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                            <p className="text-gray-600">No more classes today</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Today's Full Schedule */}
                {teacherStatus.today.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Today's Complete Schedule</CardTitle>
                      <CardDescription>All classes for {teacherStatus.currentDay}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {teacherStatus.today.map((entry, idx) => (
                          <div
                            key={idx}
                            className={`p-4 rounded-lg border-2 ${
                              entry.timeSlot === teacherStatus.currentSlot
                                ? "bg-green-50 border-green-300"
                                : "bg-white border-gray-200"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <p className="font-semibold text-lg">{entry.timeSlot}</p>
                                <p className="text-gray-700">{entry.subject}</p>
                                <p className="text-sm text-gray-600">
                                  {entry.section} • Semester {entry.semester}
                                </p>
                                {entry.classroom && entry.classroom !== entry.cabin && (
                                  <p className="text-sm text-blue-600 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    Class: {entry.classroom}
                                  </p>
                                )}
                                {entry.cabin && (
                                  <p className="text-sm text-green-600 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {entry.classroom === entry.cabin ? 'Class/Cabin' : 'Cabin'}: {entry.cabin}
                                  </p>
                                )}
                              </div>
                              {entry.timeSlot === teacherStatus.currentSlot && (
                                <Badge className="bg-green-500">Now</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  Enter a teacher's name and click "Live Status" to see what they're teaching right now
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default TeacherTimetable;
