// components/contributor/LandingView.tsx

import React from "react";

interface Props {
  onSelect: (medium: "audio" | "video") => void;
}

export default function LandingView({ onSelect }: Props) {
  return (
    <div className="flex flex-col items-center px-6 py-10 flex-1">
      {/* Icon */}
      <div className="w-20 h-20 rounded-full bg-[#eef4fa] border border-[#cde0f5] flex items-center justify-center mb-6">
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#2C5F8A"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      </div>

      <h1 className="text-[26px] font-extrabold text-[#2c3e50] text-center tracking-tight leading-tight mb-3">
        Add Your Voice
      </h1>
      <p className="text-[#7f8c8d] text-center text-base leading-relaxed mb-10 max-w-xs">
        You've been invited to leave a personal message for a Living Frame.
        Speak freely — up to 60 seconds.
      </p>

      {/* Medium options */}
      <div className="w-full grid grid-cols-2 gap-4 mb-10">
        <button
          onClick={() => onSelect("audio")}
          className="flex flex-col items-center gap-3 bg-white rounded-2xl p-6 border border-[#ecf0f1] active:scale-95 transition-transform"
        >
          <div className="w-14 h-14 rounded-full bg-[#1a3e5c] flex items-center justify-center">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            </svg>
          </div>
          <span className="font-bold text-[#2c3e50] text-base">Voice only</span>
          <span className="text-xs text-[#7f8c8d]">Audio recording</span>
        </button>

        <button
          onClick={() => onSelect("video")}
          className="flex flex-col items-center gap-3 bg-white rounded-2xl p-6 border border-[#ecf0f1] active:scale-95 transition-transform"
        >
          <div className="w-14 h-14 rounded-full bg-[#1a3e5c] flex items-center justify-center">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </div>
          <span className="font-bold text-[#2c3e50] text-base">
            Video message
          </span>
          <span className="text-xs text-[#7f8c8d]">Face &amp; voice</span>
        </button>
      </div>

      <p className="text-xs text-[#bdc3c7] text-center leading-relaxed px-4">
        No account needed. Your message goes directly to the Living Frame owner.
      </p>
    </div>
  );
}
