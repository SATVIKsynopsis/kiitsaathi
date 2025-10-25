import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Upload lost & found application image
router.post("/upload-lost-found-image", async (req, res) => {
  try {
    // Use express-fileupload or multer for file parsing if not already set up
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: "No image uploaded" });
    }
    const { lostItemId } = req.body;
    const file = req.files.image;
    if (!lostItemId || !file) {
      return res.status(400).json({ error: "Missing lostItemId or file" });
    }
    // Validate file type and size
    if (!file.mimetype.match(/^image\/(jpeg|jpg|png)$/)) {
      return res.status(400).json({ error: "Only JPG and PNG files are allowed" });
    }
    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ error: "File size must be less than 5MB" });
    }
    const fileExt = file.name.split('.').pop();
    const fileName = `application_${lostItemId}_${Date.now()}.${fileExt}`;
    // Upload new image
    const { error: uploadError } = await supabase.storage
      .from("lost-and-found-images")
      .upload(fileName, file.data, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.mimetype,
      });
    if (uploadError) throw uploadError;
    // Get public URL
    const { data } = supabase.storage.from("lost-and-found-images").getPublicUrl(fileName);
    res.json({ publicUrl: data.publicUrl });
  } catch (error) {
    console.error("Lost & Found image upload error:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

export default router;
