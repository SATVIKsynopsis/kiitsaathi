// Enhanced Analysis Display Component
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, XCircle, FileText, AlertTriangle, CheckCircle, 
  Target, Lightbulb, Award, Zap, BarChart3, ArrowUpCircle, Info 
} from "lucide-react";

interface EnhancedAnalysisDisplayProps {
  geminiResult: any;
}

export const EnhancedAnalysisDisplay = ({ geminiResult }: EnhancedAnalysisDisplayProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 90) return 'from-green-500 to-emerald-600';
    if (score >= 80) return 'from-blue-500 to-cyan-600';
    if (score >= 70) return 'from-yellow-500 to-amber-600';
    if (score >= 60) return 'from-orange-500 to-yellow-600';
    return 'from-red-500 to-pink-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-gradient-to-br from-green-50 via-green-100 to-emerald-50';
    if (score >= 80) return 'bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-50';
    if (score >= 70) return 'bg-gradient-to-br from-yellow-50 via-yellow-100 to-amber-50';
    if (score >= 60) return 'bg-gradient-to-br from-orange-50 via-orange-100 to-yellow-50';
    return 'bg-gradient-to-br from-red-50 via-red-100 to-pink-50';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Professional Score Header */}
      <Card className="border-none shadow-2xl overflow-hidden">
        <div className={`${getScoreBg(geminiResult.atsScore)} p-8`}>
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getScoreGradient(geminiResult.atsScore)} flex items-center justify-center shadow-lg`}>
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Analysis Complete</h2>
                  <p className="text-sm text-gray-600">AI-Powered Resume Evaluation</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mt-4">
                <div className={`text-5xl font-bold ${getScoreColor(geminiResult.atsScore)}`}>
                  {geminiResult.atsScore}
                </div>
                <div>
                  <div className="text-sm text-gray-500 uppercase tracking-wide">Overall Score</div>
                  <Badge className="mt-1 bg-white text-gray-700 hover:bg-white">
                    Grade: {geminiResult.overallGrade}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Powered by</div>
              <div className="text-sm font-semibold text-gray-700">Groq AI</div>
              <div className="text-xs text-gray-500">llama-3.3-70b</div>
            </div>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-gray-700 leading-relaxed">{geminiResult.summary}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Modern Tabbed Interface */}
      <Card className="border-none shadow-xl">
        <CardContent className="p-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5 h-auto p-1 bg-gray-100">
              <TabsTrigger value="overview" className="flex flex-col items-center gap-1.5 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <BarChart3 className="w-4 h-4" />
                <span className="text-xs font-medium">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="sections" className="flex flex-col items-center gap-1.5 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <FileText className="w-4 h-4" />
                <span className="text-xs font-medium">Sections</span>
              </TabsTrigger>
              <TabsTrigger value="keywords" className="flex flex-col items-center gap-1.5 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Target className="w-4 h-4" />
                <span className="text-xs font-medium">Keywords</span>
              </TabsTrigger>
              <TabsTrigger value="improvements" className="flex flex-col items-center gap-1.5 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Lightbulb className="w-4 h-4" />
                <span className="text-xs font-medium">Improve</span>
              </TabsTrigger>
              <TabsTrigger value="action" className="flex flex-col items-center gap-1.5 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Zap className="w-4 h-4" />
                <span className="text-xs font-medium">Action</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6 mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Strengths */}
                <Card className="border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-green-700 text-lg">
                      <CheckCircle className="w-5 h-5" />
                      Strengths
                      <Badge variant="outline" className="ml-auto border-green-300 text-green-700">
                        {geminiResult.strengths?.length || 0}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2.5">
                      {geminiResult.strengths?.map((strength: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm border border-green-100">
                          <Award className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Critical Issues */}
                {geminiResult.criticalIssues && geminiResult.criticalIssues.length > 0 && (
                  <Card className="border border-red-200 bg-gradient-to-br from-red-50 to-pink-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-red-700 text-lg">
                        <XCircle className="w-5 h-5" />
                        Issues to Fix
                        <Badge variant="outline" className="ml-auto border-red-300 text-red-700">
                          {geminiResult.criticalIssues.length}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2.5">
                        {geminiResult.criticalIssues.map((issue: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm border border-red-100">
                            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Score Metrics */}
              <Card className="border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <TrendingUp className="w-5 h-5" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {geminiResult.keywordAnalysis && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Keyword Optimization</span>
                        <span className={`text-sm font-bold ${getScoreColor(geminiResult.keywordAnalysis.score)}`}>
                          {geminiResult.keywordAnalysis.score}/100
                        </span>
                      </div>
                      <Progress value={geminiResult.keywordAnalysis.score} className="h-2" />
                    </div>
                  )}
                  {geminiResult.formatAnalysis && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Format & Structure</span>
                        <span className={`text-sm font-bold ${getScoreColor(geminiResult.formatAnalysis.score)}`}>
                          {geminiResult.formatAnalysis.score}/100
                        </span>
                      </div>
                      <Progress value={geminiResult.formatAnalysis.score} className="h-2" />
                    </div>
                  )}
                  {geminiResult.lengthAnalysis && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Resume Length</span>
                        <span className={`text-sm font-bold ${getScoreColor(geminiResult.lengthAnalysis.score)}`}>
                          {geminiResult.lengthAnalysis.score}/100
                        </span>
                      </div>
                      <Progress value={geminiResult.lengthAnalysis.score} className="h-2" />
                      <p className="text-xs text-gray-600 mt-1">{geminiResult.lengthAnalysis.currentLength}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sections Tab */}
            <TabsContent value="sections" className="space-y-4 mt-6">
              {geminiResult.sectionAnalysis && Object.entries(geminiResult.sectionAnalysis).map(([section, analysis]: [string, any]) => (
                <Card key={section} className="border border-gray-200 hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800 capitalize">
                        {section.replace(/([A-Z])/g, ' $1').trim()}
                      </h3>
                      <div className="flex items-center gap-3">
                        <span className={`text-lg font-bold ${getScoreColor(analysis.score)}`}>
                          {analysis.score}
                        </span>
                        <Progress value={analysis.score} className="h-2 w-24" />
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                      {analysis.feedback}
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      {analysis.issues && analysis.issues.length > 0 && (
                        <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                          <h4 className="font-semibold text-red-700 mb-2 text-sm flex items-center gap-2">
                            <XCircle className="w-4 h-4" />
                            Issues
                          </h4>
                          <ul className="space-y-1.5">
                            {analysis.issues.map((issue: string, idx: number) => (
                              <li key={idx} className="text-sm text-red-600 flex items-start gap-2">
                                <span className="text-red-400 mt-1">•</span>
                                <span>{issue}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {analysis.suggestions && analysis.suggestions.length > 0 && (
                        <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                          <h4 className="font-semibold text-green-700 mb-2 text-sm flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Suggestions
                          </h4>
                          <ul className="space-y-1.5">
                            {analysis.suggestions.map((suggestion: string, idx: number) => (
                              <li key={idx} className="text-sm text-green-600 flex items-start gap-2">
                                <span className="text-green-400 mt-1">•</span>
                                <span>{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Keywords Tab */}
            <TabsContent value="keywords" className="space-y-6 mt-6">
              {geminiResult.keywordAnalysis && (
                <>
                  <Card className="border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="text-blue-700">Keyword Performance</span>
                        <Badge className={`text-lg ${getScoreColor(geminiResult.keywordAnalysis.score)}`}>
                          {geminiResult.keywordAnalysis.score}/100
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Progress value={geminiResult.keywordAnalysis.score} className="h-3" />
                    </CardContent>
                  </Card>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Industry Keywords */}
                    <Card className="border border-green-200">
                      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                        <CardTitle className="text-green-700 text-base">Industry Keywords</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 pt-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-sm text-green-600">Found</h4>
                            <Badge variant="outline" className="border-green-300 text-green-700">
                              {geminiResult.keywordAnalysis.industryKeywords?.found?.length || 0}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {geminiResult.keywordAnalysis.industryKeywords?.found?.map((keyword: string, idx: number) => (
                              <Badge key={idx} className="bg-green-100 text-green-800 hover:bg-green-200 border border-green-200">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-sm text-orange-600">Missing</h4>
                            <Badge variant="outline" className="border-orange-300 text-orange-700">
                              {geminiResult.keywordAnalysis.industryKeywords?.missing?.length || 0}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {geminiResult.keywordAnalysis.industryKeywords?.missing?.map((keyword: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Technical Skills */}
                    <Card className="border border-blue-200">
                      <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                        <CardTitle className="text-blue-700 text-base">Technical Skills</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 pt-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-sm text-blue-600">Found</h4>
                            <Badge variant="outline" className="border-blue-300 text-blue-700">
                              {geminiResult.keywordAnalysis.technicalSkills?.found?.length || 0}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {geminiResult.keywordAnalysis.technicalSkills?.found?.map((skill: string, idx: number) => (
                              <Badge key={idx} className="bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-200">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-sm text-purple-600">Suggested</h4>
                            <Badge variant="outline" className="border-purple-300 text-purple-700">
                              {geminiResult.keywordAnalysis.technicalSkills?.suggestions?.length || 0}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {geminiResult.keywordAnalysis.technicalSkills?.suggestions?.map((skill: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </TabsContent>

            {/* Improvements Tab */}
            <TabsContent value="improvements" className="space-y-4 mt-6">
              {geminiResult.recommendedImprovements && geminiResult.recommendedImprovements.length > 0 && (
                <div className="space-y-4">
                  {geminiResult.recommendedImprovements.map((rec: any, idx: number) => (
                    <Card key={idx} className={`border-l-4 ${
                      rec.priority === 'high' ? 'border-l-red-500 bg-gradient-to-r from-red-50 to-white' :
                      rec.priority === 'medium' ? 'border-l-yellow-500 bg-gradient-to-r from-yellow-50 to-white' :
                      'border-l-green-500 bg-gradient-to-r from-green-50 to-white'
                    } hover:shadow-lg transition-shadow`}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white ${
                              rec.priority === 'high' ? 'bg-red-500' :
                              rec.priority === 'medium' ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}>
                              {idx + 1}
                            </div>
                            <Badge className={`${
                              rec.priority === 'high' ? 'bg-red-600 hover:bg-red-700' :
                              rec.priority === 'medium' ? 'bg-yellow-600 hover:bg-yellow-700' :
                              'bg-green-600 hover:bg-green-700'
                            } text-white uppercase text-xs tracking-wider`}>
                              {rec.priority} Priority
                            </Badge>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {rec.category}
                          </Badge>
                        </div>
                        
                        <h3 className="font-semibold text-lg mb-3 text-gray-800">{rec.issue}</h3>
                        <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-2">
                          <div className="flex items-start gap-2">
                            <ArrowUpCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="text-sm font-semibold text-gray-700">Solution: </span>
                              <span className="text-sm text-gray-600">{rec.solution}</span>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <TrendingUp className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="text-sm font-semibold text-gray-700">Impact: </span>
                              <span className="text-sm text-gray-600">{rec.impact}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Format & Length Analysis */}
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                {geminiResult.formatAnalysis && (
                  <Card className="border border-gray-200">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-white">
                      <CardTitle className="text-base">Format Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <Progress value={geminiResult.formatAnalysis.score} className="h-2 mb-4" />
                      {geminiResult.formatAnalysis.issues && geminiResult.formatAnalysis.issues.length > 0 && (
                        <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-100">
                          <h4 className="font-semibold text-red-700 mb-2 text-sm">Issues:</h4>
                          <ul className="space-y-1">
                            {geminiResult.formatAnalysis.issues.map((issue: string, idx: number) => (
                              <li key={idx} className="text-sm text-red-600 flex items-start gap-2">
                                <span className="text-red-400">•</span>
                                <span>{issue}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {geminiResult.formatAnalysis.suggestions && geminiResult.formatAnalysis.suggestions.length > 0 && (
                        <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                          <h4 className="font-semibold text-green-700 mb-2 text-sm">Suggestions:</h4>
                          <ul className="space-y-1">
                            {geminiResult.formatAnalysis.suggestions.map((suggestion: string, idx: number) => (
                              <li key={idx} className="text-sm text-green-600 flex items-start gap-2">
                                <span className="text-green-400">•</span>
                                <span>{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {geminiResult.lengthAnalysis && (
                  <Card className="border border-gray-200">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-white">
                      <CardTitle className="text-base">Resume Length</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <Progress value={geminiResult.lengthAnalysis.score} className="h-2 mb-4" />
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 mb-3">
                        <p className="text-sm text-gray-700">
                          <strong>Current:</strong> {geminiResult.lengthAnalysis.currentLength}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg border border-gray-100">
                        {geminiResult.lengthAnalysis.recommendations}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Action Plan Tab */}
            <TabsContent value="action" className="space-y-6 mt-6">
              {geminiResult.nextSteps && geminiResult.nextSteps.length > 0 && (
                <Card className="border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-700">
                      <Zap className="w-5 h-5" />
                      Your Action Plan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-3">
                      {geminiResult.nextSteps.map((step: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0 shadow-md">
                            {idx + 1}
                          </div>
                          <span className="text-gray-700 pt-2 leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              )}

              {geminiResult.industrySpecificAdvice && (
                <Card className="border border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-purple-700">
                      <Target className="w-5 h-5" />
                      Industry-Specific Advice
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed bg-white p-5 rounded-xl shadow-sm border border-purple-100">
                      {geminiResult.industrySpecificAdvice}
                    </p>
                  </CardContent>
                </Card>
              )}

              {geminiResult.careerLevel && (
                <Card className="border border-gray-200">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-white">
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-600" />
                      Career Level Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <Badge className="text-base capitalize bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-1.5">
                        {geminiResult.careerLevel}
                      </Badge>
                      <p className="text-sm text-gray-600">
                        Resume optimized for {geminiResult.careerLevel}-level positions
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};