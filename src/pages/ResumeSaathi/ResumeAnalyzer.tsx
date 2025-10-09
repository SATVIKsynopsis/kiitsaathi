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
      "leadership", "technical", "problem-solving", "communication",
      "python", "javascript", "java", "react", "node", "sql", "aws", "git"
    ];

    const textLower = text.toLowerCase();
    const lines = text.split("\n");
    const wordCount = text.split(/\s+/).length;
    const sentenceCount = text.split(/[.!?]+/).length;

    // Check for contact info (20 points)
    if (textLower.includes("@") && textLower.includes(".com")) {
      atsScore += 10;
      strengths.push("Professional email address found");
    } else {
      improvements.push("Add a professional email address (e.g., yourname@email.com)");
    }

    if (/\d{10}/.test(text) || /\(\d{3}\)/.test(text)) {
      atsScore += 5;
      strengths.push("Contact phone number included");
    } else {
      improvements.push("Include a professional contact phone number");
    }

    if (textLower.includes("linkedin") || textLower.includes("github") || textLower.includes("portfolio")) {
      atsScore += 5;
      strengths.push("Professional profile links present (LinkedIn/GitHub/Portfolio)");
    } else {
      improvements.push("Add LinkedIn or GitHub profile to showcase your professional presence");
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
      const missing = sections.filter(s => !textLower.includes(s));
      improvements.push(`Add missing sections to strengthen your resume: ${missing.join(", ")}`);
    }

    // Summary/Objective check
    if (textLower.includes("summary") || textLower.includes("objective")) {
      atsScore += 5;
      strengths.push("Professional summary or objective statement included");
    } else {
      improvements.push("Add a concise professional summary highlighting your key skills and career goals");
    }

    // Keyword analysis with enhanced suggestions (25 points)
    const keywordCount = {};
    commonKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = text.match(regex);
      const count = matches ? matches.length : 0;
      
      if (count > 0) {
        keywordsFound.push(`${keyword} (${count}x)`);
        atsScore += Math.min(count * 1.5, 3); // Reward multiple mentions, capped
      } else {
        keywordsMissing.push(keyword);
      }
    });

    if (keywordsFound.length < 5) {
      improvements.push("Include more relevant technical keywords and skills that match job requirements");
    }

    // Format checks (20 points)
    const bulletCount = (text.match(/[•●◦▪▫–-]\s/g) || []).length;
    if (bulletCount >= 8) {
      atsScore += 8;
      strengths.push("Excellent use of bullet points for readability");
    } else if (bulletCount >= 5) {
      atsScore += 5;
      strengths.push("Good use of bullet points");
      improvements.push("Add more bullet points to highlight key achievements and responsibilities");
    } else {
      formatIssues.push("Use more bullet points (aim for 3-5 per job/project)");
      improvements.push("Format your experience with clear bullet points for better ATS parsing");
    }

    // Quantifiable achievements check
    const numberPattern = /\b\d+%|\b\d+\+|\b\d+x|\b\$\d+/gi;
    const quantifiables = text.match(numberPattern);
    if (quantifiables && quantifiables.length >= 3) {
      atsScore += 7;
      strengths.push("Resume includes quantifiable achievements with metrics");
    } else if (quantifiables && quantifiables.length > 0) {
      atsScore += 3;
      improvements.push("Add more measurable achievements with specific numbers and percentages");
    } else {
      improvements.push("Include quantifiable results (e.g., 'Increased efficiency by 30%', 'Led team of 5')");
    }

    const datePattern = /\d{4}|\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/gi;
    const dates = text.match(datePattern);
    if (dates && dates.length >= 4) {
      atsScore += 5;
      strengths.push("Timeline dates properly formatted and included");
    } else {
      improvements.push("Add clear dates (Month/Year format) to all experience and education entries");
    }

    if (text.match(/[A-Z][a-z]+\s[A-Z][a-z]+/)) {
      atsScore += 3;
      strengths.push("Professional name formatting detected");
    }

    // Action verbs check
    const actionVerbs = ["achieved", "developed", "created", "managed", "led", "implemented", "designed", "improved", "analyzed"];
    const foundVerbs = actionVerbs.filter(verb => textLower.includes(verb));
    if (foundVerbs.length >= 5) {
      atsScore += 5;
      strengths.push("Strong action verbs used throughout resume");
    } else if (foundVerbs.length >= 3) {
      atsScore += 3;
      improvements.push("Use more strong action verbs to start bullet points (e.g., achieved, led, developed)");
    } else {
      improvements.push("Start bullet points with powerful action verbs to demonstrate impact");
    }

    // Length and content density check (15 points)
    if (wordCount >= 400 && wordCount <= 800) {
      atsScore += 15;
      strengths.push("Resume length is optimal (400-800 words)");
    } else if (wordCount >= 300 && wordCount < 400) {
      atsScore += 10;
      improvements.push("Add more detailed descriptions of your experience and achievements");
    } else if (wordCount < 300) {
      improvements.push("Resume is too brief - expand on your experience, skills, and projects");
      atsScore += 5;
      formatIssues.push("Content is too sparse - aim for 400-800 words total");
    } else if (wordCount > 800 && wordCount <= 1000) {
      atsScore += 12;
      improvements.push("Consider condensing to 1-2 pages for better readability");
    } else {
      improvements.push("Resume is too long - focus on most relevant and recent experience");
      atsScore += 8;
      formatIssues.push("Reduce content to 1-2 pages maximum");
    }

    // Writing quality check
    const avgWordsPerSentence = wordCount / Math.max(sentenceCount, 1);
    if (avgWordsPerSentence >= 10 && avgWordsPerSentence <= 20) {
      atsScore += 3;
    } else if (avgWordsPerSentence > 25) {
      formatIssues.push("Sentences are too long - break into shorter, clearer statements");
    }

    // Layout score (based on structure)
    let layoutScore = 70;
    if (lines.length < 20) {
      layoutScore -= 20;
      formatIssues.push("Resume appears to have minimal content - expand each section");
    } else if (lines.length > 100) {
      layoutScore -= 10;
      formatIssues.push("Resume may be too dense - ensure proper spacing and formatting");
    }
    
    if (bulletCount === 0) {
      layoutScore -= 15;
      formatIssues.push("No bullet points detected - use bullets for better structure");
    }
    
    if (!textLower.includes("summary") && !textLower.includes("objective")) {
      layoutScore -= 10;
    }

    // Check for education details
    if (textLower.includes("gpa") || textLower.includes("cgpa") || textLower.includes("grade")) {
      atsScore += 3;
      strengths.push("Academic performance metrics included");
    }

    // Certifications check
    if (textLower.includes("certifi") || textLower.includes("certified")) {
      atsScore += 3;
      strengths.push("Professional certifications mentioned");
    } else {
      improvements.push("Add relevant certifications or courses to boost credibility");
    }

    // Cap scores at 100
    atsScore = Math.min(Math.max(atsScore, 0), 100);
    layoutScore = Math.min(Math.max(layoutScore, 0), 100);

    // Add personalized improvement suggestions based on score
    if (atsScore < 60) {
      improvements.unshift("Critical: Restructure your resume with clear sections and strong keywords");
    } else if (atsScore < 80) {
      improvements.unshift("Good foundation - focus on adding quantifiable achievements and keywords");
    }

    return {
      atsScore,
      strengths: strengths.slice(0, 10),
      improvements: improvements.slice(0, 10),
      keywordAnalysis: {
        found: keywordsFound.slice(0, 15),
        missing: keywordsMissing.slice(0, 8),
      },
      formatIssues: formatIssues.slice(0, 6),
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
