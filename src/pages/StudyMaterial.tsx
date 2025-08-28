import { useState, useEffect } from "react";
import { 
  BookOpen, 
  FileQuestion, 
  Youtube, 
  MessageSquare, 
  Search, 
  Plus,
  Eye,
  Star,
  Clock,
  Users,
  ChevronRight,
  X,
  Shield,
  AlertTriangle,
  Loader
} from "lucide-react";
import { createClient } from '@supabase/supabase-js';
import { Footer } from "../components/Footer";

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
  const [activeSection, setActiveSection] = useState("notes");
  const [selectedPdf, setSelectedPdf] = useState<SecurePDFData | null>(null);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [addResourceDialogOpen, setAddResourceDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [notes, setNotes] = useState<StudyMaterial[]>([]);
  const [pyqs, setPyqs] = useState<StudyMaterial[]>([]);
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

  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('pdfs')
          .select('*')
          .eq('type', activeSection === 'notes' ? 'note' : 'pyq');
          
        if (error) {
          setError(error.message);
        } else if (data) {
          const notesData = data.filter(d => d.type === 'note');
          const pyqsData = data.filter(d => d.type === 'pyq');
          setNotes(notesData);
          setPyqs(pyqsData);
        }
      } catch (err: any) {
        setError(`Failed to fetch data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeSection, user]);

  const openSecurePdfViewer = async (pdfId: number) => {
    if (!user) {
      setError("Please login to view PDFs");
      return;
    }

    if (!pdfId) {
      setError("Invalid PDF ID");
      console.error("PDF ID is missing or invalid:", pdfId);
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      // Get current session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setError("Authentication required. Please login again.");
        return;
      }

      const ipAddress = await getUserIP();
      const userAgent = navigator.userAgent;

      console.log('Creating PDF session for PDF ID:', pdfId);
      console.log('User ID:', user.id);
      console.log('IP Address:', ipAddress);

      // Step 1: Create/verify PDF session
      const { data: sessionResponse, error: sessionError } = await supabase.functions.invoke('verify-pdf-session', {
        body: { 
          pdfId, 
          ipAddress, 
          userAgent,
          duration: 1800 // 30 minutes
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        }
      });

      if (sessionError) {
        console.error('Session creation error:', sessionError);
        setError(`Session error: ${sessionError.message}`);
        return;
      }

      if (!sessionResponse?.data?.sessionToken) {
        console.error('Invalid session response:', sessionResponse);
        setError('Failed to create secure session');
        return;
      }

      console.log('Session created successfully:', sessionResponse.data.sessionToken);

      // Step 2: Generate secure PDF URL
      const { data: urlResponse, error: urlError } = await supabase.functions.invoke('gen-secure-pdf-url', {
        body: { 
          sessionToken: sessionResponse.data.sessionToken, 
          ipAddress, 
          userAgent 
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        }
      });

      if (urlError) {
        console.error('URL generation error:', urlError);
        setError(`URL generation error: ${urlError.message}`);
        return;
      }

      if (!urlResponse?.data?.pdfUrl) {
        console.error('Invalid URL response:', urlResponse);
        setError('Failed to generate secure PDF URL');
        return;
      }

      console.log('PDF URL generated successfully');

      // Step 3: Open secure viewer in new window
      const viewerUrl = `/secure-view?pdfUrl=${encodeURIComponent(urlResponse.data.pdfUrl)}&time=${urlResponse.data.timeRemaining}`;
      window.open(viewerUrl, '_blank', 'noopener,noreferrer');

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

  // Filter function for study materials
  const filterMaterials = (materials: StudyMaterial[]) => {
    return materials.filter(item => {
      const matchesSearch = searchQuery === "" || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subject.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSubject = selectedSubject === "all" || item.subject === selectedSubject;
      const matchesSemester = selectedSemester === "all" || item.semester === selectedSemester;
      
      return matchesSearch && matchesSubject && matchesSemester;
    });
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
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 p-6">
        {/* Header and Search Bar */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Study Materials</h1>
          <div className="flex gap-2">
            <button 
              onClick={() => setRequestDialogOpen(true)} 
              className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600"
            >
              <MessageSquare className="w-4 h-4" /> Request
            </button>
            <button 
              onClick={() => setAddResourceDialogOpen(true)} 
              className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 flex gap-4 flex-wrap">
          <input
            type="text"
            placeholder="Search by title or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-64 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Subjects</option>
            <option value="DSD">DSD</option>
            <option value="M3">M3</option>
            <option value="DSA">DSA</option>
          </select>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Semesters</option>
            {semesters.map((s) => (
              <option key={s} value={s.toString()}>{s} Semester</option>
            ))}
          </select>
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-4">
          <button
            onClick={() => setActiveSection("notes")}
            className={`px-4 py-2 ${activeSection === "notes" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500 hover:text-gray-700"}`}
          >
            <BookOpen className="inline w-4 h-4 mr-2" /> Notes
          </button>
          <button
            onClick={() => setActiveSection("pyqs")}
            className={`px-4 py-2 ${activeSection === "pyqs" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500 hover:text-gray-700"}`}
          >
            <FileQuestion className="inline w-4 h-4 mr-2" /> PYQs
          </button>
          <button
            onClick={() => setActiveSection("playlists")}
            className={`px-4 py-2 ${activeSection === "playlists" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500 hover:text-gray-700"}`}
          >
            <Youtube className="inline w-4 h-4 mr-2" /> Playlists
          </button>
          <button
            onClick={() => setActiveSection("groups")}
            className={`px-4 py-2 ${activeSection === "groups" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500 hover:text-gray-700"}`}
          >
            <Users className="inline w-4 h-4 mr-2" /> Groups
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError("")} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-8">
            <Loader className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        )}

        {/* Content */}
        {!loading && (
          <div className="space-y-4">
            {activeSection === "notes" && filterMaterials(notes).map((item) => (
              <div key={item.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                      <span>Subject: <span className="font-medium">{item.subject}</span></span>
                      <span>Semester: <span className="font-medium">{item.semester}</span></span>
                      <span>Uploaded by: <span className="font-medium">{item.uploaded_by}</span></span>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" /> {item.views || 0} views
                      </span>
                      {item.rating && (
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4" /> {item.rating}
                        </span>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => openSecurePdfViewer(item.pdf_id)} 
                    disabled={loading}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    Secure View
                  </button>
                </div>
              </div>
            ))}

            {activeSection === "pyqs" && filterMaterials(pyqs).map((item) => (
              <div key={item.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                      <span>Subject: <span className="font-medium">{item.subject}</span></span>
                      <span>Semester: <span className="font-medium">{item.semester}</span></span>
                      <span>Uploaded by: <span className="font-medium">{item.uploaded_by}</span></span>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" /> {item.views || 0} views
                      </span>
                      {item.rating && (
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4" /> {item.rating}
                        </span>
                      )}
                    </div>
                  </div>
                   
                  <button 
                    onClick={() => openSecurePdfViewer(item.pdf_id)} 
                    disabled={loading}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    Secure View
                  </button>
                </div>
              </div>
            ))}

            {activeSection === "playlists" && studyMaterials.playlists.map((item) => (
              <div key={item.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                <div className="flex gap-4 text-sm text-gray-500 mb-3">
                  <span>Subject: <span className="font-medium">{item.subject}</span></span>
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
                  className="text-red-600 hover:text-red-700 inline-flex items-center gap-1 font-medium"
                >
                  <Youtube className="w-4 h-4" />
                  View Playlist 
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            ))}

            {activeSection === "groups" && studyMaterials.telegramGroups.map((item) => (
              <div key={item.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-lg mb-3">{item.name}</h3>
                <a 
                  href={item.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 font-medium"
                >
                  <MessageSquare className="w-4 h-4" />
                  Join Group 
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            ))}

            {/* Empty State */}
            {((activeSection === "notes" && filterMaterials(notes).length === 0) ||
              (activeSection === "pyqs" && filterMaterials(pyqs).length === 0)) && (
              <div className="text-center py-12 text-gray-500">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No materials found</p>
                <p>Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        )}

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
      </div>
      <Footer />
    </div>
  );
}