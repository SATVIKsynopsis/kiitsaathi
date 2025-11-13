import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, Loader } from "lucide-react";
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { semesters, semesterSubjects } from "@/data/studyMaterials";

// ===== Supabase Client =====
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Guard: only create client when env vars are present
let supabase: SupabaseClient | null = null;
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.error("❌ Missing Supabase environment variables (VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY)");
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function StudyMaterialUploadDialog({ open, onOpenChange }: Props) {
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

  // ===== File Change =====
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];

    const allowedTypes = [
      "application/pdf",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Only PDF, PPT, DOC allowed.");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error("File size exceeds 50MB limit");
      return;
    }

    setForm({ ...form, file });
  };

  // ===== Submit Upload =====
  const handleSubmit = async () => {
    if (!supabase) {
      toast.error("Supabase is not configured. Check environment variables.");
      return;
    }

    if (!form.file || !form.title || !form.subject || !form.semester || !form.uploader_name) {
      toast.error("Please fill all required fields");
      return;
    }

    if ((form.folder_type === "pyqs" || form.folder_type === "ebooks") && !form.year) {
      toast.error("Year is required for PYQs / Ebooks");
      return;
    }

    setUploading(true);

    try {
      // Get user (may return an error)
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.warn("supabase.auth.getUser() returned error:", userError);
      }
      const userId = userData?.user?.id ?? null;

      // Create unique file name (fallback ext to 'bin' if missing)
      const timestamp = Date.now();
      const rawName = (form.file.name || "file").toString();
      const ext = rawName.includes(".") ? rawName.split(".").pop() : "bin";
      const safeTitle = form.title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      const filename = `${safeTitle}_${timestamp}.${ext}`;

      // Storage path
      const storagePath = `${form.folder_type}/${filename}`;

      // Upload File
      const uploadResp = await supabase.storage
        .from("study-materials")
        .upload(storagePath, form.file, {
          contentType: form.file.type,
        });

      // uploadResp has either error or data
      if (uploadResp.error) {
        throw uploadResp.error;
      }

      // Get Public URL
      const { data: publicData } = supabase.storage
        .from("study-materials")
        .getPublicUrl(storagePath);

      const publicUrl = publicData?.publicUrl ?? null;
      if (!publicUrl) {
        // Not fatal but warn
        console.warn("Public URL generation returned null for", storagePath);
      }

      const filesizeMB = `${(form.file.size / 1024 / 1024).toFixed(2)} MB`;

      const baseData: any = {
        title: form.title,
        subject: form.subject,
        semester: form.semester,
        branch: form.branch,
        uploaded_by: form.uploader_name,
        user_id: userId,
        filesize: filesizeMB,
        mime_type: form.file.type,
        status: "active",
        pdf_url: publicUrl,
        upload_date: new Date().toISOString().split("T")[0]
      };

      // Insert based on folder type
      let insertError = null;

      if (form.folder_type === "notes") {
        const { error } = await supabase.from("notes").insert(baseData);
        insertError = error;
      } else if (form.folder_type === "pyqs") {
        const { error } = await supabase.from("pyqs").insert({ ...baseData, year: form.year });
        insertError = error;
      } else if (form.folder_type === "ppts") {
        const { error } = await supabase.from("ppts").insert({ ...baseData, ppt_url: publicUrl });
        insertError = error;
      } else if (form.folder_type === "ebooks") {
        const { error } = await supabase.from("ebooks").insert({ ...baseData, year: form.year });
        insertError = error;
      } else {
        insertError = new Error("Invalid folder type");
      }

      if (insertError) {
        // Rollback: remove file from storage
        try {
          await supabase.storage.from("study-materials").remove([storagePath]);
        } catch (rErr) {
          console.warn("Rollback remove failed:", rErr);
        }
        throw insertError;
      }

      toast.success("Study material uploaded successfully!");

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

    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(err?.message || "Upload failed");
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

        {/* FORM UI */}
        <div className="space-y-4">
          {/* Title + Uploader */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Title *</Label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label>Your Name *</Label>
              <Input value={form.uploader_name} onChange={e => setForm({ ...form, uploader_name: e.target.value })} />
            </div>
          </div>

          {/* Type + Semester */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Type *</Label>
              <Select value={form.folder_type} onValueChange={v => setForm({ ...form, folder_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {folderTypes.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Semester *</Label>
              <Select value={form.semester} onValueChange={v => setForm({ ...form, semester: v, subject: "" })}>
                <SelectTrigger><SelectValue placeholder="Select semester" /></SelectTrigger>
                <SelectContent>
                  {semesters.map(s => <SelectItem key={s} value={s}>{s} Semester</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Subject + Branch */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Subject *</Label>
              <Select
                value={form.subject}
                onValueChange={v => setForm({ ...form, subject: v })}
                disabled={!form.semester}
              >
                <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                <SelectContent>
                  {availableSubjects.map(sub => (
                    <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Branch</Label>
              <Input value={form.branch} onChange={e => setForm({ ...form, branch: e.target.value })} />
            </div>
          </div>

          {/* Year */}
          {(form.folder_type === "pyqs" || form.folder_type === "ebooks") && (
            <div>
              <Label>Year *</Label>
              <Input value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} />
            </div>
          )}

          {/* File Upload */}
          <div>
            <Label>Upload File *</Label>
            <Input type="file" accept=".pdf,.ppt,.pptx,.doc,.docx" onChange={handleFileChange} />
            {form.file && (
              <p className="text-sm mt-1">
                Selected: {form.file.name} ({(form.file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={uploading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={uploading}>
              {uploading ? (<><Loader className="w-4 h-4 mr-2 animate-spin" />Uploading...</>) : (<><Upload className="w-4 h-4 mr-2" />Upload</>)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
