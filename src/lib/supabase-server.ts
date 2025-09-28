// lib/supabase-server.ts
import { createClient } from "@supabase/supabase-js";

//SERVER-SIDE use.
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);
