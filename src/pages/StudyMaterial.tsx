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
  Star,
  Eye
} from "lucide-react";
import { createClient } from '@supabase/supabase-js';
import { Footer } from "../components/Footer";
import { FilterBar } from "@/components/study-materials/FilterBar";
import { DataTable } from "@/components/study-materials/DataTable";
import { TabNavigation } from "@/components/study-materials/TabNavigation";
import { dummyStudyMaterials, subjects, semesters, years, StudyMaterialItem } from "@/data/studyMaterials";

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY!
);

// Types
interface SecurePDFData {
  pdfUrl: string;
  filename: string;
  timeRemaining: number;
  expiresAt: string;
  sessionId: string;
  pdfId: number;
  title?: string;
}

interface StudyMaterial {
  id: number;
  pdf_id: number;
  title: string;
  subject: string;
  semester: string;
  branch: string;
  uploaded_by: string;
  upload_date?: string;
  views: number;
  rating?: number;
  year?: string;
  type: string;
  file_path: string;
  upload_user_id: string;
  max_session_duration: number;
  is_active: boolean;
}

export default function StudyMaterial() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [activeSection, setActiveSection] = useState("notes");
  const [selectedPdf, setSelectedPdf] = useState<SecurePDFData | null>(null);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [addResourceDialogOpen, setAddResourceDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [user, setUser] = useState<any>(null);

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

  // Hardcoded playlists and telegram groups (unchanged)
  const studyMaterials = {
    playlists: [
      {
        id: 1,
        title: "Complete DSD Course by Gate Lectures",
        subject: "DSD",
        youtubeId: "PLBlnK6fEyqRjMH3mWf6kwqiTbT798eAOm",
        duration: "45 hours",
        subscribers: "1.2M",
        description: "Comprehensive digital system design course covering all topics"
      },
      {
        id: 2,
        title: "Mathematics-3 Full Playlist",
        subject: "M3",
        youtubeId: "PLU6SqdYcYsfI4IJGfYN65_rdJgSfVtEt6",
        duration: "32 hours",
        subscribers: "800K",
        description: "Complete M3 coverage with solved examples"
      },
      {
        id: 3,
        title: "Data Structures Masterclass",
        subject: "DSA",
        youtubeId: "PLmjdcKkCqsVFqe-CxnvKOyKGLKg-Qz0Qa",
        duration: "40 hours",
        subscribers: "900K",
        description: "Master data structures with practical examples"
      }
    ],
    telegramGroups: [
      {
        id: 1,
        name: "KIIT CSE Resources",
        link: "https://t.me/kiitcseresources"
      }
    ]
  };

  // Filter function for study materials
  const filterMaterials = (materials: StudyMaterialItem[]) => {
    return materials.filter(item => {
      const matchesSearch = searchQuery === "" || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subject.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSubject = selectedSubject === "all" || item.subject === selectedSubject;
      const matchesSemester = selectedSemester === "all" || item.semester === selectedSemester;
      const matchesYear = selectedYear === "all" || item.year === selectedYear;
      
      return matchesSearch && matchesSubject && matchesSemester && matchesYear;
    });
  };

  // Get filtered materials for current section
  const getCurrentMaterials = () => {
    const filteredMaterials = dummyStudyMaterials.filter(item => item.type === (activeSection === 'notes' ? 'note' : 'pyq'));
    return filterMaterials(filteredMaterials);
  };

  // Handle PDF viewing (using the existing secure viewer logic)
  const handleViewPDF = (id: number) => {
    // Find the material by id and use its pdf_id if available
    const material = dummyStudyMaterials.find(m => m.id === id);
    if (material) {
      // For now, just show an alert since we're using dummy data
      alert(`Opening PDF: ${material.title}\nThis will be connected to secure PDF viewer once real data is available.`);
      // In the future: openSecurePdfViewer(material.pdf_id);
    }
  };

const openSecurePdfViewer = async (pdfId: number) => {
  if (!user) {
    setError("Please login to view PDFs");
    return;
  }

  if (!pdfId) {
    setError("Invalid PDF ID");
    return;
  }

  setLoading(true);
  setError("");
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      setError("Authentication required. Please login again.");
      return;
    }

    const ipAddress = await getUserIP();
    const userAgent = navigator.userAgent;

    // Fixed function call - let Supabase client handle JSON serialization
    const { data: sessionResponse, error: sessionError } = await supabase.functions.invoke('verify-pdf-session', {
      body: {  
        pdfId: pdfId,
        ipAddress: ipAddress,
        userAgent: userAgent,
        duration: 1800
      }
    });

    if (sessionError) {
      console.error('Session creation error:', sessionError);
      setError(`Session error: ${sessionError.message}`);
      return;
    }

    if (!sessionResponse?.success || !sessionResponse?.data?.sessionToken) {
      console.error('Invalid session response:', sessionResponse);
      setError('Failed to create secure session');
      return;
    }

    // Generate PDF URL
    const { data: urlResponse, error: urlError } = await supabase.functions.invoke('gen-secure-pdf-url', {
  body: {
    sessionToken: sessionResponse.data.sessionToken,
    ipAddress: ipAddress,
    userAgent: userAgent
  }
});

console.log('gen-secure-pdf-url response:', { urlResponse, urlError });

    if (urlError) {
      console.error('URL generation error:', urlError);
      setError(`URL generation error: ${urlError.message}`);
      return;
    }

    if (!urlResponse?.success || !urlResponse?.data?.pdfUrl) {
      console.error('Invalid URL response:', urlResponse);
      setError('Failed to generate secure PDF URL');
      return;
    }

    // Open secure viewer
    const viewerUrl = `/secure-view?pdfUrl=${encodeURIComponent(urlResponse.data.pdfUrl)}&time=${urlResponse.data.timeRemaining}`;
    const newWindow = window.open(viewerUrl, '_blank', 'noopener,noreferrer');
    
    if (!newWindow) {
      setError('Please allow popups to view the PDF');
    }

  } catch (err: any) {
    console.error('Error in openSecurePdfViewer:', err);
    setError(`Error: ${err.message}`);
  } finally {
    setLoading(false);
  }
};

  // Get user IP address
  const getUserIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || "127.0.0.1";
    } catch (error) {
      console.warn('Failed to get IP address:', error);
      return "127.0.0.1";
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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Study Materials</h1>
            <p className="text-muted-foreground">Access notes, previous year questions, and study resources</p>
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
        {(activeSection === "notes" || activeSection === "pyqs") && (
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
              subjects={subjects}
              semesters={semesters}
              years={years}
            />

            {/* Loading */}
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader className="w-8 h-8 animate-spin text-kiit-primary" />
              </div>
            ) : (
              /* Data Table */
              <DataTable
                materials={getCurrentMaterials()}
                onViewPDF={handleViewPDF}
                loading={loading}
              />
            )}
          </>
        )}

        {/* Playlists Section */}
        {activeSection === "playlists" && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {studyMaterials.playlists.map((item) => (
              <div key={item.id} className="glass-card p-6 hover:shadow-lg transition-all hover-lift">
                <h3 className="font-semibold text-lg mb-3 text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-4">
                  <span className="bg-accent px-2 py-1 rounded">
                    Subject: <span className="font-medium">{item.subject}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> {item.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" /> {item.subscribers}
                  </span>
                </div>
                <a 
                  href={`https://www.youtube.com/playlist?list=${item.youtubeId}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-medium"
                >
                  <Youtube className="w-4 h-4" />
                  View Playlist 
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Groups Section */}
        {activeSection === "groups" && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {studyMaterials.telegramGroups.map((item) => (
              <div key={item.id} className="glass-card p-6 hover:shadow-lg transition-all hover-lift">
                <h3 className="font-semibold text-lg mb-4 text-foreground">{item.name}</h3>
                <a 
                  href={item.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  <MessageSquare className="w-4 h-4" />
                  Join Group
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Request Dialog */}
        {requestDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Request Resource</h3>
                <button onClick={() => setRequestDialogOpen(false)}>
                  <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
              <div className="space-y-4">
                <input type="text" placeholder="Title" className="w-full px-3 py-2 border rounded-lg" />
                <input type="text" placeholder="Subject" className="w-full px-3 py-2 border rounded-lg" />
                <select className="w-full px-3 py-2 border rounded-lg">
                  <option>Select Semester</option>
                  {semesters.map(s => <option key={s} value={s}>{s} Semester</option>)}
                </select>
                <select className="w-full px-3 py-2 border rounded-lg">
                  <option>Study Notes</option>
                  <option>PYQs</option>
                  <option>YouTube Playlist</option>
                </select>
                <textarea placeholder="Additional details" rows={3} className="w-full px-3 py-2 border rounded-lg"></textarea>
              </div>
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => { alert("Request submitted!"); setRequestDialogOpen(false); }} 
                  className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
                >
                  Submit
                </button>
                <button 
                  onClick={() => setRequestDialogOpen(false)} 
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Resource Dialog */}
        {addResourceDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Add Resource</h3>
                <button onClick={() => setAddResourceDialogOpen(false)}>
                  <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
              <div className="space-y-4">
                <input type="text" placeholder="Title" className="w-full px-3 py-2 border rounded-lg" />
                <input type="text" placeholder="Subject" className="w-full px-3 py-2 border rounded-lg" />
                <select className="w-full px-3 py-2 border rounded-lg">
                  <option>Select Semester</option>
                  {semesters.map(s => <option key={s} value={s}>{s} Semester</option>)}
                </select>
                <select className="w-full px-3 py-2 border rounded-lg">
                  <option>Study Notes</option>
                  <option>PYQs</option>
                  <option>YouTube Playlist</option>
                </select>
                <input type="file" accept=".pdf" className="w-full px-3 py-2 border rounded-lg" />
                <textarea placeholder="Description" rows={3} className="w-full px-3 py-2 border rounded-lg"></textarea>
              </div>
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => { alert("Resource submitted for review!"); setAddResourceDialogOpen(false); }} 
                  className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
                >
                  Submit
                </button>
                <button 
                  onClick={() => setAddResourceDialogOpen(false)} 
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      <Footer />
    </div>
  );
}
