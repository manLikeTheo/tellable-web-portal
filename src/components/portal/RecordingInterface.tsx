// components/portal/RecordingInterface.tsx
import React, { useState, useRef, useEffect } from "react";
import { InvitationDetails } from "../../types/portal";

interface RecordingInterfaceProps {
  invitation: InvitationDetails;
  guestName: string;
  onComplete: (audioBlob: Blob, duration: number) => void;
  onBack: () => void;
}

type RecordingState = "idle" | "recording" | "stopped";

const RecordingInterface: React.FC<RecordingInterfaceProps> = ({
  invitation,
  guestName,
  onComplete,
  onBack,
}) => {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevels, setAudioLevels] = useState<number[]>(Array(20).fill(0));
  const [isVisible, setIsVisible] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (recordingState === "idle") {
      startRecording();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const visualizeAudio = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Sample 20 points for visualization
    const samples = 20;
    const levels = [];
    for (let i = 0; i < samples; i++) {
      const index = Math.floor((i / samples) * dataArray.length);
      levels.push((dataArray[index] / 255) * 100);
    }

    setAudioLevels(levels);
    animationRef.current = requestAnimationFrame(visualizeAudio);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;

      // Setup audio analyzer
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      analyser.smoothingTimeConstant = 0.8;
      analyser.fftSize = 1024;
      microphone.connect(analyser);
      analyserRef.current = analyser;

      // Start visualization
      visualizeAudio();

      // Setup recorder
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

      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });

        // Get actual duration
        const duration = await getAudioDuration(blob);

        stream.getTracks().forEach((track) => track.stop());
        onComplete(blob, duration);
      };

      mediaRecorder.start();
      setRecordingState("recording");
      setRecordingTime(0);

      intervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Recording error:", err);
      alert("Unable to access microphone. Please check permissions.");
    }
  };

  const getAudioDuration = (blob: Blob): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      const url = URL.createObjectURL(blob);

      audio.addEventListener("loadedmetadata", () => {
        const duration = Math.round(audio.duration);
        URL.revokeObjectURL(url);
        resolve(duration);
      });

      audio.addEventListener("error", () => {
        URL.revokeObjectURL(url);
        resolve(recordingTime); // Fallback to timer
      });

      audio.src = url;
    });
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingState === "recording") {
      mediaRecorderRef.current.stop();
      setRecordingState("stopped");

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-red-200/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      <div className="w-full max-w-3xl relative z-10">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8 animate-fade-in">
          <div className="w-3 h-3 rounded-full bg-purple-600"></div>
          <div className="w-3 h-3 rounded-full bg-purple-600"></div>
          <div className="w-3 h-3 rounded-full bg-purple-600"></div>
          <div className="w-3 h-3 rounded-full bg-purple-300"></div>
          <div className="w-3 h-3 rounded-full bg-gray-300"></div>
        </div>

        {/* Main Recording Card */}
        <div
          className={`bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          {/* Sticky Prompt */}
          <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-2xl p-6 mb-8 border-2 border-purple-200">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl">💭</span>
              <span className="text-purple-700 text-xs font-bold uppercase">
                Your Question
              </span>
            </div>
            <p className="text-gray-900 text-lg font-medium leading-relaxed">
              {invitation.prompt_content}
            </p>
          </div>

          {/* Waveform Visualization */}
          <div className="mb-8">
            <div className="flex items-end justify-center gap-2 h-40 bg-gradient-to-b from-gray-50 to-white rounded-2xl p-6 border-2 border-gray-200">
              {audioLevels.map((level, index) => (
                <div
                  key={index}
                  className="flex-1 bg-gradient-to-t from-red-500 to-pink-500 rounded-full transition-all duration-100 min-w-[4px]"
                  style={{
                    height: `${Math.max(10, level)}%`,
                    opacity: recordingState === "recording" ? 1 : 0.3,
                  }}
                ></div>
              ))}
            </div>
          </div>

          {/* Recording Timer */}
          <div className="text-center mb-8">
            <div
              className={`inline-flex items-center gap-3 px-8 py-4 rounded-full ${
                recordingState === "recording"
                  ? "bg-red-500 animate-pulse-gentle"
                  : "bg-gray-300"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full ${
                  recordingState === "recording"
                    ? "bg-white animate-ping-slow"
                    : "bg-gray-500"
                }`}
              ></div>
              <span className="text-white text-3xl font-black font-mono tabular-nums">
                {formatTime(recordingTime)}
              </span>
            </div>
            <p className="text-gray-600 text-lg mt-4 font-medium">
              {recordingState === "recording"
                ? "Recording in progress..."
                : "Recording paused"}
            </p>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            {recordingState === "recording" && (
              <button
                onClick={stopRecording}
                className="group bg-gray-900 hover:bg-gray-800 text-white px-12 py-5 rounded-2xl font-black text-xl transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95"
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-white rounded"></div>
                  <span>Stop Recording</span>
                </div>
              </button>
            )}
          </div>

          {/* Tips Footer */}
          <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <p className="text-blue-900 font-bold text-sm mb-1">Pro Tip</p>
                <p className="text-blue-800 text-sm">
                  Most great stories are 1-3 minutes long. Take your time and
                  speak from the heart!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recording Indicator (Floating) */}
        {recordingState === "recording" && (
          <div className="fixed top-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-full shadow-2xl animate-bounce-gentle z-50">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <span className="font-bold">REC</span>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(20px);
          }
        }
        @keyframes pulse-gentle {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        @keyframes ping-slow {
          75%,
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        @keyframes bounce-gentle {
          0%,
          100% {
            transform: translateY(0) translateX(-50%);
          }
          50% {
            transform: translateY(-10px) translateX(-50%);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        .animate-pulse-gentle {
          animation: pulse-gentle 2s ease-in-out infinite;
        }
        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default RecordingInterface;
// // components/portal/RecordingInterface.tsx -- OLD
// import React, { useState, useRef, useEffect } from "react";
// import { InvitationDetails } from "../../types/portal";

// interface RecordingInterfaceProps {
//   token: string;
//   invitation: InvitationDetails;
//   guestName: string;
//   onSuccess: (submissionId: string) => void;
//   onBack: () => void;
// }

// type RecordingState = "idle" | "recording" | "stopped" | "uploading" | "error";

// const RecordingInterface: React.FC<RecordingInterfaceProps> = ({
//   token,
//   invitation,
//   guestName,
//   onSuccess,
//   onBack,
// }) => {
//   const [recordingState, setRecordingState] = useState<RecordingState>("idle");
//   const [recordingTime, setRecordingTime] = useState(0);
//   const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
//   const [audioUrl, setAudioUrl] = useState<string>("");
//   const [audioDuration, setAudioDuration] = useState<number>(0); // NEW: Track duration

//   const [storyTitle, setStoryTitle] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState<string>("");

//   const mediaRecorderRef = useRef<MediaRecorder | null>(null);
//   const audioChunksRef = useRef<Blob[]>([]);
//   const intervalRef = useRef<NodeJS.Timeout | null>(null);
//   const streamRef = useRef<MediaStream | null>(null);

//   // ADD: Helper function to get audio duration from blob
//   const getAudioDuration = (blob: Blob): Promise<number> => {
//     return new Promise((resolve, reject) => {
//       const audio = new Audio();
//       const url = URL.createObjectURL(blob);

//       audio.addEventListener("loadedmetadata", () => {
//         const duration = Math.round(audio.duration);
//         URL.revokeObjectURL(url); //Clean up
//         resolve(duration);
//       });

//       audio.addEventListener("error", () => {
//         URL.revokeObjectURL(url); //Clean up
//         reject(new Error("Failed to get audio duration"));
//       });

//       audio.src = url;
//     });
//   };

//   useEffect(() => {
//     return () => {
//       // Cleanup
//       if (intervalRef.current) clearInterval(intervalRef.current);
//       if (streamRef.current) {
//         streamRef.current.getTracks().forEach((track) => track.stop());
//       }
//       if (audioUrl) URL.revokeObjectURL(audioUrl);
//     };
//   }, [audioUrl]);

//   const startRecording = async () => {
//     try {
//       setError("");
//       const stream = await navigator.mediaDevices.getUserMedia({
//         audio: {
//           echoCancellation: true,
//           noiseSuppression: true,
//           autoGainControl: true,
//         },
//       });

//       streamRef.current = stream;
//       const mediaRecorder = new MediaRecorder(stream, {
//         mimeType: "audio/webm;codecs=opus",
//       });

//       mediaRecorderRef.current = mediaRecorder;
//       audioChunksRef.current = [];

//       mediaRecorder.ondataavailable = (event) => {
//         if (event.data.size > 0) {
//           audioChunksRef.current.push(event.data);
//         }
//       };

//       mediaRecorder.onstop = async () => {
//         const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
//         setAudioBlob(blob);
//         const url = URL.createObjectURL(blob);
//         setAudioUrl(url);

//         //Add: Get actual audio duration from blob
//         try {
//           const duration = await getAudioDuration(blob);
//           setAudioDuration(duration);
//           console.log("📏 Audio duration:", duration, "seconds");
//         } catch (error) {
//           console.warn("⚠️ Could not determine duration, using recording time");
//           setAudioDuration(recordingTime); //Fallback timer duration
//         }
//         stream.getTracks().forEach((track) => track.stop());
//       };

//       mediaRecorder.start();
//       setRecordingState("recording");
//       setRecordingTime(0);

//       intervalRef.current = setInterval(() => {
//         setRecordingTime((prev) => prev + 1);
//       }, 1000);
//     } catch (err) {
//       console.error("Recording error:", err);
//       setError(
//         "Unable to access microphone. Please check permissions and try again."
//       );
//     }
//   };

//   const stopRecording = () => {
//     if (mediaRecorderRef.current && recordingState === "recording") {
//       mediaRecorderRef.current.stop();
//       setRecordingState("stopped");

//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//         intervalRef.current = null;
//       }
//     }
//   };

//   const restartRecording = () => {
//     if (audioUrl) {
//       URL.revokeObjectURL(audioUrl);
//     }
//     setAudioBlob(null);
//     setAudioUrl("");
//     setRecordingTime(0);
//     setAudioDuration(0);
//     setRecordingState("idle");
//     setError("");
//   };

//   const submitStory = async () => {
//     if (!audioBlob || !guestName.trim()) return;
//     setIsSubmitting(true);
//     setError("");

//     try {
//       console.log("📤 Starting story submission...");
//       console.log("📏 Audio duration:", audioDuration, "seconds");

//       const formData = new FormData();
//       formData.append("audio", audioBlob, `${Date.now()}_recording.webm`);
//       formData.append("token", token);
//       formData.append("duration", audioDuration.toString());

//       console.log("📤 Uploading audio to server...");
//       const uploadResponse = await fetch("/api/portal/upload-audio", {
//         method: "POST",
//         body: formData,
//       });

//       console.log("Upload response status:", uploadResponse.status);

//       if (!uploadResponse.ok) {
//         const errorText = await uploadResponse.text();
//         console.error("❌ Upload failed:", errorText);
//         throw new Error("Failed to upload audio");
//       }

//       // Parse response ONCE
//       const uploadData = await uploadResponse.json();
//       console.log("✅ Audio uploaded successfully:", uploadData);

//       // Extract data from parsed response
//       const { audioPath, audioUrl: uploadedUrl, bucket } = uploadData;

//       if (!audioPath) {
//         console.error("❌ No audioPath in upload response:", uploadData);
//         throw new Error("Server did not return audio path");
//       }

//       console.log("📝 Submitting story with audioPath:", audioPath);

//       // Submit story duration metadata
//       const submissionResponse = await fetch("/api/portal/submit-story", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           token,
//           guestName: guestName.trim(),
//           storyTitle: storyTitle.trim() || null,
//           storyContent: "Voice recording submission",
//           audioPath,
//           audioUrl: uploadedUrl,
//           duration: audioDuration,
//         }),
//       });

//       console.log("Submission response status:", submissionResponse.status);

//       if (!submissionResponse.ok) {
//         const errorData = await submissionResponse.json();
//         console.error("❌ Submission failed:", errorData);
//         throw new Error(errorData.error || "Failed to submit story");
//       }

//       const submissionData = await submissionResponse.json();
//       console.log("✅ Story submitted successfully:", submissionData);

//       // Pass only the submissionId, not the whole object
//       onSuccess(submissionData.submissionId);
//     } catch (err) {
//       console.error("💥 Submission error:", err);
//       setError(
//         err instanceof Error
//           ? err.message
//           : "Failed to submit story. Please try again."
//       );
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const formatTime = (seconds: number): string => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}:${secs.toString().padStart(2, "0")}`;
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center p-4">
//       <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full">
//         <button
//           onClick={onBack}
//           className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
//         >
//           <svg
//             className="w-5 h-5"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M15 19l-7-7 7-7"
//             />
//           </svg>
//           <span>Back</span>
//         </button>

//         <div className="text-center mb-8">
//           <h1 className="text-2xl font-bold text-gray-900 mb-2">
//             Record Your Story
//           </h1>
//           <p className="text-gray-600">
//             for <span className="font-semibold">"{invitation.book_title}"</span>
//           </p>
//         </div>

//         <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-2xl p-6 mb-8">
//           <p className="text-lg text-gray-900 leading-relaxed">
//             {invitation.prompt_content}
//           </p>
//         </div>

//         <div className="text-center mb-8">
//           {/* Recording Visualizer */}
//           <div className="relative mb-6">
//             <div
//               className={`w-32 h-32 rounded-full mx-auto flex items-center justify-center transition-all duration-300 ${
//                 recordingState === "recording"
//                   ? "bg-red-500 animate-pulse shadow-lg shadow-red-200"
//                   : recordingState === "stopped"
//                   ? "bg-green-500 shadow-lg shadow-green-200"
//                   : "bg-gray-300"
//               }`}
//             >
//               <svg
//                 className="w-16 h-16 text-white"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
//                 />
//               </svg>
//             </div>

//             {/* Recording Timer */}
//             {(recordingState === "recording" ||
//               recordingState === "stopped") && (
//               <div className="mt-4">
//                 <p className="text-2xl font-mono font-bold text-gray-900">
//                   {formatTime(recordingTime)}
//                 </p>
//                 <p className="text-sm text-gray-600">
//                   {recordingState === "recording"
//                     ? "Recording..."
//                     : "Recording complete"}
//                 </p>
//                 {/* New: ShoW actuaL duraTIon if different from recording time*/}
//                 {recordingState === "stopped" &&
//                   audioDuration > 0 &&
//                   audioDuration !== recordingTime && (
//                     <p className="text-sm text-gray-500 mt-1">
//                       Actual duration: {formatTime(audioDuration)}
//                     </p>
//                   )}
//               </div>
//             )}
//           </div>

//           {/* Recording Controls */}
//           <div className="flex justify-center space-x-4">
//             {recordingState === "idle" && (
//               <button
//                 onClick={startRecording}
//                 className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-full font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
//               >
//                 <div className="flex items-center space-x-2">
//                   <div className="w-3 h-3 bg-white rounded-full"></div>
//                   <span>Start Recording</span>
//                 </div>
//               </button>
//             )}

//             {recordingState === "recording" && (
//               <button
//                 onClick={stopRecording}
//                 className="bg-gray-800 hover:bg-gray-900 text-white px-8 py-4 rounded-full font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
//               >
//                 <div className="flex items-center space-x-2">
//                   <div className="w-3 h-3 bg-white"></div>
//                   <span>Stop Recording</span>
//                 </div>
//               </button>
//             )}

//             {recordingState === "stopped" && (
//               <div className="flex space-x-3">
//                 <button
//                   onClick={restartRecording}
//                   className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-full font-medium transition-all duration-200"
//                 >
//                   🔄 Re-record
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>

//         {audioUrl && recordingState === "stopped" && (
//           <div className="bg-gray-50 rounded-xl p-6 mb-8">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">
//               Preview Your Recording
//             </h3>
//             <audio controls className="w-full">
//               <source src={audioUrl} type="audio/webm" />
//               Your browser does not support the audio element.
//             </audio>
//           </div>
//         )}

//         {recordingState === "stopped" && (
//           <div className="mb-6">
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Give your story a title (optional)
//             </label>
//             <input
//               type="text"
//               value={storyTitle}
//               onChange={(e) => setStoryTitle(e.target.value)}
//               placeholder="My story about..."
//               className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//               maxLength={100}
//             />
//           </div>
//         )}

//         {error && (
//           <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
//             <div className="flex items-center space-x-2">
//               <svg
//                 className="w-5 h-5 text-red-600"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.766 0L3.048 16.5c-.77.833.192 2.5 1.732 2.5z"
//                 />
//               </svg>
//               <p className="text-red-800 font-medium">Error</p>
//             </div>
//             <p className="text-red-700 mt-1">{error}</p>
//           </div>
//         )}

//         {recordingState === "stopped" && (
//           <button
//             onClick={submitStory}
//             disabled={isSubmitting || !audioBlob}
//             className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
//               isSubmitting
//                 ? "bg-gray-400 text-gray-600 cursor-not-allowed"
//                 : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 transform hover:scale-[1.02] active:scale-[0.98]"
//             }`}
//           >
//             {isSubmitting ? (
//               <div className="flex items-center justify-center space-x-2">
//                 <div className="w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
//                 <span>Sharing your story...</span>
//               </div>
//             ) : (
//               "✨ Share Your Story"
//             )}
//           </button>
//         )}

//         {recordingState === "idle" && (
//           <div className="mt-8 text-center">
//             <p className="text-sm text-gray-600 mb-2">
//               💡 <strong>Tip:</strong> Speak clearly and take your time
//             </p>
//             <p className="text-xs text-gray-500">
//               Most great stories are 1-3 minutes long
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default RecordingInterface;
