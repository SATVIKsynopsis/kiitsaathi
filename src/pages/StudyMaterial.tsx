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
import { semesters, years } from "@/data/studyMaterials";

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

  // Handle file upload
  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please login to upload files");
      return;
    }

    if (!uploadForm.file || !uploadForm.title || !uploadForm.subject || !uploadForm.semester || !uploadForm.branch) {
      toast.error("Please fill all required fields");
      return;
    }

    // Validate file type based on active section
    const allowedTypes = activeSection === "ppts" 
      ? ['.pptx', '.pdf'] 
      : ['.pdf'];
    
    const fileExtension = uploadForm.file.name.toLowerCase().substring(uploadForm.file.name.lastIndexOf('.'));
    
    if (!allowedTypes.includes(fileExtension)) {
      if (activeSection === "ppts") {
        toast.error("Only .pptx and .pdf files are allowed in PPTs section.");
      } else {
        toast.error("Only .pdf files are allowed.");
      }
      return;
    }

    setUploading(true);

    try {
      // Upload file to storage
      const fileName = `${Date.now()}_${uploadForm.file.name}`;
      const bucketName = activeSection === "ppts" ? "ppts" : "study-materials";
      
      // Set correct content type for PPTX files
      const contentType = fileExtension === '.pptx' 
        ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        : 'application/pdf';

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, uploadForm.file, {
          contentType,
          upsert: true
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        toast.error("Failed to upload file");
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      // Save to database
      const dbData = {
        title: uploadForm.title,
        subject: uploadForm.subject,
        semester: uploadForm.semester,
        branch: uploadForm.branch,
        year: uploadForm.year || new Date().getFullYear().toString(),
        uploaded_by: user.email || "Anonymous",
        user_id: user.id,
        views: 0
      };

      if (activeSection === "ppts") {
        await supabase.from("ppts").insert({
          ...dbData,
          ppt_url: publicUrl
        });
      } else if (activeSection === "notes") {
        await supabase.from("notes").insert({
          ...dbData,
          pdf_url: publicUrl
        });
      } else if (activeSection === "pyqs") {
        await supabase.from("pyqs").insert({
          ...dbData,
          pdf_url: publicUrl
        });
      }

      toast.success("File uploaded successfully!");
      setAddResourceDialogOpen(false);
      setUploadForm({
        title: "",
        subject: "",
        semester: "",
        branch: "",
        year: "",
        file: null
      });
      
      // Refresh materials
      window.location.reload();
      
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
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
            <button 
              onClick={() => setAddResourceDialogOpen(true)} 
              className="bg-kiit-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-kiit-primary/90 transition-colors shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4" /> Add Resource
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
              subjects={[]}
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
                onViewPDF={(id) => console.log("View PDF", id)}
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

      {/* Upload Dialog */}
      <Dialog open={addResourceDialogOpen} onOpenChange={setAddResourceDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload {activeSection === "ppts" ? "PPT" : activeSection === "notes" ? "Notes" : "PYQ"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFileUpload} className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={uploadForm.title}
                onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter title"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={uploadForm.subject}
                onChange={(e) => setUploadForm(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Enter subject"
                required
              />
            </div>

            <div>
              <Label htmlFor="semester">Semester *</Label>
              <Select value={uploadForm.semester} onValueChange={(value) => setUploadForm(prev => ({ ...prev, semester: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map(sem => (
                    <SelectItem key={sem} value={sem}>{sem}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="branch">Branch *</Label>
              <Input
                id="branch"
                value={uploadForm.branch}
                onChange={(e) => setUploadForm(prev => ({ ...prev, branch: e.target.value }))}
                placeholder="Enter branch (e.g., CSE, ECE)"
                required
              />
            </div>

            <div>
              <Label htmlFor="year">Year</Label>
              <Select value={uploadForm.year} onValueChange={(value) => setUploadForm(prev => ({ ...prev, year: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="file">
                File * {activeSection === "ppts" ? "(.pptx, .pdf)" : "(.pdf)"}
              </Label>
              <Input
                id="file"
                type="file"
                accept={activeSection === "ppts" ? ".pptx,.pdf" : ".pdf"}
                onChange={(e) => setUploadForm(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                required
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setAddResourceDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={uploading}>
                {uploading ? <Loader className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

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