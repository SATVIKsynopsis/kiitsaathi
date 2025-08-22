import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Lightbulb, 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Star, 
  Filter,
  Search,
  ArrowLeft,
  ArrowRight,
  Users,
  BookOpen,
  Code,
  Palette,
  BarChart3,
  MessageSquare
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useNavigate } from "react-router-dom";

const SkillEnhancingSessions = () => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["All", "Technical", "Soft Skills", "Creative", "Business"];

  const sessions = [
    {
      id: 1,
      title: "Figma Design Mastery",
      speaker: "Arjun Kumar",
      speakerRole: "UI/UX Designer at Swiggy",
      date: "25th Jan 2025",
      time: "6:00 PM - 7:30 PM",
      venue: "Online",
      price: 299,
      category: "Creative",
      rating: 4.9,
      attendees: 45,
      description: "Learn professional UI/UX design with hands-on Figma projects",
      thumbnail: "🎨"
    },
    {
      id: 2,
      title: "Excel Power User Workshop",
      speaker: "Priya Sharma",
      speakerRole: "Data Analyst at Flipkart",
      date: "28th Jan 2025",
      time: "4:00 PM - 6:00 PM",
      venue: "Campus Room 205",
      price: 199,
      category: "Business",
      rating: 4.8,
      attendees: 32,
      description: "Master advanced Excel formulas, pivot tables & data visualization",
      thumbnail: "📊"
    },
    {
      id: 3,
      title: "AI Tools for Students",
      speaker: "Rahul Singh",
      speakerRole: "ML Engineer at Microsoft",
      date: "2nd Feb 2025",
      time: "7:00 PM - 8:30 PM",
      venue: "Online",
      price: 399,
      category: "Technical",
      rating: 4.9,
      attendees: 67,
      description: "ChatGPT, Claude, and other AI tools to boost your productivity",
      thumbnail: "🤖"
    },
    {
      id: 4,
      title: "Freelancing 101",
      speaker: "Sneha Das",
      speakerRole: "Freelance Consultant",
      date: "5th Feb 2025",
      time: "5:30 PM - 7:00 PM",
      venue: "Online",
      price: 249,
      category: "Business",
      rating: 4.7,
      attendees: 28,
      description: "Start earning while studying - freelancing tips & client management",
      thumbnail: "💼"
    },
    {
      id: 5,
      title: "Communication Skills Bootcamp",
      speaker: "Ankit Patel",
      speakerRole: "HR Manager at TCS",
      date: "8th Feb 2025",
      time: "3:00 PM - 5:00 PM",
      venue: "Campus Auditorium",
      price: 199,
      category: "Soft Skills",
      rating: 4.8,
      attendees: 89,
      description: "Improve your speaking, presentation & interpersonal skills",
      thumbnail: "🗣️"
    },
    {
      id: 6,
      title: "Python for Beginners",
      speaker: "Vikash Gupta",
      speakerRole: "Software Engineer at Amazon",
      date: "12th Feb 2025",
      time: "6:00 PM - 8:00 PM",
      venue: "Online",
      price: 349,
      category: "Technical",
      rating: 4.9,
      attendees: 56,
      description: "Start your coding journey with Python basics & mini-projects",
      thumbnail: "🐍"
    }
  ];

  const filteredSessions = sessions.filter(session => {
    const matchesCategory = selectedFilter === "All" || session.category === selectedFilter;
    const matchesSearch = session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.speaker.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Technical": return <Code className="w-4 h-4" />;
      case "Creative": return <Palette className="w-4 h-4" />;
      case "Business": return <BarChart3 className="w-4 h-4" />;
      case "Soft Skills": return <MessageSquare className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-kiit-green-soft to-white">
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
      <section className="pt-24 pb-16 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-kiit-green mb-6 animate-fade-in">
              🛠️ Skill-Enhancing Sessions
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-4">
              Learn from industry experts and level up your skills
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-8 text-sm md:text-base text-gray-600">
              <span>Figma, AI tools, Excel, freelancing — from your peers</span>
              <span className="hidden md:inline">•</span>
              <span>Hands-on workshops with real projects</span>
            </div>
            
            <div className="relative mb-12">
              <div className="w-64 h-64 mx-auto bg-gradient-to-br from-campus-blue to-campus-purple rounded-full flex items-center justify-center mb-8">
                <div className="text-6xl">🎓</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="py-8 px-4 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search sessions or speakers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedFilter === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedFilter(category)}
                    className="flex items-center gap-2 whitespace-nowrap"
                  >
                    {getCategoryIcon(category)}
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sessions Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {filteredSessions.map((session) => (
              <Card key={session.id} className="group hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-kiit-green overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-4xl">{session.thumbnail}</div>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      {getCategoryIcon(session.category)}
                      {session.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg group-hover:text-kiit-green transition-colors">
                    {session.title}
                  </CardTitle>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <div>
                        <div className="font-medium">{session.speaker}</div>
                        <div className="text-xs">{session.speakerRole}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {session.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {session.time}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {session.venue}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{session.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm">{session.rating}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">{session.attendees}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-kiit-green">₹{session.price}</div>
                    </div>
                  </div>
                  
                  <Button className="w-full bg-kiit-green hover:bg-kiit-green-dark text-white">
                    Register Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Our Sessions */}
      <section className="py-16 px-4 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-kiit-green mb-12">🌟 Why Our Sessions Rock</h2>
          
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { icon: "👥", title: "Peer-to-Peer Learning", desc: "Learn from recent graduates and senior students" },
              { icon: "🎯", title: "Practical Focus", desc: "Hands-on projects, not just theory" },
              { icon: "💰", title: "Student-Friendly Pricing", desc: "Affordable workshops designed for students" },
              { icon: "📜", title: "Certificates", desc: "Get completion certificates for your portfolio" }
            ].map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SkillEnhancingSessions;