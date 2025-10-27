import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, Loader, FileText } from "lucide-react";
import { semesters, semesterSubjects } from "@/data/studyMaterials";

interface StudyMaterialUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudyMaterialUploadDialog({ open, onOpenChange }: StudyMaterialUploadDialogProps) {
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    subject: "",
    semester: "",
    branch: "CSE",
    year: new Date().getFullYear().toString(),
    folder_type: "notes",
    uploader_name: "",
    file: null as File | null
  });

  const folderTypes = [
    { value: "notes", label: "Notes" },
    { value: "pyqs", label: "Previous Year Questions (PYQs)" },
    { value: "ppts", label: "Presentations (PPTs)" },
    { value: "ebooks", label: "E-Books" }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Invalid file type. Only PDF, PPT, DOC, DOCX files are allowed.');
        return;
      }

      // Validate file size (50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('File size exceeds 50MB limit');
        return;
      }

      setForm({ ...form, file });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.file || !form.title || !form.subject || !form.semester || !form.folder_type || !form.uploader_name) {
      toast.error('Please fill all required fields');
      return;
    }

    setUploading(true);

    try {
      // Upload file and submit request to backend
      const formData = new FormData();
      formData.append('file', form.file);
      formData.append('title', form.title);
      formData.append('subject', form.subject);
      formData.append('semester', form.semester);
      formData.append('branch', form.branch);
      formData.append('year', form.year);
      formData.append('folder_type', form.folder_type);
      formData.append('uploader_name', form.uploader_name);

      const response = await fetch('/api/study-material/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to submit material');
      }

      toast.success('Study material submitted for review!', {
        description: 'Admin will review and publish your material soon.'
      });

      // Reset form
      setForm({
        title: "",
        subject: "",
        semester: "",
        branch: "CSE",
        year: new Date().getFullYear().toString(),
        folder_type: "notes",
        uploader_name: "",
        file: null
      });

      onOpenChange(false);

    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error(error.message || 'Failed to submit material');
    } finally {
      setUploading(false);
    }
  };

  // Get subjects for selected semester
  const availableSubjects = form.semester 
    ? semesterSubjects.find(s => s.semester === form.semester)?.subjects || []
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Submit Study Material for Review
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., Data Structures Notes - Unit 1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="uploader_name">Your Name *</Label>
              <Input
                id="uploader_name"
                value={form.uploader_name}
                onChange={(e) => setForm({ ...form, uploader_name: e.target.value })}
                placeholder="Your full name"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="folder_type">Material Type *</Label>
              <Select value={form.folder_type} onValueChange={(value) => setForm({ ...form, folder_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {folderTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="semester">Semester *</Label>
              <Select value={form.semester} onValueChange={(value) => setForm({ ...form, semester: value, subject: "" })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map(sem => (
                    <SelectItem key={sem} value={sem}>
                      {sem} Semester
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Select 
                value={form.subject} 
                onValueChange={(value) => setForm({ ...form, subject: value })}
                disabled={!form.semester}
              >
                <SelectTrigger>
                  <SelectValue placeholder={form.semester ? "Select subject" : "Select semester first"} />
                </SelectTrigger>
                <SelectContent>
                  {availableSubjects.map(subject => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch">Branch</Label>
              <Input
                id="branch"
                value={form.branch}
                onChange={(e) => setForm({ ...form, branch: e.target.value })}
                placeholder="e.g., CSE, IT"
              />
            </div>
          </div>

          {(form.folder_type === 'pyqs' || form.folder_type === 'ebooks') && (
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                placeholder="e.g., 2024"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="file">Upload File * (PDF, PPT, DOC - Max 50MB)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.ppt,.pptx,.doc,.docx"
                required
                className="cursor-pointer"
              />
              {form.file && (
                <FileText className="w-5 h-5 text-green-500" />
              )}
            </div>
            {form.file && (
              <p className="text-sm text-muted-foreground">
                Selected: {form.file.name} ({(form.file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Your submission will be reviewed by admin before being published. 
              You'll be notified once it's approved and made available to all students.
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Submit for Review
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}