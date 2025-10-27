import express from "express";

// ✅ Export a function that accepts supabase instance
const createFacultyRoutes = (supabase) => {
  const router = express.Router(); // ✅ Inside the function

  // Get faculty photo URL
  router.get('/faculty/photo-url', async (req, res) => {
    try {
      const { facultyId } = req.query;
      if (!facultyId) {
        return res.status(400).json({ error: 'Missing facultyId parameter' });
      }
      const fileName = `${facultyId}.jpg`;
      const { data } = supabase.storage.from('faculty-photos').getPublicUrl(fileName);
      res.json({ photoUrl: data.publicUrl });
    } catch (error) {
      console.error('Error fetching faculty photo URL:', error);
      res.status(500).json({ error: 'Failed to fetch photo URL' });
    }
  });

  // Upload faculty photo
  router.post("/api/faculty/upload-photo", async (req, res) => {
    try {
      if (!req.files || !req.files.photo) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      const { facultyId } = req.body;
      const file = req.files.photo;
      if (!facultyId || !file) {
        return res.status(400).json({ error: "Missing facultyId or file" });
      }
      if (!file.mimetype.match(/^image\/(jpeg|jpg|png)$/)) {
        return res.status(400).json({ error: "Only JPG and PNG files are allowed" });
      }
      if (file.size > 2 * 1024 * 1024) {
        return res.status(400).json({ error: "File size must be less than 2MB" });
      }
      const fileName = `${facultyId}.jpg`;
      await supabase.storage.from("faculty-photos").remove([fileName]);
      const { error: uploadError } = await supabase.storage
        .from("faculty-photos")
        .upload(fileName, file.data, {
          cacheControl: "3600",
          upsert: true,
          contentType: file.mimetype,
        });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("faculty-photos").getPublicUrl(fileName);
      res.json({ photoUrl: data.publicUrl });
    } catch (error) {
      console.error("Faculty photo upload error:", error);
      res.status(500).json({ error: "Failed to upload photo" });
    }
  });

  return router; // ✅ Return the router
};

export default createFacultyRoutes;