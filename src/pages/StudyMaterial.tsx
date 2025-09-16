// StudyMaterial.tsx
import { useState, useEffect } from "react";
import { 
  Plus,
  MessageSquare,
  X,
  Youtube,
  ChevronRight,
  Clock,
  Users,
} from "lucide-react";
import { createClient } from '@supabase/supabase-js';
import { DataTable } from "@/components/study-materials/DataTable";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { FilterBar } from "@/components/study-materials/FilterBar";
import { TabNavigation } from "@/components/study-materials/TabNavigation";
import { Button } from "@/components/ui/button";
import { supabase } from '@/supabaseClient'; 

interface StudyMaterial {
  id: number;
  title: string;
  subject: string;
  semester: string;
  branch: string;
  year?: string; 
  uploaded_by: string;
  upload_date?: string; 
  views: number;
  rating?: number; 
  pdf_url: string;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

interface StudyMaterialItem {
  id: number;
  title: string;
  subject: string;
  semester: string;
  year?: string; // Optional
  views: number;
  uploadedBy: string;
  uploadDate?: string; // Optional
  pdfUrl: string; // Replace downloadUrl
  rating?: number; // Optional
}

const StudyMaterial: React.FC = () => {
  const [notes, setNotes] = useState<StudyMaterialItem[]>([]);
  const [pyqs, setPyqs] = useState<StudyMaterialItem[]>([]);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [addResourceDialogOpen, setAddResourceDialogOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("notes");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [semesters, setSemesters] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);

  const staticContent = {
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch notes
        const { data: notesData, error: notesError } = await supabase
          .from('notes')
          .select('id, title, subject, semester, branch, uploaded_by, upload_date, views, rating, pdf_url, user_id, created_at, updated_at')
          .order('created_at', { ascending: false });

        if (notesError) throw notesError;

        const transformedNotes = notesData.map(item => ({
          id: item.id,
          title: item.title || 'Untitled',
          subject: item.subject || 'General',
          semester: item.semester || 'N/A',
          branch: item.branch || 'N/A',
          year: undefined, // No year in notes
          views: item.views || 0,
          uploadedBy: item.uploaded_by || 'Anonymous',
          uploadDate: item.upload_date ? item.upload_date.toString() : item.created_at, // Convert date to string
          pdfUrl: item.pdf_url,
          rating: item.rating || undefined, // Include rating if present
        }));
        setNotes(transformedNotes);

        // Fetch pyqs
        const { data: pyqsData, error: pyqsError } = await supabase
          .from('pyqs')
          .select('id, title, subject, semester, branch, year, uploaded_by, views, pdf_url, user_id, created_at, updated_at')
          .order('created_at', { ascending: false });

        if (pyqsError) throw pyqsError;

        const transformedPyqs = pyqsData.map(item => ({
          id: item.id,
          title: item.title || 'Untitled',
          subject: item.subject || 'General',
          semester: item.semester || 'N/A',
          branch: item.branch || 'N/A',
          year: item.year || undefined,
          views: item.views || 0,
          uploadedBy: item.uploaded_by || 'Anonymous',
          uploadDate: item.created_at, // Use created_at for pyqs
          pdfUrl: item.pdf_url,
          rating: undefined, // No rating in pyqs
        }));
        setPyqs(transformedPyqs);

        // Update filter options from both datasets
        const allData = [...notesData, ...pyqsData];
        const uniqueSubjects = [...new Set(allData.map(item => item.subject || 'General'))];
        const uniqueSemesters = [...new Set(allData.map(item => item.semester || 'N/A'))];
        const uniqueYears = [...new Set(allData.map(item => item.year || 'N/A'))];
        setSubjects(['all', ...uniqueSubjects]);
        setSemesters(['all', ...uniqueSemesters]);
        setYears(['all', ...uniqueYears.filter(y => y !== 'N/A')]); // Filter out 'N/A' for years
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };
    fetchData();
  }, []);

  const handleViewPDF = async (id: number) => {
    console.log(`Viewing PDF with id: ${id}`);
  };

  const getFilteredMaterials = () => {
    const data = activeSection === "notes" ? notes : pyqs;
    return data.filter(material => 
      material.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedSubject === "all" || material.subject === selectedSubject) &&
      (selectedSemester === "all" || material.semester === selectedSemester) &&
      (selectedYear === "all" || (material.year && material.year === selectedYear))
    );
  };

  const filteredMaterials = getFilteredMaterials();

  return (
    <div className="p-4">
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
      <TabNavigation activeSection={activeSection} setActiveSection={setActiveSection} />
      
      <div className="mb-4">
        <Button onClick={() => setRequestDialogOpen(true)} className="mr-2">
          <Plus className="w-4 h-4 mr-2" /> Request Note
        </Button>
        <Button onClick={() => setAddResourceDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Resource
        </Button>
      </div>

      {activeSection === "notes" && (
        <DataTable materials={filteredMaterials} onViewPDF={handleViewPDF} />
      )}
      {activeSection === "pyqs" && (
        <DataTable materials={filteredMaterials} onViewPDF={handleViewPDF} />
      )}

      {activeSection === "playlists" && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {staticContent.playlists.map((item) => (
            <div key={item.id} className="p-4 border rounded">
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-sm">{item.description}</p>
              <div className="flex gap-2 text-sm">
                <span>Subject: {item.subject}</span>
                <span><Clock className="w-4 h-4" /> {item.duration}</span>
                <span><Users className="w-4 h-4" /> {item.subscribers}</span>
              </div>
              <a href={`https://www.youtube.com/playlist?list=${item.youtubeId}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-red-500 text-white px-2 py-1 rounded">
                <Youtube className="w-4 h-4" /> View Playlist
              </a>
            </div>
          ))}
        </div>
      )}

      {activeSection === "groups" && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {staticContent.telegramGroups.map((item) => (
            <div key={item.id} className="p-4 border rounded">
              <h3 className="font-semibold">{item.name}</h3>
              <a href={item.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-blue-500 text-white px-2 py-1 rounded">
                <MessageSquare className="w-4 h-4" /> Join Group
              </a>
            </div>
          ))}
        </div>
      )}

      {requestDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded p-4 max-w-md w-full">
            <div className="flex justify-between mb-2">
              <h3 className="font-semibold">Request Resource</h3>
              <button onClick={() => setRequestDialogOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-2">
              <input type="text" placeholder="Title" className="w-full p-2 border rounded" />
              <input type="text" placeholder="Subject" className="w-full p-2 border rounded" />
              <select className="w-full p-2 border rounded">
                <option>Select Semester</option>
              </select>
              <select className="w-full p-2 border rounded">
                <option>Study Notes</option>
                <option>PYQs</option>
                <option>YouTube Playlist</option>
              </select>
              <textarea placeholder="Additional details" rows={3} className="w-full p-2 border rounded"></textarea>
            </div>
            <div className="flex gap-2 mt-2">
              <button onClick={() => { alert("Request submitted!"); setRequestDialogOpen(false); }} className="flex-1 bg-green-500 text-white p-2 rounded">
                Submit
              </button>
              <button onClick={() => setRequestDialogOpen(false)} className="flex-1 bg-gray-200 p-2 rounded">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {addResourceDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded p-4 max-w-md w-full">
            <div className="flex justify-between mb-2">
              <h3 className="font-semibold">Add Resource</h3>
              <button onClick={() => setAddResourceDialogOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-2">
              <input type="text" placeholder="Title" className="w-full p-2 border rounded" />
              <input type="text" placeholder="Subject" className="w-full p-2 border rounded" />
              <select className="w-full p-2 border rounded">
                <option>Select Semester</option>
              </select>
              <select className="w-full p-2 border rounded">
                <option>Study Notes</option>
                <option>PYQs</option>
                <option>YouTube Playlist</option>
              </select>
              <input type="file" accept=".pdf" className="w-full p-2 border rounded" />
              <textarea placeholder="Description" rows={3} className="w-full p-2 border rounded"></textarea>
            </div>
            <div className="flex gap-2 mt-2">
              <button onClick={() => { alert("Resource submitted!"); setAddResourceDialogOpen(false); }} className="flex-1 bg-green-500 text-white p-2 rounded">
                Submit
              </button>
              <button onClick={() => setAddResourceDialogOpen(false)} className="flex-1 bg-gray-200 p-2 rounded">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default StudyMaterial;