// DataTable.tsx
import React, { useState } from "react";
import { Eye, Download, Loader2, X } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { supabase } from '@/supabaseClient';

interface StudyMaterialItem {
  id: number;
  title: string;
  subject: string;
  semester: string;
  year?: string;
  views: number;
  uploadedBy: string;
  uploadDate: string;
  pdfUrl?: string;
}

interface DataTableProps {
  materials: StudyMaterialItem[];
  onViewPDF?: (id: number) => void;
  loading?: boolean;
}

export const DataTable: React.FC<DataTableProps> = ({ 
  materials, 
  onViewPDF, 
  loading = false 
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [viewingId, setViewingId] = useState<number | null>(null);
  const [pdfModal, setPdfModal] = useState<{url: string, title: string} | null>(null);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(materials.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMaterials = materials.slice(startIndex, endIndex);

  const handleViewPDF = async (id: number) => {
    const material = materials.find(m => m.id === id);
    if (!material) {
      console.error('Material not found for id:', id);
      alert('PDF not available.');
      return;
    }
    
    if (!material.pdfUrl) {
      console.error('PDF URL not found for material with id:', id);
      alert('PDF not available.');
      return;
    }

    setViewingId(id);
    
    try {
      let url = material.pdfUrl;
      if (!url.startsWith('http')) {
        const { data, error } = await supabase.storage
          .from('study-materials')
          .createSignedUrl(url, 3600);
        
        if (error) {
          console.error('Supabase error:', error);
          throw new Error('Failed to generate PDF URL');
        }
        
        url = data.signedUrl;
      }
      
      // Test if the URL is accessible before opening modal
      try {
        const response = await fetch(url, { method: 'HEAD' });
        if (!response.ok) {
          throw new Error('PDF not accessible');
        }
      } catch (fetchError) {
        console.warn('PDF may not be accessible, opening in new tab instead');
        window.open(url, '_blank');
        if (onViewPDF) onViewPDF(id);
        return;
      }
      
      // Add PDF viewer parameters for better display
      const pdfViewerUrl = url.includes('#') ? url : `${url}#view=FitH&toolbar=1&navpanes=1`;
      
      // Open PDF in modal
      setPdfModal({
        url: pdfViewerUrl,
        title: material.title
      });
      
      // Call the onViewPDF callback if provided
      if (onViewPDF) {
        onViewPDF(id);
      }
      
    } catch (error) {
      console.error('Error viewing PDF:', error);
      alert(error instanceof Error ? error.message : 'Failed to load PDF. Please try again.');
    } finally {
      setViewingId(null);
    }
  };

  const handleDownload = async (filePath: string | undefined, title: string, id: number) => {
    if (!filePath) {
      console.error('File path not found');
      alert('Download not available.');
      return;
    }

    setDownloadingId(id);

    try {
      let url = filePath;
      if (!url.startsWith('http')) {
        const { data, error } = await supabase.storage
          .from('study-materials')
          .createSignedUrl(url, 3600);
        
        if (error) {
          console.error('Supabase error:', error);
          throw new Error('Failed to generate download URL');
        }
        
        url = data.signedUrl;
      }

      // Force download using fetch and blob approach
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch file');
      }
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${title}.pdf`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      console.log(`Downloaded: ${title} from ${filePath}`);
      
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert(error instanceof Error ? error.message : 'Failed to download PDF. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  const closePdfModal = () => {
    setPdfModal(null);
  };

  const handleModalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closePdfModal();
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Loading materials...
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        <p className="text-lg mb-2">No study materials found</p>
        <p className="text-sm">Try adjusting your search criteria or upload some materials.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Title</TableHead>
                <TableHead className="font-semibold">Subject</TableHead>
                <TableHead className="font-semibold">Semester</TableHead>
                <TableHead className="font-semibold">Year</TableHead>
                <TableHead className="font-semibold">Views</TableHead>
                <TableHead className="font-semibold">Uploaded By</TableHead>
                <TableHead className="font-semibold">Upload Date</TableHead>
                <TableHead className="font-semibold text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentMaterials.map((material) => (
                <TableRow 
                  key={material.id} 
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleViewPDF(material.id)}
                >
                  <TableCell className="font-medium max-w-xs truncate" title={material.title}>
                    {material.title}
                  </TableCell>
                  <TableCell>{material.subject}</TableCell>
                  <TableCell>{material.semester}</TableCell>
                  <TableCell>{material.year || 'N/A'}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      {material.views}
                    </span>
                  </TableCell>
                  <TableCell>{material.uploadedBy}</TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {formatDate(material.uploadDate)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-center">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          handleViewPDF(material.id); 
                        }} 
                        disabled={!material.pdfUrl || viewingId === material.id}
                        className="min-w-[70px]"
                      >
                        {viewingId === material.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </>
                        )}
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          handleDownload(material.pdfUrl, material.title, material.id); 
                        }} 
                        disabled={!material.pdfUrl || downloadingId === material.id}
                        className="min-w-[90px]"
                      >
                        {downloadingId === material.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </>
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-2">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(endIndex, materials.length)} of {materials.length} materials
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} 
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <span className="text-sm px-3 py-1 bg-gray-100 rounded">
                Page {currentPage} of {totalPages}
              </span>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} 
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* PDF Modal */}
      {pdfModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={closePdfModal}
          onKeyDown={handleModalKeyDown}
          tabIndex={-1}
        >
          <div 
            className="bg-white rounded-lg shadow-2xl w-full h-full max-w-6xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900 truncate flex-1 mr-4">
                {pdfModal.title}
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Force download of the PDF
                    const link = document.createElement('a');
                    link.href = pdfModal.url;
                    link.download = `${pdfModal.title}.pdf`;
                    link.target = '_blank';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="whitespace-nowrap"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(pdfModal.url, '_blank')}
                  className="whitespace-nowrap"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Open in New Tab
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closePdfModal}
                  className="p-2"
                  aria-label="Close PDF viewer"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 relative bg-gray-50">
              <iframe
                src={pdfModal.url}
                className="w-full h-full border-0"
                title={`PDF Viewer - ${pdfModal.title}`}
                onLoad={(e) => {
                  console.log('PDF loaded successfully');
                  // Hide loading overlay
                  const overlay = e.currentTarget.nextElementSibling as HTMLElement;
                  if (overlay) overlay.style.display = 'none';
                }}
                onError={(e) => {
                  console.error('Failed to load PDF');
                  // Show error message
                  const overlay = e.currentTarget.nextElementSibling as HTMLElement;
                  if (overlay) {
                    overlay.innerHTML = `
                      <div class="text-center">
                        <div class="text-red-500 mb-2">⚠️</div>
                        <p class="text-red-600 mb-4">Failed to load PDF in viewer</p>
                        <button onclick="window.open('${pdfModal.url}', '_blank')" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                          Open in New Tab Instead
                        </button>
                      </div>
                    `;
                  }
                }}
                allow="fullscreen"
              />
              
              {/* Loading/Error overlay */}
              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-600" />
                  <p className="text-gray-600">Loading PDF...</p>
                  <p className="text-sm text-gray-500 mt-2">
                    If PDF doesn't load, try "Open in New Tab"
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t bg-gray-50 rounded-b-lg">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Use Ctrl+F to search within the PDF</span>
                <span>Press ESC to close</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DataTable;