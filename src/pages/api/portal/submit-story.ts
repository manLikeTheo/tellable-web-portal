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

  const { token, guestName, storyTitle, audioUrl, audioPath } = req.body;

  if (!token || !guestName) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  //Prioritize audioPath(in storagePath) over audioUrl(public URL)
  const storagePathForTranscription = audioPath || audioUrl;

  if (!storagePathForTranscription) {
    return res
      .status(400)
      .json({ error: "Audio recording is required. Please try again." });
  }

  try {
    console.log("Received submission request: ", {
      token: token.substring(0, 10),
      guestName,
      audioPath,
      audioUrl,
      storyTitle,
    });

    // 1. Transcribe before submission.
    console.log("🎙️ Starting transcription for:", storagePathForTranscription);
    const { data: transcriptionData, error: transcribeError } =
      await supabase.functions.invoke("transcribe-audio", {
        body: { audioPath: storagePathForTranscription },
      });

    if (transcribeError) {
      console.error("Transcription Edeg Function Error: ", transcribeError);
      return res.status(500).json({
        error: "Failed to transcribe audio. Please try again.",
        details: transcribeError.message || "Unknown transcription error",
      });
    }

    if (!transcriptionData || !transcriptionData.transcript) {
      console.error("No transcript returned from edge function: ");
      return res.status(500).json({
        error:
          "Transcription completed but no text was returned. Please try again.",
      });
    }

    const transcript = transcriptionData.transcript;
    console.log("Transcription successful:", {
      length: transcript.length,
      preview: transcript.substring(0, 50) + "...",
    });

    //2: Call RPC with real transcript as story_content
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
      console.error("RPC Error details:", error);
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

    console.log("Story Submitted successfully:", response.submissionId);
    return res.status(200).json(response);
  } catch (err: any) {
    console.error("Story submission error:", err);
    return res.status(500).json({
      error: "Internal server error",
      details: err.message || "Unknown server error",
    });
  }
}
