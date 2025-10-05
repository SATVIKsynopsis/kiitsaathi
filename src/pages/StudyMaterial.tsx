import { useState } from "react";
import { 
  BookOpen, 
  FileQuestion, 
  Youtube, 
  MessageSquare, 
  Search, 
  Filter,
  Plus,
  Download,
  Eye,
  Star,
  Clock,
  Users,
  ChevronRight,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

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
    }
  ]
};

export default function StudyMaterial() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [selectedResourceType, setSelectedResourceType] = useState("all");
  const [activeSection, setActiveSection] = useState("notes");
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [addResourceDialogOpen, setAddResourceDialogOpen] = useState(false);

  const subjects = ["DSD", "M3", "Basic Electronics", "OOPS", "COA", "DBMS"];
  const semesters = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];

  const handleResourceRequest = () => {
    toast.success("Resource request submitted! We'll notify you when it's available.");
    setRequestDialogOpen(false);
  };

  const handleAddResource = () => {
    toast.success("Resource submitted for review! It will be available after admin approval.");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-kiit-green-soft to-white">
      <Navbar />
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 glass-card px-4 py-2 text-sm font-medium text-kiit-green-dark mb-4">
              <BookOpen className="w-4 h-4" />
              Study Resources by Seniors
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-poppins font-bold text-gradient mb-4">
              Study Material Hub
              <span className="block text-2xl lg:text-3xl">By Seniors, For Students</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Access curated notes, PYQs, and resources shared by your seniors. 
              <span className="font-semibold text-kiit-green"> Because good notes are gold! 📚</span>
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="container mx-auto px-4 py-6">
        <div className="glass-card p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by subject or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-3">
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Semesters</SelectItem>
                  {semesters.map(sem => (
                    <SelectItem key={sem} value={sem}>{sem}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: "notes", label: "📘 Notes", icon: BookOpen },
            { id: "pyqs", label: "❓ PYQs", icon: FileQuestion },
            { id: "playlists", label: "🎥 YouTube", icon: Youtube },
            { id: "telegram", label: "💬 Telegram", icon: MessageSquare }
          ].map(section => (
            <Button
              key={section.id}
              variant={activeSection === section.id ? "default" : "outline"}
              onClick={() => setActiveSection(section.id)}
              className="flex items-center gap-2"
            >
              <section.icon className="w-4 h-4" />
              {section.label}
            </Button>
          ))}
        </div>

        {/* Notes Section */}
        {activeSection === "notes" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredNotes.map(note => (
              <Card key={note.id} className="group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="secondary" className="text-xs">
                      {note.subject} • {note.semester} Sem
                    </Badge>
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-3 h-3 fill-current" />
                      <span className="text-xs">{note.rating}</span>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-kiit-green transition-colors">
                    {note.title}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-3 h-3" />
                      <span>By {note.uploadedBy}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-3 h-3" />
                      <span>{note.views} views</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      <span>{note.uploadDate}</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => openSecurePdfViewer(note.pdfUrl)}
                    className="w-full group-hover:bg-kiit-green group-hover:text-white transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Notes
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* PYQs Section */}
        {activeSection === "pyqs" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredPyqs.map(pyq => (
              <Card key={pyq.id} className="group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="secondary" className="text-xs">
                      {pyq.subject} • {pyq.semester} Sem
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {pyq.year}
                    </Badge>
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-kiit-green transition-colors">
                    {pyq.title}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-3 h-3" />
                      <span>By {pyq.uploadedBy}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-3 h-3" />
                      <span>{pyq.views} views</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => openSecurePdfViewer(pyq.pdfUrl)}
                    className="w-full group-hover:bg-kiit-green group-hover:text-white transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View PYQs
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* YouTube Playlists Section */}
        {activeSection === "playlists" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {studyMaterials.playlists.map(playlist => (
              <Card key={playlist.id} className="group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-24 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Youtube className="w-8 h-8 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-kiit-green transition-colors">
                        {playlist.title}
                      </h3>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        {playlist.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                        <span>{playlist.duration}</span>
                        <span>{playlist.subscribers} subscribers</span>
                      </div>
                      
                      <Button 
                        onClick={() => window.open(`https://youtube.com/playlist?list=${playlist.youtubeId}`, '_blank')}
                        variant="outline"
                        className="group-hover:bg-red-500 group-hover:text-white group-hover:border-red-500 transition-colors"
                      >
                        <Youtube className="w-4 h-4 mr-2" />
                        Watch Playlist
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Telegram Groups Section */}
        {activeSection === "telegram" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {studyMaterials.telegramGroups.map(group => (
              <Card key={group.id} className="group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-lg group-hover:text-kiit-green transition-colors">
                        {group.name}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="w-3 h-3" />
                        <span>{group.members} members</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    {group.description}
                  </p>
                  
                  <Button 
                    onClick={() => window.open(group.link, '_blank')}
                    className="w-full group-hover:bg-blue-500 group-hover:text-white transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Join Group
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3">
        <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="bg-gradient-to-r from-kiit-green to-campus-blue text-white shadow-lg">
              <Plus className="w-5 h-5 mr-2" />
              Request Resource
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request a Study Resource</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Subject/Topic</Label>
                <Input placeholder="e.g., Data Structures, M3 Integration" />
              </div>
              <div>
                <Label>Resource Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="notes">Notes</SelectItem>
                    <SelectItem value="pyqs">Previous Year Questions</SelectItem>
                    <SelectItem value="playlist">YouTube Playlist</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Additional Details</Label>
                <Textarea placeholder="Any specific requirements or details..." />
              </div>
              <Button onClick={handleResourceRequest} className="w-full">
                Submit Request
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={addResourceDialogOpen} onOpenChange={setAddResourceDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="lg" className="shadow-lg bg-white">
              <BookOpen className="w-5 h-5 mr-2" />
              Add Resource
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share a Study Resource</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Resource Title</Label>
                <Input placeholder="e.g., Complete DSD Notes" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Subject</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(subject => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Semester</Label>
                  <Select>
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
              </div>
              <div>
                <Label>Upload File</Label>
                <Input type="file" accept=".pdf" />
              </div>
              <div>
                <Label>Your Name & Year</Label>
                <Input placeholder="e.g., Rahul S. (Final Year)" />
              </div>
              <Button onClick={handleAddResource} className="w-full">
                Submit for Review
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Secure PDF Viewer Modal */}
      <Dialog open={!!selectedPdf} onOpenChange={() => setSelectedPdf(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <div className="flex items-center justify-between">
              <DialogTitle>Study Material Viewer</DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedPdf(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="p-6 pt-0">
            <div className="bg-muted rounded-lg p-8 text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Secure PDF Viewer</h3>
              <p className="text-muted-foreground mb-4">
                This is where the secure PDF viewer would be integrated.
                PDFs will be displayed with no download/print/share options.
              </p>
              <Badge variant="outline">Protected Content</Badge>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  );
}