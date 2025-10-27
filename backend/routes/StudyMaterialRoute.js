import express from "express";

// ✅ Export a function that accepts supabase instance
const createStudyMaterialRoutes = (supabase) => {
  const router = express.Router(); // ✅ Inside the function

  router.get("/study-materials", async (req, res) => {
    try {
      const { type, subject, semester, year, search } = req.query;

      let query = supabase
        .from('study_material_requests')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (type) query = query.eq('folder_type', type);
      if (subject) query = query.eq('subject', subject);
      if (semester) query = query.eq('semester', semester);
      if (year) query = query.eq('year', year);
      if (search) query = query.ilike('title', `%${search}%`);

      const { data, error } = await query;
      if (error) throw error;

      res.json({ data: data || [] });
    } catch (error) {
      console.error("Error fetching study materials:", error);
      res.status(500).json({ error: "Failed to fetch materials" });
    }
  });

  // Upload study material and submit request
  router.post('/study-material/upload', async (req, res) => {
    try {
      if (!req.files || !req.files.file) {
        return res.status(400).json({ error: 'No file uploaded', success: false });
      }
      const file = req.files.file;
      const { title, subject, semester, branch, year, folder_type, uploader_name } = req.body;
      if (!title || !subject || !semester || !folder_type || !uploader_name) {
        return res.status(400).json({ error: 'Missing required fields', success: false });
      }
      const allowedTypes = [
        'application/pdf',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({ error: 'Invalid file type', success: false });
      }
      if (file.size > 50 * 1024 * 1024) {
        return res.status(400).json({ error: 'File size exceeds 50MB limit', success: false });
      }
      const userId = req.user?.id || 'anonymous';
      const timestamp = Date.now();
      const filename = `${userId}/${timestamp}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('study-material-pending')
        .upload(filename, file.data, {
          contentType: file.mimetype,
          upsert: false
        });
      if (uploadError) {
        console.error('Upload error:', uploadError);
        return res.status(500).json({ error: 'Failed to upload file', success: false });
      }
      const { error: insertError } = await supabase
        .from('study_material_requests')
        .insert({
          title,
          subject,
          semester,
          branch,
          year,
          folder_type,
          filename: file.name,
          storage_path: filename,
          filesize: file.size,
          mime_type: file.mimetype,
          uploader_name,
          status: 'pending'
        });
      if (insertError) {
        await supabase.storage.from('study-material-pending').remove([filename]);
        throw insertError;
      }
      res.json({ success: true });
    } catch (error) {
      console.error('Study material upload error:', error);
      res.status(500).json({ error: 'Failed to upload material', success: false });
    }
  });

  // Fetch study material requests
  router.get('/admin/study-material-requests', async (req, res) => {
    try {
      const { status } = req.query;
      let query = supabase
        .from('study_material_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (status && status !== 'all') {
        query = query.eq('status', status);
      }
      const { data, error } = await query;
      if (error) throw error;
      res.json({ data });
    } catch (error) {
      console.error('Error fetching study material requests:', error);
      res.status(500).json({ error: 'Failed to fetch requests' });
    }
  });

  // Get signed preview URL
  router.get('/admin/study-material-preview-url', async (req, res) => {
    try {
      const { path } = req.query;
      if (!path) return res.status(400).json({ error: 'Missing path' });
      const { data, error } = await supabase.storage
        .from('study-material-pending')
        .createSignedUrl(path, 300);
      if (error) throw error;
      res.json({ signedUrl: data.signedUrl });
    } catch (error) {
      console.error('Error creating signed URL:', error);
      res.status(500).json({ error: 'Failed to create signed URL' });
    }
  });

  // Approve study material
  router.post('/admin/study-material-approve', async (req, res) => {
    try {
      const { request_id, adminUserId } = req.body;
      const { error } = await supabase
        .from('study_material_requests')
        .update({ status: 'approved', updated_at: new Date().toISOString() })
        .eq('id', request_id);
      if (error) throw error;
      res.json({ success: true });
    } catch (error) {
      console.error('Error approving material:', error);
      res.status(500).json({ success: false, error: 'Failed to approve material' });
    }
  });

  // Reject study material
  router.post('/admin/study-material-reject', async (req, res) => {
    try {
      const { request_id, admin_comment } = req.body;
      const { error } = await supabase
        .from('study_material_requests')
        .update({ status: 'rejected', admin_comment, updated_at: new Date().toISOString() })
        .eq('id', request_id);
      if (error) throw error;
      res.json({ success: true });
    } catch (error) {
      console.error('Error rejecting material:', error);
      res.status(500).json({ success: false, error: 'Failed to reject material' });
    }
  });

  return router; // ✅ Return the router
};

export default createStudyMaterialRoutes;