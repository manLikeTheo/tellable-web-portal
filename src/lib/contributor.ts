// lib/contributor.ts
//
// Server-side and client-side Supabase helpers for the contributor PWA.
// Server functions use the service-role client (token validation, status updates).
// Client upload uses the anon client (direct-to-storage from browser).

import { createClient } from "@supabase/supabase-js";

// ── Types ──────────────────────────────────────────────────────────────────────

export type ContributorRecord = {
  id: string;
  story_page_id: string;
  token: string;
  contributor_name: string | null;
  status: "pending" | "submitted" | "transcribed" | "expired";
  expires_at: string;
  recording_url: string | null;
  recording_type: "audio" | "video" | null;
};

export type TokenValidationResult =
  | { valid: true; contributor: ContributorRecord }
  | { valid: false; reason: "not_found" | "expired" | "already_submitted" };

// ── Server client (service role — never exposed to browser) ───────────────────

function getServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase server credentials");
  return createClient(url, key, { auth: { persistSession: false } });
}

// ── Anon client (safe for browser — used for storage upload only) ─────────────

export function getAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Missing Supabase public credentials");
  return createClient(url, key);
}

// ── Token validation (server only) ────────────────────────────────────────────

export async function validateToken(
  token: string
): Promise<TokenValidationResult> {
  const supabase = getServerClient();

  const { data, error } = await supabase
    .from("frame_contributors")
    .select("*")
    .eq("token", token)
    .single();

  if (error || !data) {
    return { valid: false, reason: "not_found" };
  }

  if (new Date(data.expires_at) < new Date()) {
    // Mark as expired in DB if not already
    if (data.status === "pending") {
      await supabase
        .from("frame_contributors")
        .update({ status: "expired" })
        .eq("id", data.id);
    }
    return { valid: false, reason: "expired" };
  }

  if (data.status === "submitted" || data.status === "transcribed") {
    return { valid: false, reason: "already_submitted" };
  }

  return { valid: true, contributor: data as ContributorRecord };
}

// ── Mark contribution as submitted (server only) ──────────────────────────────

export async function markContributorSubmitted({
  contributorId,
  recordingUrl,
  recordingType,
  contributorName,
}: {
  contributorId: string;
  recordingUrl: string;
  recordingType: "audio" | "video";
  contributorName: string;
}): Promise<void> {
  const supabase = getServerClient();

  const { error } = await supabase
    .from("frame_contributors")
    .update({
      recording_url: recordingUrl,
      recording_type: recordingType,
      contributor_name: contributorName || null,
      status: "submitted",
      submitted_at: new Date().toISOString(),
    })
    .eq("id", contributorId);

  if (error) throw error;
}

// ── Append recording to story_pages array column (server only) ────────────────

export async function appendToStoryPage({
  storyPageId,
  recordingUrl,
  recordingType,
}: {
  storyPageId: string;
  recordingUrl: string;
  recordingType: "audio" | "video";
}): Promise<void> {
  const supabase = getServerClient();

  const arrayColumn =
    recordingType === "video" ? "video_recordings" : "voice_recordings";

  const { data: page, error: fetchError } = await supabase
    .from("story_pages")
    .select(arrayColumn)
    .eq("id", storyPageId)
    .single();

  if (fetchError) throw fetchError;

  const updated = [...((page as any)[arrayColumn] ?? []), recordingUrl];

  const { error: updateError } = await supabase
    .from("story_pages")
    .update({ [arrayColumn]: updated })
    .eq("id", storyPageId);

  if (updateError) throw updateError;
}
