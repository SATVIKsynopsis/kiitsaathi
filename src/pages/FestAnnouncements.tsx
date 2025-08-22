import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Star,
  PartyPopper,
  Music,
  Mic,
  Camera,
  Trophy,
  Heart,
  Share2,
  ArrowLeft,
  ArrowRight,
  Timer,
  Ticket
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useNavigate } from "react-router-dom";

const FestAnnouncements = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Cultural", "Technical", "Sports", "Literary"];

  const announcements = [
    {
      id: 1,
      title: "KIIT Fest 2025 - The Ultimate Celebration",
      category: "Cultural",
      date: "15th - 17th March 2025",
      location: "KIIT Campus",
      time: "9:00 AM onwards",
      description: "The biggest cultural extravaganza of the year is back! Three days of non-stop entertainment, competitions, and celebrations.",
      image: "🎭",
      status: "upcoming",
      registrations: 2500,
      prize: "₹5,00,000",
      highlights: ["Celebrity Performances", "DJ Night", "Food Courts", "Cultural Shows"],
      countdown: 45,
      featured: true
    },
    {
      id: 2,
      title: "TechnoXian 2025 - Innovation Summit",
      category: "Technical", 
      date: "22nd - 24th Feb 2025",
      location: "Convention Center",
      time: "10:00 AM - 6:00 PM",
      description: "Showcase your technical prowess in coding, robotics, and innovation challenges.",
      image: "🤖",
      status: "registration_open",
      registrations: 1200,
      prize: "₹2,50,000",
      highlights: ["Hackathon", "Robo Wars", "Tech Talks", "Startup Expo"],
      countdown: 15,
      featured: false
    },
    {
      id: 3,
      title: "Kalinga Cup - Inter-College Sports",
      category: "Sports",
      date: "5th - 8th March 2025",
      location: "Sports Complex",
      time: "7:00 AM - 7:00 PM",
      description: "Annual sports championship with participation from top colleges across India.",
      image: "⚽",
      status: "upcoming",
      registrations: 800,
      prize: "₹1,50,000",
      highlights: ["Football", "Basketball", "Cricket", "Athletics"],
      countdown: 35,
      featured: false
    },
    {
      id: 4,
      title: "Literati - Words & Wisdom Festival",
      category: "Literary",
      date: "28th Feb - 2nd March 2025",
      location: "Auditorium Complex",
      time: "2:00 PM - 8:00 PM",
      description: "Celebrate the power of words through poetry, debates, and storytelling.",
      image: "📚",
      status: "registration_open",
      registrations: 450,
      prize: "₹75,000",
      highlights: ["Poetry Slam", "Debate Championship", "Story Writing", "Open Mic"],
      countdown: 20,
      featured: false
    },
    {
      id: 5,
      title: "KIIT Music Festival - Harmony 2025",
      category: "Cultural",
      date: "10th - 11th April 2025",
      location: "Open Air Theatre",
      time: "6:00 PM - 11:00 PM",
      description: "Two nights of incredible music featuring indie bands, classical performances, and student showcases.",
      image: "🎵",
      status: "coming_soon",
      registrations: 0,
      prize: "₹3,00,000",
      highlights: ["Live Bands", "Classical Night", "Battle of Bands", "DJ Sets"],
      countdown: 70,
      featured: true
    },
    {
      id: 6,
      title: "Innovation Expo 2025",
      category: "Technical",
      date: "18th - 19th March 2025",
      location: "Engineering Block",
      time: "9:00 AM - 5:00 PM",
      description: "Display your innovative projects and compete with brilliant minds from across the country.",
      image: "💡",
      status: "upcoming",
      registrations: 600,
      prize: "₹1,00,000",
      highlights: ["Project Display", "Innovation Awards", "Investor Meetup", "Tech Demos"],
      countdown: 48,
      featured: false
    }
  ];

  const filteredAnnouncements = announcements.filter(announcement => 
    selectedCategory === "All" || announcement.category === selectedCategory
  );

  const featuredAnnouncements = announcements.filter(announcement => announcement.featured);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "registration_open": return "bg-green-100 text-green-800";
      case "upcoming": return "bg-blue-100 text-blue-800";
      case "coming_soon": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Cultural": return <Music className="w-4 h-4" />;
      case "Technical": return <Trophy className="w-4 h-4" />;
      case "Sports": return <Star className="w-4 h-4" />;
      case "Literary": return <Mic className="w-4 h-4" />;
      default: return <PartyPopper className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Back Button */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-kiit-green hover:text-kiit-green-dark"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>
      </div>
      
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400">
        <div className="container mx-auto text-center text-white">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-bounce-slow">
              🎉 Fest Announcements
            </h1>
            <p className="text-xl md:text-2xl mb-4 opacity-90">
              Get ready for the most epic celebrations of the year!
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-8 text-sm md:text-base opacity-80">
              <span>Cultural shows, tech competitions, sports events & more</span>
              <span className="hidden md:inline">•</span>
              <span>Your campus, your stage, your time to shine!</span>
            </div>
            
            <div className="relative mb-12">
              <div className="w-64 h-64 mx-auto bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-8 animate-pulse">
                <div className="text-8xl">🎪</div>
              </div>
            </div>
            
            <Button 
              onClick={() => document.getElementById("featured-section")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-white text-purple-600 hover:bg-white/90 px-8 py-3 text-lg rounded-full font-semibold"
            >
              Explore Events
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section id="featured-section" className="py-16 px-4 bg-white/90 backdrop-blur-sm">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-purple-600 mb-4">⭐ Featured Events</h2>
            <p className="text-gray-600">Don't miss these highlight events!</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {featuredAnnouncements.map((event) => (
              <Card key={event.id} className="group overflow-hidden border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 hover:shadow-xl">
                <div className="relative">
                  <div className="h-48 bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                    <div className="text-6xl">{event.image}</div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-yellow-400 text-yellow-900 font-semibold">
                      FEATURED
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2 text-purple-600">
                      <Timer className="w-4 h-4" />
                      <span className="text-sm font-semibold">{event.countdown} days to go!</span>
                    </div>
                  </div>
                </div>
                
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={`flex items-center gap-1 ${getStatusColor(event.status)}`}>
                      {getCategoryIcon(event.category)}
                      {event.category}
                    </Badge>
                    <div className="text-2xl font-bold text-purple-600">{event.prize}</div>
                  </div>
                  <CardTitle className="text-xl group-hover:text-purple-600 transition-colors">
                    {event.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-gray-600">{event.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-500" />
                      {event.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-500" />
                      {event.time}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-purple-500" />
                      {event.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-500" />
                      {event.registrations} registered
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">Highlights:</div>
                    <div className="flex flex-wrap gap-2">
                      {event.highlights.map((highlight, index) => (
                        <Badge key={index} variant="outline" className="text-xs border-purple-200">
                          {highlight}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button className="flex-1 bg-purple-500 hover:bg-purple-600 text-white">
                      <Ticket className="w-4 h-4 mr-2" />
                      Register Now
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* All Events */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">🎪 All Events</h2>
            <p className="text-gray-600">Choose your adventure!</p>
          </div>
          
          {/* Category Filter */}
          <div className="flex justify-center mb-8">
            <div className="flex gap-2 overflow-x-auto p-1 bg-white rounded-lg shadow-sm">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  {getCategoryIcon(category)}
                  {category}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Events Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {filteredAnnouncements.map((event) => (
              <Card key={event.id} className="group hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-purple-300 overflow-hidden">
                <div className="relative">
                  <div className="h-32 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center">
                    <div className="text-4xl">{event.image}</div>
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge className={getStatusColor(event.status)}>
                      {event.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      {getCategoryIcon(event.category)}
                      {event.category}
                    </Badge>
                    <div className="text-sm font-semibold text-purple-600">{event.countdown}d left</div>
                  </div>
                  <CardTitle className="text-lg group-hover:text-purple-600 transition-colors">
                    {event.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {event.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {event.location}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {event.registrations}
                      </div>
                      <div className="font-semibold text-purple-600">{event.prize}</div>
                    </div>
                  </div>
                  
                  <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white">
                    View Details
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Fun Stats */}
      <section className="py-16 px-4 bg-gradient-to-r from-purple-100 to-pink-100">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-purple-600 mb-12">🎊 Fest Stats That'll Blow Your Mind</h2>
          
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: "🎭", number: "50+", label: "Cultural Events", desc: "Dance, music, drama & more" },
              { icon: "🏆", number: "₹15L+", label: "Prize Money", desc: "Win big this fest season" },
              { icon: "🎪", number: "10K+", label: "Participants", desc: "Join the celebration" },
              { icon: "🎵", number: "3", label: "Celebrity Shows", desc: "Star-studded nights" }
            ].map((stat, index) => (
              <Card key={index} className="text-center group hover:shadow-md transition-all duration-300 border border-purple-200">
                <CardContent className="pt-6">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-purple-600 mb-1">{stat.number}</div>
                  <h3 className="font-semibold text-gray-800 mb-1">{stat.label}</h3>
                  <p className="text-sm text-gray-600">{stat.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FestAnnouncements;