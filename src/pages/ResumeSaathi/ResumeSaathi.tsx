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
import { TestResumeGenerator } from "@/components/TestResumeGenerator";
import { DeleteAllDataButton } from "@/components/DeleteAllDataButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { FileText, History, Plus, Star, Zap, Search } from "lucide-react";

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

  // Fetch monthly quota usages from backend
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

  // ✅ Updated handleFormSubmit with safe merge logic
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

      // ✅ Deep merge: preserves user data and merges AI-enhanced summary safely
      const mergedData: ResumeData = {
        personalInfo: {
          ...data.personalInfo,
          ...enhancedData.personalInfo,
        },
        summary:
  // Keep the longer summary (either user or AI)
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
      
      // Refresh monthly usage counters after a successful generation
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
    // No download limits - users can download unlimited times
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
      // Do not reset monthly usage - it persists in DB
      fetchMonthlyUsage(); // Refresh to show correct remaining count
    } catch (error) {
      console.error("Error deleting data:", error);
      useToastHook({
        title: "Error deleting data",
        description: "Try again or contact support.",
        variant: "destructive",
      });
    }
  };

  if (authLoading)
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl lg:text-5xl font-poppins font-bold text-gradient mb-4">
            Resume Saathi — AI Resume Builder
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Create ATS-optimized resumes with AI-powered suggestions and professional templates
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <Badge variant="secondary" className="text-sm">
              <Zap className="w-4 h-4 mr-1" /> ATS Optimized
            </Badge>
            <Badge variant="secondary" className="text-sm">
              <Star className="w-4 h-4 mr-1" /> Classic Template
            </Badge>
            <Badge variant="secondary" className="text-sm">
              Resumes remaining this month: {Math.max(0, (monthlyUsage.generation?.remaining ?? 2))}
            </Badge>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-4 mb-8 flex-wrap">
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
              fetchMonthlyUsage(); // Refresh quota
            }}
          />
        </div>

        {/* Main Views */}
        {viewMode === "form" && (
          <div className="space-y-6">
            {(monthlyUsage.generation?.remaining ?? 2) <= 0 && (
              <Card className="bg-red-50 border-red-200">
                <CardContent className="pt-6">
                  <p className="text-red-800 font-semibold text-center">
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
          <div className="flex justify-center animate-fade-in">
            <div className="w-full max-w-5xl">
              {/* Clean Preview Header */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-purple-100 shadow-lg">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Resume Preview</h2>
                    <p className="text-gray-600 mt-1">Template: {selectedTemplate.replace('-', ' ').toUpperCase()}</p>
                  </div>
                </div>
              </div>

              {/* Preview Content */}
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                <TemplatePreview data={resumeData} template={selectedTemplate} atsScore={atsScore} />
              </div>

              {/* Enhanced Action Buttons */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mt-6 border border-purple-100 shadow-lg">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Resume Actions</h3>
                  <p className="text-gray-600 text-sm">Manage your resume</p>
                </div>
                
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button 
                    onClick={handleSaveResume}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
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
                    className={`border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400 transition-all duration-300 ${(monthlyUsage.generation?.remaining ?? 2) <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Resume
                  </Button>
                  
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAllData}
                    className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete All Data
                  </Button>
                </div>

                {/* Download Status */}
                {dailyDownloads >= 5 && (
                  <div className="text-center mt-4">
                    <Badge variant="destructive" className="animate-pulse">
                      ⚠️ Daily download limit reached (5/5)
                    </Badge>
                    <p className="text-sm text-gray-600 mt-2">
                      You can download more resumes tomorrow
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Navigation */}
              <div className="flex justify-center gap-4 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setViewMode("form")}
                  className="text-sm"
                >
                  ← Back to Form
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setViewMode("history")}
                  className="text-sm"
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