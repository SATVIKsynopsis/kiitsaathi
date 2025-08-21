import React, { useState } from "react";
import PaymentComponent from "../components/PaymentComponent";
import { Button } from "@/components/ui/button";
import ConfirmationDashboard from "../components/ConfirmationDashboard";
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
  BookOpen
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
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [purchasedService, setPurchasedService] = useState<{ name: string; amount: number } | null>(null);

  const filterOptions: Record<string, string[]> = {
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
            <ArrowLeft width={16} height={16} />
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
              🎓 Senior Connect
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
                <div className="text-6xl">👥</div>
              </div>
            </div>
            
            <Button 
              onClick={() => document.getElementById("filter-section")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-kiit-green hover:bg-kiit-green-dark text-white px-8 py-3 text-lg rounded-full transition-all duration-300 hover:scale-105"
            >
              Find a Senior
              <ArrowRight width={20} height={20} className="ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-16 px-4 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-kiit-green mb-4">🚀 More Learning Resources</h2>
            <p className="text-gray-600">Enhance your skills and access study materials</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16">
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-kiit-green cursor-pointer">
              <CardHeader className="text-center pb-4">
                <div className="p-3 rounded-2xl bg-gradient-to-r from-campus-blue to-campus-purple w-fit mx-auto mb-3">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl mb-2">🛠️</div>
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
                    onClick={() => alert("🚀 Coming Soon! Skill sessions are under development.")}
                  >
                    Explore Sessions
                    <ArrowRight width={16} height={16} className="ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-kiit-green cursor-pointer">
              <CardHeader className="text-center pb-4">
                <div className="p-3 rounded-2xl bg-gradient-to-r from-kiit-green to-campus-blue w-fit mx-auto mb-3">
                  <BookOpen width={24} height={24} className="text-white" />
                </div>
                <div className="text-3xl mb-2">📚</div>
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
                    <ArrowRight width={16} height={16} className="ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section id="filter-section" className="py-16 px-4 bg-gradient-to-br from-kiit-green-soft to-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-kiit-green mb-4">🔍 Find Your Perfect Senior</h2>
            <p className="text-gray-600">Filter by what you need help with</p>
          </div>
          
          <div className="grid md:grid-cols-5 gap-4 mb-8">
            {Object.entries(filterOptions).map(([key, options]) => (
              <div key={key} className="space-y-2">
                <Label className="text-sm font-medium capitalize">{key === "area" ? "Area of Help" : key}</Label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={selectedFilters[key as keyof typeof selectedFilters]}
                  onChange={(e) => setSelectedFilters(prev => ({ ...prev, [key]: e.target.value }))}
                >
                  <option value="">Any</option>
                  {options.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          
          {/* Senior Profiles */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sampleSeniors.map((senior) => (
              <Card key={senior.id} className="group hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-kiit-green">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-kiit-green to-purple-400 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl">
                    {senior.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <CardTitle className="text-lg">{senior.name}</CardTitle>
                  <p className="text-sm text-gray-600">{senior.branch} • {senior.year}</p>
                  <div className="flex items-center justify-center gap-1 text-yellow-500">
                    <Star width={16} height={16} className="fill-current" />
                    <span className="text-sm">{senior.rating} ({senior.sessions} sessions)</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{senior.specialization}</p>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {senior.modes.map(mode => (
                      <Badge key={mode} variant="secondary" className="text-xs">
                        {mode}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-green-600 mb-4">
                    <Clock width={16} height={16} />
                    {senior.availability}
                  </div>
                  
                  <Button 
                    onClick={scrollToBooking}
                    className="w-full bg-kiit-green hover:bg-kiit-green-dark text-white"
                  >
                    Connect Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-kiit-green mb-12">🤝 How It Works</h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Filter, title: "Choose a Topic", desc: "Select a senior you vibe with based on your needs" },
              { icon: MessageCircle, title: "Pick Communication Mode", desc: "Call, chat, or meet in person - your choice" },
              { icon: Calendar, title: "Get Scheduled", desc: "Instant chat or scheduled slot based on availability" },
              { icon: Sparkles, title: "Talk & Learn", desc: "Get real advice and repeat when needed" }
            ].map((step, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-kiit-green to-purple-400 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
          
          <p className="text-center text-sm text-gray-600 mt-8 max-w-2xl mx-auto">
            Our seniors are volunteers or verified helpers from KIIT, not strangers.
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-4 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-kiit-green mb-12">💰 Simple Pricing</h2>
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[{
              title: "First Session", price: "Free", desc: "Try it out risk-free", amount: 0 },
              { title: "15-min Voice Call", price: "₹20", desc: "Quick doubts solved", amount: 20 },
              { title: "In-Person 1-on-1", price: "₹30", desc: "Face-to-face guidance", amount: 30 },
              { title: "Mentorship Package", price: "₹60", desc: "3 calls included", amount: 60 }
            ].map((plan, index) => (
              <Card key={index} className={`text-center ${index === 3 ? 'border-kiit-green border-2' : ''}`}>
                <CardHeader>
                  <CardTitle className="text-lg">{plan.title}</CardTitle>
                  <div className="text-2xl font-bold text-kiit-green">{plan.price}</div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{plan.desc}</p>
                  {plan.amount > 0 ? (
                    <PaymentComponent amount={plan.amount} user_id={"user_id_placeholder"} service_name="SeniorConnect" subservice_name={plan.name} payment_method="card" />
                  ) : (
                    <span className="mt-4 inline-block text-green-600 font-semibold">Free</span>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <PaymentComponent amount={60} user_id={"user_id_placeholder"} service_name="SeniorConnect" subservice_name="Session" payment_method="card" />
            <p className="text-xs text-gray-500 mt-2">We pay seniors a token amount per session from this.</p>
          </div>
        </div>
      </section>
      {/* Confirmation Dashboard Popup */}
      {showConfirmation && purchasedService && (
        <ConfirmationDashboard
          serviceName={purchasedService.name}
          amount={purchasedService.amount}
          onContinue={() => {
            setShowConfirmation(false);
            // Redirect to service or show purchased services
            // For demo, just close popup
          }}
        />
      )}

      {/* Booking Form */}
      {showBookingForm && (
        <section id="booking-form" className="py-16 px-4">
          <div className="container mx-auto max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-2xl text-kiit-green">📅 Schedule Your Session</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <Input placeholder="Your full name" />
                  </div>
                  <div>
                    <Label>WhatsApp Number</Label>
                    <Input placeholder="+91 XXXXX XXXXX" />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Year & Branch</Label>
                    <Input placeholder="e.g., 2nd Year CSE" />
                  </div>
                  <div>
                    <Label>Preferred Senior</Label>
                    <select className="w-full p-2 border border-gray-300 rounded-md">
                      <option value="">Any available senior</option>
                      {sampleSeniors.map(senior => (
                        <option key={senior.id} value={senior.name}>{senior.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <Label>What do you want help with?</Label>
                  <Textarea placeholder="Describe your doubts or questions..." />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Communication Mode</Label>
                    <select className="w-full p-2 border border-gray-300 rounded-md">
                      <option value="call">Voice Call</option>
                      <option value="chat">WhatsApp Chat</option>
                      <option value="person">In-Person</option>
                    </select>
                  </div>
                  <div>
                    <Label>Preferred Date/Time</Label>
                    <Input type="datetime-local" />
                  </div>
                </div>
                
                <Button className="w-full bg-kiit-green hover:bg-kiit-green-dark text-white">
                  Request Session
                </Button>
                
                <div className="text-center text-sm text-green-600 mt-4">
                  ✅ You're booked! A senior will reach out to you soon.
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Emotional Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-purple-100 to-pink-100">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <Heart className="w-12 h-12 mx-auto mb-6 text-red-400" />
            <blockquote className="text-xl md:text-2xl italic text-gray-700 mb-6">
              "I was totally lost in my first semester. One chat with my senior helped me feel like I belong here."
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

      {/* FAQs */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center text-kiit-green mb-12">🙋 Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            {[
              {
                q: "Is this safe?",
                a: "Yes. Only verified seniors with KIIT IDs are allowed on our platform."
              },
              {
                q: "Can I stay anonymous?",
                a: "You don't have to share your name in chat unless you're comfortable."
              },
              {
                q: "What if my senior doesn't respond?",
                a: "We'll reassign you to someone else within 24 hours, guaranteed."
              },
              {
                q: "Can I become a senior mentor?",
                a: "Yes! If you're 3rd year or above, scroll below and click 'Become a Mentor'."
              }
            ].map((faq, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Q: {faq.q}</h3>
                  <p className="text-gray-600">→ A: {faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Become a Mentor */}
      <section className="py-16 px-4 bg-gradient-to-br from-kiit-green-soft to-purple-100">
        <div className="container mx-auto text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-kiit-green mb-6">🧑‍🏫 Help juniors like someone helped you</h2>
            <p className="text-gray-600 mb-8">
              If you're a 3rd year or above, apply to mentor juniors and get paid ₹15–₹20 per session.
            </p>
            <Button className="bg-kiit-green hover:bg-kiit-green-dark text-white px-8 py-3 text-lg">
              Apply to Mentor
            </Button>
          </div>
        </div>
      </section>

      {/* Sticky WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg animate-pulse">
          <MessageSquare className="w-6 h-6" />
          <span className="ml-2 hidden md:inline">Need Help? Chat with us!</span>
        </Button>
      </div>

      <Footer />
    </div>
  );
};

export default SeniorConnect;