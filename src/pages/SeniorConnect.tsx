import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  Users, 
  MessageCircle, 
  Phone, 
  MapPin, 
  Clock, 
  Star, 
  CheckCircle,
  Heart,
  Filter,
  Calendar,
  User,
  Sparkles,
  ArrowRight,
  MessageSquare,
  ArrowLeft,
  Lightbulb,
  BookOpen,
  Wrench,
  BookMarked,
  Quote
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useNavigate } from "react-router-dom";

const SeniorConnect = () => {
  const navigate = useNavigate();
  const [selectedFilters, setSelectedFilters] = useState({
    area: "",
    branch: "",
    year: "",
    mode: "",
    language: ""
  });

  const [showBookingForm, setShowBookingForm] = useState(false);

  const filterOptions = {
    area: ["Academics", "Society Prep", "Hostel Life", "Placements", "Mental Health", "Campus Life"],
    branch: ["CSE", "EEE", "Law", "MBBS", "Mechanical", "Civil", "IT"],
    year: ["3rd Year", "4th Year", "Alumni"],
    mode: ["Call", "WhatsApp Chat", "In-Person Meetup"],
    language: ["Hindi", "English", "Odia"]
  };

  const sampleSeniors = [
    {
      id: 1,
      name: "Arjun Patel",
      branch: "CSE",
      year: "4th Year",
      specialization: "Placement prep, Coding societies, Internships",
      modes: ["Call", "Chat"],
      availability: "Free after 5 PM",
      rating: 4.9,
      sessions: 45
    },
    {
      id: 2,
      name: "Priya Sharma",
      branch: "EEE",
      year: "Alumni",
      specialization: "Mental health, Hostel life, Study abroad",
      modes: ["Call", "In-Person"],
      availability: "Available weekends",
      rating: 4.8,
      sessions: 32
    },
    {
      id: 3,
      name: "Rahul Singh",
      branch: "Law",
      year: "3rd Year",
      specialization: "Moot courts, Legal societies, Career guidance",
      modes: ["Chat", "In-Person"],
      availability: "Available today",
      rating: 4.7,
      sessions: 28
    },
    {
      id: 4,
      name: "Sneha Das",
      branch: "MBBS",
      year: "4th Year",
      specialization: "Medical entrance prep, Study techniques",
      modes: ["Call", "Chat"],
      availability: "Free after 6 PM",
      rating: 4.9,
      sessions: 56
    }
  ];

  const scrollToBooking = () => {
    setShowBookingForm(true);
    setTimeout(() => {
      document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
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
            <h1 className="text-4xl md:text-6xl font-bold text-kiit-green mb-6 animate-fade-in flex justify-center items-center gap-3">
              <GraduationCap className="w-10 h-10" /> Senior Connect
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-4">
              Real advice. No filters. Meet seniors who've lived through it.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-8 text-sm md:text-base text-gray-600">
              <span>Confused about societies, subjects, or shifting rooms?</span>
              <span className="hidden md:inline">•</span>
              <span>One call with a senior = 100 doubts solved</span>
            </div>
            
            <div className="relative mb-12">
              <div className="w-64 h-64 mx-auto bg-gradient-to-br from-kiit-green-light to-purple-200 rounded-full flex items-center justify-center mb-8">
                <Users className="w-24 h-24 text-kiit-green-dark" />
              </div>
            </div>
            
            <Button 
              onClick={() => document.getElementById("filter-section")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-kiit-green hover:bg-kiit-green-dark text-white px-8 py-3 text-lg rounded-full transition-all duration-300 hover:scale-105"
            >
              Find a Senior
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-16 px-4 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-kiit-green mb-4 flex justify-center items-center gap-2">
              <Sparkles className="w-7 h-7" /> More Learning Resources
            </h2>
            <p className="text-gray-600">Enhance your skills and access study materials</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16">
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-kiit-green cursor-pointer">
              <CardHeader className="text-center pb-4">
                {/* <div className="p-3 rounded-2xl bg-gradient-to-r from-campus-blue to-campus-purple w-fit mx-auto mb-3">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div> */}
                <Wrench className="w-8 h-8 mx-auto mb-2 text-kiit-green-dark" />
                <CardTitle className="text-lg">Skill-Enhancing Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Learn Figma, AI tools, Excel, freelancing — from your peers.</p>
                <div className="flex items-center justify-between">
                  <span className="font-semibold px-3 py-1 rounded-full text-sm bg-gradient-to-r from-campus-blue to-campus-purple text-white">
                    ₹299/workshop
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="opacity-0 group-hover:opacity-100 transition-all duration-300"
                    onClick={() => navigate('/skill-enhancing-sessions')}
                  >
                    Explore Sessions
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-kiit-green cursor-pointer">
              <CardHeader className="text-center pb-4">
                {/* <div className="p-3 rounded-2xl bg-gradient-to-r from-kiit-green to-campus-blue w-fit mx-auto mb-3">
                  <BookOpen className="w-6 h-6 text-white" />
                </div> */}
                <BookMarked className="w-8 h-8 mx-auto mb-2 text-kiit-green-dark" />
                <CardTitle className="text-lg">Study Materials by Seniors</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Seniors' notes, solved papers, lab manuals — shared with you.</p>
                <div className="flex items-center justify-between">
                  <span className="font-semibold px-3 py-1 rounded-full text-sm bg-gradient-to-r from-kiit-green to-campus-blue text-white">
                    ₹49/subject
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="opacity-0 group-hover:opacity-100 transition-all duration-300"
                    onClick={() => navigate('/study-material')}
                  >
                    View Materials
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Emotional Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-purple-100 to-pink-100">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <Heart className="w-12 h-12 mx-auto mb-6 text-red-400" />
            <blockquote className="text-xl md:text-2xl italic text-gray-700 mb-6 flex items-center gap-2 justify-center">
              <Quote className="w-6 h-6 text-gray-500" />
              I was totally lost in my first semester. One chat with my senior helped me feel like I belong here.
            </blockquote>
            <p className="text-gray-600 mb-8">— 2nd Year CSE Student</p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div>
                <div className="text-3xl font-bold text-kiit-green">1,000+</div>
                <div className="text-sm text-gray-600">Connections made</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-kiit-green">200+</div>
                <div className="text-sm text-gray-600">Verified seniors</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-kiit-green">90%</div>
                <div className="text-sm text-gray-600">Say it helped them</div>
              </div>
            </div>
            
            <p className="text-gray-600">Sometimes, talking to a fellow student makes all the difference.</p>
          </div>
        </div>
      </section>
    
      <Footer />
    </div>
  );
};

export default SeniorConnect;
