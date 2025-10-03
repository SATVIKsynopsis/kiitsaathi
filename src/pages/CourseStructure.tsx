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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navbar />
      
      <main className="flex-1 pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Course & Faculty Details
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Explore comprehensive course structure and faculty information
            </p>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="courses" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 bg-slate-800/50 border border-slate-700">
              <TabsTrigger value="courses" className="data-[state=active]:bg-blue-600">
                <BookOpen className="w-4 h-4 mr-2" />
                Course Details
              </TabsTrigger>
              <TabsTrigger value="faculty" disabled className="opacity-50 cursor-not-allowed">
                <GraduationCap className="w-4 h-4 mr-2" />
                Faculty Details
              </TabsTrigger>
            </TabsList>

            <TabsContent value="courses" className="space-y-6 animate-fade-in">
              {/* Filters */}
              <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="relative md:col-span-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search courses, codes or keywords..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-gray-500"
                      />
                    </div>

                    {/* Branch Filter */}
                    <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700">
                        {branches.map(branch => (
                          <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Semester Filter */}
                    <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700">
                        <SelectItem value="all">All Semesters</SelectItem>
                        {[1, 2, 3, 4, 5, 6].map(sem => (
                          <SelectItem key={sem} value={sem.toString()}>Semester {sem}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort */}
                  <div className="mt-4 flex items-center gap-3">
                    <span className="text-sm text-gray-400">Sort by:</span>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-48 bg-slate-800/50 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700">
                        <SelectItem value="default">Default Order</SelectItem>
                        <SelectItem value="code-asc">Code (A → Z)</SelectItem>
                        <SelectItem value="code-desc">Code (Z → A)</SelectItem>
                        <SelectItem value="name-asc">Name (A → Z)</SelectItem>
                        <SelectItem value="credits-asc">Credits (Low → High)</SelectItem>
                        <SelectItem value="credits-desc">Credits (High → Low)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Course Structure */}
              <div className="space-y-8">
                {filteredSemesters.map(semester => (
                  <div key={semester.semester} className="animate-fade-in">
                    {/* Semester Header */}
                    <div className="mb-6">
                      <h2 className="text-3xl font-bold text-white mb-2">
                        Semester {semester.semester === 1 ? "I" : semester.semester === 2 ? "II" : semester.semester === 3 ? "III" : semester.semester === 4 ? "IV" : semester.semester === 5 ? "V" : "VI"}
                      </h2>
                      <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                    </div>

                    {/* Sections */}
                    {semester.sections.map((section, idx) => (
                      <div key={idx} className="mb-6">
                        {/* Section Header */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl">{getSectionIcon(section.type)}</span>
                          <h3 className={`text-xl font-semibold ${getSectionColor(section.type)}`}>
                            {section.type}
                          </h3>
                        </div>

                        {/* Course Table */}
                        <Card className="bg-slate-900/30 border-slate-800 backdrop-blur-sm overflow-hidden">
                          <CardContent className="p-0">
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead>
                                  <tr className="border-b border-slate-800 bg-slate-800/50">
                                    <th className="text-left p-4 text-gray-400 font-medium">Code</th>
                                    <th className="text-left p-4 text-gray-400 font-medium">Title</th>
                                    <th className="text-right p-4 text-gray-400 font-medium">Credits</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {section.courses.map((course, courseIdx) => (
                                    <tr 
                                      key={courseIdx}
                                      className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                                    >
                                      <td className="p-4 text-gray-300 font-mono text-sm">
                                        {course.code}
                                      </td>
                                      <td className="p-4 text-white">
                                        {searchQuery && (course.title.toLowerCase().includes(searchQuery.toLowerCase()) || course.code.toLowerCase().includes(searchQuery.toLowerCase())) ? (
                                          <span dangerouslySetInnerHTML={{
                                            __html: course.title.replace(
                                              new RegExp(`(${searchQuery})`, 'gi'),
                                              '<mark class="bg-yellow-500/30 text-yellow-300">$1</mark>'
                                            )
                                          }} />
                                        ) : (
                                          course.title
                                        )}
                                      </td>
                                      <td className="p-4 text-right">
                                        <Badge 
                                          variant="outline"
                                          className={`
                                            ${section.type === "Theory" ? "bg-blue-500/20 text-blue-400 border-blue-500/50" : ""}
                                            ${section.type === "Practical" ? "bg-green-500/20 text-green-400 border-green-500/50" : ""}
                                            ${section.type === "Sessional" ? "bg-purple-500/20 text-purple-400 border-purple-500/50" : ""}
                                          `}
                                        >
                                          {course.credits}
                                        </Badge>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* No Results */}
              {filteredSemesters.length === 0 && (
                <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                  <CardContent className="p-12 text-center">
                    <p className="text-gray-400 text-lg">No courses found matching your filters.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="faculty">
              <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <GraduationCap className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                  <h3 className="text-2xl font-semibold text-white mb-2">Coming Soon</h3>
                  <p className="text-gray-400">Faculty details will be added later.</p>
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
