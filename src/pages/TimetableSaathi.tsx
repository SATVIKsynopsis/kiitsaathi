import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, Search, Filter, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import timetableData from "@/data/timetables.json";

const TimetableSaathi = () => {
  const [selectedSemester, setSelectedSemester] = useState("1");
  const [selectedSection, setSelectedSection] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [savePreferences, setSavePreferences] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayAbbr = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (savePreferences) {
      localStorage.setItem("tt_semester", selectedSemester);
      localStorage.setItem("tt_section", selectedSection);
    }
  }, [selectedSemester, selectedSection, savePreferences]);

  const semesterData = timetableData.semesters[selectedSemester as keyof typeof timetableData.semesters];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Timetable Saathi</h1>
            <p className="text-muted-foreground">Your Personal Class Schedule Assistant</p>
          </div>

          {/* Controls */}
          <Card className="mb-6">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="font-medium">Current Time: {currentTime.toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={savePreferences} onCheckedChange={setSavePreferences} />
                  <span className="text-sm">Save Preferences</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                  <SelectTrigger>
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
                  <SelectTrigger>
                    <SelectValue placeholder="Select Section" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesterData?.sections?.map((section: string) => (
                      <SelectItem key={section} value={section}>{section}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Day Strip */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {dayAbbr.map((day, index) => (
              <Button
                key={day}
                variant={selectedDay === index ? "default" : "outline"}
                onClick={() => setSelectedDay(index)}
                className="min-w-[80px]"
              >
                {day}
              </Button>
            ))}
          </div>

          {/* Time Sheet */}
          <div className="space-y-4">
            {'effective_from' in (semesterData || {}) && (
              <p className="text-sm text-muted-foreground">
                Effective from: {(semesterData as any).effective_from}
              </p>
            )}
            
            <div className="grid gap-4">
              {Object.entries(semesterData?.courses || {}).map(([code, name]) => (
                <Card key={code} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-lg">{code}</h3>
                        <p className="text-sm text-muted-foreground">{name as string}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span>Various Locations</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-primary" />
                          <span>As per schedule</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {!selectedSection && (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Please select a section to view timetable</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TimetableSaathi;
