import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import { ResumeData } from "./ResumeSaathi";

interface SuggestionsPanelProps {
  atsScore: number;
  resumeData: ResumeData;
}

export const SuggestionsPanel = ({ atsScore, resumeData }: SuggestionsPanelProps) => {
  const generateSuggestions = () => {
    const suggestions: Array<{ type: 'improvement' | 'warning' | 'success'; message: string; priority: 'high' | 'medium' | 'low' }> = [];

    // Contact Information Checks
    if (!resumeData.personalInfo.linkedin && !resumeData.personalInfo.portfolio) {
      suggestions.push({
        type: 'improvement',
        message: 'Add LinkedIn profile or portfolio website to increase professional credibility',
        priority: 'medium'
      });
    }

    // Professional Summary Checks
    if (!resumeData.summary || resumeData.summary.length < 100) {
      suggestions.push({
        type: 'warning',
        message: 'Professional summary should be at least 100 characters for better ATS optimization',
        priority: 'high'
      });
    }

    // Experience Checks
    if (resumeData.experience.length === 0) {
      suggestions.push({
        type: 'improvement',
        message: 'Add work experience, internships, or relevant project experience',
        priority: 'high'
      });
    } else {
      const hasQuantifiableAchievements = resumeData.experience.some(exp =>
        exp.bullets.some(bullet => /\d+/.test(bullet))
      );
      if (!hasQuantifiableAchievements) {
        suggestions.push({
          type: 'improvement',
          message: 'Include quantifiable achievements (numbers, percentages, metrics) in your experience bullets',
          priority: 'high'
        });
      }
    }

    // Skills Checks
    if (resumeData.skills.technical.length < 5) {
      suggestions.push({
        type: 'improvement',
        message: 'Add more technical skills relevant to your target role (aim for 5-8 skills)',
        priority: 'medium'
      });
    }

    if (resumeData.skills.soft.length < 3) {
      suggestions.push({
        type: 'improvement',
        message: 'Include more soft skills like Leadership, Communication, Problem-solving',
        priority: 'low'
      });
    }

    // Projects Checks
    if (resumeData.projects.length === 0) {
      suggestions.push({
        type: 'warning',
        message: 'Add at least 2-3 relevant projects to showcase your practical skills',
        priority: 'high'
      });
    } else if (resumeData.projects.length < 2) {
      suggestions.push({
        type: 'improvement',
        message: 'Add more projects to demonstrate diverse technical capabilities',
        priority: 'medium'
      });
    }

    // Additional Sections
    if (resumeData.certifications.length === 0) {
      suggestions.push({
        type: 'improvement',
        message: 'Add relevant certifications to strengthen your technical profile',
        priority: 'low'
      });
    }

    // Education Checks
    const hasRecentEducation = resumeData.education.some(edu => {
      const endYear = parseInt(edu.endDate);
      const currentYear = new Date().getFullYear();
      return (currentYear - endYear) <= 3;
    });

    if (!hasRecentEducation && resumeData.experience.length === 0) {
      suggestions.push({
        type: 'improvement',
        message: 'Consider adding more recent educational activities or professional development',
        priority: 'medium'
      });
    }

    // ATS-specific suggestions
    if (atsScore < 85) {
      if (resumeData.personalInfo.fullName.length < 2) {
        suggestions.push({
          type: 'warning',
          message: 'Ensure your full name is clearly visible and properly formatted',
          priority: 'high'
        });
      }

      if (!resumeData.personalInfo.email.includes('@')) {
        suggestions.push({
          type: 'warning',
          message: 'Verify your email address is correctly formatted',
          priority: 'high'
        });
      }
    }

    // Success messages for good practices
    if (resumeData.skills.technical.length >= 5) {
      suggestions.push({
        type: 'success',
        message: 'Great! You have a strong technical skills section',
        priority: 'low'
      });
    }

    if (resumeData.projects.length >= 2) {
      suggestions.push({
        type: 'success',
        message: 'Excellent project portfolio - shows practical experience',
        priority: 'low'
      });
    }

    if (resumeData.summary && resumeData.summary.length > 150) {
      suggestions.push({
        type: 'success',
        message: 'Well-written professional summary that will catch recruiters\' attention',
        priority: 'low'
      });
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const suggestions = generateSuggestions();
  const highPrioritySuggestions = suggestions.filter(s => s.priority === 'high');
  const improvementSuggestions = suggestions.filter(s => s.type === 'improvement');
  const successSuggestions = suggestions.filter(s => s.type === 'success');

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            ATS Optimization Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* ATS Score Status */}
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50">
              <div className="text-2xl font-bold text-blue-600 mb-1">{atsScore}/100</div>
              <div className="text-sm text-gray-600">
                {atsScore >= 85 ? 'ATS Optimized ✅' : 
                 atsScore >= 70 ? 'Good - Minor improvements needed' : 
                 'Needs improvement'}
              </div>
            </div>

            {/* Priority Suggestions */}
            {highPrioritySuggestions.length > 0 && (
              <div>
                <h4 className="font-semibold text-red-600 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  High Priority
                </h4>
                <div className="space-y-2">
                  {highPrioritySuggestions.map((suggestion, index) => (
                    <Alert key={index} variant="destructive">
                      <AlertDescription className="text-sm">
                        {suggestion.message}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}

            {/* Improvement Suggestions */}
            {improvementSuggestions.length > 0 && (
              <div>
                <h4 className="font-semibold text-orange-600 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Improvements
                </h4>
                <div className="space-y-2">
                  {improvementSuggestions.slice(0, 5).map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-orange-50 rounded-lg">
                      <Badge variant="outline" className="text-xs">
                        {suggestion.priority}
                      </Badge>
                      <p className="text-sm text-gray-700">{suggestion.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Success Messages */}
            {successSuggestions.length > 0 && (
              <div>
                <h4 className="font-semibold text-green-600 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  What's Working Well
                </h4>
                <div className="space-y-2">
                  {successSuggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <p className="text-sm text-gray-700">{suggestion.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* General ATS Tips */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">ATS Best Practices</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Use standard section headers (EXPERIENCE, EDUCATION, SKILLS)</li>
                <li>• Include keywords from job descriptions</li>
                <li>• Use simple, clean formatting without complex layouts</li>
                <li>• Save as PDF to preserve formatting</li>
                <li>• Keep it to 1-2 pages maximum</li>
              </ul>
            </div>

            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
              <strong>Note:</strong> These suggestions are for optimization purposes and will not appear in your downloaded resume. 
              The ATS score is an estimate based on common best practices and may vary across different applicant tracking systems.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};