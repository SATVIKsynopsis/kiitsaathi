import { useState, useMemo } from "react";
import { Search, BookOpen, GraduationCap } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { courseStructure, branches } from "@/data/courseStructure";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const CourseStructure = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState(branches[0]);
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  // Filter and sort courses
  const filteredSemesters = useMemo(() => {
    let semesters = courseStructure;

    // Filter by semester
    if (selectedSemester !== "all") {
      semesters = semesters.filter(s => s.semester === parseInt(selectedSemester));
    }

    // Search filter
    if (searchQuery) {
      semesters = semesters.map(semester => ({
        ...semester,
        sections: semester.sections.map(section => ({
          ...section,
          courses: section.courses.filter(course =>
            course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.title.toLowerCase().includes(searchQuery.toLowerCase())
          )
        })).filter(section => section.courses.length > 0)
      })).filter(semester => semester.sections.length > 0);
    }

    // Sort courses
    if (sortBy !== "default") {
      semesters = semesters.map(semester => ({
        ...semester,
        sections: semester.sections.map(section => ({
          ...section,
          courses: [...section.courses].sort((a, b) => {
            if (sortBy === "code-asc") return a.code.localeCompare(b.code);
            if (sortBy === "code-desc") return b.code.localeCompare(a.code);
            if (sortBy === "name-asc") return a.title.localeCompare(b.title);
            if (sortBy === "credits-asc") return a.credits - b.credits;
            if (sortBy === "credits-desc") return b.credits - a.credits;
            return 0;
          })
        }))
      }));
    }

    return semesters;
  }, [searchQuery, selectedSemester, sortBy]);

  const getSectionColor = (type: string) => {
    switch (type) {
      case "Theory": return "text-blue-400";
      case "Practical": return "text-green-400";
      case "Sessional": return "text-purple-400";
      default: return "text-gray-400";
    }
  };

  const getSectionIcon = (type: string) => {
    switch (type) {
      case "Theory": return "📘";
      case "Practical": return "🧪";
      case "Sessional": return "🛠️";
      default: return "📚";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA]">
      <Navbar />
      
      <main className="flex-1 pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ color: '#0066FF', fontFamily: 'Inter, Poppins, sans-serif' }}>
              Course & Faculty Details
            </h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#555555' }}>
              Explore your semester courses with ease
            </p>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="courses" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 bg-white border border-gray-200 shadow-sm">
              <TabsTrigger 
                value="courses" 
                className="data-[state=active]:bg-[#00C896] data-[state=active]:text-white"
                style={{ fontFamily: 'Inter, Poppins, sans-serif' }}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Course Details
              </TabsTrigger>
              <TabsTrigger value="faculty" disabled className="opacity-50 cursor-not-allowed" style={{ fontFamily: 'Inter, Poppins, sans-serif' }}>
                <GraduationCap className="w-4 h-4 mr-2" />
                Faculty Details
              </TabsTrigger>
            </TabsList>

            <TabsContent value="courses" className="space-y-6 animate-fade-in">
              {/* Filters - Sticky */}
              <div className="sticky top-16 z-10 mb-8">
                <Card className="bg-white border-gray-200 shadow-lg">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Search */}
                      <div className="relative md:col-span-2">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#0066FF' }} />
                        <Input
                          placeholder="Search courses, codes or keywords..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-12 rounded-full border-gray-300 bg-[#F5F7FA] focus:border-[#0066FF] focus:ring-[#0066FF]"
                          style={{ fontFamily: 'Inter, Poppins, sans-serif', color: '#1A1A1A' }}
                        />
                      </div>

                      {/* Branch Filter */}
                      <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                        <SelectTrigger className="bg-[#F5F7FA] border-gray-300 focus:border-[#0066FF] focus:ring-[#0066FF]" style={{ fontFamily: 'Inter, Poppins, sans-serif', color: '#1A1A1A' }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200">
                          {branches.map(branch => (
                            <SelectItem key={branch} value={branch} style={{ fontFamily: 'Inter, Poppins, sans-serif' }}>{branch}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Semester Filter */}
                      <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                        <SelectTrigger className="bg-[#F5F7FA] border-gray-300 focus:border-[#0066FF] focus:ring-[#0066FF]" style={{ fontFamily: 'Inter, Poppins, sans-serif', color: '#1A1A1A' }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200">
                          <SelectItem value="all" style={{ fontFamily: 'Inter, Poppins, sans-serif' }}>All Semesters</SelectItem>
                          {[1, 2, 3, 4, 5, 6].map(sem => (
                            <SelectItem key={sem} value={sem.toString()} style={{ fontFamily: 'Inter, Poppins, sans-serif' }}>Semester {sem}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Sort */}
                    <div className="mt-4 flex items-center gap-3">
                      <span className="text-sm" style={{ color: '#555555', fontFamily: 'Inter, Poppins, sans-serif' }}>Sort by:</span>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-48 bg-[#F5F7FA] border-gray-300 focus:border-[#0066FF] focus:ring-[#0066FF]" style={{ fontFamily: 'Inter, Poppins, sans-serif', color: '#1A1A1A' }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200">
                          <SelectItem value="default" style={{ fontFamily: 'Inter, Poppins, sans-serif' }}>Default Order</SelectItem>
                          <SelectItem value="code-asc" style={{ fontFamily: 'Inter, Poppins, sans-serif' }}>Code (A → Z)</SelectItem>
                          <SelectItem value="code-desc" style={{ fontFamily: 'Inter, Poppins, sans-serif' }}>Code (Z → A)</SelectItem>
                          <SelectItem value="name-asc" style={{ fontFamily: 'Inter, Poppins, sans-serif' }}>Name (A → Z)</SelectItem>
                          <SelectItem value="credits-asc" style={{ fontFamily: 'Inter, Poppins, sans-serif' }}>Credits (Low → High)</SelectItem>
                          <SelectItem value="credits-desc" style={{ fontFamily: 'Inter, Poppins, sans-serif' }}>Credits (High → Low)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Course Structure */}
              <div className="space-y-10">
                {filteredSemesters.map(semester => (
                  <div key={semester.semester} className="animate-fade-in">
                    {/* Semester Header with Gradient */}
                    <div 
                      className="mb-6 p-6 rounded-xl shadow-md"
                      style={{ 
                        background: 'linear-gradient(135deg, #0066FF 0%, #00C896 100%)',
                      }}
                    >
                      <h2 className="text-3xl font-bold text-white" style={{ fontFamily: 'Inter, Poppins, sans-serif' }}>
                        Semester {semester.semester === 1 ? "I" : semester.semester === 2 ? "II" : semester.semester === 3 ? "III" : semester.semester === 4 ? "IV" : semester.semester === 5 ? "V" : "VI"}
                      </h2>
                    </div>

                    {/* Sections */}
                    {semester.sections.map((section, idx) => (
                      <div key={idx} className="mb-8">
                        {/* Section Header */}
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-2xl">{getSectionIcon(section.type)}</span>
                          <h3 
                            className="text-xl font-semibold" 
                            style={{ 
                              color: section.type === "Theory" ? '#0066FF' : section.type === "Practical" ? '#00C896' : '#555555',
                              fontFamily: 'Inter, Poppins, sans-serif'
                            }}
                          >
                            {section.type}
                          </h3>
                        </div>

                        {/* Course Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {section.courses.map((course, courseIdx) => (
                            <Card 
                              key={courseIdx}
                              className="bg-white border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] rounded-xl overflow-hidden group"
                              style={{
                                boxShadow: '0 2px 8px rgba(0, 102, 255, 0.1)',
                              }}
                            >
                              <CardContent className="p-5">
                                <div className="flex justify-between items-start mb-3">
                                  <span 
                                    className="font-mono text-sm font-semibold px-3 py-1 rounded-full"
                                    style={{ 
                                      backgroundColor: '#E6F2FF',
                                      color: '#0066FF',
                                      fontFamily: 'Inter, Poppins, sans-serif'
                                    }}
                                  >
                                    {course.code}
                                  </span>
                                  <Badge 
                                    className="rounded-full"
                                    style={{
                                      backgroundColor: section.type === "Theory" ? '#E6F2FF' : section.type === "Practical" ? '#E6FFF8' : '#F5F7FA',
                                      color: section.type === "Theory" ? '#0066FF' : section.type === "Practical" ? '#00C896' : '#555555',
                                      border: 'none',
                                      fontFamily: 'Inter, Poppins, sans-serif'
                                    }}
                                  >
                                    {course.credits} Credits
                                  </Badge>
                                </div>
                                <h4 
                                  className="font-semibold text-base leading-tight"
                                  style={{ 
                                    color: '#1A1A1A',
                                    fontFamily: 'Inter, Poppins, sans-serif'
                                  }}
                                >
                                  {searchQuery && (course.title.toLowerCase().includes(searchQuery.toLowerCase()) || course.code.toLowerCase().includes(searchQuery.toLowerCase())) ? (
                                    <span dangerouslySetInnerHTML={{
                                      __html: course.title.replace(
                                        new RegExp(`(${searchQuery})`, 'gi'),
                                        '<mark style="background-color: #FFE58F; color: #1A1A1A; padding: 0 2px; border-radius: 2px;">$1</mark>'
                                      )
                                    }} />
                                  ) : (
                                    course.title
                                  )}
                                </h4>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* No Results */}
              {filteredSemesters.length === 0 && (
                <Card className="bg-white border-gray-200 shadow-md rounded-xl">
                  <CardContent className="p-12 text-center">
                    <p className="text-lg" style={{ color: '#555555', fontFamily: 'Inter, Poppins, sans-serif' }}>
                      No courses found matching your filters.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="faculty">
              <Card className="bg-white border-gray-200 shadow-md rounded-xl">
                <CardContent className="p-12 text-center">
                  <GraduationCap className="w-16 h-16 mx-auto mb-4" style={{ color: '#0066FF' }} />
                  <h3 className="text-2xl font-semibold mb-2" style={{ color: '#1A1A1A', fontFamily: 'Inter, Poppins, sans-serif' }}>
                    Coming Soon
                  </h3>
                  <p style={{ color: '#555555', fontFamily: 'Inter, Poppins, sans-serif' }}>
                    Faculty details will be added later.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CourseStructure;
