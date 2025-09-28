// lib/supabase-server.ts
import { createClient } from "@supabase/supabase-js";

// SERVER-SIDE use - with proper fallbacks and validation
const supabaseUrl =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Add validation to catch configuration issues early
if (!supabaseUrl) {
  console.error(
    "Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL environment variable"
  );
  throw new Error("Supabase URL is required");
}

if (!supabaseServiceKey) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
  throw new Error("Supabase Service Role Key is required");
}

console.log("Server Supabase Config:", {
  url: supabaseUrl,
  hasServiceKey: !!supabaseServiceKey,
  environment: process.env.NODE_ENV,
});

export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// // lib/supabase-server.ts
// import { createClient } from "@supabase/supabase-js";

// //SERVER-SIDE use.
// const supabaseUrl = process.env.SUPABASE_URL || "";
// const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);
