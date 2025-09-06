import { useState } from "react";
import { Eye, Download, Calendar, User } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StudyMaterialItem } from "@/data/studyMaterials";

interface DataTableProps {
  materials: StudyMaterialItem[];
  onViewPDF?: (id: number) => void;
  loading?: boolean;
}

export function DataTable({ materials, onViewPDF, loading = false }: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate pagination
  const totalPages = Math.ceil(materials.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMaterials = materials.slice(startIndex, endIndex);

  const handleViewPDF = (id: number) => {
    if (onViewPDF) {
      onViewPDF(id);
    }
  };

  const handleDownload = (url: string, title: string) => {
    // Placeholder for download functionality
    console.log(`Downloading: ${title} from ${url}`);
  };

  if (materials.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="text-muted-foreground">
          <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No materials found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="font-semibold text-foreground">Title</TableHead>
              <TableHead className="font-semibold text-foreground">Subject</TableHead>
              <TableHead className="font-semibold text-foreground">Semester</TableHead>
              <TableHead className="font-semibold text-foreground">Year</TableHead>
              <TableHead className="font-semibold text-foreground">Views</TableHead>
              <TableHead className="font-semibold text-foreground">Uploaded By</TableHead>
              <TableHead className="font-semibold text-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentMaterials.map((material) => (
              <TableRow 
                key={material.id} 
                className="hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => handleViewPDF(material.id)}
              >
                <TableCell className="font-medium">
                  <div className="flex flex-col gap-1">
                    <span className="text-foreground">{material.title}</span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {new Date(material.uploadDate).toLocaleDateString()}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-medium">
                    {material.subject}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {material.semester}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="font-medium text-kiit-primary">
                    {material.year}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Eye className="w-4 h-4" />
                    <span>{material.views.toLocaleString()}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <User className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">{material.uploadedBy}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewPDF(material.id);
                      }}
                      disabled={loading}
                      className="hover-lift"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(material.downloadUrl, material.title);
                      }}
                      disabled={loading}
                      className="hover-lift"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
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
        <div className="flex items-center justify-between p-4 border-t border-border/50">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, materials.length)} of {materials.length} materials
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
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              ))}
            </div>
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
  );
}