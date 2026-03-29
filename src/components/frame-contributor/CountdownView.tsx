// components/contributor/CountdownView.tsx

import React from "react";

interface Props {
  count: number;
  medium: "audio" | "video";
}

export default function CountdownView({ count, medium }: Props) {
  return (
    <div className="flex-1 bg-[#1a2733] flex flex-col items-center justify-center gap-6 px-6">
      <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
        <span className="text-white/80 text-sm font-medium tracking-wide">
          {medium === "video" ? "Video" : "Audio"} · Get ready
        </span>
      </div>

      <span
        className="text-white font-extrabold text-center leading-none select-none"
        style={{ fontSize: "clamp(80px, 25vw, 120px)", letterSpacing: "-4px" }}
      >
        {count > 0 ? count : "Go"}
      </span>

      <span className="text-white/40 text-base">
        {count > 0 ? "Recording starts in..." : "Speak clearly and freely"}
      </span>
    </div>
  );
}
