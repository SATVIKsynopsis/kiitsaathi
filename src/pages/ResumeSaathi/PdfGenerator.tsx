import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { ResumeData } from "./ResumeSaathi";

interface PdfGeneratorProps {
  data: ResumeData;
  template: string;
  onDownload: () => Promise<void>;
  disabled?: boolean;
}

export const PdfGenerator = ({ data, template, onDownload, disabled }: PdfGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    if (disabled) return;
    
    setIsGenerating(true);
    
    try {
      const resumeElement = document.getElementById('resume-content');
      if (!resumeElement) {
        throw new Error('Resume content not found');
      }

      // Configure html2canvas for better quality
      const canvas = await html2canvas(resumeElement, {
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        width: 794, // A4 width in pixels at 96 DPI
        height: 1123, // A4 height in pixels at 96 DPI
      });

      // Create PDF with A4 dimensions
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate aspect ratio to fit content properly
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / (imgWidth * 0.264583), pdfHeight / (imgHeight * 0.264583));
      
      const finalWidth = imgWidth * 0.264583 * ratio;
      const finalHeight = imgHeight * 0.264583 * ratio;
      
      pdf.addImage(imgData, 'PNG', 0, 0, finalWidth, finalHeight);

      // Add metadata
      pdf.setProperties({
        title: `${data.personalInfo.fullName} Resume`,
        subject: 'Professional Resume',
        author: data.personalInfo.fullName,
        creator: 'KIIT Saathi Resume Builder',
      });

      // Generate filename
      const fileName = `${data.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf`;
      
      // Download the PDF
      pdf.save(fileName);
      
      // Call the onDownload callback to update counters
      await onDownload();
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={generatePDF}
      disabled={isGenerating || disabled}
      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Generating PDF...
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          Download PDF — {data.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf
        </>
      )}
    </Button>
  );
};