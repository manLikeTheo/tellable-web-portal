// pages/api/portal/upload-audio.ts
import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import { supabase } from "../../../lib/supabase";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const form = formidable();
    const [fields, files] = await form.parse(req);

    const token = Array.isArray(fields.token) ? fields.token[0] : fields.token;
    const duration = Array.isArray(fields.duration)
      ? fields.duration[0]
      : fields.duration;
    const audioFile = Array.isArray(files.audio) ? files.audio[0] : files.audio;

    console.log("=== Audio Upload Debug ===");
    console.log("Token:", token);
    console.log("Audio file:", audioFile?.originalFilename);
    console.log("File size:", audioFile?.size);
    console.log("Duration:", duration, "seconds");
    console.log("MIME type:", audioFile?.mimetype);

    if (!token || !audioFile) {
      return res.status(400).json({ error: "Token and audio file required" });
    }

    // Validate token
    const { data: invitation, error: inviteError } = await supabase
      .from("collaboration_invites")
      .select("id, book_id")
      .eq("token", token)
      .single();

    if (inviteError || !invitation) {
      console.error("Invalid token:", inviteError);
      return res.status(401).json({ error: "Invalid token" });
    }

    console.log("Valid invitation found:", invitation.id);

    // Read file and prepare for upload
    const fileBuffer = fs.readFileSync(audioFile.filepath);
    const timestamp = Date.now();
    const fileExtension = path.extname(audioFile.originalFilename || ".webm");
    const fileName = `recordings/${invitation.book_id}/${timestamp}${fileExtension}`;

    console.log("📤 Uploading to guest-media bucket:", fileName);

    // Upload to guest-media bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("guest-media")
      .upload(fileName, fileBuffer, {
        contentType: audioFile.mimetype || "audio/webm",
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("❌ Upload error:", uploadError);
      return res.status(500).json({
        error: "Failed to upload audio",
        details: uploadError.message,
      });
    }

    console.log("✅ Upload successful:", uploadData.path);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("guest-media")
      .getPublicUrl(uploadData.path);

    console.log("Public URL generated:", urlData.publicUrl);

    // Return comprehensive metadata
    res.status(200).json({
      audioPath: uploadData.path,
      audioUrl: urlData.publicUrl,
      bucket: "guest-media",
      duration: duration ? parseInt(duration) : 0, // Parse client duration
      fileSize: audioFile.size,
      mimeType: audioFile.mimetype,
    });
  } catch (error) {
    console.error("💥 Upload handler error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
// // pages/api/portal/upload-audio.ts
// import { NextApiRequest, NextApiResponse } from "next";
// import formidable from "formidable";
// import { supabase } from "../../../lib/supabase";
// import fs from "fs";
// import path from "path";

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ error: "Method not allowed" });
//   }

//   try {
//     const form = formidable();
//     const [fields, files] = await form.parse(req);

//     const token = Array.isArray(fields.token) ? fields.token[0] : fields.token;
//     const audioFile = Array.isArray(files.audio) ? files.audio[0] : files.audio;

//     if (!token || !audioFile) {
//       return res.status(400).json({ error: "Token and audio file required" });
//     }

//     // Validate token
//     const { data: invitation, error: inviteError } = await supabase
//       .from("collaboration_invites")
//       .select("id, book_id")
//       .eq("token", token)
//       .single();

//     if (inviteError || !invitation) {
//       return res.status(401).json({ error: "Invalid token" });
//     }

//     // Read file and prepare for upload
//     const fileBuffer = fs.readFileSync(audioFile.filepath);
//     const fileName = `${invitation.book_id}/${Date.now()}_${
//       audioFile.originalFilename || "recording.webm"
//     }`;

//     console.log("📤 Uploading audio to guest-media bucket:", fileName);

//     // Upload to guest-media bucket
//     const { data: uploadData, error: uploadError } = await supabase.storage
//       .from("guest-media")
//       .upload(fileName, fileBuffer, {
//         contentType: audioFile.mimetype || "audio/webm",
//         cacheControl: "3600",
//         upsert: false,
//       });

//     if (uploadError) {
//       console.error("❌ Upload error:", uploadError);
//       return res.status(500).json({ error: "Failed to upload audio" });
//     }

//     console.log("✅ Audio uploaded successfully:", uploadData.path);

//     // Return BOTH the path and public URL
//     const { data: urlData } = supabase.storage
//       .from("guest-media")
//       .getPublicUrl(uploadData.path);

//     res.status(200).json({
//       audioPath: uploadData.path,
//       audioUrl: urlData.publicUrl,
//       bucket: "guest-media",
//     });
//   } catch (error) {
//     console.error("💥 Upload handler error:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// }
