import React, { useState, useMemo, useCallback } from "react";
import { Calendar as BigCalendar, momentLocalizer, View, Views } from "react-big-calendar";
import moment from "moment";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Search,
  Filter,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Plus,
  Bell,
  Settings,
  Grid3X3,
  List,
  Eye,
  Download,
  Share2,
  Music,
  Volume2,
  VolumeX,
  Star,
  Trophy,
  Zap,
  Heart,
  CheckCircle,
  AlertCircle,
  Info,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { societyInterviews, SocietyInterview, filterByCategory, filterBySearch, getUpcomingInterviews } from "@/data/societyInterviews";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const InterviewDeadlinesTracker = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<SocietyInterview | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [completedEvents, setCompletedEvents] = useState<Set<string>>(new Set());

  const categories = ["All", "Technical", "Cultural", "Sports", "Literary", "Fest", "Management"];

  // Filter interviews based on category and search
  const filteredInterviews = useMemo(() => {
    let filtered = filterByCategory(societyInterviews, selectedCategory);
    if (searchQuery) {
      filtered = filterBySearch(filtered, searchQuery);
    }
    return filtered;
  }, [selectedCategory, searchQuery]);

  // Transform interviews to calendar events
  const calendarEvents = useMemo(() => {
    return filteredInterviews.map(interview => ({
      id: interview.id,
      title: interview.society,
      start: interview.date,
      end: new Date(interview.date.getTime() + 2 * 60 * 60 * 1000), // 2 hours duration
      resource: interview,
      allDay: false
    }));
  }, [filteredInterviews]);

  // Get upcoming interviews for sidebar
  const upcomingInterviews = useMemo(() => {
    return getUpcomingInterviews(filteredInterviews).slice(0, 8);
  }, [filteredInterviews]);

  const handleEventSelect = useCallback((event: any) => {
    setSelectedEvent(event.resource);
    setShowEventModal(true);
  }, []);

  const handleEventComplete = useCallback((eventId: string) => {
    setCompletedEvents(prev => new Set([...prev, eventId]));
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  }, []);

  const eventStyleGetter = useCallback((event: any) => {
    const interview = event.resource as SocietyInterview;
    const isCompleted = completedEvents.has(interview.id);
    
    return {
      style: {
        backgroundColor: isCompleted ? '#10B981' : interview.color,
        borderRadius: '12px',
        opacity: isCompleted ? 0.7 : 0.9,
        color: 'white',
        border: '2px solid rgba(255,255,255,0.2)',
        fontWeight: '600',
        fontSize: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        backdropFilter: 'blur(10px)',
        transform: isCompleted ? 'scale(0.95)' : 'scale(1)',
        transition: 'all 0.3s ease'
      }
    };
  }, [completedEvents]);

  const CustomToolbar = () => (
    <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-6 p-4 glass-card">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1))}
          className="text-kiit-green hover:bg-kiit-green/10"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h3 className="text-xl font-bold text-kiit-green">
          {moment(date).format('MMMM YYYY')}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1))}
          className="text-kiit-green hover:bg-kiit-green/10"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
        {[Views.MONTH, Views.WEEK, Views.DAY].map((viewName) => (
          <Button
            key={viewName}
            variant={view === viewName ? "default" : "outline"}
            size="sm"
            onClick={() => setView(viewName)}
            className={view === viewName ? "bg-kiit-green text-white" : ""}
          >
            {viewName.charAt(0).toUpperCase() + viewName.slice(1)}
          </Button>
        ))}
      </div>
    </div>
  );

  const EventModal = () => (
    <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        {selectedEvent && (
          <div className="space-y-6">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                  <span className="text-3xl">{selectedEvent.logo}</span>
                  <div>
                    <div className="text-kiit-green">{selectedEvent.society}</div>
                    <div className="text-lg text-gray-600 font-normal">{selectedEvent.title}</div>
                  </div>
                </DialogTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEventModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </DialogHeader>

            <div className="grid gap-4">
              <Card>
                <CardContent className="pt-4">
                  <p className="text-gray-700 mb-4">{selectedEvent.description}</p>
                  
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-kiit-green" />
                      <span>{moment(selectedEvent.date).format('MMMM Do, YYYY')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-kiit-green" />
                      <span>{moment(selectedEvent.date).format('h:mm A')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-kiit-green" />
                      <span>{selectedEvent.venue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-kiit-green" />
                      <span>{selectedEvent.duration}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="w-5 h-5 text-kiit-green" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p><strong>Organizer:</strong> {selectedEvent.contactPerson}</p>
                      <p><strong>Email:</strong> {selectedEvent.contactEmail}</p>
                      {selectedEvent.meetingLink && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => window.open(selectedEvent.meetingLink, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Join Meeting
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-kiit-green" />
                      Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedEvent.requirements.map((req, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {req}
                        </Badge>
                      ))}
                    </div>
                    {selectedEvent.maxParticipants && (
                      <p className="text-sm text-gray-600 mt-3">
                        <strong>Max Participants:</strong> {selectedEvent.maxParticipants}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="flex gap-3">
                <Button 
                  className="flex-1 bg-kiit-green hover:bg-kiit-green-dark text-white"
                  onClick={() => {
                    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(selectedEvent.society + ' - ' + selectedEvent.title)}&dates=${moment(selectedEvent.date).format('YYYYMMDDTHHmmss')}/${moment(selectedEvent.date).add(2, 'hours').format('YYYYMMDDTHHmmss')}&details=${encodeURIComponent(selectedEvent.description)}&location=${encodeURIComponent(selectedEvent.venue)}`;
                    window.open(googleCalendarUrl, '_blank');
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Google Calendar
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleEventComplete(selectedEvent.id)}
                  disabled={completedEvents.has(selectedEvent.id)}
                >
                  {completedEvents.has(selectedEvent.id) ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Completed
                    </>
                  ) : (
                    <>
                      <Bell className="w-4 h-4 mr-2" />
                      Set Reminder
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-kiit-green-soft via-white to-campus-blue/10">
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-kiit-green hover:text-kiit-green-dark"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
            
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMusicPlaying(!musicPlaying)}
                className="text-kiit-green hover:bg-kiit-green/10"
              >
                {musicPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-kiit-green hover:bg-kiit-green/10"
              >
                {sidebarOpen ? <Eye className="w-4 h-4" /> : <List className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <Navbar />
      
      {/* Hero Section with Stats */}
      <section className="pt-24 pb-12 px-4">
        <div className="container mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 glass-card px-4 py-2 text-sm font-medium text-kiit-green mb-6">
              <Star className="w-4 h-4" />
              Society Interview Tracker
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gradient mb-6">
              🗓️ Interview Deadlines Tracker
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8">
              Never miss a society interview or deadline again
            </p>
            
            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-8">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="glass-card p-4 text-center"
              >
                <div className="text-2xl font-bold text-kiit-green">{societyInterviews.length}</div>
                <div className="text-sm text-gray-600">Total Events</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="glass-card p-4 text-center"
              >
                <div className="text-2xl font-bold text-campus-blue">{upcomingInterviews.length}</div>
                <div className="text-sm text-gray-600">Upcoming</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="glass-card p-4 text-center"
              >
                <div className="text-2xl font-bold text-campus-orange">{categories.length - 1}</div>
                <div className="text-sm text-gray-600">Categories</div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="glass-card p-4 text-center"
              >
                <div className="text-2xl font-bold text-campus-purple">{completedEvents.size}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <section className="py-6 px-4 bg-white/80 backdrop-blur-sm sticky top-20 z-40">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search societies or events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 glass-card border-0"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={`whitespace-nowrap ${
                    selectedCategory === category 
                      ? "bg-kiit-green text-white hover:bg-kiit-green-dark" 
                      : "glass-card border-0"
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Calendar Layout */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex gap-6">
            {/* Main Calendar */}
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="glass-card p-6 min-h-[600px]"
              >
                <CustomToolbar />
                <div className="calendar-container">
                  <BigCalendar
                    localizer={localizer}
                    events={calendarEvents}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 500 }}
                    view={view}
                    views={[Views.MONTH, Views.WEEK, Views.DAY]}
                    date={date}
                    onView={setView}
                    onNavigate={setDate}
                    onSelectEvent={handleEventSelect}
                    eventPropGetter={eventStyleGetter}
                    components={{
                      toolbar: () => null
                    }}
                  />
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, x: 300 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 300 }}
                  transition={{ duration: 0.3 }}
                  className="w-80 space-y-4"
                >
                  {/* Upcoming Events */}
                  <Card className="glass-card border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-kiit-green">
                        <Clock className="w-5 h-5" />
                        Upcoming Events
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                      {upcomingInterviews.map((interview) => (
                        <motion.div
                          key={interview.id}
                          whileHover={{ scale: 1.02 }}
                          className="p-3 glass-card cursor-pointer border-l-4"
                          style={{ borderLeftColor: interview.color }}
                          onClick={() => {
                            setSelectedEvent(interview);
                            setShowEventModal(true);
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-xl">{interview.logo}</span>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">{interview.society}</h4>
                              <p className="text-xs text-gray-600 truncate">{interview.title}</p>
                              <div className="flex items-center gap-1 mt-1">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-500">
                                  {moment(interview.date).format('MMM Do, h:mm A')}
                                </span>
                              </div>
                              <Badge 
                                className="mt-1 text-xs" 
                                style={{ backgroundColor: interview.color }}
                              >
                                {interview.category}
                              </Badge>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card className="glass-card border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-kiit-green">
                        <Zap className="w-5 h-5" />
                        Quick Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start glass-card border-0">
                        <Download className="w-4 h-4 mr-2" />
                        Export Calendar
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start glass-card border-0">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share Events
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start glass-card border-0">
                        <Bell className="w-4 h-4 mr-2" />
                        Notification Settings
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Achievement Section */}
      {completedEvents.size > 0 && (
        <section className="py-12 px-4 bg-gradient-to-r from-kiit-green/10 to-campus-blue/10">
          <div className="container mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto"
            >
              <Trophy className="w-16 h-16 text-campus-orange mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-kiit-green mb-4">
                🎉 Great Progress!
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                You've completed {completedEvents.size} interview{completedEvents.size > 1 ? 's' : ''} successfully!
              </p>
              <Badge className="bg-campus-orange text-white px-4 py-2 text-lg">
                <Heart className="w-4 h-4 mr-2" />
                Keep it up!
              </Badge>
            </motion.div>
          </div>
        </section>
      )}

      <EventModal />
      <Footer />

    </div>
  );
};

export default InterviewDeadlinesTracker;