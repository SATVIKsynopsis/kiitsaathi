import React, { useState, useMemo } from "react";
import { Calendar, momentLocalizer, Views, View } from "react-big-calendar";
import moment from "moment";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Users, 
  Search,
  ArrowLeft,
  Bell,
  ExternalLink,
  CheckCircle,
  Music,
  Sparkles,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Video
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { mockInterviews, SocietyInterview } from "@/data/societyInterviews";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

const localizer = momentLocalizer(moment);

const InterviewDeadlinesTracker = () => {
  const navigate = useNavigate();
  const { width, height } = useWindowSize();
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<SocietyInterview | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const categories = ["All", "Technical", "Cultural", "Sports", "Literary", "Fest", "Business", "Social"];

  const filteredInterviews = useMemo(() => {
    return mockInterviews.filter(interview => {
      const matchesSearch = interview.society.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           interview.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || interview.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const calendarEvents = filteredInterviews.map(interview => ({
    id: interview.id,
    title: interview.society,
    start: interview.date,
    end: new Date(interview.date.getTime() + 2 * 60 * 60 * 1000),
    resource: interview
  }));

  const upcomingInterviews = filteredInterviews
    .filter(interview => interview.status === "upcoming")
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  const handleEventClick = (event: any) => {
    setSelectedEvent(event.resource);
  };

  const handleCompleteInterview = (interviewId: string) => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const handleAddToGoogleCalendar = (interview: SocietyInterview) => {
    const startDate = moment(interview.date).format('YYYYMMDDTHHmmss');
    const endDate = moment(interview.date).add(2, 'hours').format('YYYYMMDDTHHmmss');
    const details = encodeURIComponent(`${interview.description}\n\nContact: ${interview.contactPerson}\nEmail: ${interview.contactEmail}`);
    const location = encodeURIComponent(interview.venue);
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(interview.title)}&dates=${startDate}/${endDate}&details=${details}&location=${location}`;
    window.open(googleCalendarUrl, '_blank');
  };

  const eventStyleGetter = (event: any) => {
    const interview = event.resource as SocietyInterview;
    return {
      style: {
        backgroundColor: interview.color,
        borderRadius: '8px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        fontSize: '12px',
        fontWeight: '600'
      }
    };
  };

  const CustomToolbar = ({ label, onNavigate, onView }: any) => (
    <div className="flex flex-col lg:flex-row items-center justify-between mb-6 gap-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('PREV')}
            className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-xl font-bold text-white px-4">{label}</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('NEXT')}
            className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('TODAY')}
          className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
        >
          Today
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
        {Object.values(Views).map((viewOption) => (
          <Button
            key={viewOption}
            variant={view === viewOption ? "default" : "outline"}
            size="sm"
            onClick={() => onView(viewOption)}
            className={view === viewOption 
              ? "bg-white text-purple-600 hover:bg-white/90" 
              : "bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
            }
          >
            {viewOption}
          </Button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {showConfetti && <Confetti width={width} height={height} />}
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="sticky top-0 z-40 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/kiit-societies')}
              className="flex items-center gap-2 text-white hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to KIIT Societies
            </Button>
            
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMusicPlaying(!musicPlaying)}
                className="text-white hover:bg-white/10"
              >
                <Music className={`w-4 h-4 ${musicPlaying ? 'animate-pulse' : ''}`} />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-white hover:bg-white/10"
              >
                {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <Navbar />
      
      <section className="pt-12 pb-8 px-4 text-center relative z-10">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
              <h1 className="text-4xl md:text-6xl font-bold text-white">
                🗓️ Interview Deadlines Tracker
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-white/80 mb-8">
              Never miss a society interview again — Your calendar to success
            </p>
          </div>
        </div>
      </section>

      <section className="pb-8 px-4 relative z-10">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-white/60" />
                  <Input
                    placeholder="Search societies or events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto">
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className={selectedCategory === category 
                        ? "bg-white text-purple-600 hover:bg-white/90 whitespace-nowrap" 
                        : "bg-white/10 border-white/20 text-white hover:bg-white/20 whitespace-nowrap"
                      }
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 relative z-10">
        <div className="container mx-auto max-w-7xl">
          <div className="flex gap-6">
            <div className="flex-1">
              <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white overflow-hidden">
                <CardContent className="p-6">
                  <Calendar
                    localizer={localizer}
                    events={calendarEvents}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 600 }}
                    onSelectEvent={handleEventClick}
                    view={view}
                    onView={setView}
                    date={date}
                    onNavigate={setDate}
                    eventPropGetter={eventStyleGetter}
                    components={{ toolbar: CustomToolbar }}
                    className="custom-calendar"
                  />
                </CardContent>
              </Card>
            </div>

            <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block w-80 transition-all duration-300`}>
              <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Clock className="w-5 h-5" />
                    Upcoming Interviews
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                  {upcomingInterviews.length === 0 ? (
                    <div className="text-center py-8">
                      <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-white/40" />
                      <p className="text-white/60">No upcoming interviews!</p>
                      <p className="text-sm text-white/40">Enjoy your free time ✨</p>
                    </div>
                  ) : (
                    upcomingInterviews.map((interview) => (
                      <Card 
                        key={interview.id} 
                        className="bg-white/5 border-white/10 hover:bg-white/10 transition-all cursor-pointer group"
                        onClick={() => setSelectedEvent(interview)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="text-2xl">{interview.logo}</div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-white group-hover:text-yellow-400 transition-colors">
                                {interview.society}
                              </h4>
                              <p className="text-sm text-white/60 mb-2">{interview.title}</p>
                              <div className="flex items-center gap-2 text-xs text-white/50">
                                <CalendarIcon className="w-3 h-3" />
                                {moment(interview.date).format('MMM DD, h:mm A')}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-white/50 mt-1">
                                {interview.isOnline ? (
                                  <Video className="w-3 h-3" />
                                ) : (
                                  <MapPin className="w-3 h-3" />
                                )}
                                {interview.venue}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="bg-gradient-to-br from-purple-900/95 to-blue-900/95 backdrop-blur-xl border-white/20 text-white max-w-2xl">
          {selectedEvent && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">{selectedEvent.logo}</div>
                  <div>
                    <DialogTitle className="text-2xl text-white">{selectedEvent.society}</DialogTitle>
                    <p className="text-lg text-white/80">{selectedEvent.title}</p>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-white/80">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{moment(selectedEvent.date).format('MMMM DD, YYYY')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/80">
                      <Clock className="w-4 h-4" />
                      <span>{selectedEvent.startTime} - {selectedEvent.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/80">
                      {selectedEvent.isOnline ? (
                        <Video className="w-4 h-4" />
                      ) : (
                        <MapPin className="w-4 h-4" />
                      )}
                      <span>{selectedEvent.venue}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/80">
                      <Users className="w-4 h-4" />
                      <span>{selectedEvent.contactPerson}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Badge 
                      className="text-white border-white/20" 
                      style={{ backgroundColor: selectedEvent.color }}
                    >
                      {selectedEvent.category}
                    </Badge>
                    <Badge 
                      variant={selectedEvent.status === 'upcoming' ? 'default' : 'secondary'}
                      className="ml-2"
                    >
                      {selectedEvent.status}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 text-white">Description</h4>
                  <p className="text-white/80">{selectedEvent.description}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 text-white">Requirements</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.requirements.map((req, index) => (
                      <Badge key={index} variant="outline" className="border-white/20 text-white/80">
                        {req}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3 pt-4">
                  <Button 
                    onClick={() => handleAddToGoogleCalendar(selectedEvent)}
                    className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                  >
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Add to Calendar
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Set Reminder
                  </Button>
                  
                  {selectedEvent.isOnline && selectedEvent.onlineLink && (
                    <Button 
                      onClick={() => window.open(selectedEvent.onlineLink, '_blank')}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Join Online
                    </Button>
                  )}
                  
                  {selectedEvent.status === 'upcoming' && (
                    <Button 
                      onClick={() => handleCompleteInterview(selectedEvent.id)}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark Complete
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default InterviewDeadlinesTracker;