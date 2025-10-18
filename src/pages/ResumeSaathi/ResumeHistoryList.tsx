import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { FileText, Edit, Eye, Trash2, Calendar, Star } from "lucide-react";
import { ResumeData } from "./ResumeSaathi";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Resume {
  id: string;
  title: string;
  template: string;
  data: ResumeData;
  ats_score: number | null;
  created_at: string;
  updated_at: string;
}

interface ResumeHistoryListProps {
  onEdit: (resume: Resume) => void;
  onPreview: (resume: Resume) => void;
  quotaExhausted?: boolean; // New prop to check if quota is exhausted
}

export const ResumeHistoryList = ({ onEdit, onPreview, quotaExhausted = false }: ResumeHistoryListProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchResumes();
    }
  }, [user]);

  const fetchResumes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setResumes(data || []);
    } catch (error) {
      console.error('Error fetching resumes:', error);
      toast({
        title: "Error fetching resumes",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (resumeId: string) => {
    try {
      const { error } = await supabase
        .from('resumes')
        .delete()
        .eq('id', resumeId);

      if (error) throw error;

      setResumes(resumes.filter(resume => resume.id !== resumeId));
      toast({
        title: "Resume deleted successfully",
        description: "Your resume has been permanently removed."
      });
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast({
        title: "Error deleting resume",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return "bg-gray-100 text-gray-700";
    if (score >= 85) return "bg-green-100 text-green-800";
    if (score >= 70) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No resumes yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first resume to get started with your job search.
          </p>
          <Button onClick={() => window.location.reload()}>
            Create Your First Resume
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">My Resumes</h2>
        <p className="text-gray-600">Manage and access all your saved resumes</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {resumes.map((resume) => (
          <Card key={resume.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                    {resume.title}
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    {resume.template.charAt(0).toUpperCase() + resume.template.slice(1)} Template
                  </p>
                </div>
                {resume.ats_score && (
                  <Badge className={`ml-2 ${getScoreColor(resume.ats_score)}`}>
                    <Star className="w-3 h-3 mr-1" />
                    {resume.ats_score}
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-4">
                {/* Resume Preview Card */}
                <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-200">
                  <div className="text-center">
                    <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {resume.data.personalInfo.fullName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {resume.data.experience.length} experiences • {resume.data.projects.length} projects
                    </p>
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>Updated {formatDate(resume.updated_at)}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPreview(resume)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (quotaExhausted) {
                        toast({
                          title: "Monthly limit reached",
                          description: "You have used all 2 resume generations for this month. Editing is disabled until next month.",
                          variant: "destructive"
                        });
                        return;
                      }
                      onEdit(resume);
                    }}
                    disabled={quotaExhausted}
                    className={`flex-1 ${quotaExhausted ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </div>

                {/* Delete Button */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Resume</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{resume.title}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(resume.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{resumes.length}</div>
              <div className="text-sm text-gray-600">Total Resumes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {resumes.filter(r => r.template === 'modern').length}
              </div>
              <div className="text-sm text-gray-600">Modern Template</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {resumes.filter(r => r.ats_score && r.ats_score >= 85).length}
              </div>
              <div className="text-sm text-gray-600">ATS Optimized</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(resumes.reduce((sum, r) => sum + (r.ats_score || 0), 0) / resumes.length) || 0}
              </div>
              <div className="text-sm text-gray-600">Avg. Score</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};