import React, { useState, useMemo, useEffect } from "react";
import { Calendar, momentLocalizer, Views, View } from "react-big-calendar";
import moment from "moment";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Video,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/lib/database-types";
import { useEvents } from "@/hooks/useEvents";
import { toast } from "sonner";

const localizer = momentLocalizer(moment);

const HOSTED_URL = import.meta.env.VITE_HOSTED_URL;

type CalendarEvent = Database["public"]["Tables"]["calendar_events"]["Row"];

const categories = [
  "All",
  "Technical",
  "Cultural",
  "Sports",
  "Literary",
  "Social",
];
const societies = [
  "Fed KIIT",
  "KIIT E-Cell",
  "USC KIIT",
  "K-1000",
  "IEEE CTSoC KIIT",
  "IoT Lab KIIT",
  "CyberVault KIIT",
  "KITPD2S",
  "AISoC KIIT",
  "MLSA KIIT",
  "Google Developer Group (GDG) KIIT",
  "Coding Ninjas KIIT Chapter",
  "GeeksforGeeks KIIT Chapter",
  "KIIT Model UN Society",
  "Qutopia",
  "Korus",
  "Kalliope",
  "Kronicle",
  "Khwaab",
  "KIIT Automobile Society",
  "Apogeio",
  "KIIT Robotics Society",
  "Keurig",
  "Kreative Eye",
  "Kartavya",
  "Kamakshi",
  "KIIT International Students Society",
  "Khwahishein",
  "KIIT Film Society",
  "Kalakaar",
  "Konnexions",
  "K-Konnect",
  "KIIT Wordsmith",
  "Kzarshion",
  "Kraya Kuber",
  "Kimaya",
  "Society for Civil Engineering",
  "NCC",
  "NSS",
  "Youth Red Cross KIIT",
  "TEDX-KU",
  "KIIT Animal & Environment Welfare Society",
  "KIIT Electrical Society",
  "Enactus",
  "Kraftovity",
  "SPIC MACAY",
];

const InterviewDeadlinesTracker = () => {
  const navigate = useNavigate();
  const { width, height } = useWindowSize();
  const { user } = useAuth();
  const { events, upcomingEvents, loading, error } = useEvents();
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedSociety, setSelectedSociety] = useState<string>("All");
  const [showConfetti, setShowConfetti] = useState(false);
  const [addEventOpen, setAddEventOpen] = useState(false);
  const [addInterviewOpen, setAddInterviewOpen] = useState(false);
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
  const [interviewFormData, setInterviewFormData] = useState({
    company_name: "",
    category: "",
    interview_name: "",
    interview_date: "",
    start_time: "",
    end_time: "",
    location: "",
    role: "",
    description: "",
    requirements: "",
    validation: false,
  });
  const kiitSocieties = [
  {name: "Student", section: "student"},
  { name: "Fed KIIT", section: "fedkiit" },
  { name: "KIIT E-Cell", section: "ecell" },
  { name: "USC KIIT", section: "usc" },
  { name: "K-1000 ", section: "k1000" },
  { name: "IEEE KIIT", section: "ctsoc" },
  { name: "IoT Lab KIIT", section: "iotlab" },
  { name: "CyberVault KIIT", section: "cybervault" },
  { name: "KITPD2S", section: "kitpd2s" },
  { name: "AISOC KIIT", section: "aisoc" },
  { name: "MLSA KIIT", section: "mlsa" },
  { name: "Google Developer Group (GDG) KIIT", section: "gdg" },
  { name: "Coding Ninjas KIIT Chapter", section: "codingninjas" },
  { name: "GeeksforGeeks KIIT Chapter", section: "gfg" },
  { name: "KIIT Model UN Society", section: "mun" },
  { name: "Qutopia", section: "qutopia" },
  { name: "Korus", section: "korus" },
  { name: "Kalliope", section: "kalliope" },
  { name: "Kronicle", section: "kronicle" },
  { name: "Khwaab", section: "khwaab" },
  { name: "KIIT Automobile Society", section: "automobile" },
  { name: "Apogeio", section: "apogeio" },
  { name: "KIIT Robotics Society", section: "robotics" },
  { name: "Keurig", section: "keurig" },
  { name: "Kreative Eye", section: "kreativeeye" },
  { name: "Kartavya", section: "kartavya" },
  { name: "Kamakshi", section: "kamakshi" },
  { name: "KIIT International Students Society", section: "kintl" },
  { name: "Khwahishein", section: "khwahishein" },
  { name: "KIIT Film Society", section: "filmsociety" },
  { name: "Kalakaar", section: "kalakaar" },
  { name: "Konnexions", section: "konnexions" },
  { name: "K-Konnect", section: "kconnect" },
  { name: "KIIT Wordsmith", section: "wordsmith" },
  { name: "Kzarshion", section: "kzarshion" },
  { name: "Kraya Kuber", section: "krayakuber" },
  { name: "Kimaya", section: "kimaya" },
  { name: "Society for Civil Engineering", section: "civil" },
  { name: "NCC", section: "ncc" },
  { name: "NSS", section: "nss" },
  { name: "Youth Red Cross KIIT", section: "yrc" },
  { name: "TEDX-KU", section: "tedx-ku" },
  { name: "KIIT Animal & Environment Welfare Society", section: "kiit-animal-environment" },
  { name: "KIIT Electrical Society", section: "kiit-electrical" },
  { name: "Enactus", section: "enactus" },
  { name: "Kraftovity", section: "kraftovity" },
  { name: "SPIC MACAY", section: "spic-macay" },
  {name: "Other", section: "other"}
];


  // Filter + search
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        event.society_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.event_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || event.category === selectedCategory;
      const matchesSociety =
        selectedSociety === "All" || event.society_name === selectedSociety;
      return matchesSearch && matchesCategory && matchesSociety;
    });
  }, [events, searchQuery, selectedCategory, selectedSociety]);

  // Transform events for calendar
  const calendarEvents = useMemo(() => {
    return filteredEvents.map((event) => ({
      id: event.id,
      title: event.event_name,
      start: new Date(`${event.event_date}T${event.start_time || "09:00"}`),
      end: new Date(`${event.event_date}T${event.end_time || "10:00"}`),
      allDay: !event.start_time,
      resource: event,
    }));
  }, [filteredEvents]);

  // Handle event selection
  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event.resource);
  };

  // Add to Calendar functionality
  const handleAddToCalendar = (event: CalendarEvent) => {
    const startDate = new Date(
      `${event.event_date}T${event.start_time || "09:00"}`
    );
    const endDate = event.end_time
      ? new Date(`${event.event_date}T${event.end_time}`)
      : new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour default

    const eventData = {
      title: event.event_name,
      start: startDate,
      end: endDate,
      description: `${event.description || ""}\n\nSociety: ${
        event.society_name
      }\nVenue: ${event.venue}\nOrganiser: ${event.organiser}`,
      location: event.venue,
    };

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      eventData.title
    )}&dates=${startDate.toISOString().replace(/[:-]|\.\d{3}/g, "")}/${endDate
      .toISOString()
      .replace(/[:-]|\.\d{3}/g, "")}&details=${encodeURIComponent(
      eventData.description
    )}&location=${encodeURIComponent(eventData.location)}`;
    window.open(googleCalendarUrl, "_blank");
    setSelectedEvent(null);
  };
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!formData.event_name || !formData.event_date) {
    toast.error("Event name and date are required!");
    return;
  }

  if (!user) {
    toast.error("Please sign in to add events");
    return;
  }

  const reqs = formData.requirements
    ? formData.requirements.split(",").map((r) => r.trim()).filter(Boolean)
    : [];

  setIsSubmitting(true);

  try {
    const accessToken = (await supabase.auth.getSession()).data?.session?.access_token;

    const response = await fetch(`${HOSTED_URL}/api/events/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ formData: { ...formData, requirements: reqs } }),
    });

    const result = await response.json();

    if (result.success) {
      toast.success(result.message);
      setAddEventOpen(false);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
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
    } else {
      toast.error(result.message || "Failed to add event");
    }
  } catch (err) {
    console.error("Unexpected error:", err);
    toast.error("Failed to submit event");
  } finally {
    setIsSubmitting(false);
  }
};


const handleInterviewSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!interviewFormData.interview_name || !interviewFormData.interview_date) {
    toast.error("Interview name and date are required!");
    return;
  }

  if (!user?.email) {
    toast.error("Please sign in to add interviews");
    return;
  }

  setIsSubmitting(true);
  try {
    const accessToken = (await supabase.auth.getSession()).data?.session?.access_token;

    const response = await fetch("/api/interviews/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ formData: interviewFormData }),
    });

    const result = await response.json();
    if (result.success) {
      toast.success(result.message);
      setAddInterviewOpen(false);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);

      setInterviewFormData({
        company_name: "",
        category: "",
        interview_name: "",
        interview_date: "",
        start_time: "",
        end_time: "",
        location: "",
        role: "",
        description: "",
        requirements: "",
        validation: false,
      });
    } else {
      toast.error(result.message || "Failed to submit interview");
    }
  } catch (err) {
    console.error("Unexpected error:", err);
    toast.error("Failed to submit interview");
  } finally {
    setIsSubmitting(false);
  }
};


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Campus Events
            </h1>
            <p className="text-gray-600">
              Never miss what's happening on campus.
            </p>
          </div>
          {user && (
            <div className=" ">
              <Button
                onClick={() => setAddEventOpen(true)}
                className="mx-4 bg-blue-600 hover:bg-blue-700"
              >
                + Create Event
              </Button>
              <Button
                onClick={() => setAddInterviewOpen(true)}
                className=" mx-4 bg-green-600 hover:bg-blue-700"
              >
                + Create Interview
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6">
          {/* Calendar, Legend, and Filters - 2/5 of screen */}
          <div className="col-span-1 md:col-span-2 space-y-4 md:space-y-6">
            <div className="bg-kiit-green-soft rounded-lg shadow-lg overflow-hidden mb-4 md:mb-8 border border-kiit-green p-2 sm:p-4">
              <Calendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                style={{
                  height: 400,
                  backgroundColor: "kiit-blue-100",
                  color: "black",
                }}
                view={view}
                date={date}
                onView={setView}
                onNavigate={setDate}
                onSelectEvent={handleSelectEvent}
                className="mobile-calendar"
                eventPropGetter={(event) => ({
                  style: {
                    backgroundColor:
                      event.resource.category === "Technical"
                        ? "hsl(var(--campus-blue))"
                        : event.resource.category === "Cultural"
                        ? "hsl(var(--campus-purple))"
                        : event.resource.category === "Sports"
                        ? "hsl(var(--campus-orange))"
                        : event.resource.category === "Literary"
                        ? "hsl(var(--kiit-green-dark))"
                        : "hsl(var(--kiit-green))",
                    borderRadius: "6px",
                    border: "1px solid rgba(0, 0, 0, 0.15)",
                    color: "black",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    transition: "transform 0.2s ease, box-shadow 0.3s ease",
                  },
                })}
                dayPropGetter={(date) => {
                  const hasEvent = calendarEvents.some((e) =>
                    moment(e.start).isSame(date, "day")
                  );
                  return {
                    style: {
                      color: "black", // day numbers
                      backgroundColor: hasEvent
                        ? "hsl(var(--kiit-green-light) / 0.3)"
                        : "transparent",
                      border: hasEvent
                        ? "1px solid hsl(var(--kiit-green-light))"
                        : "1px solid rgba(0,0,0,0.05)",
                      borderRadius: "4px",
                      transition: "background-color 0.3s ease",
                    },
                  };
                }}
                components={{
                  event: ({ event }) => (
                    <span className="px-2 py-1 text-xs font-medium rounded text-black shadow-sm hover:shadow-md transition-all duration-200">
                      {event.title}
                    </span>
                  ),
                  month: {
                    header: (props) => (
                      <div
                        {...props}
                        className="text-black font-semibold bg-white/50 border-b border-black/10 py-2 text-center"
                      >
                        {props.label}
                      </div>
                    ),
                  },
                }}
              />
            </div>
            {/* Filters */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Society
                  </label>
                  <select
                    value={selectedSociety}
                    onChange={(e) => setSelectedSociety(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  >
                    {societies.map((soc) => (
                      <option key={soc} value={soc}>
                        {soc}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
              <hr className="border-t mx-3" />

              {/* Legend */}
              <CardHeader className="p-2 pl-7">
                <CardTitle className="text-lg">Legend</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-red-500">
                    Application Deadlines
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-yellow-500">
                    Workshops & Events
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-blue-500">
                    Interviews
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Events - 3/5 of screen */}
          <div className="col-span-1 md:col-span-3 bg-kiit-green-soft p-2 sm:p-4 rounded-lg space-y-4">
            <div className="scrollbar-thumb-gray-300 my-2 scrollbar-track-gray-700 h-[400px] sm:h-[500px] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900">
                Upcoming Events
              </h2>
              {upcomingEvents.length === 0 ? (
                <p className="text-gray-600 text-center">No upcoming events</p>
              ) : (
                upcomingEvents
                  .filter((event) => event.category !== "Interviews")
                  .map((event) => (
                    <Card
                      key={event.id}
                      onClick={() => handleAddToCalendar(event)}
                      className="p-4 bg-white shadow-md hover:shadow-lg transition-shadow"
                    >
                      <div className="flex justify-between  items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {event.event_name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {event.society_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {moment(event.event_date).format("MMM D, YYYY")}
                          </p>
                          <p className="text-sm text-gray-600">
                            {event.start_time} - {event.end_time || "TBD"}
                          </p>
                          {event.venue && (
                            <p className="text-sm text-gray-600">
                              <MapPin className="inline w-4 h-4 mr-1" />
                              {event.venue}
                            </p>
                          )}
                          {event.organiser && (
                            <p className="text-sm text-gray-600">
                              <Users className="inline w-4 h-4 mr-1" />
                              {event.organiser}
                            </p>
                          )}
                        </div>
                        <Badge
                          className={`bg-${
                            event.category === "Technical"
                              ? "blue"
                              : event.category === "Cultural"
                              ? "purple"
                              : event.category === "Sports"
                              ? "yellow"
                              : "green"
                          }-500 text-white`}
                        >
                          {event.category}
                        </Badge>
                      </div>
                    </Card>
                  ))
              )}
            </div>
          </div>
        </div>

        {/* Event Modal */}
        {selectedEvent && (
          <Dialog
            open={!!selectedEvent}
            onOpenChange={() => setSelectedEvent(null)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedEvent.event_name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                <p>
                  <strong>Society:</strong> {selectedEvent.society_name}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {moment(selectedEvent.event_date).format("MMMM DD, YYYY")}
                </p>
                <p>
                  <strong>Time:</strong> {selectedEvent.start_time} -{" "}
                  {selectedEvent.end_time || "TBD"}
                </p>
                <p>
                  <strong>Venue:</strong> {selectedEvent.venue}
                </p>
                <p>
                  <strong>Organiser:</strong> {selectedEvent.organiser}
                </p>
                <p>
                  <strong>Category:</strong> {selectedEvent.category}
                </p>
                <p>
                  <strong>Description:</strong> {selectedEvent.description}
                </p>
                {selectedEvent.requirements?.length > 0 && (
                  <div>
                    <strong>Requirements:</strong>
                    <ul>
                      {selectedEvent.requirements.map((req, idx) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <Button onClick={() => handleAddToCalendar(selectedEvent)}>
                Add to Calendar
              </Button>
            </DialogContent>
          </Dialog>
        )}

        {/* Add Event Dialog */}
        {addEventOpen && (
          <Dialog open={addEventOpen} onOpenChange={setAddEventOpen}>
            <DialogContent className="bg-gradient-to-br from-campus-blue to-purple-900 text-white max-w-2xl">
              <DialogHeader className="text-center">
                <DialogTitle className="text-white">Add New Event</DialogTitle>
                <p className="text-white/70 text-sm mt-1">
                  Create a new society event
                </p>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={formData.society_name}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setFormData({ ...formData, society_name: e.target.value })
                    }
                    className="  bg-white text-black placeholder-white/50 border-white/20 h-10 px-3 rounded-md w-full border focus:outline-none focus:ring-2 focus:ring-white/30"
                  >
                    <option value="" disabled>
                      Select Society
                    </option>
                    {kiitSocieties.map((society) => (
                      <option key={society.section} value={society.name} >
                        {society.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="bg-white text-black placeholder-white/50 border-white/20 h-10 rounded px-3"
                  >
                    <option value="">Select Category</option>
                    <option value="Technical">Technical</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Sports">Sports</option>
                    <option value="Literary">Literary</option>
                    <option value="Social">Social</option>
                  </select>
                </div>

                <Input
                  placeholder="Event Name *"
                  value={formData.event_name}
                  onChange={(e) =>
                    setFormData({ ...formData, event_name: e.target.value })
                  }
                  className="bg-white text-black placeholder-white/50 border-white/20 h-10"
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input
                    type="date"
                    value={formData.event_date}
                    onChange={(e) =>
                      setFormData({ ...formData, event_date: e.target.value })
                    }
                    className="bg-white text-black placeholder-white/50 border-white/20 h-10"
                    required
                  />
                  <Input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) =>
                      setFormData({ ...formData, start_time: e.target.value })
                    }
                    className="bg-white text-black placeholder-white/50 border-white/20 h-10"
                    placeholder="Start Time"
                  />
                  <Input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) =>
                      setFormData({ ...formData, end_time: e.target.value })
                    }
                    className="bg-white text-black placeholder-white/50 border-white/20 h-10"
                    placeholder="End Time"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    placeholder="Venue *"
                    value={formData.venue}
                    onChange={(e) =>
                      setFormData({ ...formData, venue: e.target.value })
                    }
                    className="bg-white text-black placeholder-white/50 border-white/20 h-10"
                    required
                  />
                  <Input
                    placeholder="Organiser"
                    value={formData.organiser}
                    onChange={(e) =>
                      setFormData({ ...formData, organiser: e.target.value })
                    }
                    className="bg-white text-black placeholder-white/50 border-white/20 h-10"
                  />
                </div>

                <Input
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="bg-white text-black placeholder-white/50 border-white/20 h-10"
                />

                <Input
                  placeholder="Requirements (comma-separated)"
                  value={formData.requirements}
                  onChange={(e) =>
                    setFormData({ ...formData, requirements: e.target.value })
                  }
                  className="bg-white text-black placeholder-white/50 border-white/20 h-10"
                />

                <Button
                  type="submit"
                  className="w-full bg-kiit-green hover:bg-kiit-green-dark text-white h-12"
                  disabled={isSubmitting}
                >
                  <CalendarIcon className="w-5 h-5 mr-2" />
                  {isSubmitting ? "Saving..." : "Save Event"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
        {/* Add Interview Dialog */}
        {/* Add Interview Dialog */}
        {addInterviewOpen && (
          <Dialog open={addInterviewOpen} onOpenChange={setAddInterviewOpen}>
            <DialogContent className="bg-gradient-to-br from-campus-blue to-purple-900 text-white max-w-2xl">
              <DialogHeader className="text-center">
                <DialogTitle className="text-white">
                  Add New Interview
                </DialogTitle>
                <p className="text-white/70 text-sm mt-1">
                  Schedule a new interview
                </p>
              </DialogHeader>

              <form onSubmit={handleInterviewSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Company Name *"
                    value={interviewFormData.company_name}
                    onChange={(e) =>
                      setInterviewFormData({
                        ...interviewFormData,
                        company_name: e.target.value,
                      })
                    }
                    className="bg-white text-black placeholder-white/50 border-white/20 h-10"
                    required
                  />
                  <select
                    value={interviewFormData.category}
                    onChange={(e) =>
                      setInterviewFormData({
                        ...interviewFormData,
                        category: e.target.value,
                      })
                    }
                    className="bg-white text-black placeholder-white/50 border-white/20 h-10 rounded px-3"
                  >
                    <option value="">Select Type</option>
                    <option value="Technical">Technical</option>
                    <option value="HR">HR</option>
                    <option value="Managerial">Managerial</option>
                    <option value="Final">Final</option>
                  </select>
                </div>

                <Input
                  placeholder="Interview Name *"
                  value={interviewFormData.interview_name}
                  onChange={(e) =>
                    setInterviewFormData({
                      ...interviewFormData,
                      interview_name: e.target.value,
                    })
                  }
                  className="bg-white text-black placeholder-white/50 border-white/20 h-10"
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input
                    type="date"
                    value={interviewFormData.interview_date}
                    onChange={(e) =>
                      setInterviewFormData({
                        ...interviewFormData,
                        interview_date: e.target.value,
                      })
                    }
                    className="bg-white text-black placeholder-white/50 border-white/20 h-10"
                    required
                  />
                  <Input
                    type="time"
                    value={interviewFormData.start_time}
                    onChange={(e) =>
                      setInterviewFormData({
                        ...interviewFormData,
                        start_time: e.target.value,
                      })
                    }
                    className="bg-white text-black placeholder-white/50 border-white/20 h-10"
                    placeholder="Start Time"
                  />
                  <Input
                    type="time"
                    value={interviewFormData.end_time}
                    onChange={(e) =>
                      setInterviewFormData({
                        ...interviewFormData,
                        end_time: e.target.value,
                      })
                    }
                    className="bg-white text-black placeholder-white/50 border-white/20 h-10"
                    placeholder="End Time"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    placeholder="Location *"
                    value={interviewFormData.location}
                    onChange={(e) =>
                      setInterviewFormData({
                        ...interviewFormData,
                        location: e.target.value,
                      })
                    }
                    className="bg-white text-black placeholder-white/50 border-white/20 h-10"
                    required
                  />
                  <Input
                    placeholder="Role"
                    value={interviewFormData.role}
                    onChange={(e) =>
                      setInterviewFormData({
                        ...interviewFormData,
                        role: e.target.value,
                      })
                    }
                    className="bg-white text-black placeholder-white/50 border-white/20 h-10"
                  />
                </div>

                <Input
                  placeholder="Description"
                  value={interviewFormData.description}
                  onChange={(e) =>
                    setInterviewFormData({
                      ...interviewFormData,
                      description: e.target.value,
                    })
                  }
                  className="bg-white text-black placeholder-white/50 border-white/20 h-10"
                />

                <Input
                  placeholder="Requirements (comma-separated)"
                  value={interviewFormData.requirements}
                  onChange={(e) =>
                    setInterviewFormData({
                      ...interviewFormData,
                      requirements: e.target.value,
                    })
                  }
                  className="bg-white text-black placeholder-white/50 border-white/20 h-10"
                />

                <Button
                  type="submit"
                  className="w-full bg-kiit-green hover:bg-kiit-green-dark text-white h-12"
                >
                  <CalendarIcon className="w-5 h-5 mr-2" />
                  Save Interview
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <Footer />
      {showConfetti && <Confetti width={width} height={height} />}
    </div>
  );
};

export default InterviewDeadlinesTracker;
