// components/portal/RecordingInterface.tsx
import React, { useState, useRef, useEffect } from "react";
import { InvitationDetails } from "../../types/portal";

interface RecordingInterfaceProps {
  token: string;
  invitation: InvitationDetails;
  guestName: string;
  onSuccess: (submissionId: string) => void;
  onBack: () => void;
}

type RecordingState = "idle" | "recording" | "stopped" | "uploading" | "error";

const RecordingInterface: React.FC<RecordingInterfaceProps> = ({
  token,
  invitation,
  guestName,
  onSuccess,
  onBack,
}) => {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [storyTitle, setStoryTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setRecordingState("recording");
      setRecordingTime(0);

      intervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Recording error:", err);
      setError(
        "Unable to access microphone. Please check permissions and try again."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingState === "recording") {
      mediaRecorderRef.current.stop();
      setRecordingState("stopped");

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  const restartRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl("");
    setRecordingTime(0);
    setRecordingState("idle");
    setError("");
  };

  const submitStory = async () => {
    if (!audioBlob || !guestName.trim()) return;
    setIsSubmitting(true);
    setError("");

    try {
      console.log("📤 Starting story submission...");

      const formData = new FormData();
      formData.append("audio", audioBlob, `${Date.now()}_recording.webm`);
      formData.append("token", token);

      console.log("📤 Uploading audio to server...");
      const uploadResponse = await fetch("/api/portal/upload-audio", {
        method: "POST",
        body: formData,
      });

      console.log("Upload response status:", uploadResponse.status);

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error("❌ Upload failed:", errorText);
        throw new Error("Failed to upload audio");
      }

      // Parse response ONCE
      const uploadData = await uploadResponse.json();
      console.log("✅ Audio uploaded successfully:", uploadData);

      // Extract data from parsed response
      const { audioPath, audioUrl: uploadedUrl, bucket } = uploadData;

      if (!audioPath) {
        console.error("❌ No audioPath in upload response:", uploadData);
        throw new Error("Server did not return audio path");
      }

      console.log("📝 Submitting story with audioPath:", audioPath);

      // Submit story with BOTH audioPath (for transcription) and audioUrl (for storage)
      const submissionResponse = await fetch("/api/portal/submit-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          guestName: guestName.trim(),
          storyTitle: storyTitle.trim() || null,
          storyContent: "Voice recording submission",
          audioPath,
          audioUrl: uploadedUrl,
        }),
      });

      console.log("Submission response status:", submissionResponse.status);

      if (!submissionResponse.ok) {
        const errorData = await submissionResponse.json();
        console.error("❌ Submission failed:", errorData);
        throw new Error(errorData.error || "Failed to submit story");
      }

      const submissionData = await submissionResponse.json();
      console.log("✅ Story submitted successfully:", submissionData);

      // Pass only the submissionId, not the whole object
      onSuccess(submissionData.submissionId);
    } catch (err) {
      console.error("💥 Submission error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit story. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span>Back</span>
        </button>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Record Your Story
          </h1>
          <p className="text-gray-600">
            for <span className="font-semibold">"{invitation.book_title}"</span>
          </p>
        </div>

        <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-2xl p-6 mb-8">
          <p className="text-lg text-gray-900 leading-relaxed">
            {invitation.prompt_content}
          </p>
        </div>

        <div className="text-center mb-8">
          {/* Recording Visualizer */}
          <div className="relative mb-6">
            <div
              className={`w-32 h-32 rounded-full mx-auto flex items-center justify-center transition-all duration-300 ${
                recordingState === "recording"
                  ? "bg-red-500 animate-pulse shadow-lg shadow-red-200"
                  : recordingState === "stopped"
                  ? "bg-green-500 shadow-lg shadow-green-200"
                  : "bg-gray-300"
              }`}
            >
              <svg
                className="w-16 h-16 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </div>

            {/* Recording Timer */}
            {(recordingState === "recording" ||
              recordingState === "stopped") && (
              <div className="mt-4">
                <p className="text-2xl font-mono font-bold text-gray-900">
                  {formatTime(recordingTime)}
                </p>
                <p className="text-sm text-gray-600">
                  {recordingState === "recording"
                    ? "Recording..."
                    : "Recording complete"}
                </p>
              </div>
            )}
          </div>

          {/* Recording Controls */}
          <div className="flex justify-center space-x-4">
            {recordingState === "idle" && (
              <button
                onClick={startRecording}
                className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-full font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                  <span>Start Recording</span>
                </div>
              </button>
            )}

            {recordingState === "recording" && (
              <button
                onClick={stopRecording}
                className="bg-gray-800 hover:bg-gray-900 text-white px-8 py-4 rounded-full font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-white"></div>
                  <span>Stop Recording</span>
                </div>
              </button>
            )}

            {recordingState === "stopped" && (
              <div className="flex space-x-3">
                <button
                  onClick={restartRecording}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-full font-medium transition-all duration-200"
                >
                  🔄 Re-record
                </button>
              </div>
            )}
          </div>
        </div>

        {audioUrl && recordingState === "stopped" && (
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Preview Your Recording
            </h3>
            <audio controls className="w-full">
              <source src={audioUrl} type="audio/webm" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        {recordingState === "stopped" && (
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Give your story a title (optional)
            </label>
            <input
              type="text"
              value={storyTitle}
              onChange={(e) => setStoryTitle(e.target.value)}
              placeholder="My story about..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              maxLength={100}
            />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-2">
              <svg
                className="w-5 h-5 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.766 0L3.048 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <p className="text-red-800 font-medium">Error</p>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        )}

        {recordingState === "stopped" && (
          <button
            onClick={submitStory}
            disabled={isSubmitting || !audioBlob}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
              isSubmitting
                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 transform hover:scale-[1.02] active:scale-[0.98]"
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                <span>Sharing your story...</span>
              </div>
            ) : (
              "✨ Share Your Story"
            )}
          </button>
        )}

        {recordingState === "idle" && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 mb-2">
              💡 <strong>Tip:</strong> Speak clearly and take your time
            </p>
            <p className="text-xs text-gray-500">
              Most great stories are 1-3 minutes long
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecordingInterface;
