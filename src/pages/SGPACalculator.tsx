import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calculator, Download, RotateCcw, TrendingUp, BookOpen } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { curriculum } from '@/data/curriculum';
import { toast } from 'sonner';

interface Subject {
  name: string;
  credits: number;
  grade?: number;
}

interface SemesterData {
  semester: number;
  subjects: Subject[];
  sgpa: number;
}

const SGPACalculator = () => {
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [semesterHistory, setSemesterHistory] = useState<SemesterData[]>([]);
  const [currentSGPA, setCurrentSGPA] = useState<number>(0);
  const [cgpa, setCGPA] = useState<number>(0);

  const branches = Object.keys(curriculum);
  const semesters = selectedBranch ? Object.keys(curriculum[selectedBranch]) : [];

  useEffect(() => {
    if (selectedBranch && selectedSemester) {
      const semesterSubjects = curriculum[selectedBranch][selectedSemester] || [];
      setSubjects(semesterSubjects.map(sub => ({ ...sub, grade: undefined })));
    }
  }, [selectedBranch, selectedSemester]);

  useEffect(() => {
    calculateSGPA();
  }, [subjects]);

  useEffect(() => {
    calculateCGPA();
  }, [semesterHistory]);

  const calculateSGPA = () => {
    const validGrades = subjects.filter(sub => sub.grade !== undefined && sub.grade !== null);
    if (validGrades.length === 0) {
      setCurrentSGPA(0);
      return;
    }

    const totalCredits = validGrades.reduce((sum, sub) => sum + sub.credits, 0);
    const totalPoints = validGrades.reduce((sum, sub) => sum + (sub.credits * (sub.grade || 0)), 0);
    
    const sgpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;
    setCurrentSGPA(Math.round(sgpa * 100) / 100);
  };

  const calculateCGPA = () => {
    if (semesterHistory.length === 0) {
      setCGPA(0);
      return;
    }

    const totalCredits = semesterHistory.reduce((sum, sem) => {
      return sum + sem.subjects.reduce((subSum, sub) => subSum + sub.credits, 0);
    }, 0);

    const totalPoints = semesterHistory.reduce((sum, sem) => {
      return sum + sem.subjects.reduce((subSum, sub) => {
        return subSum + (sub.credits * (sub.grade || 0));
      }, 0);
    }, 0);

    const calculatedCGPA = totalCredits > 0 ? (totalPoints / totalCredits) : 0;
    setCGPA(Math.round(calculatedCGPA * 100) / 100);
  };

  const handleGradeChange = (index: number, grade: string) => {
    const gradeValue = parseFloat(grade);
    if (gradeValue < 0 || gradeValue > 10) {
      toast.error('Grade must be between 0 and 10');
      return;
    }

    const updatedSubjects = [...subjects];
    updatedSubjects[index].grade = gradeValue || undefined;
    setSubjects(updatedSubjects);
  };

  const addSemesterToHistory = () => {
    if (!selectedSemester || currentSGPA === 0) {
      toast.error('Please complete current semester calculation first');
      return;
    }

    const semesterData: SemesterData = {
      semester: parseInt(selectedSemester),
      subjects: subjects.filter(sub => sub.grade !== undefined),
      sgpa: currentSGPA
    };

    const existingIndex = semesterHistory.findIndex(sem => sem.semester === semesterData.semester);
    if (existingIndex >= 0) {
      const updated = [...semesterHistory];
      updated[existingIndex] = semesterData;
      setSemesterHistory(updated);
      toast.success('Semester data updated successfully');
    } else {
      setSemesterHistory([...semesterHistory, semesterData].sort((a, b) => a.semester - b.semester));
      toast.success('Semester added to CGPA calculation');
    }
  };

  const resetCalculator = () => {
    setSelectedBranch('');
    setSelectedSemester('');
    setSubjects([]);
    setSemesterHistory([]);
    setCurrentSGPA(0);
    setCGPA(0);
    toast.success('Calculator reset successfully');
  };

  const exportToPDF = () => {
    // Implementation for PDF export would go here
    toast.success('PDF export feature coming soon!');
  };

  const exportToCSV = () => {
    if (semesterHistory.length === 0) {
      toast.error('No data to export');
      return;
    }

    let csvContent = 'Semester,Subject,Credits,Grade,Points\n';
    semesterHistory.forEach(sem => {
      sem.subjects.forEach(sub => {
        const points = sub.credits * (sub.grade || 0);
        csvContent += `${sem.semester},"${sub.name}",${sub.credits},${sub.grade || 0},${points}\n`;
      });
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sgpa-cgpa-data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Data exported to CSV successfully');
  };

  const chartData = semesterHistory.map(sem => ({
    semester: `Sem ${sem.semester}`,
    sgpa: sem.sgpa
  }));

  const highestSGPA = Math.max(...semesterHistory.map(s => s.sgpa));
  const lowestSGPA = Math.min(...semesterHistory.map(s => s.sgpa));

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-4">
            <Calculator className="h-12 w-12 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold text-gradient">
              SGPA & CGPA Calculator
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Calculate your SGPA and CGPA with accurate KIIT curriculum. Track your academic progress with real-time calculations and visual insights.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Calculator */}
          <div className="lg:col-span-2 space-y-6">
            {/* Selection Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Branch & Semester Selection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="branch">Branch</Label>
                    <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map(branch => (
                          <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="semester">Semester</Label>
                    <Select value={selectedSemester} onValueChange={setSelectedSemester} disabled={!selectedBranch}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Semester" />
                      </SelectTrigger>
                      <SelectContent>
                        {semesters.map(sem => (
                          <SelectItem key={sem} value={sem}>Semester {sem}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subjects Table */}
            {subjects.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Subject Grades</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Subject</TableHead>
                          <TableHead className="text-center">Credits</TableHead>
                          <TableHead className="text-center">Grade (0-10)</TableHead>
                          <TableHead className="text-center">Points</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subjects.map((subject, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{subject.name}</TableCell>
                            <TableCell className="text-center">{subject.credits}</TableCell>
                            <TableCell className="text-center">
                              <Input
                                type="number"
                                min="0"
                                max="10"
                                step="0.1"
                                value={subject.grade || ''}
                                onChange={(e) => handleGradeChange(index, e.target.value)}
                                className="w-20 text-center"
                                placeholder="0.0"
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              {subject.grade ? (subject.credits * subject.grade).toFixed(1) : '0.0'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button onClick={addSemesterToHistory} disabled={currentSGPA === 0}>
                      Add to CGPA Calculation
                    </Button>
                    <Button variant="outline" onClick={resetCalculator}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {/* SGPA Card */}
            <Card>
              <CardHeader>
                <CardTitle>Current SGPA</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {currentSGPA.toFixed(2)}
                  </div>
                  <Badge variant={currentSGPA >= 8.5 ? "default" : currentSGPA >= 7.0 ? "secondary" : "destructive"}>
                    {currentSGPA >= 8.5 ? "Excellent" : currentSGPA >= 7.0 ? "Good" : currentSGPA > 0 ? "Average" : "Not Calculated"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* CGPA Card */}
            <Card>
              <CardHeader>
                <CardTitle>Overall CGPA</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {cgpa.toFixed(2)}
                  </div>
                  <Badge variant={cgpa >= 8.5 ? "default" : cgpa >= 7.0 ? "secondary" : "destructive"}>
                    {cgpa >= 8.5 ? "Excellent" : cgpa >= 7.0 ? "Good" : cgpa > 0 ? "Average" : "Not Calculated"}
                  </Badge>
                  {semesterHistory.length > 0 && (
                    <div className="mt-3 text-sm text-muted-foreground">
                      Based on {semesterHistory.length} semester(s)
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Export Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Export Options
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full" onClick={exportToPDF}>
                    Export PDF Report
                  </Button>
                  <Button variant="outline" className="w-full" onClick={exportToCSV}>
                    Export CSV Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Performance Chart */}
        {chartData.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Academic Performance Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="semester" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip 
                      formatter={(value) => [value, 'SGPA']}
                      labelFormatter={(label) => `${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="sgpa" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              {semesterHistory.length > 1 && (
                <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-sm text-muted-foreground">Highest SGPA</div>
                    <div className="text-2xl font-bold text-green-600">{highestSGPA.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Lowest SGPA</div>
                    <div className="text-2xl font-bold text-red-600">{lowestSGPA.toFixed(2)}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Semester History */}
        {semesterHistory.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Semester History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {semesterHistory.map((sem, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold">Semester {sem.semester}</h4>
                      <Badge variant="outline">SGPA: {sem.sgpa.toFixed(2)}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                      {sem.subjects.map((sub, subIndex) => (
                        <div key={subIndex} className="flex justify-between">
                          <span className="truncate mr-2">{sub.name}</span>
                          <span>{sub.grade?.toFixed(1)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SGPACalculator;