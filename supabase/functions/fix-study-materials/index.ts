// supabase/functions/fix-study-materials/index.ts
// ----------------------------------------------------------
// EDGE FUNCTION → Replaces signed URLs with permanent public URLs
// in study_materials table by scanning the storage bucket.
// ----------------------------------------------------------

import { serve } from "https://deno.land/x/sift@0.6.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ----------------------------------------------------------
// CONFIG
// ----------------------------------------------------------
const BUCKET = "study-materials";
const TABLE = "study_materials";
const PDF_COLUMN = "pdf_url";

serve(async () => {
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing environment variables" }),
        { status: 400 }
      );
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    console.log("Fetching files from storage:", BUCKET);

    // 1. List all files
    const { data: files, error: listErr } = await supabase.storage
      .from(BUCKET)
      .list("", { limit: 10000 });

    if (listErr) throw listErr;

    console.log(`Found ${files.length} files.`);

    let updated = 0;

    for (const file of files) {
      const filename = file.name;
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${filename}`;

      console.log("Updating:", filename);

      const { error: updateErr } = await supabase
        .from(TABLE)
        .update({ [PDF_COLUMN]: publicUrl })
        .like(PDF_COLUMN, `%${filename}%`);

      if (!updateErr) updated++;
      else console.error("Update error:", updateErr);
    }

    return new Response(
      JSON.stringify({
        message: "Completed updating URLs",
        updated_rows: updated,
      }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
    });
  }
});
