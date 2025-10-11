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
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { token, guestName, storyTitle, storyContent, audioUrl } = req.body;

  if (!token || !guestName || !storyContent) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // --- NEW/UPDATED LOGIC ---
    // 1. Transcribe before submission.

    let transcript = "";
    if (audioUrl) {
      const { data: transcriptionData, error: transcribeError } =
        await supabase.functions.invoke("transcribe-audio", {
          body: { audioPath: audioUrl },
        });

      if (transcribeError || !transcriptionData?.transcript) {
        return res.status(500).json({
          error: "Failed to transcribe audio. Please try again.",
        });
      }

      transcript = transcriptionData.transcript;
    } else {
      //Fallback if no audio(edge case)
      return res.status(400).json({
        error: "Audio recording is required. Please try again.",
      });
    }

    //2. Call RPC with transcript as story_content
    const { data, error } = await supabase
      .rpc("handle_guest_submission_prompt_specific", {
        p_invitation_token: token,
        p_guest_name: guestName,
        p_story_content: transcript,
        p_story_title: storyTitle ?? null,
        p_audio_url: audioUrl ?? null,
      })
      .single();

    const result = data as unknown as RpcReturn;

    if (error || !result?.success) {
      // console.log("RPC Error details:", error);
      return res.status(400).json({
        error: result?.message ?? "Failed to submit story",
      });
    }

    const response: SubmissionResponse = {
      submissionId: result.submission_id ?? "",
      success: result.success,
      message: result.message ?? "",
      createdUserId: result.created_user_id ?? "",
    };

    // console.log("Submission response:", response);

    return res.status(200).json(response);
  } catch (err) {
    console.error("Story submission error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
