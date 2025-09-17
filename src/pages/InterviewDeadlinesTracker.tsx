import React, { useState, useMemo, useEffect } from "react";
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
  ChevronLeft,
  ChevronRight,
  Video
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

const localizer = momentLocalizer(moment);

type CalendarEvent = Database['public']['Tables']['calendar_events']['Row'];

const categories = ["All", "Technical", "Cultural", "Sports", "Literary", "Social"];

const InterviewDeadlinesTracker = () => {
  const navigate = useNavigate();
  const { width, height } = useWindowSize();

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [showConfetti, setShowConfetti] = useState(false);
  const [addEventOpen, setAddEventOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    society_name: "",
    event_name: "",
    event_date: "",
    start_time: "",
    end_time: "",
    venue: "",
    organiser: "",
    category: "",
    description: "",
    requirements: "",
    validation: false,
  });

  // Fetch user
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      } else {
        setError("Please login to add events to calendar");
      }
    };
    getUser();
  }, []);

  // Fetch events from Supabase
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .order("event_date", { ascending: true });
      
      if (error) {
        console.error("Error fetching events:", error.message);
        setError("Failed to load events: " + error.message);
      } else {
        console.log("Fetched events:", data); // Debug log
        setEvents(data || []);
        setError(null);
      }
    } catch (err) {
      console.error("Unexpected error fetching events:", err);
      setError("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Filter + search
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        event.society_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.event_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || event.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [events, searchQuery, selectedCategory]);

  // Sort events by date (upcoming first)
  const upcomingEvents = useMemo(() => {
    return filteredEvents
      .filter(event => {
        const eventDate = moment(event.event_date);
        return eventDate.isSameOrAfter(moment(), 'day'); 
      })
      .sort((a, b) => moment(a.event_date).diff(moment(b.event_date)));
  }, [filteredEvents]);

  // Transform events for calendar
  const calendarEvents = useMemo(() => {
    return filteredEvents.map((event) => ({
      id: event.id,
      title: event.event_name,
      start: new Date(`${event.event_date}T${event.start_time || '09:00'}`),
      end: new Date(`${event.event_date}T${event.end_time || '10:00'}`),
      allDay: !event.start_time,
      resource: event,
    }));
  }, [filteredEvents]);

  // Handle event selection
  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event.resource);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.event_name || !formData.event_date) {
      alert("Event name and date are required!");
      return;
    }

    const reqs: string[] = formData.requirements
      ? formData.requirements.split(",").map((r) => r.trim()).filter(Boolean)
      : [];

    try {
      const { error } = await supabase.from("calendar_events").insert([
        { 
          ...formData, 
          requirements: reqs,
          validation: formData.validation
        }
      ]);

      if (error) {
        console.error("Insert error:", error);
        alert("Error adding event: " + error.message);
      } else {
        alert("Event added successfully!");
        setAddEventOpen(false);
        // Reset form
        setFormData({
          society_name: "",
          event_name: "",
          event_date: "",
          start_time: "",
          end_time: "",
          venue: "",
          organiser: "",
          category: "",
          description: "",
          requirements: "",
          validation: false,
        });
        // Refresh events
        await fetchEvents();
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("Failed to add event");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8 mt-10">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Events Tracker</h1>
            <p className="text-gray-600">Stay organized with society event schedules</p>
          </div>
          {user && (
            <Button onClick={() => setAddEventOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
            view={view}
            date={date}
            onView={setView}
            onNavigate={setDate}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={(event) => ({
              style: { 
                backgroundColor: event.resource.category === "Technical" ? "#3B82F6" : "#10B981",
                borderRadius: "4px"
              },
            })}
            components={{
              event: ({ event }) => (
                <span className="px-2 py-1 text-xs rounded text-white">
                  {event.title}
                </span>
              ),
            }}
          />
        </div>

        {/* Upcoming Events - NOW SHOWS DATABASE DATA */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Upcoming Events ({upcomingEvents.length})</h2>
            <Badge variant="outline" className="text-sm">
              {upcomingEvents.length} {upcomingEvents.length === 1 ? "event" : "events"} found
            </Badge>
          </div>
          
          {upcomingEvents.length === 0 ? (
            <Card className="text-center py-12 bg-gray-50">
              <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming events</h3>
              <p className="text-gray-500 mb-4">No events match your current filters</p>
              <Button variant="outline" onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}>
                Clear Filters
              </Button>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.slice(0, 6).map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedEvent(event)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant={event.validation ? "default" : "secondary"}>
                        {event.category}
                      </Badge>
                      {event.validation && <CheckCircle className="w-4 h-4 text-green-500" />}
                    </div>
                    <CardTitle className="text-lg truncate">{event.event_name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{event.society_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarIcon className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">
                          {moment(event.event_date).format("MMM DD, YYYY")}
                        </span>
                      </div>
                      {event.start_time && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span>{event.start_time} - {event.end_time || "TBD"}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="truncate">{event.venue}</span>
                      </div>
                      {event.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
                      )}
                      {event.requirements && event.requirements.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {event.requirements.slice(0, 2).map((req, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {req}
                            </Badge>
                          ))}
                          {event.requirements.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{event.requirements.length - 2} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Selected Event Modal */}
        {selectedEvent && (
          <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{selectedEvent.event_name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-sm text-gray-500 mb-1">Society</h3>
                    <p className="text-lg font-medium">{selectedEvent.society_name}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-gray-500 mb-1">Organiser</h3>
                    <p className="text-sm">{selectedEvent.organiser}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-500 mb-2">Date & Time</h3>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-semibold">{moment(selectedEvent.event_date).format("MMM DD, YYYY")}</p>
                    </div>
                    {selectedEvent.start_time && (
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Time</p>
                        <p className="font-semibold">{selectedEvent.start_time} - {selectedEvent.end_time || "TBD"}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-500 mb-2">Venue</h3>
                  <p className="text-gray-700">{selectedEvent.venue}</p>
                </div>
                {selectedEvent.requirements?.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-sm text-gray-500 mb-2">Requirements</h3>
                    <div className="space-y-1">
                      {selectedEvent.requirements.map((req, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">{req}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {selectedEvent.description && (
                  <div>
                    <h3 className="font-semibold text-sm text-gray-500 mb-2">Description</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedEvent.description}</p>
                  </div>
                )}
                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedEvent(null)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                    Add to Calendar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Add Event Dialog */}
        <Dialog open={addEventOpen} onOpenChange={setAddEventOpen}>
          <DialogContent className="bg-gradient-to-br from-purple-900 to-blue-900 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Add New Event</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input 
                placeholder="Society Name" 
                value={formData.society_name}
                onChange={(e) => setFormData({ ...formData, society_name: e.target.value })}
                className="bg-white/10 text-white placeholder-white/50 border-white/20"
              />
              <Input 
                placeholder="Event Name *" 
                value={formData.event_name}
                onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                className="bg-white/10 text-white placeholder-white/50 border-white/20"
                required
              />
              <Input 
                type="date" 
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                className="bg-white/10 text-white placeholder-white/50 border-white/20"
                required
              />
              <div className="flex gap-2">
                <Input 
                  type="time" 
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className="bg-white/10 text-white placeholder-white/50 border-white/20 flex-1"
                  placeholder="Start Time"
                />
                <Input 
                  type="time" 
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  className="bg-white/10 text-white placeholder-white/50 border-white/20 flex-1"
                  placeholder="End Time"
                />
              </div>
              <Input 
                placeholder="Venue *" 
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                className="bg-white/10 text-white placeholder-white/50 border-white/20"
                required
              />
              <Input 
                placeholder="Organiser" 
                value={formData.organiser}
                onChange={(e) => setFormData({ ...formData, organiser: e.target.value })}
                className="bg-white/10 text-white placeholder-white/50 border-white/20"
              />
              <Input 
                placeholder="Category" 
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="bg-white/10 text-white placeholder-white/50 border-white/20"
              />
              <Input 
                placeholder="Description" 
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-white/10 text-white placeholder-white/50 border-white/20"
              />
              <Input 
                placeholder="Requirements (comma-separated)" 
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                className="bg-white/10 text-white placeholder-white/50 border-white/20"
              />
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Save Event
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Footer />
      {showConfetti && <Confetti width={width} height={height} />}
    </div>
  );
};

export default InterviewDeadlinesTracker;