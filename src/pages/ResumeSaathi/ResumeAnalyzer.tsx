import { useState, useCallback } from "react";
import { Upload, FileText, CheckCircle, AlertTriangle, TrendingUp, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import * as pdfjsLib from "pdfjs-dist";
import { toast } from "sonner";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface AnalysisResult {
  atsScore: number;
  strengths: string[];
  improvements: string[];
  keywordAnalysis: {
    found: string[];
    missing: string[];
  };
  formatIssues: string[];
  layoutScore: number;
}

export const ResumeAnalyzer = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const analyzeResumeText = (text: string): AnalysisResult => {
    let atsScore = 0;
    const strengths: string[] = [];
    const improvements: string[] = [];
    const formatIssues: string[] = [];
    const keywordsFound: string[] = [];
    const keywordsMissing: string[] = [];

    const commonKeywords = [
      "experience", "education", "skills", "project", "achievement",
      "leadership", "technical", "problem-solving", "communication"
    ];

    const textLower = text.toLowerCase();
    const lines = text.split("\n");
    const wordCount = text.split(/\s+/).length;

    // Check for contact info (20 points)
    if (textLower.includes("@") && textLower.includes(".com")) {
      atsScore += 10;
      strengths.push("Email address found");
    } else {
      improvements.push("Add a professional email address");
    }

    if (/\d{10}/.test(text) || /\(\d{3}\)/.test(text)) {
      atsScore += 5;
      strengths.push("Phone number included");
    } else {
      improvements.push("Include a contact phone number");
    }

    if (textLower.includes("linkedin") || textLower.includes("github")) {
      atsScore += 5;
      strengths.push("Professional links present");
    }

    // Check for sections (30 points)
    const sections = ["experience", "education", "skills", "projects"];
    let sectionsFound = 0;
    sections.forEach(section => {
      if (textLower.includes(section)) {
        sectionsFound++;
        strengths.push(`${section.charAt(0).toUpperCase() + section.slice(1)} section found`);
      }
    });
    atsScore += sectionsFound * 7;

    if (sectionsFound < 4) {
      improvements.push(`Add missing sections: ${sections.filter(s => !textLower.includes(s)).join(", ")}`);
    }

    // Keyword analysis (20 points)
    commonKeywords.forEach(keyword => {
      if (textLower.includes(keyword)) {
        keywordsFound.push(keyword);
        atsScore += 2;
      } else {
        keywordsMissing.push(keyword);
      }
    });

    // Format checks (15 points)
    const bulletCount = (text.match(/[•●◦▪▫–-]\s/g) || []).length;
    if (bulletCount > 5) {
      atsScore += 5;
      strengths.push("Good use of bullet points");
    } else {
      formatIssues.push("Use more bullet points for better readability");
      improvements.push("Format experience with bullet points");
    }

    const datePattern = /\d{4}|\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/gi;
    const dates = text.match(datePattern);
    if (dates && dates.length >= 4) {
      atsScore += 5;
      strengths.push("Timeline dates included");
    } else {
      improvements.push("Add dates to your experience and education");
    }

    if (text.match(/[A-Z][a-z]+\s[A-Z][a-z]+/)) {
      atsScore += 5;
      strengths.push("Proper name formatting detected");
    }

    // Length check (15 points)
    if (wordCount >= 300 && wordCount <= 800) {
      atsScore += 15;
      strengths.push("Resume length is optimal");
    } else if (wordCount < 300) {
      improvements.push("Resume is too short - add more details");
      atsScore += 5;
    } else {
      improvements.push("Resume is too long - be more concise");
      atsScore += 10;
      formatIssues.push("Consider reducing content to 1-2 pages");
    }

    // Layout score (based on structure)
    let layoutScore = 70;
    if (lines.length < 20) {
      layoutScore -= 20;
      formatIssues.push("Resume appears to have minimal content");
    }
    if (bulletCount === 0) {
      layoutScore -= 15;
    }
    if (!textLower.includes("summary") && !textLower.includes("objective")) {
      improvements.push("Add a professional summary at the top");
      layoutScore -= 10;
    }

    // Cap score at 100
    atsScore = Math.min(Math.max(atsScore, 0), 100);
    layoutScore = Math.min(Math.max(layoutScore, 0), 100);

    return {
      atsScore,
      strengths: strengths.slice(0, 8),
      improvements: improvements.slice(0, 8),
      keywordAnalysis: {
        found: keywordsFound.slice(0, 10),
        missing: keywordsMissing.slice(0, 5),
      },
      formatIssues: formatIssues.slice(0, 5),
      layoutScore,
    };
  };

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    setFileName(file.name);
    setAnalyzing(true);
    setResult(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        fullText += pageText + "\n";
      }

      const analysis = analyzeResumeText(fullText);
      setResult(analysis);
      toast.success("Resume analyzed successfully!");
    } catch (error) {
      console.error("Error analyzing resume:", error);
      toast.error("Failed to analyze resume. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-[hsl(var(--kiit-green))]";
    if (score >= 60) return "text-[hsl(var(--campus-orange))]";
    return "text-destructive";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Improvement";
  };

  return (
    <div className="space-y-6">
      <Card className="border-[hsl(var(--kiit-green))] shadow-lg">
        <CardHeader className="bg-gradient-to-r from-[hsl(var(--kiit-green-soft))] to-white">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-[hsl(var(--kiit-green))]" />
            Resume Analyzer
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Upload your resume PDF to get instant ATS score, formatting feedback, and improvement suggestions
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[hsl(var(--kiit-green))] rounded-lg bg-[hsl(var(--kiit-green-soft))] hover:bg-[hsl(var(--kiit-green-soft))]/70 transition-colors">
            <Upload className="w-12 h-12 text-[hsl(var(--kiit-green))] mb-4" />
            <label htmlFor="resume-upload" className="cursor-pointer">
              <Button variant="default" className="bg-[hsl(var(--kiit-green))] hover:bg-[hsl(var(--kiit-green-dark))]" asChild>
                <span>Choose Resume PDF</span>
              </Button>
              <input
                id="resume-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            {fileName && (
              <p className="mt-3 text-sm text-muted-foreground">
                Selected: {fileName}
              </p>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              Max file size: 5MB
            </p>
          </div>

          {analyzing && (
            <div className="mt-6 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[hsl(var(--kiit-green))] border-t-transparent mb-3"></div>
              <p className="text-sm text-muted-foreground">Analyzing your resume...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <Card className="border-[hsl(var(--campus-blue))] shadow-lg">
            <CardHeader className="bg-gradient-to-r from-[hsl(var(--campus-blue))]/10 to-white">
              <CardTitle className="flex items-center justify-between">
                <span>ATS Score</span>
                <Badge variant="secondary" className={`text-lg px-4 py-2 ${getScoreColor(result.atsScore)}`}>
                  {result.atsScore}/100
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{getScoreLabel(result.atsScore)}</span>
                  <span className="text-muted-foreground">{result.atsScore}%</span>
                </div>
                <Progress value={result.atsScore} className="h-3" />
                <p className="text-sm text-muted-foreground">
                  {result.atsScore >= 80 && "Your resume is well-optimized for ATS systems!"}
                  {result.atsScore >= 60 && result.atsScore < 80 && "Your resume is good but has room for improvement."}
                  {result.atsScore < 60 && "Your resume needs significant improvements to pass ATS screening."}
                </p>
              </div>

              <div className="mt-6 grid gap-4">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[hsl(var(--kiit-green))]" />
                    Layout Quality
                  </h4>
                  <Progress value={result.layoutScore} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">{result.layoutScore}/100</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-[hsl(var(--kiit-green))] shadow-md">
              <CardHeader className="bg-[hsl(var(--kiit-green-soft))]">
                <CardTitle className="flex items-center gap-2 text-[hsl(var(--kiit-green-dark))]">
                  <CheckCircle className="w-5 h-5" />
                  Strengths ({result.strengths.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-2">
                  {result.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-[hsl(var(--kiit-green))] mt-0.5 flex-shrink-0" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-[hsl(var(--campus-orange))] shadow-md">
              <CardHeader className="bg-orange-50">
                <CardTitle className="flex items-center gap-2 text-orange-700">
                  <AlertTriangle className="w-5 h-5" />
                  Improvements ({result.improvements.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-2">
                  {result.improvements.map((improvement, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="w-4 h-4 text-[hsl(var(--campus-orange))] mt-0.5 flex-shrink-0" />
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="border-[hsl(var(--campus-blue))] shadow-md">
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center gap-2 text-[hsl(var(--campus-blue))]">
                <FileText className="w-5 h-5" />
                Keyword Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2 text-[hsl(var(--kiit-green))]">
                  Found Keywords ({result.keywordAnalysis.found.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.keywordAnalysis.found.map((keyword, idx) => (
                    <Badge key={idx} variant="secondary" className="bg-[hsl(var(--kiit-green-soft))] text-[hsl(var(--kiit-green-dark))]">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
              {result.keywordAnalysis.missing.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-muted-foreground">
                    Consider Adding
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.keywordAnalysis.missing.map((keyword, idx) => (
                      <Badge key={idx} variant="outline" className="border-muted-foreground/30">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {result.formatIssues.length > 0 && (
            <Card className="border-destructive shadow-md">
              <CardHeader className="bg-red-50">
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <XCircle className="w-5 h-5" />
                  Format Issues ({result.formatIssues.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-2">
                  {result.formatIssues.map((issue, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <XCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <Card className="bg-gradient-to-r from-[hsl(var(--kiit-green-soft))] to-blue-50 border-[hsl(var(--kiit-green))]">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-3 text-[hsl(var(--kiit-green-dark))]">
                📋 Quick Tips for ATS Optimization
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-[hsl(var(--kiit-green))]">•</span>
                  <span>Use standard section headings: Experience, Education, Skills</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[hsl(var(--kiit-green))]">•</span>
                  <span>Include relevant keywords from the job description</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[hsl(var(--kiit-green))]">•</span>
                  <span>Keep formatting simple - avoid tables, images, and complex layouts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[hsl(var(--kiit-green))]">•</span>
                  <span>Use bullet points to highlight achievements</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[hsl(var(--kiit-green))]">•</span>
                  <span>Include dates in a consistent format (MM/YYYY)</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
