import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TestResumeGeneratorProps {
  onTestResume?: (data: any, template: string) => void;
}

export function TestResumeGenerator({ onTestResume }: TestResumeGeneratorProps) {
  const { toast } = useToast();

  const downloadTestResume = () => {
    // Download the test resume PDF from public folder
    const link = document.createElement('a');
    link.href = '/test-resume.pdf';
    link.download = 'Test_Resume_Sample.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "✅ Test Resume Downloaded!",
      description: "This is a sample resume for testing. Use the form below to create your personalized resume.",
    });
  };

  return (
    <Card className="glass-card border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-700">
          <FileText className="w-5 h-5" />
          Test Resume Download
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Sample Resume Features:
            </h4>
            <ul className="space-y-2 text-sm text-green-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">•</span>
                <span>Pre-filled with realistic KIIT student data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">•</span>
                <span>Download instantly without using your monthly quota</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">•</span>
                <span>Perfect for testing the format and layout</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">•</span>
                <span>No AI generation required - instant download</span>
              </li>
            </ul>
          </div>
          
          <Button 
            onClick={downloadTestResume}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Test Resume
          </Button>
          
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-800 text-center flex items-center justify-center gap-2">
              <CheckCircle className="w-3 h-3" />
              <strong>No quota used!</strong> This doesn't count towards your monthly limit.
            </p>
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            For a personalized ATS-optimized resume, fill out the form below
          </p>
        </div>
      </CardContent>
    </Card>
  );
}