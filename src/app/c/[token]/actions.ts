// app/c/[token]/actions.ts
//
// Server Action: called by the client after a successful storage upload.
// Updates frame_contributors + appends to story_pages — both writes
// happen server-side using the service role key, never exposed to the browser.

"use server";

import { markContributorSubmitted, appendToStoryPage } from "@/lib/contributor";

export type SubmitResult =
  | { success: true }
  | { success: false; error: string };

export async function submitContribution({
  contributorId,
  storyPageId,
  recordingUrl,
  recordingType,
  contributorName,
}: {
  contributorId: string;
  storyPageId: string;
  recordingUrl: string;
  recordingType: "audio" | "video";
  contributorName: string;
}): Promise<SubmitResult> {
  try {
    await markContributorSubmitted({
      contributorId,
      recordingUrl,
      recordingType,
      contributorName,
    });

    await appendToStoryPage({ storyPageId, recordingUrl, recordingType });

    return { success: true };
  } catch (err: any) {
    console.error("❌ [submitContribution]", err.message);
    return { success: false, error: err.message };
  }
}
