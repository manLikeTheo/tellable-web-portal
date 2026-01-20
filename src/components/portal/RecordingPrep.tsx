// components/portal/RecordingPrep.tsx
import React, { useState, useEffect, useRef } from "react";
import { InvitationDetails } from "../../types/portal";
import {
  Mic,
  User,
  Check,
  AlertCircle,
  ChevronDown,
  Lightbulb,
  Headphones,
  MessageCircle,
  Clock,
  RotateCcw,
  CircleDot,
} from "lucide-react";

interface RecordingPrepProps {
  invitation: InvitationDetails;
  onStartRecording: (name: string) => void;
  onBack: () => void;
}

const RecordingPrep: React.FC<RecordingPrepProps> = ({
  invitation,
  onStartRecording,
  onBack,
}) => {
  const [guestName, setGuestName] = useState(invitation.invitee_name || "");
  const [micPermission, setMicPermission] = useState<
    "pending" | "granted" | "denied"
  >("pending");
  const [audioLevel, setAudioLevel] = useState(0);
  const [expandedTip, setExpandedTip] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const checkMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setMicPermission("granted");

      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);

      analyser.smoothingTimeConstant = 0.8;
      analyser.fftSize = 1024;

      microphone.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      monitorAudioLevel();
    } catch (error) {
      console.error("Microphone access denied:", error);
      setMicPermission("denied");
    }
  };

  const monitorAudioLevel = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    const normalizedLevel = Math.min(100, (average / 128) * 100);

    setAudioLevel(normalizedLevel);

    animationRef.current = requestAnimationFrame(monitorAudioLevel);
  };

  const handleStartRecording = () => {
    if (guestName.trim() && micPermission === "granted") {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      onStartRecording(guestName.trim());
    }
  };

  const tips = [
    {
      icon: Headphones,
      title: "Find a quiet spot",
      detail:
        "Background noise can be distracting. Choose a calm environment where you can speak clearly without interruptions.",
    },
    {
      icon: MessageCircle,
      title: "Speak naturally",
      detail:
        "Talk like you're having a conversation with a friend. Your authentic voice is what makes the story special.",
    },
    {
      icon: Clock,
      title: "Take your time",
      detail:
        "There's no rush. Pause when you need to gather your thoughts. We're here to capture your story, not test your speed.",
    },
    {
      icon: RotateCcw,
      title: "You can re-record",
      detail:
        "Not happy with your first take? No problem! You'll have a chance to listen and re-record if needed.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8 animate-fade-in">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/40"></div>
          <div className="w-3 h-3 rounded-full bg-gray-600"></div>
          <div className="w-3 h-3 rounded-full bg-gray-600"></div>
        </div>

        {/* Main Card */}
        <div
          className={`bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 border border-yellow-500/20 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          {/* Back Button */}
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-yellow-400 mb-6 transition-colors group"
          >
            <span className="text-xl group-hover:-translate-x-1 transition-transform">
              ←
            </span>
            <span className="font-medium">Back</span>
          </button>

          {/* Header */}
          <div
            className="text-center mb-8 animate-fade-in-up"
            style={{ animationDelay: "200ms" }}
          >
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Mic className="w-12 h-12 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
              Get Ready
            </h1>
            <p className="text-gray-300">
              Just a few quick steps before we start recording
            </p>
          </div>

          {/* Name Input */}
          <div
            className="mb-8 animate-fade-in-up"
            style={{ animationDelay: "300ms" }}
          >
            <label className="block text-white font-bold text-lg mb-3">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-yellow-400" strokeWidth={2} />
                <span>Confirm your name</span>
              </div>
            </label>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Enter your name..."
              className="w-full px-5 py-4 bg-gray-700/50 border-2 border-gray-600 rounded-xl focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 text-white placeholder-gray-400 text-lg transition-all"
              maxLength={50}
            />
            <p className="text-gray-400 text-sm mt-2">
              This is how your story will be credited in the book
            </p>
          </div>

          {/* Microphone Check */}
          <div
            className="mb-8 animate-fade-in-up"
            style={{ animationDelay: "400ms" }}
          >
            <label className="block text-white font-bold text-lg mb-3">
              <div className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-yellow-400" strokeWidth={2} />
                <span>Microphone Check</span>
              </div>
            </label>

            {micPermission === "pending" && (
              <button
                onClick={checkMicrophone}
                className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 text-gray-900 py-4 rounded-xl font-semibold hover:from-yellow-700 hover:to-yellow-600 transition-all shadow-lg"
              >
                Test Microphone
              </button>
            )}

            {micPermission === "granted" && (
              <div className="bg-green-900/30 border-2 border-green-500/30 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-6 h-6 text-white" strokeWidth={3} />
                  </div>
                  <div>
                    <p className="text-green-400 font-bold">
                      Microphone Ready!
                    </p>
                    <p className="text-green-300/80 text-sm">
                      Speak to see the levels
                    </p>
                  </div>
                </div>

                {/* Audio Level Bars */}
                <div className="flex items-end gap-1 h-12">
                  {[...Array(20)].map((_, i) => {
                    const threshold = (i / 20) * 100;
                    const isActive = audioLevel > threshold;
                    return (
                      <div
                        key={i}
                        className={`flex-1 rounded-t transition-all duration-100 ${
                          isActive
                            ? audioLevel > 70
                              ? "bg-red-500"
                              : audioLevel > 40
                              ? "bg-yellow-500"
                              : "bg-green-500"
                            : "bg-gray-700"
                        }`}
                        style={{
                          height: isActive ? `${40 + (i / 20) * 60}%` : "20%",
                        }}
                      ></div>
                    );
                  })}
                </div>
              </div>
            )}

            {micPermission === "denied" && (
              <div className="bg-red-900/30 border-2 border-red-500/30 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <AlertCircle
                    className="w-7 h-7 text-red-400"
                    strokeWidth={2}
                  />
                  <div>
                    <p className="text-red-400 font-bold mb-2">
                      Microphone Access Denied
                    </p>
                    <p className="text-red-300/80 text-sm mb-3">
                      Please enable microphone access in your browser settings
                      to continue.
                    </p>
                    <button
                      onClick={checkMicrophone}
                      className="text-red-400 font-semibold underline hover:text-red-300"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recording Tips */}
          <div
            className="mb-8 animate-fade-in-up"
            style={{ animationDelay: "500ms" }}
          >
            <label className="block text-white font-bold text-lg mb-4">
              <div className="flex items-center gap-2">
                <Lightbulb
                  className="w-5 h-5 text-yellow-400"
                  strokeWidth={2}
                />
                <span>Quick Tips for a Great Story</span>
              </div>
            </label>
            <div className="space-y-3">
              {tips.map((tip, index) => (
                <div
                  key={index}
                  className="border-2 border-gray-700 rounded-xl overflow-hidden hover:border-yellow-500/30 transition-all"
                >
                  <button
                    onClick={() =>
                      setExpandedTip(expandedTip === index ? null : index)
                    }
                    className="w-full px-5 py-4 flex items-center gap-4 hover:bg-gray-700/30 transition-colors text-left"
                  >
                    <tip.icon
                      className="w-7 h-7 text-yellow-400 flex-shrink-0"
                      strokeWidth={2}
                    />
                    <span className="flex-1 font-semibold text-white">
                      {tip.title}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        expandedTip === index ? "rotate-180" : ""
                      }`}
                      strokeWidth={2}
                    />
                  </button>
                  {expandedTip === index && (
                    <div className="px-5 pb-4 pt-2 bg-gray-700/30 animate-expand-down">
                      <p className="text-gray-300 leading-relaxed">
                        {tip.detail}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Start Recording Button */}
          <button
            onClick={handleStartRecording}
            disabled={!guestName.trim() || micPermission !== "granted"}
            className={`w-full py-5 rounded-2xl font-black text-xl transition-all transform shadow-xl ${
              guestName.trim() && micPermission === "granted"
                ? "bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-700 hover:to-red-600 hover:scale-[1.02] active:scale-[0.98] animate-fade-in-up"
                : "bg-gray-700 text-gray-500 cursor-not-allowed"
            }`}
            style={{ animationDelay: "600ms" }}
          >
            <div className="flex items-center justify-center gap-3">
              <CircleDot
                className="w-6 h-6"
                strokeWidth={2.5}
                fill="currentColor"
              />
              <span>Start Recording</span>
            </div>
          </button>

          {(!guestName.trim() || micPermission !== "granted") && (
            <p className="text-center text-gray-400 text-sm mt-4">
              {!guestName.trim()
                ? "Please enter your name to continue"
                : "Please test your microphone to continue"}
            </p>
          )}
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
        @keyframes expand-down {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 200px;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
          animation-fill-mode: both;
        }
        .animate-expand-down {
          animation: expand-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default RecordingPrep;
