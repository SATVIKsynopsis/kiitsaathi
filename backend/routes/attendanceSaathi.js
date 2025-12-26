import express from "express";
import multer from "multer";
import Tesseract from "tesseract.js";
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import os from "os";
import crypto from "crypto";

const router = express.Router();

//multer config

const upload = multer({
  dest: path.join(os.tmpdir(), "uploads"),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files allowed"), false);
  }
});

//attendance calculator

function calculateAttendance({ subject = null, present, total }) {
  if (total <= 0 || present > total) return null;

  const currentPercent = Number(
    ((present / total) * 100).toFixed(2)
  );

  const skipNextPercent = Number(
    ((present / (total + 1)) * 100).toFixed(2)
  );

  return {
    subject,
    present,
    total,
    currentPercent,
    skipNextPercent,
    decision:
      skipNextPercent >= 75
        ? "You can skip the next class"
        : "You should attend the next class"
  };
}

//ocr for extraction of image

async function extractAttendance(imagePath) {
  const processedPath = path.join(
    os.tmpdir(),
    `processed_${crypto.randomUUID()}.png`
  );

  try {
    // preprocess image
    await sharp(imagePath)
      .grayscale()
      .resize({ width: 3000 })
      .normalize()
      .png()
      .toFile(processedPath);

    // OCR
    const {
      data: { text }
    } = await Tesseract.recognize(processedPath, "eng", {
      preserve_interword_spaces: "1",
      tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK
    });

    // parse OCR output
    const lines = text.split("\n");
    const results = [];

    for (let rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;
      if (line.toLowerCase().includes("subject")) continue;

      const numbers = line.match(/\d+(?:\.\d+)?/g);
      if (!numbers || numbers.length < 4) continue;

      const total = Number(numbers[0]);
      const present = Number(numbers[3]);

      const subject = line
        .split(numbers[0])[0]
        .replace(/[^a-zA-Z ]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      const record = calculateAttendance({
        subject,
        present,
        total
      });

      if (record) results.push(record);
    }

    return results;

  } finally {
    // cleanup processed image
    try {
      await fs.unlink(processedPath);
    } catch (_) {}
  }
}


//route
router.post(
  "/analyzeAttendance",
  upload.single("image"),
  async (req, res) => {
    let uploadedPath;

    try {
      //mode 1: if users uploads a screenshot
      if (req.file) {
        uploadedPath = req.file.path;

        const data = await extractAttendance(uploadedPath);

        return res.json({
          success: true,
          mode: "image",
          data
        });
      }

      //mode 2: if users manually uploads thier subject attendance
      const { subject, present, total } = req.body;

      if (
        present === undefined ||
        total === undefined
      ) {
        return res.status(400).json({
          success: false,
          error: "Either upload an image or provide present and total"
        });
      }

      const result = calculateAttendance({
        subject: subject || "Single Subject",
        present: Number(present),
        total: Number(total)
      });

      if (!result) {
        return res.status(400).json({
          success: false,
          error: "Invalid attendance values"
        });
      }

      return res.json({
        success: true,
        mode: "manual",
        data: result
      });

    } catch (err) {
      console.error("Attendance error:", err);

      res.status(500).json({
        success: false,
        error: "Attendance processing failed"
      });

    } finally {
      // cleanup uploaded image
      if (uploadedPath) {
        try {
          await fs.unlink(uploadedPath);
        } catch (_) {}
      }
    }
  }
);

export default router;