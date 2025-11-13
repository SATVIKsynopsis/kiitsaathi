// fix-study-materials.js
// ------------------------------------------------------
// This script scans the "study-materials" bucket,
// lists ALL files, generates public URLs for each file,
// and updates your database table "study_materials"
// replacing signed URLs with permanent public URLs.
// ------------------------------------------------------

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// ------------------------------------------------------
// 1. Load environment variables
// ------------------------------------------------------
const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌ ERROR: Missing SUPABASE_URL or SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

// ------------------------------------------------------
// 2. Supabase client (service key allows admin permissions)
// ------------------------------------------------------
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// ------------------------------------------------------
// 3. CONFIG
// ------------------------------------------------------
const BUCKET = "study-materials";        // your bucket name
const TABLE = "study_materials";         // your table name
const PDF_COLUMN = "pdf_url";            // the column to update
const PREFIX = "";                        // folder inside bucket (empty means full bucket)

// ------------------------------------------------------
// 4. Main Function
// ------------------------------------------------------
async function fixFiles() {
  console.log("🔍 Fetching all files from bucket:", BUCKET);

  // List all files
  const { data: files, error: listErr } = await supabase.storage
    .from(BUCKET)
    .list(PREFIX, { limit: 10000, offset: 0 });

  if (listErr) {
    console.error("❌ Error listing files:", listErr);
    return;
  }

  console.log(`📦 Found ${files.length} files in storage bucket.`);

  // Loop through each file
  for (const file of files) {
    const filename = file.name;
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${filename}`;

    console.log(`\n🔄 Processing file: ${filename}`);
    console.log(`➡️ Public URL: ${publicUrl}`);

    // ------------------------------------------------------
    // Replace ALL rows in table where old signed URL contains the file name
    // ------------------------------------------------------
    const { data: updateData, error: updateErr } = await supabase
      .from(TABLE)
      .update({ [PDF_COLUMN]: publicUrl })
      .like(PDF_COLUMN, `%${filename}%`);

    if (updateErr) {
      console.error("❌ DB Update Error:", updateErr);
    } else {
      console.log(`✅ Updated rows for file: ${filename}`);
    }
  }

  console.log("\n🎉 DONE! All signed URLs replaced with public URLs.");
}

// ------------------------------------------------------
// 5. Execute script
// ------------------------------------------------------
fixFiles();
