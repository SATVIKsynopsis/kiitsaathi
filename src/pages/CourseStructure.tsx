import { useState, useMemo } from "react";
import { Search, BookOpen, GraduationCap, Users, Sparkles  } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { branchCourseStructure, branches } from "@/data/courseStructure";
import { contactPersons, facultyMembers } from "@/data/facultyData";
import { FacultyCard } from "@/components/FacultyCard";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const CourseStructure = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState(branches[0]);
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  const [expandedCardId, setExpandedCardId] = useState<string>("");
  const [facultySearchQuery, setFacultySearchQuery] = useState("");
  const [selectedDesignation, setSelectedDesignation] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "contact" | "faculty">("all");
  const [selectedSchool, setSelectedSchool] = useState<string>("all");

  const filteredSemesters = useMemo(() => {
    let semesters = branchCourseStructure[selectedBranch] || branchCourseStructure[branches[0]];

    if (selectedSemester !== "all") {
      semesters = semesters.filter((s) => s.semester === parseInt(selectedSemester));
    }

    if (searchQuery) {
      semesters = semesters
        .map((semester) => ({
          ...semester,
          sections: semester.sections
            .map((section) => ({
              ...section,
              courses: section.courses.filter(
                (course) =>
                  course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  course.title.toLowerCase().includes(searchQuery.toLowerCase()),
              ),
            }))
            .filter((section) => section.courses.length > 0),
        }))
        .filter((semester) => semester.sections.length > 0);
    }

    if (sortBy !== "default") {
      semesters = semesters.map((semester) => ({
        ...semester,
        sections: semester.sections.map((section) => ({
          ...section,
          courses: [...section.courses].sort((a, b) => {
            if (sortBy === "code-asc") return a.code.localeCompare(b.code);
            if (sortBy === "code-desc") return b.code.localeCompare(a.code);
            if (sortBy === "name-asc") return a.title.localeCompare(b.title);
            if (sortBy === "credits-asc") return a.credits - b.credits;
            if (sortBy === "credits-desc") return b.credits - a.credits;
            return 0;
          }),
        })),
      }));
    }

    return semesters;
  }, [searchQuery, selectedSemester, sortBy, selectedBranch]);

  const getSectionIcon = (type: string) => {
    switch (type) {
      case "Theory":
        return "📘";
      case "Practical":
        return "🧪";
      case "Sessional":
        return "🛠️";
      default:
        return "📚";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#F5F7FA] via-white to-[#E6F2FF]">
      <Navbar />

      <main className="flex-1 pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-gradient-to-r from-[#0066FF]/10 to-[#00C896]/10 border border-[#0066FF]/20">
              <Sparkles className="w-4 h-4 text-[#0066FF]" />
              <span className="text-sm font-medium text-[#0066FF]">Academic Portal 2024-25</span>
            </div>
            <h1
              className="text-4xl md:text-5xl font-bold mb-4 gradient-text"
              style={{ fontFamily: "Inter, Poppins, sans-serif" }}
            >
              Course & Faculty Hub
            </h1>
            <p className="text-lg text-[#555555] max-w-2xl mx-auto" style={{ fontFamily: "Inter, Poppins, sans-serif" }}>
              Explore comprehensive course details and connect with distinguished faculty members
            </p>
          </div>

          <Tabs defaultValue="courses" className="w-full">
            <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-3 mb-10 bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg rounded-2xl ">
              <TabsTrigger
                value="courses"
                className=" data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0066FF] data-[state=active]:to-[#0052CC] data-[state=active]:text-white data-[state=active]:shadow-md rounded-xl"
                style={{ fontFamily: "Inter, Poppins, sans-serif" }}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Courses
              </TabsTrigger>
              <TabsTrigger
                value="calendar"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00C896] data-[state=active]:to-[#00A876] data-[state=active]:text-white data-[state=active]:shadow-md rounded-xl"
                style={{ fontFamily: "Inter, Poppins, sans-serif" }}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Calendar
              </TabsTrigger>
              <TabsTrigger
                value="faculty"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#006400] data-[state=active]:to-[#228B22] data-[state=active]:text-white data-[state=active]:shadow-md rounded-xl"
                style={{ fontFamily: "Inter, Poppins, sans-serif" }}
              >
                <GraduationCap className="w-4 h-4 mr-2" />
                Faculty
              </TabsTrigger>
            </TabsList>

            <TabsContent value="courses" className="space-y-6 animate-fade-in">
              <div className="sticky top-16 z-10 mb-6">
                <Card className="glass-effect border-gray-200 shadow-xl">
                  <CardContent className="p-5">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="relative md:col-span-2">
                        <Search
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                          style={{ color: "#0066FF" }}
                        />
                        <Input
                          placeholder="Search courses, codes or keywords..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 text-sm rounded-full border-gray-300 bg-white/80 focus:border-[#0066FF] focus:ring-[#0066FF] shadow-sm"
                          style={{ fontFamily: "Inter, Poppins, sans-serif", color: "#1A1A1A" }}
                        />
                      </div>

                      <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                        <SelectTrigger
                          className="text-sm bg-white/80 border-gray-300 focus:border-[#0066FF] focus:ring-[#0066FF] rounded-xl shadow-sm"
                          style={{ fontFamily: "Inter, Poppins, sans-serif", color: "#1A1A1A" }}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200 shadow-xl rounded-xl">
                          {branches.map((branch) => (
                            <SelectItem
                              key={branch}
                              value={branch}
                              style={{ fontFamily: "Inter, Poppins, sans-serif" }}
                            >
                              {branch}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                        <SelectTrigger
                          className="text-sm bg-white/80 border-gray-300 focus:border-[#0066FF] focus:ring-[#0066FF] rounded-xl shadow-sm"
                          style={{ fontFamily: "Inter, Poppins, sans-serif", color: "#1A1A1A" }}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200 shadow-xl rounded-xl">
                          <SelectItem value="all" style={{ fontFamily: "Inter, Poppins, sans-serif" }}>
                            All Semesters
                          </SelectItem>
                          {[1, 2, 3, 4, 5, 6].map((sem) => (
                            <SelectItem
                              key={sem}
                              value={sem.toString()}
                              style={{ fontFamily: "Inter, Poppins, sans-serif" }}
                            >
                              Semester {sem}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs text-[#555555]" style={{ fontFamily: "Inter, Poppins, sans-serif" }}>
                        Sort by:
                      </span>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger
                          className="w-44 text-sm bg-white/80 border-gray-300 focus:border-[#0066FF] focus:ring-[#0066FF] rounded-xl shadow-sm"
                          style={{ fontFamily: "Inter, Poppins, sans-serif", color: "#1A1A1A" }}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200 shadow-xl rounded-xl">
                          <SelectItem value="default" style={{ fontFamily: "Inter, Poppins, sans-serif" }}>
                            Default Order
                          </SelectItem>
                          <SelectItem value="code-asc" style={{ fontFamily: "Inter, Poppins, sans-serif" }}>
                            Code (A → Z)
                          </SelectItem>
                          <SelectItem value="code-desc" style={{ fontFamily: "Inter, Poppins, sans-serif" }}>
                            Code (Z → A)
                          </SelectItem>
                          <SelectItem value="name-asc" style={{ fontFamily: "Inter, Poppins, sans-serif" }}>
                            Name (A → Z)
                          </SelectItem>
                          <SelectItem value="credits-asc" style={{ fontFamily: "Inter, Poppins, sans-serif" }}>
                            Credits (Low → High)
                          </SelectItem>
                          <SelectItem value="credits-desc" style={{ fontFamily: "Inter, Poppins, sans-serif" }}>
                            Credits (High → Low)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-8">
                {filteredSemesters.map((semester) => (
                  <div key={semester.semester} className="animate-slide-up">
                    <div
                      className="mb-5 p-6 rounded-2xl shadow-lg"
                      style={{
                        background: "linear-gradient(135deg, #0066FF 0%, #00C896 100%)",
                      }}
                    >
                      <h2
                        className="text-3xl font-bold text-white"
                        style={{ fontFamily: "Inter, Poppins, sans-serif" }}
                      >
                        Semester{" "}
                        {["I", "II", "III", "IV", "V", "VI"][semester.semester - 1]}
                      </h2>
                    </div>

                    {semester.sections.map((section, idx) => (
                      <div key={idx} className="mb-6">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-2xl">{getSectionIcon(section.type)}</span>
                          <h3
                            className="text-xl font-semibold"
                            style={{
                              color:
                                section.type === "Theory"
                                  ? "#0066FF"
                                  : section.type === "Practical"
                                    ? "#00C896"
                                    : "#555555",
                              fontFamily: "Inter, Poppins, sans-serif",
                            }}
                          >
                            {section.type}
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {section.courses.map((course, courseIdx) => (
                            <Card
                              key={courseIdx}
                              className="bg-white border-gray-200 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 rounded-2xl overflow-hidden group"
                            >
                              <CardContent className="p-5">
                                <div className="flex justify-between items-start mb-3">
                                  <span
                                    className="font-mono text-xs font-bold px-3 py-1.5 rounded-full shadow-sm"
                                    style={{
                                      backgroundColor: "#E6F2FF",
                                      color: "#0066FF",
                                      fontFamily: "Inter, Poppins, sans-serif",
                                    }}
                                  >
                                    {course.code}
                                  </span>
                                  <Badge
                                    className="text-xs rounded-full shadow-sm"
                                    style={{
                                      backgroundColor:
                                        section.type === "Theory"
                                          ? "#E6F2FF"
                                          : section.type === "Practical"
                                            ? "#E6FFF8"
                                            : "#F5F7FA",
                                      color:
                                        section.type === "Theory"
                                          ? "#0066FF"
                                          : section.type === "Practical"
                                            ? "#00C896"
                                            : "#555555",
                                      border: "none",
                                      fontFamily: "Inter, Poppins, sans-serif",
                                    }}
                                  >
                                    {course.credits} Credits
                                  </Badge>
                                </div>
                                <h4
                                  className="font-semibold text-sm leading-tight"
                                  style={{
                                    color: "#1A1A1A",
                                    fontFamily: "Inter, Poppins, sans-serif",
                                  }}
                                >
                                  {searchQuery &&
                                  (course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    course.code.toLowerCase().includes(searchQuery.toLowerCase())) ? (
                                    <span
                                      dangerouslySetInnerHTML={{
                                        __html: course.title.replace(
                                          new RegExp(`(${searchQuery})`, "gi"),
                                          '<mark style="background-color: #FFE58F; color: #1A1A1A; padding: 0 2px; border-radius: 2px;">$1</mark>',
                                        ),
                                      }}
                                    />
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

              {filteredSemesters.length === 0 && (
                <Card className="bg-white border-gray-200 shadow-md rounded-2xl">
                  <CardContent className="p-10 text-center">
                    <p className="text-base text-[#555555]" style={{ fontFamily: "Inter, Poppins, sans-serif" }}>
                      No courses found matching your filters.
                    </p>
                  </CardContent>
                </Card>
              )}

              <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl text-center border border-blue-200 shadow-sm">
                <p className="text-xs text-gray-600" style={{ fontFamily: "Inter, Poppins, sans-serif" }}>
                  All data sourced from the official KIIT Bhubaneswar website -{" "}
                  <a
                    href="https://kiit.ac.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-medium"
                  >
                    https://kiit.ac.in/
                  </a>
                </p>
              </div>
            </TabsContent>

            <TabsContent value="calendar" className="space-y-6 animate-fade-in">
              <div className="text-center mb-8">
                <h2
                  className="text-3xl font-bold mb-3 gradient-text"
                  style={{ fontFamily: "Inter, Poppins, sans-serif" }}
                >
                  Academic Calendar
                </h2>
                <p className="text-base text-[#555555]" style={{ fontFamily: "Inter, Poppins, sans-serif" }}>
                  Download semester-wise academic calendars
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <Card
                    key={sem}
                    className="bg-white border-gray-200 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 rounded-2xl overflow-hidden"
                  >
                    <CardContent className="p-5 text-center">
                      <div
                        className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg"
                        style={{ background: "linear-gradient(135deg, #00C896 0%, #0066FF 100%)" }}
                      >
                        <BookOpen className="w-8 h-8 text-white" />
                      </div>
                      <h3
                        className="text-lg font-semibold mb-3"
                        style={{ color: "#1A1A1A", fontFamily: "Inter, Poppins, sans-serif" }}
                      >
                        Semester {["I", "II", "III", "IV", "V", "VI", "VII", "VIII"][sem - 1]}
                      </h3>
                      <Button
                        onClick={() => window.open(`/academic-calendars/semester-${sem}.pdf`, "_blank")}
                        className="w-full text-sm shadow-md hover:shadow-lg"
                        style={{
                          background: "linear-gradient(135deg, #0066FF 0%, #00C896 100%)",
                          color: "white",
                          fontFamily: "Inter, Poppins, sans-serif",
                        }}
                      >
                        Download PDF
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl text-center border border-blue-200 shadow-sm">
                <p className="text-xs text-gray-600" style={{ fontFamily: "Inter, Poppins, sans-serif" }}>
                  All data sourced from the official KIIT Bhubaneswar website -{" "}
                  <a
                    href="https://kiit.ac.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-medium"
                  >
                    https://kiit.ac.in/
                  </a>
                </p>
              </div>
            </TabsContent>

            <TabsContent value="faculty" className="space-y-8 animate-fade-in">
              <div className="sticky top-16 z-10 mb-8">
                <Card className="glass-effect border-gray-200 shadow-xl">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="relative">
                        <Search
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                          style={{ color: "#006400" }}
                        />
                        <Input
                          placeholder="Search by name or designation..."
                          value={facultySearchQuery}
                          onChange={(e) => setFacultySearchQuery(e.target.value)}
                          className="pl-12 rounded-full border-gray-300 bg-white/80 focus:border-[#006400] focus:ring-[#006400] shadow-sm"
                          style={{ fontFamily: "Inter, Poppins, sans-serif", color: "#1A1A1A" }}
                        />
                      </div>

                      <Select value={selectedCategory} onValueChange={(value: any) => setSelectedCategory(value)}>
                        <SelectTrigger
                          className="bg-white/80 border-gray-300 focus:border-[#228B22] focus:ring-[#228B22] rounded-xl shadow-sm"
                          style={{ fontFamily: "Inter, Poppins, sans-serif", color: "#1A1A1A" }}
                        >
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200 shadow-xl rounded-xl">
                          <SelectItem value="all" style={{ fontFamily: "Inter, Poppins, sans-serif" }}>
                            All Categories
                          </SelectItem>
                          <SelectItem value="contact" style={{ fontFamily: "Inter, Poppins, sans-serif" }}>
                            Contact Persons
                          </SelectItem>
                          <SelectItem value="faculty" style={{ fontFamily: "Inter, Poppins, sans-serif" }}>
                            Faculty Members
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                        <SelectTrigger
                          className="bg-white/80 border-gray-300 focus:border-[#FF6B35] focus:ring-[#FF6B35] rounded-xl shadow-sm"
                          style={{ fontFamily: "Inter, Poppins, sans-serif", color: "#1A1A1A" }}
                        >
                          <SelectValue placeholder="All Schools" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200 shadow-xl rounded-xl">
                          <SelectItem value="all" style={{ fontFamily: "Inter, Poppins, sans-serif" }}>
                            All Schools
                          </SelectItem>
                          <SelectItem
                            value="School of Computer Engineering"
                            style={{ fontFamily: "Inter, Poppins, sans-serif" }}
                          >
                            School of Computer Engineering
                          </SelectItem>
                          <SelectItem
                            value="School of Civil Engineering"
                            style={{ fontFamily: "Inter, Poppins, sans-serif" }}
                          >
                            School of Civil Engineering
                          </SelectItem>
                          <SelectItem value="School of Management" style={{ fontFamily: "Inter, Poppins, sans-serif" }}>
                            School of Management
                          </SelectItem>
                          <SelectItem
                            value="School of Biotechnology"
                            style={{ fontFamily: "Inter, Poppins, sans-serif" }}
                          >
                            School of Biotechnology
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={selectedDesignation} onValueChange={setSelectedDesignation}>
                        <SelectTrigger
                          className="bg-white/80 border-gray-300 focus:border-[#1E90FF] focus:ring-[#1E90FF] rounded-xl shadow-sm"
                          style={{ fontFamily: "Inter, Poppins, sans-serif", color: "#1A1A1A" }}
                        >
                          <SelectValue placeholder="All Designations" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200 shadow-xl rounded-xl">
                          <SelectItem value="all" style={{ fontFamily: "Inter, Poppins, sans-serif" }}>
                            All Designations
                          </SelectItem>
                          {Array.from(new Set([...contactPersons, ...facultyMembers].map((f) => f.designation)))
                            .sort()
                            .map((designation) => (
                              <SelectItem
                                key={designation}
                                value={designation}
                                style={{ fontFamily: "Inter, Poppins, sans-serif" }}
                              >
                                {designation}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {(selectedCategory === "all" || selectedCategory === "contact") &&
                (() => {
                  const filtered = contactPersons.filter((faculty) => {
                    const matchesSearch =
                      facultySearchQuery === "" ||
                      faculty.name.toLowerCase().includes(facultySearchQuery.toLowerCase()) ||
                      faculty.designation.toLowerCase().includes(facultySearchQuery.toLowerCase());
                    const matchesDesignation =
                      selectedDesignation === "all" || faculty.designation === selectedDesignation;
                    const matchesSchool =
                      selectedSchool === "all" || faculty.school === selectedSchool || !faculty.school;
                    return matchesSearch && matchesDesignation && matchesSchool;
                  });

                  if (filtered.length === 0) return null;

                  return (
                    <div className="animate-slide-up">
                      <div className="mb-6">
                        <h2
                          className="text-4xl font-bold gradient-text"
                          style={{
                            background: "linear-gradient(135deg, #006400 0%, #228B22 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            fontFamily: "Inter, Poppins, sans-serif",
                          }}
                        >
                          Contact Persons
                        </h2>
                        <p className="mt-2 text-[#555555]" style={{ fontFamily: "Inter, Poppins, sans-serif" }}>
                          {filtered.length} contact{filtered.length !== 1 ? "s" : ""} available
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filtered.map((faculty) => (
                          <FacultyCard
                            key={faculty.id}
                            faculty={faculty}
                            isExpanded={expandedCardId === faculty.id}
                            onToggle={(id) => setExpandedCardId(expandedCardId === id ? "" : id)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })()}

              {(selectedCategory === "all" || selectedCategory === "faculty") &&
                (() => {
                  const filtered = facultyMembers.filter((faculty) => {
                    const matchesSearch =
                      facultySearchQuery === "" ||
                      faculty.name.toLowerCase().includes(facultySearchQuery.toLowerCase()) ||
                      faculty.designation.toLowerCase().includes(facultySearchQuery.toLowerCase());
                    const matchesDesignation =
                      selectedDesignation === "all" || faculty.designation === selectedDesignation;
                    const matchesSchool = selectedSchool === "all" || faculty.school === selectedSchool;
                    return matchesSearch && matchesDesignation && matchesSchool;
                  });

                  if (filtered.length === 0) return null;

                  return (
                    <div className="animate-slide-up">
                      <div className="mb-6">
                        <h2
                          className="text-4xl font-bold"
                          style={{
                            background: "linear-gradient(135deg, #006400 0%, #228B22 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            fontFamily: "Inter, Poppins, sans-serif",
                          }}
                        >
                          Faculty Members
                        </h2>
                        <p className="mt-2 text-[#555555]" style={{ fontFamily: "Inter, Poppins, sans-serif" }}>
                          {filtered.length} facult{filtered.length !== 1 ? "y members" : "y member"} available
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filtered.map((faculty) => (
                          <FacultyCard
                            key={faculty.id}
                            faculty={faculty}
                            isExpanded={expandedCardId === faculty.id}
                            onToggle={(id) => setExpandedCardId(expandedCardId === id ? "" : id)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })()}

              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl text-center border border-blue-200 shadow-sm">
                <p className="text-sm text-gray-600" style={{ fontFamily: "Inter, Poppins, sans-serif" }}>
                  All data sourced from the official KIIT Bhubaneswar website -{" "}
                  <a
                    href="https://kiit.ac.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-medium"
                  >
                    https://kiit.ac.in/
                  </a>
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CourseStructure;
