// components/contributor/ReviewView.tsx

"use client";

import React, { useRef, useState } from "react";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

interface Props {
  medium: "audio" | "video";
  blobUrl: string;
  duration: number;
  isSubmitting: boolean;
  onDiscard: () => void;
  onSubmit: (name: string) => void;
}

export default function ReviewView({
  medium,
  blobUrl,
  duration,
  isSubmitting,
  onDiscard,
  onSubmit,
}: Props) {
  const [name, setName] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="flex flex-col flex-1 px-6 py-8 gap-6">
      <div>
        <h2 className="text-2xl font-extrabold text-[#2c3e50] tracking-tight mb-1">
          Review your message
        </h2>
        <p className="text-[#7f8c8d] text-sm leading-relaxed">
          Listen back before sending. Discard and re-record if you'd like to try
          again.
        </p>
      </div>

      {/* Playback */}
      {medium === "video" ? (
        <div className="rounded-2xl overflow-hidden bg-black flex-1 min-h-0">
          <video
            src={blobUrl}
            controls
            playsInline
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center flex-1 gap-3">
          <audio
            ref={audioRef}
            src={blobUrl}
            onEnded={() => setIsPlaying(false)}
          />
          <button
            onClick={handlePlayPause}
            className="w-24 h-24 rounded-full bg-[#eef4fa] border border-[#cde0f5] flex items-center justify-center active:scale-95 transition-transform"
          >
            {isPlaying ? (
              <svg width="36" height="36" viewBox="0 0 24 24" fill="#2C5F8A">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="#2C5F8A"
                style={{ marginLeft: "4px" }}
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            )}
          </button>
          <span className="text-lg font-bold text-[#2c3e50]">
            {formatTime(duration)}
          </span>
          <span className="text-sm text-[#7f8c8d]">
            {isPlaying ? "Tap to pause" : "Tap to play"}
          </span>
        </div>
      )}

      {/* Name input */}
      <div>
        <label className="block text-xs font-bold text-[#7f8c8d] uppercase tracking-wider mb-2">
          Your name (optional)
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Uncle Emeka"
          maxLength={60}
          className="w-full rounded-xl border border-[#ecf0f1] bg-[#f8f9fa] px-4 py-3 text-[#2c3e50] text-base placeholder:text-[#bdc3c7] focus:outline-none focus:border-[#2C5F8A] focus:ring-1 focus:ring-[#2C5F8A] transition-colors"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pb-2">
        <button
          onClick={onDiscard}
          disabled={isSubmitting}
          className="flex-1 flex items-center justify-center gap-2 border-2 border-red-400 rounded-full py-3.5 text-red-500 font-bold text-base active:scale-95 transition-transform disabled:opacity-50"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6" />
          </svg>
          Discard
        </button>

        <button
          onClick={() => onSubmit(name)}
          disabled={isSubmitting}
          className="flex-[2] flex items-center justify-center gap-2 rounded-full py-3.5 text-white font-bold text-base active:scale-95 transition-transform disabled:opacity-60"
          style={{
            background: isSubmitting
              ? "#7f8c8d"
              : "linear-gradient(to right, #1a3e5c, #2C5F8A)",
          }}
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Sending...
            </>
          ) : (
            <>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Send message
            </>
          )}
        </button>
      </div>
    </div>
  );
}
