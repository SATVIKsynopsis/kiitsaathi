import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ResumeForm } from "./ResumeForm";
import { TemplatePreview } from "./TemplatePreview";
import { PdfGenerator } from "./PdfGenerator";
import { Loader3D } from "./Loader3D";
import { SuggestionsPanel } from "./SuggestionsPanel";
import { ResumeHistoryList } from "./ResumeHistoryList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, History, Plus, Star, Zap } from "lucide-react";

export interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    city: string;
    linkedin?: string;
    portfolio?: string;
  };
  summary: string;
  education: Array<{
    degree: string;
    institution: string;
    startDate: string;
    endDate: string;
    cgpa?: string;
  }>;
  experience: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    bullets: string[];
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    link?: string;
  }>;
  skills: {
    technical: string[];
    soft: string[];
  };
  certifications: string[];
  awards: string[];
  languages: string[];
  interests: string[];
}

type ViewMode = 'form' | 'loading' | 'preview' | 'history';

const ResumeSaathi = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>('form');
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [atsScore, setAtsScore] = useState<number>(0);
  const [dailyDownloads, setDailyDownloads] = useState(0);
  const [editingResumeId, setEditingResumeId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?redirect=/resume-saathi');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchDailyDownloads();
    }
  }, [user]);

  const fetchDailyDownloads = async () => {
    if (!user) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('resume_downloads_daily')
        .select('downloads')
        .eq('user_id', user.id)
        .eq('day', today)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching downloads:', error);
        return;
      }

      setDailyDownloads(data?.downloads || 0);
    } catch (error) {
      console.error('Error fetching daily downloads:', error);
    }
  };

  const handleFormSubmit = (data: ResumeData, template: string) => {
    setResumeData(data);
    setSelectedTemplate(template);
    setViewMode('loading');
    
    // Show loader for minimum 4 seconds
    setTimeout(() => {
      const score = calculateAtsScore(data);
      setAtsScore(score);
      setViewMode('preview');
    }, 4000);
  };

  const calculateAtsScore = (data: ResumeData): number => {
    let score = 0;
    
    // Contact info (20 points)
    if (data.personalInfo.fullName) score += 5;
    if (data.personalInfo.email) score += 5;
    if (data.personalInfo.phone) score += 5;
    if (data.personalInfo.linkedin || data.personalInfo.portfolio) score += 5;
    
    // Summary (15 points)
    if (data.summary && data.summary.length > 50) score += 15;
    
    // Experience (25 points)
    if (data.experience.length > 0) score += 15;
    if (data.experience.some(exp => exp.bullets.length > 2)) score += 10;
    
    // Education (15 points)
    if (data.education.length > 0) score += 15;
    
    // Skills (15 points)
    if (data.skills.technical.length > 3) score += 10;
    if (data.skills.soft.length > 2) score += 5;
    
    // Additional sections (10 points)
    if (data.projects.length > 0) score += 5;
    if (data.certifications.length > 0) score += 3;
    if (data.awards.length > 0) score += 2;
    
    return Math.min(score, 100);
  };

  const handleSaveResume = async () => {
    if (!resumeData || !user) return;

    try {
      const resumeTitle = `${resumeData.personalInfo.fullName} Resume - ${new Date().toLocaleDateString()}`;
      
      const resumeRecord = {
        user_id: user.id,
        title: resumeTitle,
        template: selectedTemplate,
        data: resumeData,
        ats_score: atsScore
      };

      if (editingResumeId) {
        const { error } = await supabase
          .from('resumes')
          .update(resumeRecord)
          .eq('id', editingResumeId);
        
        if (error) throw error;
        toast({ title: "Resume updated successfully!" });
      } else {
        const { error } = await supabase
          .from('resumes')
          .insert(resumeRecord);
        
        if (error) throw error;
        toast({ title: "Resume saved successfully!" });
      }
    } catch (error) {
      console.error('Error saving resume:', error);
      toast({
        title: "Error saving resume",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleDownload = async () => {
    if (dailyDownloads >= 5) {
      toast({
        title: "Daily limit reached",
        description: "You can download up to 5 resumes per day. Try again tomorrow.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Update download count
      const today = new Date().toISOString().split('T')[0];
      const { error } = await supabase
        .from('resume_downloads_daily')
        .upsert({
          user_id: user?.id,
          day: today,
          downloads: dailyDownloads + 1
        });

      if (error) throw error;
      
      setDailyDownloads(prev => prev + 1);
      toast({ title: "Resume downloaded successfully!" });
    } catch (error) {
      console.error('Error updating download count:', error);
    }
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl lg:text-5xl font-poppins font-bold text-gradient mb-4">
            Resume Saathi — AI Resume Builder
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Create ATS-optimized resumes with AI-powered suggestions and multiple professional templates
          </p>
          
          <div className="flex items-center justify-center gap-4 mt-6">
            <Badge variant="secondary" className="text-sm">
              <Zap className="w-4 h-4 mr-1" />
              ATS Optimized
            </Badge>
            <Badge variant="secondary" className="text-sm">
              <Star className="w-4 h-4 mr-1" />
              3 Templates
            </Badge>
            <Badge variant="secondary" className="text-sm">
              Resumes remaining today: {5 - dailyDownloads}
            </Badge>
          </div>
        </div>

        <div className="flex justify-center gap-4 mb-8">
          <Button
            variant={viewMode === 'form' ? "default" : "outline"}
            onClick={() => setViewMode('form')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New
          </Button>
          <Button
            variant={viewMode === 'history' ? "default" : "outline"}
            onClick={() => setViewMode('history')}
          >
            <History className="w-4 h-4 mr-2" />
            My Resumes
          </Button>
        </div>

        {viewMode === 'form' && (
          <ResumeForm
            onSubmit={handleFormSubmit}
            initialData={resumeData}
            editingId={editingResumeId}
          />
        )}

        {viewMode === 'loading' && <Loader3D />}

        {viewMode === 'preview' && resumeData && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <TemplatePreview
                data={resumeData}
                template={selectedTemplate}
                atsScore={atsScore}
              />
              <div className="flex gap-4 mt-6">
                <Button onClick={handleSaveResume}>
                  <FileText className="w-4 h-4 mr-2" />
                  Save Resume
                </Button>
                <PdfGenerator
                  data={resumeData}
                  template={selectedTemplate}
                  onDownload={handleDownload}
                  disabled={dailyDownloads >= 5}
                />
                <Button
                  variant="outline"
                  onClick={() => setViewMode('form')}
                >
                  Edit
                </Button>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <SuggestionsPanel
                atsScore={atsScore}
                resumeData={resumeData}
              />
            </div>
          </div>
        )}

        {viewMode === 'history' && (
          <ResumeHistoryList
            onEdit={(resume) => {
              setEditingResumeId(resume.id);
              setResumeData(resume.data);
              setViewMode('form');
            }}
            onPreview={(resume) => {
              setResumeData(resume.data);
              setSelectedTemplate(resume.template);
              setAtsScore(resume.ats_score || 0);
              setViewMode('preview');
            }}
          />
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ResumeSaathi;