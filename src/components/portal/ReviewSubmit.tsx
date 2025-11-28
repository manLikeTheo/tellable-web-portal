// components/portal/ReviewSubmit.tsx
import React, { useState, useEffect, useRef } from "react";
import { InvitationDetails } from "../../types/portal";

interface ReviewSubmitProps {
  invitation: InvitationDetails;
  audioBlob: Blob;
  audioDuration: number;
  guestName: string;
  token: string;
  onSuccess: (submissionId: string) => void;
  onReRecord: () => void;
}

const ReviewSubmit: React.FC<ReviewSubmitProps> = ({
  invitation,
  audioBlob,
  audioDuration,
  guestName,
  token,
  onSuccess,
  onReRecord,
}) => {
  const [storyTitle, setStoryTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const url = URL.createObjectURL(audioBlob);
    setAudioUrl(url);
    const timer = setTimeout(() => setIsVisible(true), 100);

    return () => {
      URL.revokeObjectURL(url);
      clearTimeout(timer);
    };
  }, [audioBlob]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const handleSubmit = async () => {
    if (!audioBlob) return;
    setIsSubmitting(true);
    setError("");

    try {
      // Upload audio
      const formData = new FormData();
      formData.append("audio", audioBlob, `${Date.now()}_recording.webm`);
      formData.append("token", token);
      formData.append("duration", audioDuration.toString());

      const uploadResponse = await fetch("/api/portal/upload-audio", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload audio");
      }

      const uploadData = await uploadResponse.json();
      const { audioPath, audioUrl: uploadedUrl } = uploadData;

      if (!audioPath) {
        throw new Error("Server did not return audio path");
      }

      // Submit story
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
          duration: audioDuration,
        }),
      });

      if (!submissionResponse.ok) {
        const errorData = await submissionResponse.json();
        throw new Error(errorData.error || "Failed to submit story");
      }

      const submissionData = await submissionResponse.json();
      onSuccess(submissionData.submissionId);
    } catch (err) {
      console.error("Submission error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit story. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = audioRef.current
    ? (currentTime / audioRef.current.duration) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8 animate-fade-in">
          <div className="w-3 h-3 rounded-full bg-purple-600"></div>
          <div className="w-3 h-3 rounded-full bg-purple-600"></div>
          <div className="w-3 h-3 rounded-full bg-purple-600"></div>
          <div className="w-3 h-3 rounded-full bg-purple-600"></div>
          <div className="w-3 h-3 rounded-full bg-purple-300"></div>
        </div>

        {/* Main Card */}
        <div
          className={`bg-white rounded-3xl shadow-2xl p-8 md:p-10 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          {/* Header */}
          <div
            className="text-center mb-8 animate-fade-in-up"
            style={{ animationDelay: "200ms" }}
          >
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-4xl">✨</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
              Review Your Story
            </h1>
            <p className="text-gray-600">
              Listen to your recording before sharing
            </p>
          </div>

          {/* Audio Player Card */}
          <div
            className="mb-8 animate-fade-in-up"
            style={{ animationDelay: "300ms" }}
          >
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-8 shadow-xl">
              <audio ref={audioRef} src={audioUrl} preload="metadata" />

              {/* Custom Audio Player */}
              <div className="space-y-6">
                {/* Waveform Visualization (Simplified) */}
                <div className="flex items-center justify-center gap-1 h-16">
                  {[...Array(30)].map((_, i) => {
                    const isActive = (i / 30) * 100 < progress;
                    return (
                      <div
                        key={i}
                        className={`flex-1 rounded-full transition-all duration-200 ${
                          isActive ? "bg-white" : "bg-white/30"
                        }`}
                        style={{
                          height: `${30 + Math.random() * 70}%`,
                        }}
                      ></div>
                    );
                  })}
                </div>

                {/* Play Button & Time */}
                <div className="flex items-center gap-6">
                  <button
                    onClick={togglePlayback}
                    className="w-16 h-16 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                  >
                    {isPlaying ? (
                      <span className="text-3xl text-purple-600">⏸</span>
                    ) : (
                      <span className="text-3xl text-purple-600 ml-1">▶</span>
                    )}
                  </button>

                  <div className="flex-1">
                    {/* Progress Bar */}
                    <div className="bg-white/30 rounded-full h-2 overflow-hidden mb-2">
                      <div
                        className="bg-white h-full transition-all duration-200 rounded-full"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    {/* Time Display */}
                    <div className="flex justify-between text-white text-sm font-mono">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(audioDuration)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Title Input */}
          <div
            className="mb-8 animate-fade-in-up"
            style={{ animationDelay: "400ms" }}
          >
            <label className="block text-gray-900 font-bold text-lg mb-3">
              ✏️ Give your story a title (optional)
            </label>
            <input
              type="text"
              value={storyTitle}
              onChange={(e) => setStoryTitle(e.target.value)}
              placeholder="My story about..."
              className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 text-lg transition-all"
              maxLength={100}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-gray-500 text-sm">
                This will appear above your recording
              </p>
              <p className="text-gray-400 text-xs">{storyTitle.length}/100</p>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5 mb-6 animate-shake">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="text-red-900 font-bold mb-1">
                    Submission Error
                  </p>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div
            className="flex flex-col sm:flex-row gap-4 animate-fade-in-up"
            style={{ animationDelay: "500ms" }}
          >
            <button
              onClick={onReRecord}
              disabled={isSubmitting}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl">🔄</span>
                <span>Re-record</span>
              </div>
            </button>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 rounded-xl font-black text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sharing your story...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl">✨</span>
                  <span>Share Your Story</span>
                </div>
              )}
            </button>
          </div>

          {/* Preview Tip */}
          <div
            className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-4 animate-fade-in-up"
            style={{ animationDelay: "600ms" }}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">💡</span>
              <p className="text-blue-800 text-sm">
                <strong>Pro tip:</strong> Listen to your recording before
                submitting to make sure you're happy with it!
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-10px);
          }
          75% {
            transform: translateX(10px);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
          animation-fill-mode: both;
        }
        .animate-shake {
          animation: shake 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ReviewSubmit;
