import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  ExternalLink, 
  Search,
  Filter,
  ArrowLeft,
  Users,
  Target,
  Briefcase,
  Video,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List,
  Sparkles,
  Play,
  Pause
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { societyInterviews, categoryColors, eventTypeColors, SocietyInterview } from "@/data/societyInterviews";
import { format, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, addMonths, subMonths, startOfMonth, endOfMonth } from "date-fns";

const InterviewDeadlinesTracker = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'list'>('month');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<SocietyInterview | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isPlaying, setIsPlaying] = useState(false);

  const categories = ['All', 'Technical', 'Cultural', 'Sports', 'Literary', 'Social', 'Business'];

  const filteredEvents = useMemo(() => {
    return societyInterviews.filter(event => {
      const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
      const matchesSearch = event.societyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          event.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const eventsForSelectedDate = useMemo(() => {
    return filteredEvents.filter(event => isSameDay(event.date, selectedDate));
  }, [filteredEvents, selectedDate]);

  const getDaysInView = () => {
    switch (viewMode) {
      case 'week':
        return eachDayOfInterval({
          start: startOfWeek(currentDate, { weekStartsOn: 1 }),
          end: endOfWeek(currentDate, { weekStartsOn: 1 })
        });
      case 'month':
        return eachDayOfInterval({
          start: startOfMonth(currentDate),
          end: endOfMonth(currentDate)
        });
      default:
        return [currentDate];
    }
  };

  const navigateCalendar = (direction: 'prev' | 'next') => {
    if (viewMode === 'month') {
      setCurrentDate(direction === 'next' ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(direction === 'next' ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1));
    }
  };

  const getEventsForDay = (day: Date) => {
    return filteredEvents.filter(event => isSameDay(event.date, day));
  };

  const toggleMusic = () => {
    setIsPlaying(!isPlaying);
    // In a real app, you'd integrate with an audio API here
  };

  const stats = {
    totalEvents: filteredEvents.length,
    upcomingEvents: filteredEvents.filter(e => e.status === 'upcoming').length,
    todayEvents: filteredEvents.filter(e => isSameDay(e.date, new Date())).length,
    categoriesActive: new Set(filteredEvents.map(e => e.category)).size
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-kiit-green via-white to-campus-blue relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-campus-purple/20 to-campus-orange/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-r from-kiit-green/20 to-campus-blue/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-campus-orange/10 to-campus-purple/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Header with Navigation */}
      <div className="sticky top-0 z-50 bg-white/10 backdrop-blur-xl border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-kiit-green hover:text-kiit-green-dark glass-button"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
            
            {/* Music Toggle */}
            <Button
              variant="ghost"
              onClick={toggleMusic}
              className="flex items-center gap-2 glass-button"
              title="Toggle Background Music"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              🎵
            </Button>
          </div>
        </div>
      </div>
      
      <Navbar />
      
      {/* Hero Section with Floating Animation */}
      <section className="pt-24 pb-16 px-4 relative">
        <div className="container mx-auto text-center">
          <div className="max-w-6xl mx-auto">
            {/* Floating Title */}
            <div className="animate-float mb-8">
              <h1 className="text-5xl md:text-7xl font-bold text-gradient mb-6">
                🗓️ KIIT Society Hub
              </h1>
              <div className="text-2xl md:text-3xl font-semibold text-hero-gradient mb-4">
                Never Miss Another Interview
              </div>
            </div>
            
            <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-4xl mx-auto leading-relaxed">
              Your one-stop destination for tracking all society interviews, onboarding sessions, and selection trials across KIIT campus
            </p>
            
            {/* Floating Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
              {[
                { label: 'Total Events', value: stats.totalEvents, icon: '📅', color: 'from-kiit-green to-campus-blue' },
                { label: 'Upcoming', value: stats.upcomingEvents, icon: '⏰', color: 'from-campus-orange to-campus-purple' },
                { label: 'Today', value: stats.todayEvents, icon: '🎯', color: 'from-campus-purple to-campus-blue' },
                { label: 'Active Categories', value: stats.categoriesActive, icon: '🏆', color: 'from-campus-blue to-kiit-green' }
              ].map((stat, index) => (
                <Card key={index} className="glass-card hover:scale-105 transition-all duration-300 animate-bounce-slow" style={{ animationDelay: `${index * 200}ms` }}>
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl mb-2">{stat.icon}</div>
                    <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1`}>
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filter Bar with Glassmorphism */}
      <section className="py-6 px-4 sticky top-[88px] z-40 bg-white/10 backdrop-blur-xl border-y border-white/20">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search societies or events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 glass-card border-white/30 text-white placeholder:text-gray-300"
                />
              </div>
              
              {/* Category Filters */}
              <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={`whitespace-nowrap glass-button ${
                      selectedCategory === category 
                        ? 'bg-gradient-to-r from-kiit-green to-campus-blue text-white' 
                        : 'border-white/30 text-gray-700 hover:bg-white/20'
                    }`}
                  >
                    {category}
                  </Button>
                ))}
              </div>
              
              {/* View Toggle */}
              <div className="flex gap-1 glass-card p-1 rounded-lg">
                {[
                  { mode: 'month', icon: Grid3X3, label: 'Month' },
                  { mode: 'week', icon: CalendarIcon, label: 'Week' },
                  { mode: 'list', icon: List, label: 'List' }
                ].map(({ mode, icon: Icon, label }) => (
                  <Button
                    key={mode}
                    variant={viewMode === mode ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode(mode as any)}
                    className={`${viewMode === mode ? 'bg-kiit-green text-white' : 'text-gray-600'}`}
                    title={label}
                  >
                    <Icon className="w-4 h-4" />
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {viewMode === 'list' ? (
        /* List View */
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="space-y-6">
              {filteredEvents.map((event, index) => (
                <Card key={event.id} className="glass-card group hover:scale-[1.02] transition-all duration-300 overflow-hidden animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className={`h-2 bg-gradient-to-r ${event.color}`}></div>
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Event Info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="text-4xl group-hover:scale-110 transition-transform duration-300">{event.logo}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <h3 className="text-xl font-bold text-gray-800">{event.societyName}</h3>
                              <Badge className={eventTypeColors[event.eventType]}>{event.eventType}</Badge>
                              <Badge variant="outline" className="border-gray-300">{event.category}</Badge>
                            </div>
                            <h4 className="text-lg text-gray-700 font-medium mb-3">{event.title}</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
                              <div className="flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4 text-kiit-green" />
                                {format(event.date, 'EEEE, MMMM d, yyyy')}
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-kiit-green" />
                                {event.time}
                              </div>
                              <div className="flex items-center gap-2">
                                {event.isOnline ? <Video className="w-4 h-4 text-blue-500" /> : <MapPin className="w-4 h-4 text-red-500" />}
                                {event.venue}
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-purple-500" />
                                {event.applicants}/{event.positions} applicants
                              </div>
                            </div>
                            
                            <p className="text-gray-600 mb-4">{event.description}</p>
                            
                            <div className="flex flex-wrap gap-2 mb-4">
                              {event.requirements.map((req, i) => (
                                <Badge key={i} variant="secondary" className="text-xs bg-gray-100">
                                  {req}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="lg:w-64 space-y-4">
                        <div className="text-center lg:text-right">
                          <Badge className={`${
                            event.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                            event.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {event.difficulty}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button className="w-full bg-gradient-to-r from-kiit-green to-campus-blue text-white hover:scale-105 transition-transform duration-200">
                                View Details
                                <ExternalLink className="w-4 h-4 ml-2" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl glass-card">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-3 text-xl">
                                  <span className="text-3xl">{event.logo}</span>
                                  {event.title}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div className="space-y-2">
                                    <div><strong>Society:</strong> {event.societyName}</div>
                                    <div><strong>Date:</strong> {format(event.date, 'PPP')}</div>
                                    <div><strong>Time:</strong> {event.time}</div>
                                    <div><strong>Venue:</strong> {event.venue}</div>
                                  </div>
                                  <div className="space-y-2">
                                    <div><strong>Type:</strong> {event.eventType}</div>
                                    <div><strong>Category:</strong> {event.category}</div>
                                    <div><strong>Difficulty:</strong> {event.difficulty}</div>
                                    <div><strong>Positions:</strong> {event.positions}</div>
                                  </div>
                                </div>
                                
                                <div>
                                  <strong>Description:</strong>
                                  <p className="mt-1 text-gray-600">{event.description}</p>
                                </div>
                                
                                <div>
                                  <strong>Requirements:</strong>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {event.requirements.map((req, i) => (
                                      <Badge key={i} variant="outline">{req}</Badge>
                                    ))}
                                  </div>
                                </div>
                                
                                {event.contactPerson && (
                                  <div className="bg-gray-50 p-4 rounded-lg">
                                    <strong>Contact:</strong>
                                    <div className="mt-1">
                                      <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4" />
                                        {event.contactPerson}
                                      </div>
                                      {event.contactEmail && (
                                        <div className="flex items-center gap-2 mt-1">
                                          <Mail className="w-4 h-4" />
                                          {event.contactEmail}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                                
                                {event.meetLink && (
                                  <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                                    <Video className="w-4 h-4 mr-2" />
                                    Join Online Meeting
                                  </Button>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <Button variant="outline" size="sm" className="w-full hover:bg-gray-50">
                            Add to Calendar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      ) : (
        /* Calendar View */
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-7xl">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateCalendar('prev')}
                  className="glass-button"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h2 className="text-2xl font-bold text-gray-800">
                  {format(currentDate, viewMode === 'month' ? 'MMMM yyyy' : 'MMMM d - ') }
                  {viewMode === 'week' && format(endOfWeek(currentDate), 'd, yyyy')}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateCalendar('next')}
                  className="glass-button"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              
              <Button
                variant="outline"
                onClick={() => setCurrentDate(new Date())}
                className="glass-button"
              >
                Today
              </Button>
            </div>
            
            {/* Calendar Grid */}
            <div className="glass-card p-6 rounded-2xl">
              {viewMode === 'month' && (
                <div className="grid grid-cols-7 gap-4">
                  {/* Week Headers */}
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <div key={day} className="text-center font-semibold text-gray-600 py-3">
                      {day}
                    </div>
                  ))}
                  
                  {/* Calendar Days */}
                  {getDaysInView().map((day, index) => {
                    const dayEvents = getEventsForDay(day);
                    const isToday = isSameDay(day, new Date());
                    const isSelected = isSameDay(day, selectedDate);
                    
                    return (
                      <div
                        key={index}
                        className={`min-h-[120px] p-2 rounded-lg border cursor-pointer transition-all duration-200 ${
                          isToday ? 'bg-kiit-green/10 border-kiit-green/30' :
                          isSelected ? 'bg-campus-blue/10 border-campus-blue/30' :
                          'bg-white/50 border-gray-200 hover:bg-white/80'
                        }`}
                        onClick={() => setSelectedDate(day)}
                      >
                        <div className={`text-sm font-medium mb-2 ${
                          isToday ? 'text-kiit-green' : 'text-gray-700'
                        }`}>
                          {format(day, 'd')}
                        </div>
                        
                        <div className="space-y-1">
                          {dayEvents.slice(0, 3).map((event, i) => (
                            <div
                              key={i}
                              className={`text-xs p-1 rounded bg-gradient-to-r ${event.color} text-white truncate cursor-pointer hover:scale-105 transition-transform`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEvent(event);
                              }}
                            >
                              {event.logo} {event.societyName}
                            </div>
                          ))}
                          {dayEvents.length > 3 && (
                            <div className="text-xs text-gray-500 text-center">
                              +{dayEvents.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {viewMode === 'week' && (
                <div className="grid grid-cols-7 gap-4">
                  {getDaysInView().map((day, index) => {
                    const dayEvents = getEventsForDay(day);
                    const isToday = isSameDay(day, new Date());
                    
                    return (
                      <div key={index} className="space-y-4">
                        <div className={`text-center py-3 rounded-lg ${
                          isToday ? 'bg-kiit-green text-white' : 'bg-gray-100 text-gray-700'
                        }`}>
                          <div className="font-medium">{format(day, 'EEE')}</div>
                          <div className="text-xl font-bold">{format(day, 'd')}</div>
                        </div>
                        
                        <div className="space-y-2 min-h-[400px]">
                          {dayEvents.map((event, i) => (
                            <Card
                              key={i}
                              className={`p-3 cursor-pointer hover:scale-105 transition-all duration-200 bg-gradient-to-r ${event.color} text-white`}
                              onClick={() => setSelectedEvent(event)}
                            >
                              <div className="text-lg mb-1">{event.logo}</div>
                              <div className="text-sm font-medium truncate">{event.societyName}</div>
                              <div className="text-xs opacity-90">{event.time}</div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Side Panel for Selected Date Events */}
      {eventsForSelectedDate.length > 0 && viewMode !== 'list' && (
        <div className="fixed right-4 top-1/2 transform -translate-y-1/2 w-80 max-h-[70vh] overflow-y-auto z-40">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-kiit-green" />
                {format(selectedDate, 'MMMM d, yyyy')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {eventsForSelectedDate.map((event, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg bg-gradient-to-r ${event.color} text-white cursor-pointer hover:scale-105 transition-transform`}
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{event.logo}</span>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{event.societyName}</div>
                      <div className="text-xs opacity-90">{event.eventType}</div>
                    </div>
                  </div>
                  <div className="text-sm">{event.title}</div>
                  <div className="text-xs opacity-90 mt-1">{event.time} • {event.venue}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <Button
          size="lg"
          className="rounded-full w-16 h-16 bg-gradient-to-r from-kiit-green to-campus-blue text-white shadow-2xl hover:scale-110 transition-all duration-300 animate-pulse"
          onClick={() => setViewMode(viewMode === 'list' ? 'month' : 'list')}
        >
          <Sparkles className="w-6 h-6" />
        </Button>
      </div>

      <Footer />
    </div>
  );
};

export default InterviewDeadlinesTracker;