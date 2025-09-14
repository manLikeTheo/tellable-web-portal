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
    const audioFile = Array.isArray(files.audio) ? files.audio[0] : files.audio;

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
      return res.status(401).json({ error: "Invalid token" });
    }

    // Read file and upload to Supabase Storage
    const fileBuffer = fs.readFileSync(audioFile.filepath);
    const fileName = `${invitation.book_id}/${Date.now()}_${
      audioFile.originalFilename
    }`;

    // Use dedicated guest-media bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("guest-media")
      .upload(fileName, fileBuffer, {
        contentType: audioFile.mimetype || "audio/webm",
        cacheControl: "3600",
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return res.status(500).json({ error: "Failed to upload audio" });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("guest-media")
      .getPublicUrl(uploadData.path);

    res.status(200).json({ audioUrl: urlData.publicUrl });
  } catch (error) {
    console.error("Upload handler error:", error);
    res.status(500).json({ error: "Internal server error" });
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

//     // Read file and upload to Supabase Storage
//     const fileBuffer = fs.readFileSync(audioFile.filepath);
//     const fileName = `${invitation.book_id}/${Date.now()}_${
//       audioFile.originalFilename
//     }`;

//     const { data: uploadData, error: uploadError } = await supabase.storage
//       .from("audio-recordings")
//       .upload(fileName, fileBuffer, {
//         contentType: audioFile.mimetype || "audio/webm",
//         cacheControl: "3600",
//       });

//     if (uploadError) {
//       console.error("Upload error:", uploadError);
//       return res.status(500).json({ error: "Failed to upload audio" });
//     }

//     // Get public URL
//     const { data: urlData } = supabase.storage
//       .from("audio-recordings")
//       .getPublicUrl(uploadData.path);

//     res.status(200).json({ audioUrl: urlData.publicUrl });
//   } catch (error) {
//     console.error("Upload handler error:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// }
