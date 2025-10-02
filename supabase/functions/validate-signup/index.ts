import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")! // needs admin key
);

serve(async (req) => {
  const { type, record } = await req.json();

  if (type === "INSERT" && record?.email) {
    if (!record.email.endsWith("@kiit.ac.in")) {
      await supabase.auth.admin.deleteUser(record.id);
      return new Response("Unauthorized domain", { status: 403 });
    }
  }

  return new Response("OK", { status: 200 });
});
