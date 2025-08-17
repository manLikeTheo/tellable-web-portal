// pages/join.tsx
"use client";
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// --- Types and Interfaces ---
interface InviteDetails {
  valid: boolean;
  error?: string;
  invite_id?: string;
  book_id?: string;
  book_title?: string;
  inviter_name?: string;
  prompt_text?: string;
}

type RecordingState =
  | "idle"
  | "recording"
  | "stopped"
  | "uploading"
  | "error"
  | "success";

// --- Supabase Client Initialization ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- Main Page Component ---
export default function JoinPage() {
  const router = useRouter();
  const { token } = router.query;

  // State Management
  const [inviteDetails, setInviteDetails] = useState<InviteDetails | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // --- Effects ---
  useEffect(() => {
    const validateToken = async () => {
      if (typeof token !== "string") {
        setInviteDetails({ valid: false, error: "Invalid invitation link." });
        setIsLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase.rpc(
          "validate_invitation_token",
          {
            p_token: token,
          }
        );
        if (error) throw error;
        setInviteDetails(data);
      } catch (err: any) {
        setInviteDetails({ valid: false, error: err.message });
      } finally {
        setIsLoading(false);
      }
    };
    if (router.isReady) {
      validateToken();
    }
  }, [token, router.isReady]);

  // --- Recording Timer Effect ---
  useEffect(() => {
    if (recordingState === "recording") {
      intervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (recordingState === "idle") {
        setRecordingTime(0);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [recordingState]);

  // --- Recording Logic ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setRecordingState("stopped");
        // Stop all tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setRecordingState("recording");
    } catch (err) {
      console.error("Microphone access error:", err);
      setRecordingState("error");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingState === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  // --- Submission Logic ---
  // const handleSubmitRecording = async () => {
  //   if (!audioBlob || !token) return;
  //   setRecordingState("uploading");

  //   try {
  //     const fileName = `${Date.now()}.webm`;
  //     const filePath = `guest-uploads/${fileName}`;
  //     const { error: uploadError } = await supabase.storage
  //       .from("book-media")
  //       .upload(filePath, audioBlob);
  //     if (uploadError) throw uploadError;

  //     const { error: submissionError } = await supabase.rpc(
  //       "handle_guest_submission_updated",
  //       {
  //         p_token: token,
  //         p_media_path: filePath,
  //       }
  //     );
  //     if (submissionError) throw submissionError;

  //     setRecordingState("success");
  //   } catch (err: any) {
  //     console.error("Submission failed:", err);
  //     setRecordingState("error");
  //   }
  // };

  const handleSubmitRecording = async () => {
    if (!audioBlob || !token) {
      console.log("Missing audioBlob or token:", {
        audioBlob: !!audioBlob,
        token,
      });
      return;
    }

    setRecordingState("uploading");

    try {
      const fileName = `${Date.now()}.webm`;
      const filePath = `guest-uploads/${fileName}`;

      console.log("Uploading file:", { fileName, filePath, token });

      const { error: uploadError } = await supabase.storage
        .from("book-media")
        .upload(filePath, audioBlob);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      console.log("File uploaded successfully, calling function with:", {
        p_token: token,
        p_media_path: filePath,
      });

      const { data: functionResult, error: submissionError } =
        await supabase.rpc("handle_guest_submission_grok", {
          p_token: token,
          p_media_path: filePath,
        });

      console.log("Function result:", functionResult);
      console.log("Function error:", submissionError);

      if (submissionError) {
        console.error("Submission error:", submissionError);
        throw submissionError;
      }

      if (functionResult?.error) {
        console.error("Function returned error:", functionResult);
        throw new Error(functionResult.error);
      }

      console.log("Success! Function returned:", functionResult);
      setRecordingState("success");
    } catch (err: any) {
      console.error("Submission failed:", err);
      setRecordingState("error");
    }
  };

  // --- Helper Functions ---
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // --- Render Logic ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Validating your invitation...</p>
        </div>
      </div>
    );
  }

  if (!inviteDetails?.valid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Invalid Invitation
            </h2>
            <p className="text-gray-600">
              {inviteDetails?.error || "This link is invalid or has expired."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (recordingState === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Thank You!
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Your story has been successfully submitted to{" "}
              <span className="font-semibold text-gray-900">
                "{inviteDetails.book_title}"
              </span>
              .{inviteDetails.inviter_name} has been notified and will be
              thrilled to hear your contribution.
            </p>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                Your memory is now part of something beautiful that will be
                cherished for generations.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">
                VoiceVault
              </span>
            </div>
            <span className="text-sm text-gray-500">Memory Contribution</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Invitation Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium mb-4">
            You've been invited to contribute
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            "{inviteDetails.book_title}"
          </h1>
          <p className="text-lg text-gray-600">
            by{" "}
            <span className="font-semibold">{inviteDetails.inviter_name}</span>
          </p>
        </div>

        {/* Prompt Section */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
              <svg
                className="w-4 h-4 text-yellow-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Your Story Prompt
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {inviteDetails.prompt_text ||
                  "Share your memory for this chapter."}
              </p>
            </div>
          </div>
        </div>

        {/* Recording Section */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          {recordingState === "idle" && (
            <div className="text-center">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Ready to Share Your Story?
              </h3>
              <p className="text-gray-600 mb-6">
                Tap the button below to start recording. You can take as long as
                you need.
              </p>
              <button
                onClick={startRecording}
                className="inline-flex items-center px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
                </svg>
                Start Recording
              </button>
            </div>
          )}

          {recordingState === "recording" && (
            <div className="text-center">
              <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <svg
                  className="w-10 h-10 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Recording...
              </h3>
              <div className="text-3xl font-mono font-bold text-red-600 mb-6">
                {formatTime(recordingTime)}
              </div>
              <div className="flex items-center justify-center space-x-2 mb-6">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-red-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-red-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
              <button
                onClick={stopRecording}
                className="inline-flex items-center px-8 py-4 bg-gray-700 hover:bg-gray-800 text-white font-semibold rounded-xl transition-colors duration-200"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 6h12v12H6z" />
                </svg>
                Stop Recording
              </button>
            </div>
          )}

          {recordingState === "stopped" && audioBlob && (
            <div className="text-center">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Review Your Recording
              </h3>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <audio
                  src={URL.createObjectURL(audioBlob)}
                  controls
                  className="w-full"
                  style={{ height: "40px" }}
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={() => {
                    setRecordingState("idle");
                    setAudioBlob(null);
                  }}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors duration-200"
                >
                  Record Again
                </button>
                <button
                  onClick={handleSubmitRecording}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  Submit Story
                </button>
              </div>
            </div>
          )}

          {recordingState === "uploading" && (
            <div className="text-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Uploading Your Story
              </h3>
              <p className="text-gray-600">
                Please wait while we save your contribution...
              </p>
            </div>
          )}

          {recordingState === "error" && (
            <div className="text-center">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Something Went Wrong
              </h3>
              <p className="text-gray-600 mb-4">
                We couldn't access your microphone or save your recording.
                Please check your browser permissions and try again.
              </p>
              <button
                onClick={() => setRecordingState("idle")}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Powered by VoiceVault - Preserving memories for generations
          </p>
        </div>
      </div>
    </div>
  );
}
