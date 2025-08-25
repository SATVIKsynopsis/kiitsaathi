import { useState } from "react";
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
  ArrowLeft
} from "lucide-react";
import { Footer } from "../components/Footer";
import ConfirmationDashboard from '../components/ConfirmationDashboard';
import PaymentComponent from '../components/PaymentComponent';

// Mock data for demonstration
const studyMaterials = {
  notes: [
    {
      id: 1,
      title: "Digital System Design Complete Notes",
      subject: "DSD",
      semester: "4th",
      branch: "CSE",
      uploadedBy: "Rahul S. (Final Year)",
      uploadDate: "2024-01-15",
      views: 1234,
      rating: 4.8,
      pdfUrl: "/api/secure-pdf/dsd-notes.pdf"
    },
    {
      id: 2,
      title: "Mathematics-3 Full Course Notes",
      subject: "M3",
      semester: "3rd",
      branch: "All",
      uploadedBy: "Priya M. (Final Year)",
      uploadDate: "2024-01-10",
      views: 987,
      rating: 4.9,
      pdfUrl: "/api/secure-pdf/m3-notes.pdf"
    },
    {
      id: 3,
      title: "Basic Electronics Fundamentals",
      subject: "Basic Electronics",
      semester: "2nd",
      branch: "All",
      uploadedBy: "Amit K. (Final Year)",
      uploadDate: "2024-01-08",
      views: 756,
      rating: 4.7,
      pdfUrl: "/api/secure-pdf/electronics-notes.pdf"
    },
    {
      id: 4,
      title: "Data Structures and Algorithms",
      subject: "DSA",
      semester: "3rd",
      branch: "CSE",
      uploadedBy: "Sneha P. (Final Year)",
      uploadDate: "2024-01-12",
      views: 1456,
      rating: 4.9,
      pdfUrl: "/api/secure-pdf/dsa-notes.pdf"
    },
    {
      id: 5,
      title: "Operating Systems Complete Guide",
      subject: "OS",
      semester: "4th",
      branch: "CSE",
      uploadedBy: "Vikash M. (Final Year)",
      uploadDate: "2024-01-20",
      views: 1123,
      rating: 4.8,
      pdfUrl: "/api/secure-pdf/os-notes.pdf"
    }
  ],
  pyqs: [
    {
      id: 1,
      title: "DSD End Semester Exam Papers (2020-2023)",
      subject: "DSD",
      semester: "4th",
      branch: "CSE",
      year: "2020-2023",
      uploadedBy: "Student Committee",
      views: 2134,
      pdfUrl: "/api/secure-pdf/dsd-pyqs.pdf"
    },
    {
      id: 2,
      title: "M3 Previous Year Question Papers",
      subject: "M3",
      semester: "3rd",
      branch: "All",
      year: "2019-2023",
      uploadedBy: "Math Club KIIT",
      views: 1876,
      pdfUrl: "/api/secure-pdf/m3-pyqs.pdf"
    },
    {
      id: 3,
      title: "DSA Mid-Sem and End-Sem Papers",
      subject: "DSA",
      semester: "3rd",
      branch: "CSE",
      year: "2021-2023",
      uploadedBy: "CSE Student Body",
      views: 1654,
      pdfUrl: "/api/secure-pdf/dsa-pyqs.pdf"
    }
  ],
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
      link: "https://t.me/kiitcseresources",
      members: "12.5K",
      description: "All CSE study materials and updates"
    },
    {
      id: 2,
      name: "KIIT Mathematics Hub",
      link: "https://t.me/kiitmathshub",
      members: "8.3K",
      description: "Math resources for all branches"
    },
    {
      id: 3,
      name: "KIIT Electronics Corner",
      link: "https://t.me/kiitelectronics",
      members: "6.7K",
      description: "Electronics and communication resources"
    },
    {
      id: 4,
      name: "KIIT Study Group",
      link: "https://t.me/kiitstudygroup",
      members: "15.2K",
      description: "General study discussions and resources"
    }
  ]
};

export default function StudyMaterial() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [activeSection, setActiveSection] = useState("notes");
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [addResourceDialogOpen, setAddResourceDialogOpen] = useState(false);
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);
  const [purchasedService, setPurchasedService] = useState<{ name: string; amount: number } | null>(null);

  const subjects = ["DSD", "M3", "Basic Electronics", "OOPS", "COA", "DBMS"];
  const semesters = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];

  const handleResourceRequest = () => {
    // Assume paid resource request is ₹10
    setRequestDialogOpen(false);
    setPurchasedService({ name: "Study Material Resource Request", amount: 10 });
    setShowPaymentConfirmation(true);
  };

  const handleAddResource = () => {
    alert("Resource submitted for review! It will be available after admin approval.");
    setAddResourceDialogOpen(false);
  };

  const openSecurePdfViewer = (pdfUrl: string) => {
    setSelectedPdf(pdfUrl);
  };

  const filteredNotes = studyMaterials.notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === "all" || note.subject === selectedSubject;
    const matchesSemester = selectedSemester === "all" || note.semester === selectedSemester;
    return matchesSearch && matchesSubject && matchesSemester;
  });

  const filteredPyqs = studyMaterials.pyqs.filter(pyq => {
    const matchesSearch = pyq.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pyq.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === "all" || pyq.subject === selectedSubject;
    const matchesSemester = selectedSemester === "all" || pyq.semester === selectedSemester;
    return matchesSearch && matchesSubject && matchesSemester;
  });

  if (showPaymentConfirmation && purchasedService) {
    return (
      <ConfirmationDashboard
        serviceName={purchasedService.name}
        amount={purchasedService.amount}
        onContinue={() => setShowPaymentConfirmation(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <BookOpen className="w-4 h-4" />
              Study Resources by Seniors
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Study Material Hub
              <span className="block text-2xl lg:text-3xl mt-2">By Seniors, For Students</span>
            </h1>
            
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Access curated notes, PYQs, and resources shared by your seniors. 
              <span className="font-semibold text-green-600"> Because good notes are gold! 📚</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search notes, subjects, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-4">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
              
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Semesters</option>
                {semesters.map(semester => (
                  <option key={semester} value={semester}>{semester} Semester</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section Navigation */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setActiveSection("notes")}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeSection === "notes" 
                  ? "bg-green-500 text-white shadow-lg" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <BookOpen className="w-5 h-5" />
              Study Notes
            </button>
            
            <button
              onClick={() => setActiveSection("pyqs")}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeSection === "pyqs" 
                  ? "bg-green-500 text-white shadow-lg" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <FileQuestion className="w-5 h-5" />
              Previous Year Questions
            </button>
            
            <button
              onClick={() => setActiveSection("playlists")}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeSection === "playlists" 
                  ? "bg-green-500 text-white shadow-lg" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Youtube className="w-5 h-5" />
              YouTube Playlists
            </button>
            
            <button
              onClick={() => setActiveSection("telegram")}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeSection === "telegram" 
                  ? "bg-green-500 text-white shadow-lg" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              Telegram Groups
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => setRequestDialogOpen(true)}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <FileQuestion className="w-5 h-5" />
            Request Resource
          </button>
          
          <button
            onClick={() => setAddResourceDialogOpen(true)}
            className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Resource
          </button>
        </div>

        {/* Notes Section */}
        {activeSection === "notes" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredNotes.map(note => (
              <div key={note.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      {note.subject} • {note.semester} Sem
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-xs text-gray-500">{note.rating}</span>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-green-600 transition-colors">
                    {note.title}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-3 h-3" />
                      <span>By {note.uploadedBy}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      <span>{note.uploadDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-3 h-3" />
                      <span>{note.views} views</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => openSecurePdfViewer(note.pdfUrl)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Notes
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PYQs Section */}
        {activeSection === "pyqs" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredPyqs.map(pyq => (
              <div key={pyq.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {pyq.subject} • {pyq.semester} Sem
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {pyq.year}
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-green-600 transition-colors">
                    {pyq.title}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-3 h-3" />
                      <span>By {pyq.uploadedBy}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-3 h-3" />
                      <span>{pyq.views} views</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => openSecurePdfViewer(pyq.pdfUrl)}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View PYQs
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* YouTube Playlists Section */}
        {activeSection === "playlists" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {studyMaterials.playlists.map(playlist => (
              <div key={playlist.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-24 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Youtube className="w-8 h-8 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-green-600 transition-colors">
                        {playlist.title}
                      </h3>
                      
                      <p className="text-sm text-gray-500 mb-3">
                        {playlist.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                        <span>{playlist.duration}</span>
                        <span>{playlist.subscribers} subscribers</span>
                      </div>
                      
                      <button 
                        onClick={() => window.open(`https://youtube.com/playlist?list=${playlist.youtubeId}`, '_blank')}
                        className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
                      >
                        <Youtube className="w-4 h-4" />
                        Watch Playlist
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Telegram Groups Section */}
        {activeSection === "telegram" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {studyMaterials.telegramGroups.map(group => (
              <div key={group.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                <div className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-lg group-hover:text-green-600 transition-colors">
                        {group.name}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Users className="w-3 h-3" />
                        <span>{group.members} members</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-4">
                    {group.description}
                  </p>
                  
                  <button 
                    onClick={() => window.open(group.link, '_blank')}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Join Group
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="Enter subject name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    <option>Select semester</option>
                    {semesters.map(sem => (
                      <option key={sem} value={sem}>{sem} Semester</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Resource Type</label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    <option>Study Notes</option>
                    <option>Previous Year Questions</option>
                    <option>YouTube Playlist</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Details</label>
                  <textarea className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" rows={3} placeholder="Any specific requirements..."></textarea>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={handleResourceRequest}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Submit Request
                </button>
                <button 
                  onClick={() => setRequestDialogOpen(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors"
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="Resource title" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="Subject name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    <option>Select semester</option>
                    {semesters.map(sem => (
                      <option key={sem} value={sem}>{sem} Semester</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Resource Type</label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    <option>Study Notes</option>
                    <option>Previous Year Questions</option>
                    <option>YouTube Playlist</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">File/Link</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="Upload file or paste link" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" rows={3} placeholder="Brief description of the resource..."></textarea>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={handleAddResource}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Submit Resource
                </button>
                <button 
                  onClick={() => setAddResourceDialogOpen(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PDF Viewer Modal */}
        {selectedPdf && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-4xl w-full h-5/6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">PDF Viewer</h3>
                <button onClick={() => setSelectedPdf(null)}>
                  <X className="w-6 h-6 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
              <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">PDF content would be displayed here</p>
                  <p className="text-sm text-gray-500 mt-2">File: {selectedPdf}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer/>
    </div>
  );
}