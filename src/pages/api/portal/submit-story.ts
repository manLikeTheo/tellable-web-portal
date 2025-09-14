// pages/api/portal/submit-story.ts
import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/supabase";
import { SubmissionResponse } from "@/types/portal";

// The shape your RPC actually returns (snake_case)
type RpcReturn = {
  success: boolean;
  message?: string | null;
  submission_id?: string | null;
  created_user_id?: string | null;
} | null;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("=== SUBMIT STORY API CALLED ===");
  console.log("Method:", req.method);
  console.log("Body:", req.body);

  if (req.method !== "POST") {
    console.log("Wrong method");

    return res.status(405).json({ error: "Method not allowed" });
  }

  const { token, guestName, storyTitle, storyContent, audioUrl } = req.body;

  console.log("Extracted params:", {
    token: token?.substring(0, 8),
    guestName,
    storyTitle,
    storyContent: storyContent?.substring(0, 20) + "....",
    audioUrl: audioUrl?.substring(0, 30) + "....",
  });

  if (!token || !guestName || !storyContent) {
    console.log("Missing required fields:", {
      hasToken: !!token,
      hasGuestName: !!guestName,
      hasStoryContent: !!storyContent,
    });

    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    console.log("Calling RPC function...");

    // no generics here — keep it simple and assert the shape afterwards
    const { data, error } = await supabase
      .rpc("handle_guest_submission_v2", {
        p_invitation_token: token,
        p_guest_name: guestName,
        p_story_content: storyContent,
        p_story_title: storyTitle ?? null,
        p_audio_url: audioUrl ?? null,
      })
      .single();
    console.log("RPC Response:", { data, error });

    const result = data as unknown as RpcReturn;

    if (error || !result?.success) {
      console.log("RPC Error details:", error);
      return res.status(400).json({
        error: result?.message ?? "Failed to submit story",
      });
    }

    // map snake_case -> your camelCase SubmissionResponse
    const response: SubmissionResponse = {
      submissionId: result.submission_id ?? "",
      success: result.success,
      message: result.message ?? "",
      createdUserId: result.created_user_id ?? "",
    };

    console.log("Submission response:", response);

    return res.status(200).json(response);
  } catch (err) {
    console.error("Story submission error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
