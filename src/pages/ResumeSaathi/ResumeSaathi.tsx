import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ResumeForm } from "./ResumeForm";
import { TemplatePreview } from "./TemplatePreview";
import { PdfGenerator } from "./PdfGenerator";
import { Loader3D } from "./Loader3D";
import { ResumeHistoryList } from "./ResumeHistoryList";
import { ResumeAnalyzer } from "./ResumeAnalyzer";
import { TestResumeGenerator } from "@/components/services/resume/TestResumeGenerator";
import { DeleteAllDataButton } from "@/components/services/resume/DeleteAllDataButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { FileText, History, Plus, Star, Zap, Search, Menu, X, Edit, Download, Trash2 } from "lucide-react";

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

type ViewMode = "form" | "loading" | "preview" | "history" | "analyzer";

const ResumeSaathi = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast: useToastHook } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [viewMode, setViewMode] = useState<ViewMode>("form");
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState("high-ats");
  const [atsScore, setAtsScore] = useState<number>(0);
  const [dailyDownloads, setDailyDownloads] = useState(0);
  const [monthlyUsage, setMonthlyUsage] = useState<{ generation?: { used: number; limit: number; remaining: number }, analysis?: { used: number; limit: number; remaining: number } }>({});
  const [editingResumeId, setEditingResumeId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth?redirect=/resume-saathi");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchDailyDownloads();
      fetchMonthlyUsage();
    }
  }, [user]);

  const fetchDailyDownloads = async () => {
    if (!user) return;
    try {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("resume_downloads_daily")
        .select("downloads")
        .eq("user_id", user.id)
        .eq("day", today)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching downloads:", error);
        return;
      }

      setDailyDownloads(data?.downloads || 0);
    } catch (error) {
      console.error("Error fetching daily downloads:", error);
    }
  };

  const fetchMonthlyUsage = async () => {
    try {
      const API_BASE_URL = "https://kiitsaathi-5-resume.onrender.com";
      const res = await fetch(`${API_BASE_URL}/usage-summary?userId=${user?.id}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data?.success) setMonthlyUsage(data.summary || {});
    } catch (e) {
      console.warn('Failed to fetch monthly usage:', e);
    }
  };

  const handleFormSubmit = async (data: ResumeData, template: string) => {
    console.log("🧠 handleFormSubmit called with:", { data, template });
    setFormError(null);

    try {
      setResumeData(data);
      setSelectedTemplate(template);
      setViewMode("loading");

      const minDelay = new Promise((resolve) => setTimeout(resolve, 4500));

      const API_BASE_URL = "https://kiitsaathi-5-resume.onrender.com";

      const response = await fetch(`${API_BASE_URL}/generate-high-ats-resume`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData: data, template, userId: user?.id }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          const err = await response.json().catch(() => ({} as any));
          throw new Error(err?.message || 'Monthly limit reached for resume generation (2 per month).');
        }
        throw new Error(`Failed to generate resume: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) throw new Error(result.error || "Failed to generate resume");

      const enhancedData = result.enhancedResumeData || {};
      const atsScore = result.atsScore || 87;
      await minDelay;

      const mergedData: ResumeData = {
        personalInfo: {
          ...data.personalInfo,
          ...enhancedData.personalInfo,
        },
        summary:
          [enhancedData.summary, enhancedData.professional_summary, enhancedData.profile_summary, data.summary]
            .filter(Boolean)
            .sort((a, b) => b.length - a.length)[0] || "",

        education: Array.isArray(enhancedData.education)
          ? enhancedData.education.map((edu: any, i: number) => ({
              degree: edu.degree || data.education[i]?.degree || "",
              institution: edu.institution || data.education[i]?.institution || "",
              startDate: edu.startDate || data.education[i]?.startDate || "",
              endDate: edu.endDate || data.education[i]?.endDate || "",
              cgpa: edu.cgpa || data.education[i]?.cgpa || "",
            }))
          : data.education,

        experience: Array.isArray(enhancedData.experience)
          ? enhancedData.experience.map((exp: any, i: number) => ({
              title: exp.title || data.experience[i]?.title || "",
              company: exp.company || data.experience[i]?.company || "",
              startDate: exp.startDate || data.experience[i]?.startDate || "",
              endDate: exp.endDate || data.experience[i]?.endDate || "",
              bullets:
                Array.isArray(exp.bullets) && exp.bullets.length > 0
                  ? exp.bullets
                  : data.experience[i]?.bullets || [],
            }))
          : data.experience,

        projects: Array.isArray(enhancedData.projects)
          ? enhancedData.projects.map((proj: any, i: number) => ({
              name: proj.name || data.projects[i]?.name || "",
              description: proj.description || data.projects[i]?.description || "",
              link: proj.link || data.projects[i]?.link || "",
              technologies: Array.isArray(proj.technologies)
                ? proj.technologies
                : typeof proj.technologies === "string"
                ? proj.technologies
                    .split(/,|•|–|-|;|\s{2,}/)
                    .map((t: string) => t.trim())
                    .filter(Boolean)
                : data.projects[i]?.technologies || [],
            }))
          : data.projects,

        skills: {
          technical:
            Array.isArray(enhancedData.skills?.technical) &&
            enhancedData.skills?.technical.length > 0
              ? enhancedData.skills.technical
              : data.skills.technical,
          soft:
            Array.isArray(enhancedData.skills?.soft) &&
            enhancedData.skills?.soft.length > 0
              ? enhancedData.skills.soft
              : data.skills.soft,
        },

        certifications:
          Array.isArray(enhancedData.certifications) && enhancedData.certifications.length > 0
            ? enhancedData.certifications
            : data.certifications,

        awards:
          Array.isArray(enhancedData.awards) && enhancedData.awards.length > 0
            ? enhancedData.awards
            : data.awards,

        languages:
          Array.isArray(enhancedData.languages) && enhancedData.languages.length > 0
            ? enhancedData.languages
            : data.languages,

        interests:
          Array.isArray(enhancedData.interests) && enhancedData.interests.length > 0
            ? enhancedData.interests
            : data.interests,
      };

      console.log("✅ Final merged resume data:", mergedData);
      console.log("🧾 Final summary field:", mergedData.summary);

      setResumeData(mergedData);
      setAtsScore(atsScore);
      setViewMode("preview");
      
      console.log('🔄 Refreshing monthly usage after generation...');
      await fetchMonthlyUsage();
      console.log('✅ Monthly usage refreshed, new count:', monthlyUsage);

      toast.success(`🎉 High-ATS Resume Generated! Score: ${atsScore}/100`);
    } catch (error: any) {
      console.error("❌ Error in handleFormSubmit:", error);
      setViewMode("form");
      const message = error?.message || "Error generating high-ATS resume. Please try again. If the issue persists, please contact support.";
      setFormError(message);
      toast.error(message);
    }
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
        ats_score: atsScore,
      };

      if (editingResumeId) {
        const { error } = await supabase
          .from("resumes")
          .update(resumeRecord)
          .eq("id", editingResumeId);
        if (error) throw error;
        useToastHook({ title: "Resume updated successfully!" });
      } else {
        const { error } = await supabase.from("resumes").insert(resumeRecord);
        if (error) throw error;
        useToastHook({ title: "Resume saved successfully!" });
      }
    } catch (error) {
      console.error("Error saving resume:", error);
      useToastHook({
        title: "Error saving resume. Please try again later.",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async () => {
    useToastHook({ title: "Resume downloaded successfully!" });
  };

  const handleDeleteAllData = async () => {
    if (!user) return;
    if (!window.confirm("⚠️ Delete all resume data permanently?")) return;

    try {
      const { error } = await supabase.rpc("delete_all_resume_data", {
        target_user_id: user.id,
      });
      if (error) throw error;

      useToastHook({ title: "✅ All data deleted successfully" });
      setResumeData(null);
      setViewMode("form");
      setEditingResumeId(null);
      fetchMonthlyUsage();
    } catch (error) {
      console.error("Error deleting data:", error);
      useToastHook({
        title: "Error deleting data",
        description: "Try again or contact support.",
        variant: "destructive",
      });
    }
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    setIsMobileMenuOpen(false);
  };

  if (authLoading)
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <Navbar />

      <div className="container mx-auto px-3 sm:px-4 pt-20 sm:pt-24 pb-6 sm:pb-8">
        {/* Mobile Menu Button */}
        <div className="lg:hidden fixed top-20 right-4 z-40">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="bg-white/90 backdrop-blur-sm border-purple-200 shadow-lg"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-30 pt-20 bg-black/50 backdrop-blur-sm">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl m-4 p-6 shadow-2xl border border-purple-100">
              <div className="space-y-3">
                <Button 
                  variant={viewMode === "form" ? "default" : "outline"} 
                  onClick={() => handleViewModeChange("form")}
                  disabled={(monthlyUsage.generation?.remaining ?? 2) <= 0}
                  className="w-full justify-start text-base py-3 h-auto"
                >
                  <Plus className="w-5 h-5 mr-3" /> Create New
                </Button>
                <Button 
                  variant={viewMode === "analyzer" ? "default" : "outline"} 
                  onClick={() => handleViewModeChange("analyzer")}
                  className="w-full justify-start text-base py-3 h-auto"
                >
                  <Search className="w-5 h-5 mr-3" /> Analyze Resume
                </Button>
                <Button 
                  variant={viewMode === "history" ? "default" : "outline"} 
                  onClick={() => handleViewModeChange("history")}
                  className="w-full justify-start text-base py-3 h-auto"
                >
                  <History className="w-5 h-5 mr-3" /> My Resumes
                </Button>
                <DeleteAllDataButton
                  onDataDeleted={() => {
                    setResumeData(null);
                    setViewMode("form");
                    setEditingResumeId(null);
                    fetchMonthlyUsage();
                  }}
                  className="w-full justify-start text-base py-3 h-auto"
                />
              </div>
            </div>
          </div>
        )}

        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-poppins font-bold text-gradient mb-3 sm:mb-4 px-2">
            Resume Saathi
          </h1>
          <p className="text-sm sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto px-2 sm:px-4">
            Create ATS-optimized resumes with AI-powered suggestions
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-4 sm:mt-6 px-2">
            <Badge variant="secondary" className="text-xs sm:text-sm px-2 py-1">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> ATS Optimized
            </Badge>
            <Badge variant="secondary" className="text-xs sm:text-sm px-2 py-1">
              <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> Classic Template
            </Badge>
            <Badge variant="secondary" className="text-xs sm:text-sm px-2 py-1">
              Remaining: {Math.max(0, (monthlyUsage.generation?.remaining ?? 2))}
            </Badge>
          </div>
        </div>

        {/* Desktop Buttons */}
        <div className="hidden lg:flex justify-center gap-4 mb-6 sm:mb-8 flex-wrap">
          <Button 
            variant={viewMode === "form" ? "default" : "outline"} 
            onClick={() => setViewMode("form")}
            disabled={(monthlyUsage.generation?.remaining ?? 2) <= 0}
            className={`${(monthlyUsage.generation?.remaining ?? 2) <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Plus className="w-4 h-4 mr-2" /> Create New
          </Button>
          <Button variant={viewMode === "analyzer" ? "default" : "outline"} onClick={() => setViewMode("analyzer")}>
            <Search className="w-4 h-4 mr-2" /> Analyze Resume
          </Button>
          <Button variant={viewMode === "history" ? "default" : "outline"} onClick={() => setViewMode("history")}>
            <History className="w-4 h-4 mr-2" /> My Resumes
          </Button>
          <DeleteAllDataButton
            onDataDeleted={() => {
              setResumeData(null);
              setViewMode("form");
              setEditingResumeId(null);
              fetchMonthlyUsage();
            }}
          />
        </div>

        {/* Main Views */}
        {viewMode === "form" && (
          <div className="space-y-4 sm:space-y-6">
            {(monthlyUsage.generation?.remaining ?? 2) <= 0 && (
              <Card className="bg-red-50 border-red-200 mx-2 sm:mx-0">
                <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
                  <p className="text-red-800 font-semibold text-center text-sm sm:text-base">
                    ⚠️ Monthly limit reached: You have used all 2 resume generations for this month. 
                    Please wait until next month to create or edit resumes.
                  </p>
                </CardContent>
              </Card>
            )}
            <TestResumeGenerator onTestResume={handleFormSubmit} />
            <ResumeForm
              onSubmit={handleFormSubmit}
              initialData={resumeData}
              editingId={editingResumeId}
              externalError={formError}
            />
          </div>
        )}

        {viewMode === "loading" && <Loader3D />}

        {viewMode === "preview" && resumeData && (
          <div className="flex justify-center animate-fade-in px-2 sm:px-0">
            <div className="w-full max-w-5xl">
              {/* Clean Preview Header */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 border border-purple-100 shadow-lg">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
                  <div className="text-center sm:text-left">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Resume Preview</h2>
                    <p className="text-gray-600 mt-1 text-sm sm:text-base">Template: {selectedTemplate.replace('-', ' ').toUpperCase()}</p>
                  </div>
                </div>
              </div>

              {/* Preview Content */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl border border-gray-200 overflow-hidden">
                <TemplatePreview data={resumeData} template={selectedTemplate} atsScore={atsScore} />
              </div>

              {/* Enhanced Action Buttons */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 mt-4 sm:mt-6 border border-purple-100 shadow-lg">
                <div className="text-center mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800">Resume Actions</h3>
                  <p className="text-gray-600 text-xs sm:text-sm">Manage your resume</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-3 sm:gap-4 justify-center">
                  <Button 
                    onClick={handleSaveResume}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg transition-all duration-300 w-full sm:w-auto"
                    size="sm"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  
                  <PdfGenerator
                    data={resumeData}
                    template={selectedTemplate}
                    onDownload={handleDownload}
                    disabled={dailyDownloads >= 5}
                  />
                  
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      const quotaExhausted = (monthlyUsage.generation?.remaining ?? 2) <= 0;
                      if (quotaExhausted) {
                        useToastHook({
                          title: "Monthly limit reached",
                          description: "You have used all 2 resume generations for this month. Editing is disabled until next month.",
                          variant: "destructive"
                        });
                        return;
                      }
                      setViewMode("form");
                    }}
                    disabled={(monthlyUsage.generation?.remaining ?? 2) <= 0}
                    className={`border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400 transition-all duration-300 w-full sm:w-auto ${(monthlyUsage.generation?.remaining ?? 2) <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    size="sm"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAllData}
                    className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 shadow-lg transition-all duration-300 w-full sm:w-auto"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete All
                  </Button>
                </div>

                {/* Download Status */}
                {dailyDownloads >= 5 && (
                  <div className="text-center mt-3 sm:mt-4">
                    <Badge variant="destructive" className="animate-pulse text-xs">
                      ⚠️ Daily download limit reached (5/5)
                    </Badge>
                    <p className="text-xs text-gray-600 mt-2">
                      You can download more resumes tomorrow
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Navigation */}
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-4 sm:mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setViewMode("form")}
                  className="text-sm w-full sm:w-auto"
                  size="sm"
                >
                  ← Back to Form
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setViewMode("history")}
                  className="text-sm w-full sm:w-auto"
                  size="sm"
                >
                  View History →
                </Button>
              </div>
            </div>
          </div>
        )}

        {viewMode === "analyzer" && <ResumeAnalyzer />}
        {viewMode === "history" && (
          <ResumeHistoryList
            onEdit={(resume) => {
              const quotaExhausted = (monthlyUsage.generation?.remaining ?? 2) <= 0;
              if (quotaExhausted) {
                useToastHook({
                  title: "Monthly limit reached",
                  description: "You have used all 2 resume generations for this month. Editing is disabled until next month.",
                  variant: "destructive"
                });
                return;
              }
              setEditingResumeId(resume.id);
              setResumeData(resume.data);
              setViewMode("form");
            }}
            onPreview={(resume) => {
              setResumeData(resume.data);
              setSelectedTemplate(resume.template);
              setAtsScore(resume.ats_score || 0);
              setViewMode("preview");
            }}
            quotaExhausted={(monthlyUsage.generation?.remaining ?? 2) <= 0}
          />
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ResumeSaathi;