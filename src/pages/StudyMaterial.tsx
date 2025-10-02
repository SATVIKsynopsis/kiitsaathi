import { useState, useEffect } from "react";
import {
  Plus,
  MessageSquare,
  X,
  AlertTriangle,
  Loader,
  Youtube,
  ChevronRight,
  Clock,
  Users,
  Upload,
  File,
  BookOpen,
  Bot,
  Search
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { FilterBar } from "@/components/study-materials/FilterBar";
import { DataTable } from "@/components/study-materials/DataTable";
import { TabNavigation } from "@/components/study-materials/TabNavigation";
import { toast } from "sonner";
import { semesters, years, semesterSubjects } from "@/data/studyMaterials";
import { Input } from "@/components/ui/input";


// Types
interface StudyMaterialItem {
  id: number;
  title: string;
  subject: string;
  semester: string;
  branch?: string;
  year?: string;
  type?: 'note' | 'pyq' | 'ppt' | 'ebook';
  views: number;
  uploadedBy: string;
  uploadDate?: string;
  downloadUrl: string;
}

export default function StudyMaterial() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [activeSection, setActiveSection] = useState("notes");
  const [materials, setMaterials] = useState<StudyMaterialItem[]>([]);

  const [addResourceDialogOpen, setAddResourceDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: "",
    subject: "",
    semester: "",
    branch: "",
    year: "",
    file: null as File | null
  });

  //playlist from youtube 
  const playlistYoutube = [
    {
      "course_name": "Data Structures & Algorithms (DSA)",
      "playlist_name": "Master Data Structures & Algorithms: DSA Bootcamp 2025",
      "channel_name": "HelloWorld by Prince",
      "videos": "60+",
      "playlist_link": "https://www.youtube.com/playlist?list=PLA3GkZPtsafYzRj2lk6OyquJtRXoDLR_S"
    },
    {
      "course_name": "Data Structures & Algorithms (DSA)",
      "playlist_name": "Ultimate Playlist - Master DSA for Free",
      "channel_name": "Take U Forward",
      "videos": "90+",
      "playlist_link": "https://www.youtube.com/playlist?list=PLKtofb3HgEyygy1CDrP17k2xKfvETIMr5"
    },
    {
      "course_name": "Object Oriented Programming (OOPS)",
      "playlist_name": "Object Oriented Programming (OOP) in Java Course",
      "channel_name": "Kunal Kushwaha",
      "videos": "28+",
      "playlist_link": "https://www.youtube.com/playlist?list=PL9gnSGHSqcno1G3XjUbwzXHL8_EttOuKk"
    },
    {
      "course_name": "Design and Analysis of Algorithms (DAA)",
      "playlist_name": "Design and Analysis of Algorithms (DAA)",
      "channel_name": "Gate Smashers",
      "videos": "45+",
      "playlist_link": "https://www.youtube.com/playlist?list=PLxCzCOWd7aiHcmS4i14bI0VrMbZTUvlTa"
    },
    {
      "course_name": "Java (Full Course)",
      "playlist_name": "Java Full Course for free ☕ (2025)",
      "channel_name": "Bro Code",
      "videos": "1 (full course)",
      "playlist_link": "https://www.youtube.com/watch?v=xTtL8E4LzTQ"
    },
    {
      "course_name": "Java (Beginner to Advanced)",
      "playlist_name": "Java Tutorial for Beginners",
      "channel_name": "CodeWithHarry",
      "videos": "75+",
      "playlist_link": "https://www.youtube.com/watch?v=BGTx91t8q50"
    },
    {
      "course_name": "SQL (Complete Course)",
      "playlist_name": "Complete SQL Course For Beginners",
      "channel_name": "Edureka",
      "videos": "1 (full course)",
      "playlist_link": "https://www.youtube.com/watch?v=q_JsgpiuY98"
    },
    {
      "course_name": "SQL (Hindi, Full Tutorial)",
      "playlist_name": "SQL Tutorial for Beginners | Full SQL Course In Hindi",
      "channel_name": "Rishabh Mishra",
      "videos": "1 (full course)",
      "playlist_link": "https://www.youtube.com/watch?v=On9eSN3F8w0"
    },
    {
      "course_name": "SQL for Beginners",
      "playlist_name": "SQL Playlist 2025 | SQL Tutorial For Beginners | SQL Course",
      "channel_name": "Simplilearn",
      "videos": "25+",
      "playlist_link": "https://www.youtube.com/playlist?list=PLEiEAq2VkUUKL3yPbn8yWnatjUg0P0I-Z"
    },
    {
      "course_name": "Data Structures & Algorithms (DSA)",
      "playlist_name": "Master Data Structures & Algorithms: DSA Bootcamp 2025",
      "channel_name": "HelloWorld by Prince",
      "videos": "60+",
      "playlist_link": "https://www.youtube.com/playlist?list=PLA3GkZPtsafYzRj2lk6OyquJtRXoDLR_S"
    },
    {
      "course_name": "Data Structures & Algorithms (DSA)",
      "playlist_name": "Ultimate Playlist - Master DSA for Free",
      "channel_name": "Take U Forward",
      "videos": "90+",
      "playlist_link": "https://www.youtube.com/playlist?list=PLKtofb3HgEyygy1CDrP17k2xKfvETIMr5"
    },
    {
      "course_name": "Object Oriented Programming (OOPS)",
      "playlist_name": "Object Oriented Programming (OOP) in Java Course",
      "channel_name": "Kunal Kushwaha",
      "videos": "28+",
      "playlist_link": "https://www.youtube.com/playlist?list=PL9gnSGHSqcno1G3XjUbwzXHL8_EttOuKk"
    },
    {
      "course_name": "Design and Analysis of Algorithms (DAA)",
      "playlist_name": "Design and Analysis of Algorithms (DAA)",
      "channel_name": "Gate Smashers",
      "videos": "45+",
      "playlist_link": "https://www.youtube.com/playlist?list=PLxCzCOWd7aiHcmS4i14bI0VrMbZTUvlTa"
    },
    {
      "course_name": "Java (Full Course)",
      "playlist_name": "Java Full Course for free ☕ (2025)",
      "channel_name": "Bro Code",
      "videos": "1 (full course)",
      "playlist_link": "https://www.youtube.com/watch?v=xTtL8E4LzTQ"
    },
    {
      "course_name": "Java (Beginner to Advanced)",
      "playlist_name": "Java Tutorial for Beginners",
      "channel_name": "CodeWithHarry",
      "videos": "75+",
      "playlist_link": "https://www.youtube.com/watch?v=BGTx91t8q50"
    },
    {
      "course_name": "SQL (Complete Course)",
      "playlist_name": "Complete SQL Course For Beginners",
      "channel_name": "Edureka",
      "videos": "1 (full course)",
      "playlist_link": "https://www.youtube.com/watch?v=q_JsgpiuY98"
    },
    {
      "course_name": "SQL (Hindi, Full Tutorial)",
      "playlist_name": "SQL Tutorial for Beginners | Full SQL Course In Hindi",
      "channel_name": "Rishabh Mishra",
      "videos": "1 (full course)",
      "playlist_link": "https://www.youtube.com/watch?v=On9eSN3F8w0"
    },
    {
      "course_name": "SQL for Beginners",
      "playlist_name": "SQL Playlist 2025 | SQL Tutorial For Beginners | SQL Course",
      "channel_name": "Simplilearn",
      "videos": "25+",
      "playlist_link": "https://www.youtube.com/playlist?list=PLEiEAq2VkUUKL3yPbn8yWnatjUg0P0I-Z"
    }
  ]



  // Get current user session
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      } else {
        setError("Please login to access study materials");
      }
    };
    getUser();
  }, []);

  // Fetch materials from Supabase
  useEffect(() => {
    const fetchMaterials = async () => {
      setLoading(true);
      setError("");

      let query;
      if (activeSection === "notes") {
        query = supabase.from("notes").select("*").order("created_at", { ascending: false });
      } else if (activeSection === "pyqs") {
        query = supabase.from("pyqs").select("*").order("created_at", { ascending: false });
      } else if (activeSection === "ppts") {
        query = supabase.from("ppts").select("*").order("created_at", { ascending: false });
      } else if (activeSection === "ebooks") {
        query = supabase.from("ebooks").select("*").order("created_at", { ascending: false });
      }

      if (!query) {
        setLoading(false);
        return;
      }

      const { data, error } = await query;

      if (error) {
        console.error("Fetch error:", error);
        setError(error.message);
        setLoading(false);
        return;
      }

      const mapped = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        subject: item.subject,
        semester: item.semester,
        branch: item.branch || "",
        year: item.year || "",
        views: item.views ?? 0,
        uploadedBy: item.uploaded_by,
        uploadDate: item.upload_date ?? item.created_at,
        downloadUrl: activeSection === "ppts" ? item.ppt_url : item.pdf_url,
      }));

      setMaterials(mapped);
      setLoading(false);
    };

    fetchMaterials();
  }, [activeSection]);
  const availableSubjects =
    selectedSemester === "all"
      ? semesterSubjects.flatMap(s => s.subjects) // all subjects
      : semesterSubjects.find(s => s.semester === selectedSemester)?.subjects || [];

  // Filter function for study materials
  const filterMaterials = (materials: StudyMaterialItem[]) => {
    return materials.filter(item => {
      const matchesSearch = searchQuery === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subject.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSubject = selectedSubject === "all" || item.subject === selectedSubject;
      const matchesSemester = selectedSemester === "all" || item.semester === selectedSemester;
      const matchesYear = selectedYear === "all" || (item.year && item.year === selectedYear);

      return matchesSearch && matchesSubject && matchesSemester && matchesYear;
    });
  };

  // Handle file download
  const handleDownload = async (material: StudyMaterialItem) => {
    try {
      // Update view count
      if (activeSection === "notes") {
        await supabase.from("notes").update({ views: material.views + 1 }).eq("id", material.id);
      } else if (activeSection === "pyqs") {
        await supabase.from("pyqs").update({ views: material.views + 1 }).eq("id", material.id);
      } else if (activeSection === "ppts") {
        await supabase.from("ppts").update({ views: material.views + 1 }).eq("id", material.id);
      } else if (activeSection === "ebooks") {
        await supabase.from("ebooks").update({ views: material.views + 1 }).eq("id", material.id);
      }

      // Download file
      window.open(material.downloadUrl, '_blank');
    } catch (error) {
      console.error("Download error:", error);
    }
  };


  if (!user && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Authentication Required</h2>
          <p>Please login to access study materials.</p>
        </div>
      </div>
    );
  }

  const handleView = async (id: number) => {
    try {
      // Update view count first
      const table = activeSection === "notes"
        ? "notes"
        : activeSection === "pyqs"
          ? "pyqs"
          : activeSection === "ebooks"
            ? "ebooks"
            : "ppts";

      const { error } = await supabase
        .from(table)
        .update({ views: materials.find(m => m.id === id)?.views! + 1 })
        .eq("id", id);

      if (error) {
        throw error;
      }

      // Update local state
      setMaterials(materials.map(material =>
        material.id === id
          ? { ...material, views: material.views + 1 }
          : material
      ));

      // Find material and open PDF
      const material = materials.find(m => m.id === id);
      if (material && material.downloadUrl) {
        // Method 1: Open in new tab with PDF viewer
        window.open(material.downloadUrl, '_blank', 'noopener,noreferrer');
      }

    } catch (error) {
      console.error("Error updating view count:", error);
      toast.error("Failed to update view count");
    }
  };;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Navbar />
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Enhanced Hero Header */}
        <div className="mb-12 text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-kiit-primary/10 via-kiit-secondary/10 to-kiit-primary/10 rounded-3xl blur-3xl -z-10"></div>
            <div className="glass-card p-8 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-kiit-primary to-kiit-secondary rounded-2xl mb-6 shadow-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-kiit-primary via-kiit-secondary to-kiit-primary bg-clip-text text-transparent mb-4">
                Study Materials
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Access comprehensive notes, previous year questions, presentations, and curated study resources
                to excel in your academic journey
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <button
                  onClick={() => window.open('https://forms.gle/5d89iETDeefruKSX9', '_blank')}
                  className="group bg-gradient-to-r from-kiit-secondary to-kiit-secondary/90 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 hover:from-kiit-secondary/90 hover:to-kiit-secondary transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Request Resource
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="mb-8">
          <TabNavigation
            activeSection={activeSection}
            setActiveSection={setActiveSection}
          />
        </div>

        {/* Enhanced Error Display */}
        {error && (
          <div className="mb-8 p-6 bg-gradient-to-r from-destructive/10 to-destructive/5 border border-destructive/20 rounded-xl flex items-center gap-3 text-destructive shadow-lg">
            <div className="flex-shrink-0 w-10 h-10 bg-destructive/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Something went wrong</p>
              <p className="text-sm opacity-80">{error}</p>
            </div>
            <button
              onClick={() => setError("")}
              className="flex-shrink-0 w-8 h-8 rounded-full hover:bg-destructive/20 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Content */}
        {(activeSection === "notes" || activeSection === "pyqs" || activeSection === "ppts" || activeSection === "ebooks") && (
          <>
            {/* Filter Bar */}
            <FilterBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedSubject={selectedSubject}
              setSelectedSubject={setSelectedSubject}
              selectedSemester={selectedSemester}
              setSelectedSemester={setSelectedSemester}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              subjects={availableSubjects}
              semesters={semesters}
              years={years}
            />

            {/* Enhanced Loading */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-kiit-primary/20 rounded-full"></div>
                  <div className="w-16 h-16 border-4 border-kiit-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                </div>
                <p className="mt-4 text-muted-foreground animate-pulse">Loading study materials...</p>
              </div>
            ) : (
              <div className="glass-card rounded-2xl overflow-hidden border border-border/50 shadow-xl">
                <DataTable
                  materials={filterMaterials(materials)}
                  onViewPDF={handleView}
                  loading={loading}
                  materialType={activeSection as "notes" | "pyqs" | "ppts" | "ebooks"}
                  onDownload={handleDownload}
                />
              </div>
            )}
          </>
        )}

        {/* Enhanced Playlists Section */}
        {activeSection === "playlists" && (
          <div className="glass-card p-12 rounded-2xl text-center border border-border/50 bg-gradient-to-br from-card/50 to-muted/20">
            {/* <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mb-6 shadow-lg">
              <Youtube className="w-10 h-10 text-white" />
            </div>
             <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent"> 
              YouTube Playlists
            </h3>
            <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
              Curated educational playlists and video lectures are coming soon to enhance your learning experience
            </p> */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground group-focus-within:text-kiit-primary transition-colors">
                <Search className="w-5 h-5" />
              </div>
              <Input
                type="text"
                placeholder="Search by title, subject, or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-base rounded-xl border-border/50 bg-background/50 focus:bg-background transition-all duration-300 focus:ring-2 focus:ring-kiit-primary/20 focus:border-kiit-primary/50"
              />
            </div>

            {/* Filter playlists based on search query */}
            {playlistYoutube
              .filter((playlist) =>
                playlist.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                playlist.playlist_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                playlist.channel_name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((playlist, idx) => (
                <div
                  key={idx}
                  className="glass-card my-6 p-6 rounded-xl border border-border/30 flex flex-col md:flex-row items-center gap-6 text-left shadow-md bg-white/60"
                >
                  <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                    <Youtube className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg mb-1">{playlist.course_name}</h4>
                    <p className="text-md font-semibold mb-1">{playlist.playlist_name}</p>
                    <p className="text-sm text-muted-foreground mb-1">
                      Channel: <span className="font-medium">{playlist.channel_name}</span>
                    </p>
                    <p className="text-sm text-muted-foreground mb-2">
                      Videos: {playlist.videos}
                    </p>
                    <a
                      href={playlist.playlist_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Watch Playlist
                    </a>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Enhanced Groups Section */}
        {activeSection === "groups" && (
          <div className="space-y-8">
            <div className="glass-card p-8 rounded-2xl text-center border border-border/50 bg-gradient-to-br from-card/50 to-muted/20">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-kiit-primary to-kiit-secondary rounded-2xl mb-6 shadow-lg">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-kiit-primary to-kiit-secondary bg-clip-text text-transparent">
                Study Groups & Resources
              </h3>
              <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed mb-6">
                Join collaborative study groups and access shared resources from students
              </p>
            </div>

            {/* Demo Groups */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-card p-6 rounded-2xl border border-border/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    📘
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">CSE Study Hub</h4>
                    <p className="text-sm text-muted-foreground">Computer Science & Engineering</p>
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">Comprehensive notes, assignments, and project resources for CSE students.</p>
                <div className="flex gap-3">
                  <a
                    href="https://t.me/kiit_cse_study"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-center text-sm font-medium transition-colors"
                  >
                    📱 Telegram Group
                  </a>
                  <a
                    href="https://drive.google.com/drive/folders/cse_resources"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-center text-sm font-medium transition-colors"
                  >
                    📁 Drive Resources
                  </a>
                </div>
              </div>

              <div className="glass-card p-6 rounded-2xl border border-border/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                    ⚡
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">ETC Study Group</h4>
                    <p className="text-sm text-muted-foreground">Electronics & Telecommunication</p>
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">Circuit diagrams, lab manuals, and electronics project resources.</p>
                <div className="flex gap-3">
                  <a
                    href="https://t.me/kiit_etc_study"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-center text-sm font-medium transition-colors"
                  >
                    📱 Telegram Group
                  </a>
                  <a
                    href="https://drive.google.com/drive/folders/etc_resources"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-center text-sm font-medium transition-colors"
                  >
                    📁 Drive Resources
                  </a>
                </div>
              </div>

              <div className="glass-card p-6 rounded-2xl border border-border/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                    🏗️
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Civil Engineering Hub</h4>
                    <p className="text-sm text-muted-foreground">Civil Engineering Department</p>
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">Construction guides, AutoCAD files, and project documentation.</p>
                <div className="flex gap-3">
                  <a
                    href="https://t.me/kiit_civil_study"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-center text-sm font-medium transition-colors"
                  >
                    📱 Telegram Group
                  </a>
                  <a
                    href="https://drive.google.com/drive/folders/civil_resources"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-center text-sm font-medium transition-colors"
                  >
                    📁 Drive Resources
                  </a>
                </div>
              </div>

              <div className="glass-card p-6 rounded-2xl border border-border/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                    🧪
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">Biotech Resources</h4>
                    <p className="text-sm text-muted-foreground">Biotechnology Department</p>
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">Lab protocols, research papers, and biotech project resources.</p>
                <div className="flex gap-3">
                  <a
                    href="https://t.me/kiit_biotech_study"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-center text-sm font-medium transition-colors"
                  >
                    📱 Telegram Group
                  </a>
                  <a
                    href="https://drive.google.com/drive/folders/biotech_resources"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-center text-sm font-medium transition-colors"
                  >
                    📁 Drive Resources
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Still Need Help? Section */}
        <div className="mt-16 mb-8">
          <div className="glass-card p-8 rounded-2xl border border-border/50 bg-gradient-to-br from-card/50 to-muted/20 text-center">
            <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-kiit-primary to-kiit-secondary bg-clip-text text-transparent">
              Still Need Help?
            </h3>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed mb-8">
              Can't find what you're looking for? Our AI assistant is here 24/7 to help, or submit a resource request and we'll add it to our collection.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
              <button
                onClick={() => window.location.href = '/chatbot'}
                className="group w-full sm:w-auto bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Bot className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Ask AI Assistant
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => window.open('https://forms.gle/5d89iETDeefruKSX9', '_blank')}
                aria-label="Request Resource Form"
                className="group w-full sm:w-auto bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 hover:from-blue-600 hover:via-cyan-600 hover:to-teal-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Request Resource
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}