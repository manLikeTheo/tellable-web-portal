// components/contributor/RecordingView.tsx
//
// Active recording state for both audio and video.
// Uses MediaRecorder API — no third-party libraries required.
// Handles the live camera preview for video via a <video> element.

"use client";

import React, { useEffect, useRef } from "react";

const MAX_SECONDS = 60;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

interface Props {
  medium: "audio" | "video";
  duration: number;
  isPaused: boolean;
  stream: MediaStream | null;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export default function RecordingView({
  medium,
  duration,
  isPaused,
  stream,
  onPause,
  onResume,
  onStop,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressPct = Math.min((duration / MAX_SECONDS) * 100, 100);
  const isNearEnd = duration >= MAX_SECONDS - 10;

  // Attach live stream to video preview
  useEffect(() => {
    if (videoRef.current && stream && medium === "video") {
      videoRef.current.srcObject = stream;
    }
  }, [stream, medium]);

  return (
    <div className="flex-1 flex flex-col bg-[#1a2733]">
      {/* Camera preview (video only) */}
      {medium === "video" && (
        <div className="relative flex-1 bg-black overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {/* REC overlay */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
            <div
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold text-white ${
                isPaused ? "bg-black/50" : "bg-red-500/80"
              }`}
            >
              {!isPaused && (
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              )}
              {isPaused ? "PAUSED" : "REC"} · {formatTime(duration)}
            </div>
          </div>
          {/* Progress bar overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div
              className={`h-full transition-all duration-1000 ${
                isNearEnd ? "bg-amber-400" : "bg-white"
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          {isNearEnd && !isPaused && (
            <div className="absolute bottom-3 left-0 right-0 text-center text-amber-400 text-xs font-bold">
              {MAX_SECONDS - duration}s remaining
            </div>
          )}
        </div>
      )}

      {/* Audio-only display */}
      {medium === "audio" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
          {/* Status badge */}
          <div
            className={`flex items-center gap-2 rounded-full px-4 py-2 ${
              isPaused ? "bg-white/10" : "bg-red-500/20"
            }`}
          >
            {!isPaused && (
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            )}
            <span className="text-white text-sm font-bold tracking-widest">
              {isPaused ? "PAUSED" : "REC"} · {formatTime(duration)}
            </span>
          </div>

          {/* Large timer */}
          <span
            className="text-white font-extrabold leading-none"
            style={{
              fontSize: "clamp(56px, 18vw, 80px)",
              letterSpacing: "-3px",
            }}
          >
            {formatTime(duration)}
          </span>
          <span
            className={`text-sm ${
              isNearEnd ? "text-amber-400 font-bold" : "text-white/30"
            }`}
          >
            {isNearEnd
              ? `${MAX_SECONDS - duration}s remaining`
              : `/ ${formatTime(MAX_SECONDS)}`}
          </span>

          {/* Progress bar */}
          <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden mt-2">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                isNearEnd ? "bg-amber-400" : "bg-[#2C5F8A]"
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {isPaused && (
            <p className="text-white/40 text-sm text-center mt-2">
              Tap Resume when you're ready to continue.
            </p>
          )}
        </div>
      )}

      {/* Controls */}
      <div
        className={`flex items-center justify-between px-10 py-6 ${
          medium === "video" ? "bg-[#111]" : ""
        }`}
      >
        {/* Pause / Resume */}
        {isPaused ? (
          <button
            onClick={onResume}
            className="flex flex-col items-center gap-1 w-14"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            <span className="text-white/50 text-xs">Resume</span>
          </button>
        ) : (
          <button
            onClick={onPause}
            className="flex flex-col items-center gap-1 w-14"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
            <span className="text-white/50 text-xs">Pause</span>
          </button>
        )}

        {/* Stop */}
        <button
          onClick={onStop}
          className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/40 active:scale-95 transition-transform"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        </button>

        {/* Spacer */}
        <div className="w-14" />
      </div>
    </div>
  );
}
