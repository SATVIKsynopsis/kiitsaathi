import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  Clock, 
  Building, 
  ExternalLink, 
  CheckCircle,
  AlertTriangle,
  Search,
  Filter,
  ArrowLeft,
  ArrowRight,
  MapPin,
  Users,
  TrendingUp,
  Target,
  Briefcase
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useNavigate } from "react-router-dom";

const InterviewDeadlinesTracker = () => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("deadline");

  const categories = ["All", "Tech", "Consulting", "Finance", "Product", "Core"];

  const opportunities = [
    {
      id: 1,
      company: "Google",
      role: "Software Engineer Intern",
      deadline: "2025-02-15",
      daysLeft: 8,
      category: "Tech",
      location: "Bangalore",
      stipend: "₹80,000/month",
      status: "open",
      applied: false,
      difficulty: "Hard",
      applications: 2500,
      hired: 25,
      link: "#",
      requirements: ["DSA", "System Design", "Python/Java"],
      logo: "🔍"
    },
    {
      id: 2,
      company: "McKinsey & Company",
      role: "Business Analyst Intern",
      deadline: "2025-02-20",
      daysLeft: 13,
      category: "Consulting",
      location: "Mumbai",
      stipend: "₹1,20,000/month",
      status: "open",
      applied: true,
      difficulty: "Hard",
      applications: 800,
      hired: 12,
      link: "#",
      requirements: ["Case Studies", "Analytics", "Presentation"],
      logo: "📊"
    },
    {
      id: 3,
      company: "Flipkart",
      role: "Product Management Intern",
      deadline: "2025-02-12",
      daysLeft: 5,
      category: "Product",
      location: "Bengaluru",
      stipend: "₹60,000/month",
      status: "urgent",
      applied: false,
      difficulty: "Medium",
      applications: 1200,
      hired: 15,
      link: "#",
      requirements: ["Product Sense", "Analytics", "SQL"],
      logo: "🛒"
    },
    {
      id: 4,
      company: "Goldman Sachs",
      role: "Technology Analyst",
      deadline: "2025-02-25",
      daysLeft: 18,
      category: "Finance",
      location: "Mumbai",
      stipend: "₹90,000/month",
      status: "open",
      applied: false,
      difficulty: "Hard",
      applications: 3000,
      hired: 30,
      link: "#",
      requirements: ["Programming", "Finance", "Problem Solving"],
      logo: "💰"
    },
    {
      id: 5,
      company: "Zomato",
      role: "Software Developer",
      deadline: "2025-02-18",
      daysLeft: 11,
      category: "Tech",
      location: "Gurgaon",
      stipend: "₹45,000/month",
      status: "open",
      applied: true,
      difficulty: "Medium",
      applications: 1800,
      hired: 40,
      link: "#",
      requirements: ["React", "Node.js", "MongoDB"],
      logo: "🍕"
    },
    {
      id: 6,
      company: "Tata Steel",
      role: "Management Trainee",
      deadline: "2025-02-22",
      daysLeft: 15,
      category: "Core",
      location: "Jamshedpur",
      stipend: "₹35,000/month",
      status: "open",
      applied: false,
      difficulty: "Medium",
      applications: 900,
      hired: 50,
      link: "#",
      requirements: ["Engineering", "Leadership", "Analytics"],
      logo: "🏭"
    }
  ];

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesCategory = selectedFilter === "All" || opp.category === selectedFilter;
    const matchesSearch = opp.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         opp.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    switch (sortBy) {
      case "deadline":
        return a.daysLeft - b.daysLeft;
      case "company":
        return a.company.localeCompare(b.company);
      case "difficulty":
        const diffOrder = { "Easy": 1, "Medium": 2, "Hard": 3 };
        return diffOrder[a.difficulty as keyof typeof diffOrder] - diffOrder[b.difficulty as keyof typeof diffOrder];
      default:
        return 0;
    }
  });

  const getStatusColor = (status: string, daysLeft: number) => {
    if (status === "urgent" || daysLeft <= 5) return "destructive";
    if (daysLeft <= 10) return "secondary";
    return "default";
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-100 text-green-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Hard": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const appliedCount = opportunities.filter(opp => opp.applied).length;
  const urgentCount = opportunities.filter(opp => opp.daysLeft <= 5).length;

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
              📋 Interview Deadlines Tracker
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-4">
              Never miss an opportunity again
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-8 text-sm md:text-base text-gray-600">
              <span>Track company deadlines, application links, and progress</span>
              <span className="hidden md:inline">•</span>
              <span>Stay organized with your placement preparation</span>
            </div>
            
            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6 max-w-2xl mx-auto mb-8">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-kiit-green">{opportunities.length}</div>
                  <div className="text-sm text-gray-600">Total Opportunities</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-campus-blue">{appliedCount}</div>
                  <div className="text-sm text-gray-600">Applications Sent</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-campus-orange">{urgentCount}</div>
                  <div className="text-sm text-gray-600">Urgent Deadlines</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="py-8 px-4 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search companies or roles..."
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
                    className="whitespace-nowrap"
                  >
                    {category}
                  </Button>
                ))}
              </div>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="deadline">Sort by Deadline</option>
                <option value="company">Sort by Company</option>
                <option value="difficulty">Sort by Difficulty</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Opportunities List */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="space-y-6">
            {filteredOpportunities.map((opp) => (
              <Card key={opp.id} className={`group hover:shadow-lg transition-all duration-300 ${opp.applied ? 'border-l-4 border-l-green-500' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Company Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="text-4xl">{opp.logo}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold">{opp.company}</h3>
                            {opp.applied && (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Applied
                              </Badge>
                            )}
                          </div>
                          <h4 className="text-lg text-gray-700 font-medium mb-2">{opp.role}</h4>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {opp.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Briefcase className="w-4 h-4" />
                              {opp.stipend}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {opp.applications} applicants
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              {opp.hired} hired
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            {opp.requirements.map((req, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {req}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Deadline & Actions */}
                    <div className="md:w-64 space-y-4">
                      <div className="text-center md:text-right">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                          opp.daysLeft <= 5 ? 'bg-red-100 text-red-800' : 
                          opp.daysLeft <= 10 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-green-100 text-green-800'
                        }`}>
                          <Clock className="w-4 h-4" />
                          {opp.daysLeft} days left
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Deadline: {new Date(opp.deadline).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span>Difficulty:</span>
                          <Badge className={getDifficultyColor(opp.difficulty)}>
                            {opp.difficulty}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>Selection Rate</span>
                            <span>{Math.round((opp.hired / opp.applications) * 100)}%</span>
                          </div>
                          <Progress 
                            value={Math.round((opp.hired / opp.applications) * 100)} 
                            className="h-2"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Button 
                          className="w-full bg-kiit-green hover:bg-kiit-green-dark text-white"
                          disabled={opp.applied}
                        >
                          {opp.applied ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Applied
                            </>
                          ) : (
                            <>
                              Apply Now
                              <ExternalLink className="w-4 h-4 ml-2" />
                            </>
                          )}
                        </Button>
                        <Button variant="outline" size="sm" className="w-full">
                          View Details
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

      {/* Tips Section */}
      <section className="py-16 px-4 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-kiit-green mb-12">💡 Pro Tips for Success</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { icon: "🎯", title: "Apply Early", desc: "Don't wait till the last day - apply as soon as possible" },
              { icon: "📄", title: "Tailor Your Resume", desc: "Customize your resume for each role and company" },
              { icon: "🔄", title: "Follow Up", desc: "Send a polite follow-up email after applying" },
              { icon: "📚", title: "Prepare Well", desc: "Research the company and practice relevant skills" }
            ].map((tip, index) => (
              <Card key={index} className="text-center group hover:shadow-md transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                    {tip.icon}
                  </div>
                  <h3 className="font-semibold mb-2">{tip.title}</h3>
                  <p className="text-sm text-gray-600">{tip.desc}</p>
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

export default InterviewDeadlinesTracker;