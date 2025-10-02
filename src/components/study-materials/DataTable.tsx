// DataTable.tsx
import React, { useState } from "react";
import { Eye, Download, Loader2, Presentation } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface StudyMaterialItem {
  id: number;
  title: string;
  subject: string;
  semester: string;
  branch?: string;
  year?: string;
  type?: 'note' | 'pyq' | 'ppt';
  views: number;
  uploadedBy: string;
  uploadDate?: string;
  downloadUrl: string;
}

interface DataTableProps {
  materials: StudyMaterialItem[];
  onViewPDF?: (id: number) => void;
  loading?: boolean;
  materialType?: "notes" | "pyqs" | "ppts";
  onDownload?: (material: StudyMaterialItem) => void;
}

export const DataTable: React.FC<DataTableProps> = ({ 
  materials, 
  onViewPDF,
  materialType = "notes",
  onDownload
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(materials.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMaterials = materials.slice(startIndex, endIndex);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const getFileIcon = () => {
    switch (materialType) {
      case "ppts":
        return <Presentation className="w-4 h-4 text-orange-600" />;
      case "pyqs":
        return <Eye className="w-4 h-4 text-blue-600" />;
      default:
        return <Eye className="w-4 h-4 text-green-600" />;
    }
  };

  const getFileTypeLabel = () => {
    switch (materialType) {
      case "ppts":
        return "PPT";
      case "pyqs":
        return "PYQ";
      default:
        return "Note";
    }
  };

  if (materials.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
          {getFileIcon()}
        </div>
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          No {materialType} found
        </h3>
        <p className="text-sm text-muted-foreground">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Title</TableHead>
              <TableHead className="font-semibold">Subject</TableHead>
              <TableHead className="font-semibold">Semester</TableHead>
              {materialType === "ppts" && <TableHead className="font-semibold">Branch</TableHead>}
              {/* <TableHead className="font-semibold">Views</TableHead> */}
              <TableHead className="font-semibold">Uploaded By</TableHead>
              <TableHead className="font-semibold">Upload Date</TableHead>
              <TableHead className="font-semibold text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentMaterials.map((material) => (
              <TableRow key={material.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                   
                    <span className="truncate max-w-xs">{material.title}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {material.subject}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-medium">
                    {material.semester}
                  </span>
                </TableCell>
                {materialType === "ppts" && (
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {material.branch || "N/A"}
                    </span>
                  </TableCell>
                )}
                {/* <TableCell>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-muted-foreground" />
                    <span className="text-sm">{material.views}</span>
                  </div>
                </TableCell> */}
                <TableCell className="text-sm text-muted-foreground">
                  {material.uploadedBy}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(material.uploadDate)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 justify-center">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onViewPDF && onViewPDF(material.id)}
                      className="h-8 px-2 hover:bg-primary/10"
                      title={`View ${getFileTypeLabel()}`}
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDownload && onDownload(material)}
                      className="h-8 px-2 hover:bg-green-100 hover:text-green-700"
                      title={`Download ${getFileTypeLabel()}`}
                    >
                      <Download className="w-3 h-3" />
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
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, materials.length)} of{" "}
            {materials.length} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="h-8 w-8 p-0"
                    >
                      {page}
                    </Button>
                  );
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  return (
                    <span key={page} className="px-2 text-muted-foreground">
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};