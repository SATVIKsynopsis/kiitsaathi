import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft,
  ArrowRight,
  Calendar,
  PartyPopper,
  Trophy,
  Search,
  Users,
  MessageSquare,
  Instagram,
  ExternalLink,
  Sparkles
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useNavigate } from "react-router-dom";

const KiitSocieties = () => {
  const navigate = useNavigate();

  const societyServices = [
    {
      icon: Search,
      title: "Interview Deadlines Tracker",
      description: "Track every interview and onboarding deadline.",
      price: "Free",
      gradient: "from-campus-purple to-campus-orange",
      emoji: "🗓️",
      route: "/interview-deadlines"
    },
    {
      icon: PartyPopper,
      title: "Fest Announcements",
      description: "All fest updates, registrations, and event highlights — in one place.",
      price: "Free",
      gradient: "from-campus-purple to-campus-orange",
      emoji: "🎊",
      route: "/fest-announcements"
    },
    {
      icon: Trophy,
      title: "Sports Events Hub",
      description: "See tryout dates, match schedules, and urgent team alerts.",
      price: "Free",
      gradient: "from-kiit-green to-campus-blue",
      emoji: "🎾",
      route: "/sports-events"
    }
  ];

  const kiitSocieties = [
    {
      name: "Fed KIIT",
      brief: "Fostering innovation and development through hackathons, workshops, and tech-driven projects.",
      category: "Technical",
      members: "1,200+",
      gradient: "from-blue-600 via-purple-600 to-indigo-700",
      website: "https://www.fedkiit.com/",
      instagram: "https://www.instagram.com/fedkiit/?hl=en",
      upcomingEvent: {
        title: "TechFest Hackathon 2024",
        date: "March 15-17"
      },
      logoPlaceholder: "🚀"
    },
    {
      name: "KIIT E-Cell",
      brief: "Promoting entrepreneurship through mentorship, startup incubations, and networking.",
      category: "Business",
      members: "800+",
      gradient: "from-orange-500 via-red-500 to-pink-600",
      website: "https://www.kiitecell.org/",
      instagram: "https://www.instagram.com/ecell_kiit/?hl=en",
      upcomingEvent: {
        title: "Startup Pitch Competition",
        date: "April 5-7"
      },
      logoPlaceholder: "💡"
    },
    {
      name: "USC KIIT",
      brief: "Uniting students across cultures with leadership programs, global events, and community initiatives.",
      category: "Cultural",
      members: "1,500+",
      gradient: "from-emerald-500 via-teal-500 to-cyan-600",
      website: "#",
      instagram: "https://www.instagram.com/usc.kiit/?hl=en",
      upcomingEvent: {
        title: "International Cultural Night",
        date: "March 22"
      },
      logoPlaceholder: "🌍"
    }
  ];

  const handleServiceClick = (route: string) => {
    if (route) {
      navigate(route);
    } else {
      alert("🚀 Coming Soon! This service is under development and will be available soon.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-kiit-green-soft to-white">
      {/* Back to Home Button */}
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
      <section className="pt-24 pb-16 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-kiit-green mb-6 animate-fade-in">
              📣 KIIT Societies, Fests and Sports
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-4">
              Your gateway to campus societies, events, and opportunities
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-8 text-sm md:text-base text-gray-600">
              <span>Never miss an interview, fest, or sports event again</span>
              <span className="hidden md:inline">•</span>
              <span>One calendar. All societies. All events.</span>
            </div>
            
            <div className="relative mb-12">
              <div className="w-64 h-64 mx-auto bg-gradient-to-br from-kiit-green-light to-purple-200 rounded-full flex items-center justify-center mb-8">
                <div className="text-6xl">🏛️</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Services */}
      <section className="py-16 px-4 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-kiit-green mb-4">🚀 Quick Access</h2>
            <p className="text-gray-600">Track deadlines, events, and announcements</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {societyServices.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <Card 
                  key={index}
                  className="group hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-kiit-green cursor-pointer"
                  onClick={() => handleServiceClick(service.route)}
                >
                  <CardHeader className="text-center pb-4">
                    <div className={`p-3 rounded-2xl bg-gradient-to-r ${service.gradient} w-fit mx-auto mb-3`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-3xl mb-2">{service.emoji}</div>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{service.description}</p>
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold px-3 py-1 rounded-full text-sm bg-gradient-to-r ${service.gradient} text-white`}>
                        {service.price}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="opacity-0 group-hover:opacity-100 transition-all duration-300"
                      >
                        Explore
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* All KIIT Societies */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-kiit-green mb-4">🏛️ All KIIT Societies</h2>
            <p className="text-gray-600">Discover societies that match your interests and passions</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {kiitSocieties.map((society, index) => (
              <div 
                key={index} 
                className="group relative overflow-hidden rounded-2xl transition-all duration-500 hover:scale-105 hover:shadow-2xl"
              >
                {/* Main Card with Gradient Background */}
                <div className={`relative h-80 bg-gradient-to-br ${society.gradient} p-6 text-white`}>
                  {/* Society Logo Placeholder */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-2xl border border-white/30">
                      {society.logoPlaceholder}
                    </div>
                    {/* Instagram Icon */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(society.instagram, '_blank');
                      }}
                      className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/30 transition-all duration-300 border border-white/30"
                    >
                      <Instagram className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Society Name - Clickable */}
                  <button
                    onClick={() => society.website !== "#" && window.open(society.website, '_blank')}
                    className="text-left w-full group/name"
                  >
                    <h3 className="text-2xl font-bold mb-2 group-hover/name:underline flex items-center gap-2">
                      {society.name}
                      {society.website !== "#" && <ExternalLink className="w-4 h-4 opacity-0 group-hover/name:opacity-100 transition-opacity duration-300" />}
                    </h3>
                  </button>

                  {/* Category and Members */}
                  <div className="flex items-center gap-4 mb-4 text-sm">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                      {society.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {society.members}
                    </span>
                  </div>

                  {/* Upcoming Event Box - Always Visible */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (society.website !== "#") {
                        window.open(society.website, '_blank');
                      }
                    }}
                    className="w-full mb-4 p-3 bg-white/90 text-gray-800 rounded-xl border-2 border-yellow-300 shadow-lg hover:shadow-xl hover:bg-white transition-all duration-300 group/event"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <div className="font-semibold text-sm flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-yellow-500" />
                          Upcoming Event
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {society.upcomingEvent.title}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-medium text-orange-600">
                          {society.upcomingEvent.date}
                        </div>
                        <ExternalLink className="w-3 h-3 mt-1 ml-auto opacity-0 group-hover/event:opacity-100 transition-opacity duration-300" />
                      </div>
                    </div>
                  </button>

                  {/* Brief - Hidden by default, shown on hover */}
                  <div className="absolute inset-x-6 bottom-6 transform translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                    <div className="p-4 bg-white/95 backdrop-blur-sm rounded-xl text-gray-800 shadow-lg border border-white/50">
                      <p className="text-sm leading-relaxed">{society.brief}</p>
                    </div>
                  </div>
                </div>

                {/* Glowing Border Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none" 
                     style={{
                       background: `linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)`
                     }}>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-gradient-to-br from-kiit-green-soft to-purple-100">
        <div className="container mx-auto text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-kiit-green mb-6">📅 Never Miss an Opportunity</h2>
            <p className="text-gray-600 mb-8">
              Stay updated with all society interviews, fest announcements, and sports events in one place.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button 
                className="bg-kiit-green hover:bg-kiit-green-dark text-white px-8 py-3"
                onClick={() => alert("🚀 Coming Soon! Interview tracker is under development.")}
              >
                Track Interviews
              </Button>
              <Button 
                variant="outline" 
                className="border-kiit-green text-kiit-green hover:bg-kiit-green hover:text-white px-8 py-3"
                onClick={() => alert("🚀 Coming Soon! Event calendar is under development.")}
              >
                View All Events
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Support */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          className="rounded-full w-14 h-14 bg-green-500 hover:bg-green-600 text-white shadow-lg"
          onClick={() => window.open('https://wa.me/1234567890', '_blank')}
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
      </div>

      <Footer />
    </div>
  );
};

export default KiitSocieties;