// import React, { useState, useMemo, useEffect } from "react";
// import { Calendar, momentLocalizer, Views, View } from "react-big-calendar";
// import moment from "moment";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import {
//   Calendar as CalendarIcon,
//   Clock,
//   MapPin,
//   Users,
//   Search,
//   ArrowLeft,
//   Bell,
//   ExternalLink,
//   CheckCircle,
//   ChevronLeft,
//   ChevronRight,
//   Video
// } from "lucide-react";
// import { Navbar } from "@/components/Navbar";
// import { Footer } from "@/components/Footer";
// import { useNavigate } from "react-router-dom";
// import "react-big-calendar/lib/css/react-big-calendar.css";
// import Confetti from "react-confetti";
// import { useWindowSize } from "react-use";
// import { supabase } from "@/integrations/supabase/client";
// import { Database } from "@/lib/database-types";
// import { useEvents } from '@/hooks/useEvents';
// import { toast } from "sonner";

// const localizer = momentLocalizer(moment);

// type CalendarEvent = Database['public']['Tables']['calendar_events']['Row'];

// const categories = ["All", "Technical", "Cultural", "Sports", "Literary", "Social"];

// const InterviewDeadlinesTracker = () => {
//   const navigate = useNavigate();
//   const { width, height } = useWindowSize();
//   const { events, upcomingEvents, loading, error } = useEvents(); // USE THE HOOK
//   // const [events, setEvents] = useState<CalendarEvent[]>([]);
//   const [view, setView] = useState<View>(Views.MONTH);
//   const [date, setDate] = useState(new Date());
//   const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState<string>("All");
//   const [showConfetti, setShowConfetti] = useState(false);
//   const [addEventOpen, setAddEventOpen] = useState(false);
//   const [user, setUser] = useState<any>(null);
//   const [formData, setFormData] = useState({
//     society_name: "",
//     event_name: "",
//     event_date: "",
//     start_time: "",
//     end_time: "",
//     venue: "",
//     organiser: "",
//     category: "",
//     description: "",
//     requirements: "",
//     validation: false,
//   });

//   // Fetch user
//   useEffect(() => {
//     const getUser = async () => {
//       const { data: { session } } = await supabase.auth.getSession();
//       if (session?.user) {
//         setUser(session.user);
//       } else {
//         toast("Please login to add events to calendar");
//       }
//     };
//     getUser();
//   }, []);

//   // Filter + search
//   const filteredEvents = useMemo(() => {
//     return events.filter((event) => {
//       const matchesSearch =
//         event.society_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         event.event_name.toLowerCase().includes(searchQuery.toLowerCase());
//       const matchesCategory = selectedCategory === "All" || event.category === selectedCategory;
//       return matchesSearch && matchesCategory;
//     });
//   }, [events, searchQuery, selectedCategory]);


//   // Transform events for calendar
//   const calendarEvents = useMemo(() => {
//     return filteredEvents.map((event) => ({
//       id: event.id,
//       title: event.event_name,
//       start: new Date(`${event.event_date}T${event.start_time || '09:00'}`),
//       end: new Date(`${event.event_date}T${event.end_time || '10:00'}`),
//       allDay: !event.start_time,
//       resource: event,
//     }));
//   }, [filteredEvents]);

//   // Handle event selection
//   const handleSelectEvent = (event: any) => {
//     setSelectedEvent(event.resource);
//   };

//   // Add to Calendar functionality (Google Calendar only)
//   const handleAddToCalendar = (event: CalendarEvent) => {
//     const startDate = new Date(`${event.event_date}T${event.start_time || '09:00'}`);
//     const endDate = event.end_time
//       ? new Date(`${event.event_date}T${event.end_time}`)
//       : new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour default

//     const eventData = {
//       title: event.event_name,
//       start: startDate,
//       end: endDate,
//       description: `${event.description || ''}\n\nSociety: ${event.society_name}\nVenue: ${event.venue}\nOrganiser: ${event.organiser}`,
//       location: event.venue,
//     };

//     // Create Google Calendar URL
//     const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventData.title)}&dates=${startDate.toISOString().replace(/[:-]|\.\d{3}/g, '')}/${endDate.toISOString().replace(/[:-]|\.\d{3}/g, '')}&details=${encodeURIComponent(eventData.description)}&location=${encodeURIComponent(eventData.location)}`;

//     // Open Google Calendar in new tab
//     window.open(googleCalendarUrl, '_blank');
//     setSelectedEvent(null);
//   };

//   // Handle form submission
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!formData.event_name || !formData.event_date) {
//       toast.error("Event name and date are required!");
//       return;
//     }

//     if (!user?.email) {
//       toast.error("Please sign in to add events");
//       return;
//     }

//     const reqs: string[] = formData.requirements
//       ? formData.requirements.split(",").map((r) => r.trim()).filter(Boolean)
//       : [];

//     try {
//       // Check if user is admin
//       const { data: profile } = await supabase
//         .from('profiles')
//         .select('is_admin')
//         .eq('id', user.id)
//         .single();

//       if (profile?.is_admin) {
//         // Admin users publish directly
//         const { data, error } = await supabase.from("calendar_events").insert([
//           {
//             ...formData,
//             requirements: reqs,
//             validation: true // Auto-validate admin events
//           }
//         ]).select();

//         if (error) {
//           console.error("Insert error:", error);
//           toast.error("Error adding event: " + error.message);
//         } else {
//           console.log("Event inserted:", data);
//           toast.success("Event published successfully!");
//           setAddEventOpen(false);
//           setShowConfetti(true);
//           setTimeout(() => setShowConfetti(false), 3000);
//         }
//       } else {
//         // Regular users submit for approval
//         const { error } = await supabase
//           .from('interview_event_requests')
//           .insert({
//             ...formData,
//             requirements: reqs,
//             requester_email: user.email,
//             user_id: user.id,
//             status: 'pending'
//           });

//         if (error) {
//           console.error("Request submit error:", error);
//           toast.error("Error submitting event request: " + error.message);
//         } else {
//           toast.success("Event submitted for review! You'll be notified once it's approved.");
//           setAddEventOpen(false);
//         }
//       }

//       // Reset form
//       setFormData({
//         society_name: "",
//         event_name: "",
//         event_date: "",
//         start_time: "",
//         end_time: "",
//         venue: "",
//         organiser: "",
//         category: "",
//         description: "",
//         requirements: "",
//         validation: false,
//       });

//     } catch (err) {
//       console.error("Unexpected error:", err);
//       toast.error("Failed to submit event");
//     }
//   };

//   if (loading) {
//     return (
//       <div className=" bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading events...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className=" bg-gradient-to-br from-blue-50 to-purple-100">
//       <Navbar />
//       <div className="container mx-auto px-4 py-8 mt-10">
//         <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//           <div>
//             <h1 className="text-3xl mt-12 font-bold text-gray-900 mb-2">Events Tracker</h1>
//             <p className="text-gray-600">Stay organized with society event schedules</p>
//           </div>
//           {user && (
//             <Button onClick={() => setAddEventOpen(true)} className="bg-blue-600 hover:bg-blue-700">
//               <CalendarIcon className="w-4 h-4 mr-2" />
//               Add Event
//             </Button>
//           )}
//         </div>

//         {error && (
//           <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
//             {error}
//           </div>
//         )}

//         {/* Filters */}
//         <div className="mb-6 flex flex-col md:flex-row gap-4">
//           <div className="relative flex-1">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//             <Input
//               type="text"
//               placeholder="Search events..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="pl-10"
//             />
//           </div>
//           <select
//             value={selectedCategory}
//             onChange={(e) => setSelectedCategory(e.target.value)}
//             className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//           >
//             {categories.map((cat) => (
//               <option key={cat} value={cat}>
//                 {cat}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Calendar */}
//         <div
//           className="bg-kiit-green-soft rounded-lg shadow-lg overflow-hidden mb-8 border border-kiit-green p-4"
//         >
//           <Calendar
//             localizer={localizer}
//             events={calendarEvents}
//             startAccessor="start"
//             endAccessor="end"
//             style={{
//               height: 400,
//               backgroundColor: "kiit-blue-100",
//               color: "black",
//             }}
//             view={view}
//             date={date}
//             onView={setView}
//             onNavigate={setDate}
//             onSelectEvent={handleSelectEvent}
//             eventPropGetter={(event) => ({
//               style: {
//                 backgroundColor:
//                   event.resource.category === "Technical"
//                     ? "hsl(var(--campus-blue))"
//                     : event.resource.category === "Cultural"
//                       ? "hsl(var(--campus-purple))"
//                       : event.resource.category === "Sports"
//                         ? "hsl(var(--campus-orange))"
//                         : event.resource.category === "Literary"
//                           ? "hsl(var(--kiit-green-dark))"
//                           : "hsl(var(--kiit-green))",
//                 borderRadius: "6px",
//                 border: "1px solid rgba(0, 0, 0, 0.15)",
//                 color: "black",
//                 boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
//                 transition: "transform 0.2s ease, box-shadow 0.3s ease",
//               },
//             })}
//             dayPropGetter={(date) => {
//               const hasEvent = calendarEvents.some((e) =>
//                 moment(e.start).isSame(date, "day")
//               );
//               return {
//                 style: {
//                   color: "black", // day numbers
//                   backgroundColor: hasEvent
//                     ? "hsl(var(--kiit-green-light) / 0.3)"
//                     : "transparent",
//                   border: hasEvent
//                     ? "1px solid hsl(var(--kiit-green-light))"
//                     : "1px solid rgba(0,0,0,0.05)",
//                   borderRadius: "4px",
//                   transition: "background-color 0.3s ease",
//                 },
//               };
//             }}
//             components={{
//               event: ({ event }) => (
//                 <span className="px-2 py-1 text-xs font-medium rounded text-black shadow-sm hover:shadow-md transition-all duration-200">
//                   {event.title}
//                 </span>
//               ),
            
//               month: {
//                 header: (props) => (
//                   <div
//                     {...props}
//                     className="text-black font-semibold bg-white/50 border-b border-black/10 py-2 text-center"
//                   >
//                     {props.label}
//                   </div>
//                 ),
//               },
//             }}
//           />
//         </div>



//         {/* Upcoming Events - Gradient Cards */}
//         <section>
//           <div className="flex justify-between items-center mb-6">
//             <h2 className="text-2xl font-bold text-gray-900">Upcoming Events ({upcomingEvents.length})</h2>
//             <Badge variant="outline" className="text-sm">
//               {upcomingEvents.length} {upcomingEvents.length === 1 ? "event" : "events"} found
//             </Badge>
//           </div>

//           {upcomingEvents.length === 0 ? (
//             <Card className="text-center py-12 bg-gradient-to-r from-blue-50 to-purple-50">
//               <CalendarIcon className="w-12 h-12 text-blue-400 mx-auto mb-4" />
//               <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming events</h3>
//               <p className="text-gray-500 mb-4">No events match your current filters</p>
//               <Button variant="outline" onClick={() => {
//                 setSearchQuery("");
//                 setSelectedCategory("All");
//               }}>
//                 Clear Filters
//               </Button>
//             </Card>
//           ) : (
//             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//               {upcomingEvents.slice(0, 6).map((event, index) => (
//                 <Card
//                   key={event.id}
//                   className="hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
//                   style={{
//                     background: `linear-gradient(135deg, ${event.category === "Technical" ? "#3B82F6" : "#10B981"} 0%, ${event.category === "Technical" ? "#1D4ED8" : "#059669"} 100%)`,
//                     color: "white"
//                   }}
//                   onClick={() => setSelectedEvent(event)}
//                 >
//                   <CardHeader className="pb-3 bg-white/10 backdrop-blur-sm">
//                     <div className="flex items-center justify-between">
//                       <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
//                         {event.category}
//                       </Badge>
//                       {event.validation && (
//                         <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full">
//                           <CheckCircle className="w-3 h-3 text-green-300" />
//                           <span className="text-xs">Verified</span>
//                         </div>
//                       )}
//                     </div>
//                     <CardTitle className="text-white text-lg truncate font-semibold">{event.event_name}</CardTitle>
//                   </CardHeader>
//                   <CardContent className="pt-0 pb-4">
//                     <div className="space-y-3">
//                       <div className="flex items-center gap-2 text-white/90 text-sm">
//                         <Users className="w-4 h-4 text-white/70" />
//                         <span className="font-medium">{event.society_name}</span>
//                       </div>
//                       <div className="flex items-center gap-2 text-white/90 text-sm">
//                         <CalendarIcon className="w-4 h-4 text-white/70" />
//                         <span className="font-medium">
//                           {moment(event.event_date).format("MMM DD, YYYY")}
//                         </span>
//                       </div>
//                       {event.start_time && (
//                         <div className="flex items-center gap-2 text-white/90 text-sm">
//                           <Clock className="w-4 h-4 text-white/70" />
//                           <span>{event.start_time} - {event.end_time || "TBD"}</span>
//                         </div>
//                       )}
//                       <div className="flex items-center gap-2 text-white/90 text-sm">
//                         <MapPin className="w-4 h-4 text-white/70" />
//                         <span className="truncate">{event.venue}</span>
//                       </div>
//                       {event.description && (
//                         <p className="text-white/80 text-sm line-clamp-2">{event.description}</p>
//                       )}
//                       {event.requirements && event.requirements.length > 0 && (
//                         <div className="flex flex-wrap gap-1 mt-2">
//                           {event.requirements.slice(0, 2).map((req, idx) => (
//                             <Badge key={idx} variant="secondary" className="text-xs bg-white/20 text-white border-white/30">
//                               {req}
//                             </Badge>
//                           ))}
//                           {event.requirements.length > 2 && (
//                             <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/30">
//                               +{event.requirements.length - 2} more
//                             </Badge>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           )}
//         </section>

//         {/* Selected Event Modal - Gradient Blue UI */}
//         {selectedEvent && (
//           <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
//             <DialogContent className="bg-gradient-to-br from-blue-900 to-purple-900 text-white max-w-2xl">
//               <DialogHeader className="text-center">
//                 <DialogTitle className="text-white text-2xl font-bold">{selectedEvent.event_name}</DialogTitle>
//                 <Badge variant="secondary" className="mt-2 bg-white/20 text-white border-white/30">
//                   {selectedEvent.category} • {selectedEvent.society_name}
//                 </Badge>
//               </DialogHeader>

//               <div className="space-y-6 text-white">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div className="space-y-3">
//                     <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
//                       <CalendarIcon className="w-5 h-5 text-blue-300" />
//                       <div>
//                         <h4 className="font-semibold text-sm opacity-90">Date</h4>
//                         <p className="text-white">{moment(selectedEvent.event_date).format("MMMM DD, YYYY")}</p>
//                       </div>
//                     </div>
//                     {selectedEvent.start_time && (
//                       <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
//                         <Clock className="w-5 h-5 text-blue-300" />
//                         <div>
//                           <h4 className="font-semibold text-sm opacity-90">Time</h4>
//                           <p className="text-white">{selectedEvent.start_time} - {selectedEvent.end_time || "TBD"}</p>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                   <div className="space-y-3">
//                     <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
//                       <MapPin className="w-5 h-5 text-blue-300" />
//                       <div>
//                         <h4 className="font-semibold text-sm opacity-90">Venue</h4>
//                         <p className="text-white">{selectedEvent.venue}</p>
//                       </div>
//                     </div>
//                     <div className="p-3 bg-white/10 rounded-lg">
//                       <h4 className="font-semibold text-sm opacity-90 mb-2">Organiser</h4>
//                       <p className="text-white">{selectedEvent.organiser}</p>
//                     </div>
//                   </div>
//                 </div>

//                 {selectedEvent.requirements?.length > 0 && (
//                   <div className="space-y-2">
//                     <h4 className="font-semibold text-sm opacity-90 flex items-center gap-2">
//                       <CheckCircle className="w-4 h-4 text-green-300" />
//                       Requirements
//                     </h4>
//                     <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
//                       {selectedEvent.requirements.map((req, idx) => (
//                         <div key={idx} className="flex items-start gap-2 p-2 bg-white/10 rounded">
//                           <CheckCircle className="w-4 h-4 text-green-300 flex-shrink-0 mt-0.5" />
//                           <span className="text-white text-sm">{req}</span>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {selectedEvent.description && (
//                   <div className="space-y-2">
//                     <h4 className="font-semibold text-sm opacity-90">Description</h4>
//                     <div className="p-3 bg-white/10 rounded-lg">
//                       <p className="text-white/90 whitespace-pre-wrap text-sm">{selectedEvent.description}</p>
//                     </div>
//                   </div>
//                 )}

//                 <div className="flex gap-3 pt-6 border-t border-white/20">
//                   <Button
//                     variant="outline"
//                     onClick={() => setSelectedEvent(null)}
//                     className="flex-1 bg-white/10 text-white border-white/20 hover:bg-white/20"
//                   >
//                     Close
//                   </Button>
//                   <Button
//                     onClick={() => handleAddToCalendar(selectedEvent)}
//                     className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
//                   >
//                     <CalendarIcon className="w-4 h-4 mr-2" />
//                     Add to Calendar
//                   </Button>
//                 </div>
//               </div>
//             </DialogContent>
//           </Dialog>
//         )}

//         {/* Add Event Dialog - Gradient Blue UI */}
//         <Dialog open={addEventOpen} onOpenChange={setAddEventOpen}>
//           <DialogContent className="bg-gradient-to-br from-purple-900 to-blue-900 text-white max-w-2xl">
//             <DialogHeader className="text-center">
//               <DialogTitle className="text-white">Add New Event</DialogTitle>
//               <p className="text-white/70 text-sm mt-1">Create a new society event</p>
//             </DialogHeader>

//             <form
//               onSubmit={handleSubmit}
//               className="space-y-4"
//             >
//               <div className="grid grid-cols-2 gap-3">
//                 <Input
//                   placeholder="Society Name"
//                   value={formData.society_name}
//                   onChange={(e) => setFormData({ ...formData, society_name: e.target.value })}
//                   className="bg-white text-black placeholder-white/20s border-white/20 h-10"
//                 />
//                 <select
//                   value={formData.category}
//                   onChange={(e) => setFormData({ ...formData, category: e.target.value })}
//                   className="bg-white text-black placeholder-white/20s border-white/20 h-10 rounded px-3"
//                 >
//                   <option value="" >Select Category</option>
//                   <option value="Technical">Technical</option>
//                   <option value="Cultural">Cultural</option>
//                   <option value="Sports">Sports</option>
//                   <option value="Literary">Literary</option>
//                   <option value="Social">Social</option>
//                 </select>
//               </div>

//               <Input
//                 placeholder="Event Name *"
//                 value={formData.event_name}
//                 onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
//                 className="bg-white text-black placeholder-white/20s border-white/20 h-10"
//                 required
//               />

//               <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//                 <Input
//                   type="date"
//                   value={formData.event_date}
//                   onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
//                   className="bg-white text-black placeholder-white/20s border-white/20 h-10"
//                   required
//                 />
//                 <Input
//                   type="time"
//                   value={formData.start_time}
//                   onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
//                   className="bg-white text-black placeholder-white/20s border-white/20 h-10"
//                   placeholder="Start Time"
//                 />
//                 <Input
//                   type="time"
//                   value={formData.end_time}
//                   onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
//                   className="bg-white text-black placeholder-white/20s border-white/20 h-10"
//                   placeholder="End Time"
//                 />
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                 <Input
//                   placeholder="Venue *"
//                   value={formData.venue}
//                   onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
//                   className="bg-white text-black placeholder-white/20s border-white/20 h-10"
//                   required
//                 />
//                 <Input
//                   placeholder="Organiser"
//                   value={formData.organiser}
//                   onChange={(e) => setFormData({ ...formData, organiser: e.target.value })}
//                   className="bg-white text-black placeholder-white/20s border-white/20 h-10"
//                 />
//               </div>

//               <Input
//                 placeholder="Description"
//                 value={formData.description}
//                 onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                 className="bg-white text-black placeholder-white/20s border-white/20 h-10"
//               />

//               <Input
//                 placeholder="Requirements (comma-separated)"
//                 value={formData.requirements}
//                 onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
//                 className="bg-white text-black placeholder-white/20s border-white/20 h-10"
//               />

//               <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white h-12">
//                 <CalendarIcon className="w-5 h-5 mr-2" />
//                 Save Event
//               </Button>
//             </form>
//           </DialogContent>
//         </Dialog>
//       </div>
//       <Footer />
//       {showConfetti && <Confetti width={width} height={height} />}
//     </div>

//   );
// };

// export default InterviewDeadlinesTracker;
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
import { Database } from "@/lib/database-types";
import { useEvents } from '@/hooks/useEvents'; 
import { toast } from "sonner";

const localizer = momentLocalizer(moment);

type CalendarEvent = Database['public']['Tables']['calendar_events']['Row'];

const categories = ["All", "Technical", "Cultural", "Sports", "Literary", "Social"];
const societies = ["All", "Tech Club", "Drama Society", "Music Club", "Sports Committee", "Literary Society"];

const InterviewDeadlinesTracker = () => {
  const navigate = useNavigate();
  const { width, height } = useWindowSize();
  const { events, upcomingEvents, loading, error } = useEvents();
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedSociety, setSelectedSociety] = useState<string>("All");
  const [showConfetti, setShowConfetti] = useState(false);
  const [addEventOpen, setAddEventOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
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
        toast("Please login to add events to calendar");
      }
    };
    getUser();
  }, []);

  // Filter + search
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        event.society_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.event_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || event.category === selectedCategory;
      const matchesSociety = selectedSociety === "All" || event.society_name === selectedSociety;
      return matchesSearch && matchesCategory && matchesSociety;
    });
  }, [events, searchQuery, selectedCategory, selectedSociety]);

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

  // Add to Calendar functionality
  const handleAddToCalendar = (event: CalendarEvent) => {
    const startDate = new Date(`${event.event_date}T${event.start_time || '09:00'}`);
    const endDate = event.end_time 
      ? new Date(`${event.event_date}T${event.end_time}`)
      : new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour default

    const eventData = {
      title: event.event_name,
      start: startDate,
      end: endDate,
      description: `${event.description || ''}\n\nSociety: ${event.society_name}\nVenue: ${event.venue}\nOrganiser: ${event.organiser}`,
      location: event.venue,
    };

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventData.title)}&dates=${startDate.toISOString().replace(/[:-]|\.\d{3}/g, '')}/${endDate.toISOString().replace(/[:-]|\.\d{3}/g, '')}&details=${encodeURIComponent(eventData.description)}&location=${encodeURIComponent(eventData.location)}`;
    window.open(googleCalendarUrl, '_blank');
    setSelectedEvent(null);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.event_name || !formData.event_date) {
      toast.error("Event name and date are required!");
      return;
    }

    if (!user?.email) {
      toast.error("Please sign in to add events");
      return;
    }

    const reqs: string[] = formData.requirements
      ? formData.requirements.split(",").map((r) => r.trim()).filter(Boolean)
      : [];

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (profile?.is_admin) {
        const { data, error } = await supabase.from("calendar_events").insert([
          { 
            ...formData, 
            requirements: reqs,
            validation: true
          }
        ]).select();

        if (error) {
          console.error("Insert error:", error);
          toast.error("Error adding event: " + error.message);
        } else {
          console.log("Event inserted:", data);
          toast.success("Event published successfully!");
          setAddEventOpen(false);
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        }
      } else {
        const { error } = await supabase
          .from('interview_event_requests')
          .insert({
            ...formData,
            requirements: reqs,
            requester_email: user.email,
            user_id: user.id,
            status: 'pending'
          });

        if (error) {
          console.error("Request submit error:", error);
          toast.error("Error submitting event request: " + error.message);
        } else {
          toast.success("Event submitted for review! You'll be notified once it's approved.");
          setAddEventOpen(false);
        }
      }

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

    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("Failed to submit event");
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Campus Events</h1>
            <p className="text-gray-600">Never miss what's happening on campus.</p>
          </div>
          {user && (
            <Button onClick={() => setAddEventOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              + Create Event
            </Button>
          )}
        </div>

        <div className="grid grid-cols-5 gap-6">
          {/* Calendar, Legend, and Filters - 2/5 of screen */}
          <div className="col-span-2 space-y-6">
            <div className="bg-kiit-green-soft rounded-lg shadow-lg overflow-hidden mb-8 border border-kiit-green p-4">
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
            {/* Legend */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Legend</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-red-500">Application Deadlines</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-yellow-500">Workshops & Events</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-blue-500">Interviews</Badge>
                </div>
              </CardContent>
            </Card>
            {/* Filters */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Society</label>
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
            </Card>
          </div>

          {/* Upcoming Events - 3/5 of screen */}
          <div className="col-span-3 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
            {upcomingEvents.length === 0 ? (
              <p className="text-gray-600 text-center">No upcoming events</p>
            ) : (
              upcomingEvents.map((event) => (
                <Card key={event.id} className="p-4 bg-white shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{event.event_name}</h3>
                      <p className="text-sm text-gray-600">{event.society_name}</p>
                      <p className="text-sm text-gray-600">{moment(event.event_date).format("MMM D, YYYY")}</p>
                      <p className="text-sm text-gray-600">{event.start_time} - {event.end_time || "TBD"}</p>
                      {event.venue && <p className="text-sm text-gray-600"><MapPin className="inline w-4 h-4 mr-1" />{event.venue}</p>}
                      {event.organiser && <p className="text-sm text-gray-600"><Users className="inline w-4 h-4 mr-1" />{event.organiser}</p>}
                    </div>
                    <Badge className={`bg-${event.category === "Technical" ? "blue" : event.category === "Cultural" ? "purple" : event.category === "Sports" ? "yellow" : "green"}-500 text-white`}>
                      {event.category}
                    </Badge>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Event Modal */}
        {selectedEvent && (
          <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedEvent.event_name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                <p><strong>Society:</strong> {selectedEvent.society_name}</p>
                <p><strong>Date:</strong> {moment(selectedEvent.event_date).format("MMMM DD, YYYY")}</p>
                <p><strong>Time:</strong> {selectedEvent.start_time} - {selectedEvent.end_time || "TBD"}</p>
                <p><strong>Venue:</strong> {selectedEvent.venue}</p>
                <p><strong>Organiser:</strong> {selectedEvent.organiser}</p>
                <p><strong>Category:</strong> {selectedEvent.category}</p>
                <p><strong>Description:</strong> {selectedEvent.description}</p>
                {selectedEvent.requirements?.length > 0 && (
                  <div>
                    <strong>Requirements:</strong>
                    <ul>
                      {selectedEvent.requirements.map((req, idx) => <li key={idx}>{req}</li>)}
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
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Event</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input placeholder="Society Name" value={formData.society_name} onChange={(e) => setFormData({ ...formData, society_name: e.target.value })} />
                <Input placeholder="Event Name" value={formData.event_name} onChange={(e) => setFormData({ ...formData, event_name: e.target.value })} required />
                <Input type="date" value={formData.event_date} onChange={(e) => setFormData({ ...formData, event_date: e.target.value })} required />
                <div className="grid grid-cols-2 gap-4">
                  <Input type="time" value={formData.start_time} onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} placeholder="Start Time" />
                  <Input type="time" value={formData.end_time} onChange={(e) => setFormData({ ...formData, end_time: e.target.value })} placeholder="End Time" />
                </div>
                <Input placeholder="Venue" value={formData.venue} onChange={(e) => setFormData({ ...formData, venue: e.target.value })} required />
                <Input placeholder="Organiser" value={formData.organiser} onChange={(e) => setFormData({ ...formData, organiser: e.target.value })} />
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full p-2 border rounded-lg">
                  <option value="">Select Category</option>
                  <option value="Technical">Technical</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Sports">Sports</option>
                  <option value="Literary">Literary</option>
                  <option value="Social">Social</option>
                </select>
                <Input placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                <Input placeholder="Requirements (comma-separated)" value={formData.requirements} onChange={(e) => setFormData({ ...formData, requirements: e.target.value })} />
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">Save Event</Button>
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