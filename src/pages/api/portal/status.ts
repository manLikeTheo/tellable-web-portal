import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { token } = req.query;

  if (!token || typeof token !== "string") {
    return res.status(400).json({ error: "Token required" });
  }

  try {
    // Get invitation status
    const { data: invitation, error } = await supabase
      .from("collaboration_invites")
      .select(
        `
        id,
        status,
        clicked_at,
        completed_at,
        guest_submissions (
          id,
          status,
          submitted_at,
          reviewed_at
        )
      `
      )
      .eq("token", token)
      .single();

    if (error || !invitation) {
      return res.status(404).json({ error: "Invitation not found" });
    }

    res.status(200).json({
      invitationStatus: invitation.status,
      hasSubmission:
        invitation.guest_submissions && invitation.guest_submissions.length > 0,
      submissionStatus: invitation.guest_submissions?.[0]?.status,
      clickedAt: invitation.clicked_at,
      completedAt: invitation.completed_at,
    });
  } catch (error) {
    console.error("Status check error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
