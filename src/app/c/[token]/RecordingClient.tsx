// app/c/[token]/RecordingClient.tsx
//
// Client Component: orchestrates the full contributor recording flow.
//   landing → countdown → recording → paused → reviewing → success
//
// Uses the browser-native MediaRecorder API — no native dependencies.
// Upload goes directly from the browser to Supabase Storage (frame-media
// bucket) using the anon client. DB writes happen via Server Action.

"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { getAnonClient } from "@/lib/contributor";
import { submitContribution } from "./actions";
import LandingView from "@/components/frame-contributor/LandingView";
import CountdownView from "@/components/frame-contributor/CountdownView";
import RecordingView from "@/components/frame-contributor/RecordingView";
import ReviewView from "@/components/frame-contributor/ReviewView";
import SuccessView from "@/components/frame-contributor/SuccessView";

// ── Types ──────────────────────────────────────────────────────────────────────

type FlowState =
  | "landing"
  | "countdown"
  | "recording"
  | "paused"
  | "reviewing"
  | "submitting"
  | "success";

const MAX_SECONDS = 60;

// ── Props ──────────────────────────────────────────────────────────────────────

interface Props {
  contributorId: string;
  storyPageId: string;
  token: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

// Pick the best supported MIME type for the current browser
function getBestMimeType(medium: "audio" | "video"): string {
  const candidates =
    medium === "video"
      ? [
          "video/webm;codecs=vp9,opus",
          "video/webm;codecs=vp8,opus",
          "video/webm",
          "video/mp4",
        ]
      : [
          "audio/webm;codecs=opus",
          "audio/webm",
          "audio/ogg;codecs=opus",
          "audio/mp4",
        ];

  return candidates.find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
}

// Derive a sensible file extension from the MIME type
function mimeToExt(mimeType: string): string {
  if (mimeType.includes("mp4")) return "mp4";
  if (mimeType.includes("ogg")) return "ogg";
  return "webm";
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function RecordingClient({
  contributorId,
  storyPageId,
  token,
}: Props) {
  const [flowState, setFlowState] = useState<FlowState>("landing");
  const [medium, setMedium] = useState<"audio" | "video">("audio");
  const [countdown, setCountdown] = useState(3);
  const [duration, setDuration] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [mimeType, setMimeType] = useState("");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [contributorName, setContributorName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Mirror flowState to ref for use inside setInterval callbacks
  const flowStateRef = useRef<FlowState>("landing");
  useEffect(() => {
    flowStateRef.current = flowState;
  }, [flowState]);

  // ── Cleanup on unmount ───────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      clearTimers();
      stopStream();
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, []);

  const clearTimers = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const stopStream = () => {
    stream?.getTracks().forEach((t) => t.stop());
  };

  // ── Timer ────────────────────────────────────────────────────────────────────

  useEffect(() => {
    clearTimers();

    if (flowState === "countdown") {
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearTimers();
            beginRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    if (flowState === "recording" && !isPaused) {
      timerRef.current = setInterval(() => {
        setDuration((prev) => {
          const next = prev + 1;
          if (next >= MAX_SECONDS && flowStateRef.current === "recording") {
            clearTimers();
            setTimeout(() => handleStopRef.current(), 0);
          }
          return next;
        });
      }, 1000);
    }

    return () => clearTimers();
  }, [flowState, isPaused]);

  // ── Medium selection → request permissions → countdown ───────────────────────

  const handleSelectMedium = async (selected: "audio" | "video") => {
    setError(null);
    setMedium(selected);

    try {
      const constraints: MediaStreamConstraints =
        selected === "video"
          ? { video: { facingMode: "user" }, audio: true }
          : { audio: true };

      const mediaStream = await navigator.mediaDevices.getUserMedia(
        constraints
      );
      setStream(mediaStream);
      setCountdown(3);
      setFlowState("countdown");
    } catch (err: any) {
      const isPermission =
        err.name === "NotAllowedError" || err.name === "PermissionDeniedError";
      setError(
        isPermission
          ? "Microphone/camera access was denied. Please allow access in your browser settings and try again."
          : "Could not access your microphone or camera. Please try again."
      );
    }
  };

  // ── Begin recording ───────────────────────────────────────────────────────────

  const beginRecording = useCallback(() => {
    if (!stream) {
      setError("Media stream not available. Please go back and try again.");
      setFlowState("landing");
      return;
    }

    const mime = getBestMimeType(medium);
    setMimeType(mime);
    chunksRef.current = [];

    try {
      const recorder = new MediaRecorder(
        stream,
        mime ? { mimeType: mime } : {}
      );

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const recorded = new Blob(chunksRef.current, {
          type: mime || "audio/webm",
        });
        const url = URL.createObjectURL(recorded);
        setBlob(recorded);
        setBlobUrl(url);
        setFlowState("reviewing");
      };

      recorder.start(250); // collect in 250ms chunks for smooth progress
      mediaRecorderRef.current = recorder;
      setDuration(0);
      setIsPaused(false);
      setFlowState("recording");
    } catch (err: any) {
      console.error("❌ [RecordingClient] MediaRecorder start failed:", err);
      setError("Recording could not start. Please try a different browser.");
      setFlowState("landing");
    }
  }, [stream, medium]);

  // ── Stop ──────────────────────────────────────────────────────────────────────

  const handleStop = useCallback(() => {
    clearTimers();
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") return;
    recorder.stop();
    // onstop handler above transitions to "reviewing"
  }, []);

  const handleStopRef = useRef(handleStop);
  useEffect(() => {
    handleStopRef.current = handleStop;
  }, [handleStop]);

  // ── Pause / Resume ────────────────────────────────────────────────────────────

  const handlePause = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === "recording") {
      recorder.pause();
    }
    setIsPaused(true);
    clearTimers();
  };

  const handleResume = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === "paused") {
      recorder.resume();
    }
    setIsPaused(false);
  };

  // ── Discard ───────────────────────────────────────────────────────────────────

  const handleDiscard = () => {
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
      setBlobUrl(null);
    }
    setBlob(null);
    setDuration(0);
    setIsPaused(false);
    chunksRef.current = [];
    mediaRecorderRef.current = null;
    // Keep stream alive so user can re-record without re-requesting permissions
    setFlowState("landing");
  };

  // ── Submit ────────────────────────────────────────────────────────────────────

  const handleSubmit = async (name: string) => {
    if (!blob) return;
    setContributorName(name);
    setFlowState("submitting");

    try {
      const supabase = getAnonClient();
      const ext = mimeToExt(mimeType || "");
      const fileName = `${uuidv4()}.${ext}`;
      const filePath = `contributors/${token}/${fileName}`;
      const contentType = mimeType || "audio/webm";

      console.log(`📤 [RecordingClient] Uploading to frame-media/${filePath}`);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("frame-media")
        .upload(filePath, blob, { contentType, upsert: false });

      if (uploadError) throw uploadError;

      // 1-year signed URL for playback
      const { data: signedData } = await supabase.storage
        .from("frame-media")
        .createSignedUrl(uploadData.path, 60 * 60 * 24 * 365);

      const recordingUrl = signedData?.signedUrl ?? uploadData.path;
      const recordingType = medium;

      // DB writes via Server Action (uses service role — not exposed to browser)
      const result = await submitContribution({
        contributorId,
        storyPageId,
        recordingUrl,
        recordingType,
        contributorName: name,
      });

      if (!result.success) throw new Error(result.error);

      // Clean up stream — recording is complete
      stopStream();
      setStream(null);
      setFlowState("success");
      console.log("✅ [RecordingClient] Contribution submitted");
    } catch (err: any) {
      console.error("❌ [RecordingClient] Submit failed:", err.message);
      setError(
        "Could not send your message. Please check your connection and try again."
      );
      setFlowState("reviewing");
    }
  };

  // ── Header title ──────────────────────────────────────────────────────────────

  const headerTitle: Record<FlowState, string> = {
    landing: "Add Your Voice",
    countdown: "Get ready",
    recording: medium === "video" ? "Recording video" : "Recording audio",
    paused: "Paused",
    reviewing: "Review message",
    submitting: "Sending...",
    success: "Message sent",
  };

  const showHeader = flowState !== "success" && flowState !== "landing";

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-white flex flex-col max-w-md mx-auto">
      {/* Brand header */}
      <div className="flex items-center justify-center h-14 border-b border-[#ecf0f1] px-4 shrink-0">
        {showHeader ? (
          <span className="text-sm font-bold text-[#2c3e50]">
            {headerTitle[flowState]}
          </span>
        ) : (
          <span className="text-lg font-bold tracking-tight text-[#1a3e5c]">
            Awa<span className="text-[#C9A961]">Chapter</span>
          </span>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-4 mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 leading-relaxed">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 underline font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Body */}
      <div className="flex flex-col flex-1 min-h-0">
        {flowState === "landing" && (
          <LandingView onSelect={handleSelectMedium} />
        )}

        {flowState === "countdown" && (
          <CountdownView count={countdown} medium={medium} />
        )}

        {(flowState === "recording" || flowState === "paused") && (
          <RecordingView
            medium={medium}
            duration={duration}
            isPaused={isPaused}
            stream={stream}
            onPause={handlePause}
            onResume={handleResume}
            onStop={handleStop}
          />
        )}

        {(flowState === "reviewing" || flowState === "submitting") &&
          blobUrl && (
            <ReviewView
              medium={medium}
              blobUrl={blobUrl}
              duration={duration}
              isSubmitting={flowState === "submitting"}
              onDiscard={handleDiscard}
              onSubmit={handleSubmit}
            />
          )}

        {flowState === "success" && (
          <SuccessView contributorName={contributorName} />
        )}
      </div>
    </main>
  );
}
