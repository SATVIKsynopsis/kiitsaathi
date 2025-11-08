import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, Loader, FileText } from "lucide-react";
import { createClient } from '@supabase/supabase-js';
import { semesters, semesterSubjects } from "@/data/studyMaterials";

// Initialize Supabase client with validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || ''; // FIXED: Added VITE_ prefix

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY');
}

const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;


interface StudyMaterialUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function StudyMaterialUploadDialog({ open, onOpenChange }: StudyMaterialUploadDialogProps) {
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
      
      const allowedTypes = [
        'application/pdf', 
        'application/vnd.ms-powerpoint', 
        'application/vnd.openxmlformats-officedocument.presentationml.presentation', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error('Invalid file type. Only PDF, PPT, DOC, DOCX files are allowed.');
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        toast.error('File size exceeds 50MB limit');
        return;
      }

      setForm({ ...form, file });
    }
  };

  const handleSubmit = async () => {
    if (!form.file || !form.title || !form.subject || !form.semester || !form.folder_type || !form.uploader_name) {
      toast.error('Please fill all required fields');
      return;
    }

    // Additional validation for PYQs
    if (form.folder_type === 'pyqs' && !form.year) {
      toast.error('Year is required for Previous Year Questions');
      return;
    }

    // Check if Supabase is initialized
    if (!supabase) {
      toast.error('Supabase configuration is missing. Please check your environment variables.');
      return;
    }

    setUploading(true);

    try {
      // Get current authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || null;
      
      // Generate unique filename
      const timestamp = Date.now();
      const fileExtension = form.file.name.split('.').pop();
      const sanitizedTitle = form.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filename = `${sanitizedTitle}_${timestamp}.${fileExtension}`;
      
      // Storage path: folder_type/filename
      const storagePath = `${form.folder_type}/${filename}`;

      // Upload file to Supabase Storage bucket "study-materials"
      const { error: uploadError } = await supabase.storage
        .from('study-materials')
        .upload(storagePath, form.file, {
          contentType: form.file.type,
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Failed to upload file: ${uploadError.message}`);
      }

      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('study-materials')
        .getPublicUrl(storagePath);

      // Prepare common data
      const filesizeInMB = `${(form.file.size / 1024 / 1024).toFixed(2)} MB`;
      const commonData = {
        title: form.title,
        subject: form.subject,
        semester: form.semester,
        branch: form.branch,
        uploaded_by: form.uploader_name,
        user_id: userId,
        filesize: filesizeInMB,
        mime_type: form.file.type,
        status: 'active',
        pdf_url: publicUrl,
      };

      // Insert into appropriate table based on folder_type
      let insertError;
      
      switch (form.folder_type) {
        case 'notes':
          const { error: notesError } = await supabase
            .from('notes')
            .insert({
              ...commonData,
              upload_date: new Date().toISOString().split('T')[0],
            });
          insertError = notesError;
          break;

        case 'pyqs':
          const { error: pyqsError } = await supabase
            .from('pyqs')
            .insert({
              ...commonData,
              year: form.year,
            });
          insertError = pyqsError;
          break;

        case 'ppts':
          const { error: pptsError } = await supabase
            .from('ppts')
            .insert({
              ...commonData,
              ppt_url: publicUrl,
              upload_date: new Date().toISOString().split('T')[0],
            });
          insertError = pptsError;
          break;

        case 'ebooks':
          const { error: ebooksError } = await supabase
            .from('ebooks')
            .insert({
              ...commonData,
              year: form.year,
              upload_date: new Date().toISOString().split('T')[0],
            });
          insertError = ebooksError;
          break;

        default:
          throw new Error('Invalid folder type');
      }

      if (insertError) {
        console.error('Insert error:', insertError);
        // Rollback: delete uploaded file
        await supabase.storage.from('study-materials').remove([storagePath]);
        throw new Error(`Failed to save to database: ${insertError.message}`);
      }

      toast.success('Study material uploaded successfully!', {
        description: `Your ${folderTypes.find(t => t.value === form.folder_type)?.label} has been published.`
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
      toast.error(error.message || 'Failed to upload material');
    } finally {
      setUploading(false);
    }
  };

  const availableSubjects = form.semester 
    ? semesterSubjects.find(s => s.semester === form.semester)?.subjects || []
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Study Material
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., Data Structures Notes - Unit 1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="uploader_name">Your Name *</Label>
              <Input
                id="uploader_name"
                value={form.uploader_name}
                onChange={(e) => setForm({ ...form, uploader_name: e.target.value })}
                placeholder="Your full name"
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
              <Label htmlFor="year">
                Year {form.folder_type === 'pyqs' && '*'}
              </Label>
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

          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Note:</strong> Your material will be published immediately and made available to all students. 
              Please ensure the content is accurate and appropriate before uploading.
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
            <Button onClick={handleSubmit} disabled={uploading}>
              {uploading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Material
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}