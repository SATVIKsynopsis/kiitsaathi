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
  File
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { FilterBar } from "@/components/study-materials/FilterBar";
import { DataTable } from "@/components/study-materials/DataTable";
import { TabNavigation } from "@/components/study-materials/TabNavigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { semesters, years,semesterSubjects } from "@/data/studyMaterials";


// Types
interface StudyMaterialItem {
  id: number;
  title: string;
  subject: string;
  semester: string;
  branch?: string;
  year?: string;
  type?: 'note' | 'pyq' | 'ppt';
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
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
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
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Study Materials</h1>
            <p className="text-muted-foreground">Access notes, previous year questions, presentations, and study resources</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setRequestDialogOpen(true)} 
              className="bg-kiit-secondary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-kiit-secondary/90 transition-colors shadow-md hover:shadow-lg"
            >
              <MessageSquare className="w-4 h-4" /> Request Resource
            </button>
            
          </div>
        </div>

        {/* Tab Navigation */}
        <TabNavigation 
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError("")} className="ml-auto hover:opacity-70">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Content */}
        {(activeSection === "notes" || activeSection === "pyqs" || activeSection === "ppts") && (
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

            {/* Loading */}
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader className="w-8 h-8 animate-spin text-kiit-primary" />
              </div>
            ) : (
              <DataTable
                materials={filterMaterials(materials)}
                onViewPDF={handleView}
                loading={loading}
                materialType={activeSection as "notes" | "pyqs" | "ppts"}
                onDownload={handleDownload}
              />
            )}
          </>
        )}

        {/* Playlists Section */}
        {activeSection === "playlists" && (
          <div className="text-center py-12">
            <Youtube className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">YouTube Playlists</h3>
            <p className="text-muted-foreground">Coming soon - curated study playlists</p>
          </div>
        )}

        {/* Groups Section */}
        {activeSection === "groups" && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Study Groups</h3>
            <p className="text-muted-foreground">Coming soon - collaborative study groups</p>
          </div>
        )}
      </div>

      {/* Request Dialog */}
      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Resource</DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <File className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Request Study Material</h3>
            <p className="text-muted-foreground mb-4">
              Need specific study materials? Contact us and we'll try to add them.
            </p>
            <Button onClick={() => {
              window.open('mailto:contact@kiitsaathi.com?subject=Study Material Request', '_blank');
              setRequestDialogOpen(false);
            }}>
              Send Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}