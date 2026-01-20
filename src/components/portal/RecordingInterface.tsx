// components/portal/RecordingInterface.tsx
import React, { useState, useRef, useEffect } from "react";
import { InvitationDetails } from "../../types/portal";
import { MessageCircle, Square, Lightbulb } from "lucide-react";

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

      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      analyser.smoothingTimeConstant = 0.8;
      analyser.fftSize = 1024;
      microphone.connect(analyser);
      analyserRef.current = analyser;

      visualizeAudio();

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
        resolve(recordingTime);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-600/10 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      <div className="w-full max-w-3xl relative z-10">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8 animate-fade-in">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/40"></div>
          <div className="w-3 h-3 rounded-full bg-gray-600"></div>
        </div>

        {/* Main Recording Card */}
        <div
          className={`bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 border border-yellow-500/20 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          {/* Sticky Prompt */}
          <div className="bg-gradient-to-r from-yellow-900/40 to-yellow-800/40 rounded-2xl p-6 mb-8 border-2 border-yellow-600/30">
            <div className="flex items-center gap-3 mb-2">
              <MessageCircle
                className="w-6 h-6 text-yellow-400"
                strokeWidth={2}
              />
              <span className="text-yellow-400 text-xs font-bold uppercase">
                Your Question
              </span>
            </div>
            <p className="text-white text-lg font-medium leading-relaxed">
              {invitation.prompt_content}
            </p>
          </div>

          {/* Waveform Visualization */}
          <div className="mb-8">
            <div className="flex items-end justify-center gap-2 h-40 bg-gradient-to-b from-gray-700/50 to-gray-800/50 rounded-2xl p-6 border-2 border-gray-700">
              {audioLevels.map((level, index) => (
                <div
                  key={index}
                  className="flex-1 bg-gradient-to-t from-red-600 to-red-500 rounded-full transition-all duration-100 min-w-[4px]"
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
                  ? "bg-red-600 animate-pulse-gentle"
                  : "bg-gray-700"
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
            <p className="text-gray-300 text-lg mt-4 font-medium">
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
                className="group bg-gray-700 hover:bg-gray-600 text-white px-12 py-5 rounded-2xl font-black text-xl transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95"
              >
                <div className="flex items-center gap-3">
                  <Square
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    strokeWidth={0}
                  />
                  <span>Stop Recording</span>
                </div>
              </button>
            )}
          </div>

          {/* Tips Footer */}
          <div className="mt-8 bg-blue-900/30 border-2 border-blue-500/30 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-7 h-7 text-blue-400" strokeWidth={2} />
              <div>
                <p className="text-blue-400 font-bold text-sm mb-1">Pro Tip</p>
                <p className="text-blue-300/80 text-sm">
                  Most great stories are 1-3 minutes long. Take your time and
                  speak from the heart!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recording Indicator (Floating) */}
        {recordingState === "recording" && (
          <div className="fixed top-8 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-full shadow-2xl animate-bounce-gentle z-50">
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
// // components/portal/RecordingInterface.tsx
// import React, { useState, useRef, useEffect } from "react";
// import { InvitationDetails } from "../../types/portal";
// import { MessageCircle, Square, Lightbulb } from "lucide-react";

// interface RecordingInterfaceProps {
//   invitation: InvitationDetails;
//   guestName: string;
//   onComplete: (audioBlob: Blob, duration: number) => void;
//   onBack: () => void;
// }

// type RecordingState = "idle" | "recording" | "stopped";

// const RecordingInterface: React.FC<RecordingInterfaceProps> = ({
//   invitation,
//   guestName,
//   onComplete,
//   onBack,
// }) => {
//   const [recordingState, setRecordingState] = useState<RecordingState>("idle");
//   const [recordingTime, setRecordingTime] = useState(0);
//   const [audioLevels, setAudioLevels] = useState<number[]>(Array(20).fill(0));
//   const [isVisible, setIsVisible] = useState(false);

//   const mediaRecorderRef = useRef<MediaRecorder | null>(null);
//   const audioChunksRef = useRef<Blob[]>([]);
//   const intervalRef = useRef<NodeJS.Timeout | null>(null);
//   const streamRef = useRef<MediaStream | null>(null);
//   const analyserRef = useRef<AnalyserNode | null>(null);
//   const animationRef = useRef<number | null>(null);

//   useEffect(() => {
//     const timer = setTimeout(() => setIsVisible(true), 100);
//     return () => clearTimeout(timer);
//   }, []);

//   useEffect(() => {
//     if (recordingState === "idle") {
//       startRecording();
//     }

//     return () => {
//       if (intervalRef.current) clearInterval(intervalRef.current);
//       if (animationRef.current) cancelAnimationFrame(animationRef.current);
//       if (streamRef.current) {
//         streamRef.current.getTracks().forEach((track) => track.stop());
//       }
//     };
//   }, []);

//   const visualizeAudio = () => {
//     if (!analyserRef.current) return;

//     const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
//     analyserRef.current.getByteFrequencyData(dataArray);

//     // Sample 20 points for visualization
//     const samples = 20;
//     const levels = [];
//     for (let i = 0; i < samples; i++) {
//       const index = Math.floor((i / samples) * dataArray.length);
//       levels.push((dataArray[index] / 255) * 100);
//     }

//     setAudioLevels(levels);
//     animationRef.current = requestAnimationFrame(visualizeAudio);
//   };

//   const startRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         audio: {
//           echoCancellation: true,
//           noiseSuppression: true,
//           autoGainControl: true,
//         },
//       });

//       streamRef.current = stream;

//       // Setup audio analyzer
//       const audioContext = new AudioContext();
//       const analyser = audioContext.createAnalyser();
//       const microphone = audioContext.createMediaStreamSource(stream);
//       analyser.smoothingTimeConstant = 0.8;
//       analyser.fftSize = 1024;
//       microphone.connect(analyser);
//       analyserRef.current = analyser;

//       // Start visualization
//       visualizeAudio();

//       // Setup recorder
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

//         // Get actual duration
//         const duration = await getAudioDuration(blob);

//         stream.getTracks().forEach((track) => track.stop());
//         onComplete(blob, duration);
//       };

//       mediaRecorder.start();
//       setRecordingState("recording");
//       setRecordingTime(0);

//       intervalRef.current = setInterval(() => {
//         setRecordingTime((prev) => prev + 1);
//       }, 1000);
//     } catch (err) {
//       console.error("Recording error:", err);
//       alert("Unable to access microphone. Please check permissions.");
//     }
//   };

//   const getAudioDuration = (blob: Blob): Promise<number> => {
//     return new Promise((resolve) => {
//       const audio = new Audio();
//       const url = URL.createObjectURL(blob);

//       audio.addEventListener("loadedmetadata", () => {
//         const duration = Math.round(audio.duration);
//         URL.revokeObjectURL(url);
//         resolve(duration);
//       });

//       audio.addEventListener("error", () => {
//         URL.revokeObjectURL(url);
//         resolve(recordingTime); // Fallback to timer
//       });

//       audio.src = url;
//     });
//   };

//   const stopRecording = () => {
//     if (mediaRecorderRef.current && recordingState === "recording") {
//       mediaRecorderRef.current.stop();
//       setRecordingState("stopped");

//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//       }
//       if (animationRef.current) {
//         cancelAnimationFrame(animationRef.current);
//       }
//     }
//   };

//   const formatTime = (seconds: number): string => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}:${secs.toString().padStart(2, "0")}`;
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
//       {/* Animated Background */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute top-20 left-10 w-96 h-96 bg-red-200/30 rounded-full blur-3xl animate-float"></div>
//         <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl animate-float-delayed"></div>
//       </div>

//       <div className="w-full max-w-3xl relative z-10">
//         {/* Progress Indicator */}
//         <div className="flex items-center justify-center gap-2 mb-8 animate-fade-in">
//           <div className="w-3 h-3 rounded-full bg-purple-600"></div>
//           <div className="w-3 h-3 rounded-full bg-purple-600"></div>
//           <div className="w-3 h-3 rounded-full bg-purple-600"></div>
//           <div className="w-3 h-3 rounded-full bg-purple-300"></div>
//           <div className="w-3 h-3 rounded-full bg-gray-300"></div>
//         </div>

//         {/* Main Recording Card */}
//         <div
//           className={`bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 transition-all duration-700 ${
//             isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
//           }`}
//         >
//           {/* Sticky Prompt */}
//           <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-2xl p-6 mb-8 border-2 border-purple-200">
//             <div className="flex items-center gap-3 mb-2">
//               <MessageCircle
//                 className="w-6 h-6 text-purple-600"
//                 strokeWidth={2}
//               />
//               <span className="text-purple-700 text-xs font-bold uppercase">
//                 Your Question
//               </span>
//             </div>
//             <p className="text-gray-900 text-lg font-medium leading-relaxed">
//               {invitation.prompt_content}
//             </p>
//           </div>

//           {/* Waveform Visualization */}
//           <div className="mb-8">
//             <div className="flex items-end justify-center gap-2 h-40 bg-gradient-to-b from-gray-50 to-white rounded-2xl p-6 border-2 border-gray-200">
//               {audioLevels.map((level, index) => (
//                 <div
//                   key={index}
//                   className="flex-1 bg-gradient-to-t from-red-500 to-pink-500 rounded-full transition-all duration-100 min-w-[4px]"
//                   style={{
//                     height: `${Math.max(10, level)}%`,
//                     opacity: recordingState === "recording" ? 1 : 0.3,
//                   }}
//                 ></div>
//               ))}
//             </div>
//           </div>

//           {/* Recording Timer */}
//           <div className="text-center mb-8">
//             <div
//               className={`inline-flex items-center gap-3 px-8 py-4 rounded-full ${
//                 recordingState === "recording"
//                   ? "bg-red-500 animate-pulse-gentle"
//                   : "bg-gray-300"
//               }`}
//             >
//               <div
//                 className={`w-4 h-4 rounded-full ${
//                   recordingState === "recording"
//                     ? "bg-white animate-ping-slow"
//                     : "bg-gray-500"
//                 }`}
//               ></div>
//               <span className="text-white text-3xl font-black font-mono tabular-nums">
//                 {formatTime(recordingTime)}
//               </span>
//             </div>
//             <p className="text-gray-600 text-lg mt-4 font-medium">
//               {recordingState === "recording"
//                 ? "Recording in progress..."
//                 : "Recording paused"}
//             </p>
//           </div>

//           {/* Controls */}
//           <div className="flex justify-center gap-4">
//             {recordingState === "recording" && (
//               <button
//                 onClick={stopRecording}
//                 className="group bg-gray-900 hover:bg-gray-800 text-white px-12 py-5 rounded-2xl font-black text-xl transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95"
//               >
//                 <div className="flex items-center gap-3">
//                   <Square
//                     className="w-5 h-5 text-white"
//                     fill="currentColor"
//                     strokeWidth={0}
//                   />
//                   <span>Stop Recording</span>
//                 </div>
//               </button>
//             )}
//           </div>

//           {/* Tips Footer */}
//           <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
//             <div className="flex items-start gap-3">
//               <Lightbulb className="w-7 h-7 text-blue-600" strokeWidth={2} />
//               <div>
//                 <p className="text-blue-900 font-bold text-sm mb-1">Pro Tip</p>
//                 <p className="text-blue-800 text-sm">
//                   Most great stories are 1-3 minutes long. Take your time and
//                   speak from the heart!
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Recording Indicator (Floating) */}
//         {recordingState === "recording" && (
//           <div className="fixed top-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-full shadow-2xl animate-bounce-gentle z-50">
//             <div className="flex items-center gap-3">
//               <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
//               <span className="font-bold">REC</span>
//             </div>
//           </div>
//         )}
//       </div>

//       <style jsx>{`
//         @keyframes float {
//           0%,
//           100% {
//             transform: translateY(0);
//           }
//           50% {
//             transform: translateY(-20px);
//           }
//         }
//         @keyframes float-delayed {
//           0%,
//           100% {
//             transform: translateY(0);
//           }
//           50% {
//             transform: translateY(20px);
//           }
//         }
//         @keyframes pulse-gentle {
//           0%,
//           100% {
//             transform: scale(1);
//           }
//           50% {
//             transform: scale(1.05);
//           }
//         }
//         @keyframes ping-slow {
//           75%,
//           100% {
//             transform: scale(2);
//             opacity: 0;
//           }
//         }
//         @keyframes bounce-gentle {
//           0%,
//           100% {
//             transform: translateY(0) translateX(-50%);
//           }
//           50% {
//             transform: translateY(-10px) translateX(-50%);
//           }
//         }
//         @keyframes fade-in {
//           from {
//             opacity: 0;
//           }
//           to {
//             opacity: 1;
//           }
//         }
//         .animate-float {
//           animation: float 6s ease-in-out infinite;
//         }
//         .animate-float-delayed {
//           animation: float-delayed 8s ease-in-out infinite;
//         }
//         .animate-pulse-gentle {
//           animation: pulse-gentle 2s ease-in-out infinite;
//         }
//         .animate-ping-slow {
//           animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
//         }
//         .animate-bounce-gentle {
//           animation: bounce-gentle 2s ease-in-out infinite;
//         }
//         .animate-fade-in {
//           animation: fade-in 0.6s ease-out;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default RecordingInterface;
