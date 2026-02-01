// src/components/playback/VisualVoicePlayer.tsx
import React, { useEffect, useRef, useState } from "react";
import { X, Pause, Play } from "lucide-react";

interface VisualVoicePlayerProps {
  // Media data
  mediaUrl: string;
  promptText: string;
  enhancedText?: string | null;
  contextPhoto?: string | null;

  // Speaker data
  contributorName: string;
  contributorAvatar?: string | null;

  // Playback control
  isOpen: boolean;
  onClose: () => void;
  onEnded?: () => void;
}

export const VisualVoicePlayer: React.FC<VisualVoicePlayerProps> = ({
  mediaUrl,
  promptText,
  enhancedText,
  contextPhoto,
  contributorName,
  contributorAvatar,
  isOpen,
  onClose,
  onEnded,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");
  const [showCaptions, setShowCaptions] = useState(false);

  // Format time helper
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Auto-play on open
  useEffect(() => {
    if (isOpen && audioRef.current) {
      audioRef.current.play().catch(console.error);
    }
  }, [isOpen]);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      const current = audio.currentTime || 0;
      const total = audio.duration || 1;
      setProgress((current / total) * 100);
      setCurrentTime(formatTime(current));
    };

    const updateDuration = () => {
      setDuration(formatTime(audio.duration || 0));
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [onEnded]);

  // Show captions after 3 seconds
  useEffect(() => {
    if (isPlaying) {
      const timer = setTimeout(() => setShowCaptions(true), 3000);
      return () => clearTimeout(timer);
    } else {
      setShowCaptions(false);
    }
  }, [isPlaying]);

  // Toggle play/pause
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
  };

  // Handle seek
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    audioRef.current.currentTime = percentage * audioRef.current.duration;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Hidden audio element */}
      <audio ref={audioRef} src={mediaUrl} preload="metadata" />

      {/* Layer 1: Full-bleed background with Ken Burns */}
      <div className="absolute inset-0 overflow-hidden">
        {contextPhoto ? (
          <img
            src={contextPhoto}
            alt="Story context"
            className="w-full h-full object-cover animate-kenburns"
            style={{
              filter: "brightness(0.5)",
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-awa-charcoal via-awa-charcoal-light to-awa-charcoal" />
        )}
      </div>

      {/* Layer 2: Content overlay */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Top: Close button + Scrim */}
        <div className="bg-gradient-to-b from-black/80 via-black/40 to-transparent p-6">
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all active:scale-95"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Middle: Prompt text + Speaker info */}
        <div className="flex-1 flex flex-col justify-between px-6 pb-6">
          {/* Prompt (Serif, Large) */}
          <div className="animate-slideUp">
            <h1 className="font-serif text-3xl md:text-4xl text-white leading-tight mb-4 drop-shadow-2xl">
              {promptText}
            </h1>
          </div>

          {/* Speaker Pill (Glassmorphism) */}
          <div className="animate-fadeIn" style={{ animationDelay: "0.2s" }}>
            <div className="inline-flex items-center gap-3 bg-black/30 backdrop-blur-xl border border-white/20 rounded-full px-5 py-3 shadow-2xl">
              {contributorAvatar ? (
                <img
                  src={contributorAvatar}
                  alt={contributorName}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-white/30"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-awa-gold flex items-center justify-center text-white font-bold text-lg ring-2 ring-white/30">
                  {contributorName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-white font-sans font-semibold text-sm leading-tight">
                  {contributorName}
                </p>
                <p className="text-white/70 font-sans text-xs">Storyteller</p>
              </div>
              {isPlaying && (
                <div className="ml-2 flex gap-1">
                  <span className="w-1 h-4 bg-awa-gold rounded-full animate-pulse" />
                  <span
                    className="w-1 h-4 bg-awa-gold rounded-full animate-pulse"
                    style={{ animationDelay: "0.2s" }}
                  />
                  <span
                    className="w-1 h-4 bg-awa-gold rounded-full animate-pulse"
                    style={{ animationDelay: "0.4s" }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom: Scrim + Captions + Controls */}
        <div className="bg-scrim-bottom pt-20 pb-8 px-6">
          {/* Scrolling Captions */}
          {showCaptions && enhancedText && (
            <div className="mb-6 max-h-32 overflow-y-auto animate-slideUp">
              <p className="text-white/90 font-sans text-sm leading-relaxed">
                {enhancedText}
              </p>
            </div>
          )}

          {/* Audio Controls */}
          <div className="space-y-3">
            {/* Progress Bar */}
            <div
              onClick={handleSeek}
              className="h-1.5 bg-white/20 rounded-full overflow-hidden cursor-pointer hover:h-2 transition-all"
            >
              <div
                className="h-full bg-awa-gold transition-all duration-200 rounded-full shadow-awa-glow"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Time + Controls */}
            <div className="flex items-center justify-between">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="w-14 h-14 rounded-full bg-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-2xl"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 text-awa-charcoal" fill="currentColor" />
                ) : (
                  <Play className="w-6 h-6 text-awa-charcoal ml-1" fill="currentColor" />
                )}
              </button>

              {/* Time stamps */}
              <div className="flex items-center gap-2 text-white font-sans text-sm font-medium">
                <span>{currentTime}</span>
                <span className="text-white/50">/</span>
                <span className="text-white/70">{duration}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Optional: Custom scrollbar for captions */}
      <style jsx>{`
        .overflow-y-auto::-webkit-scrollbar {
          width: 4px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: rgba(201, 169, 97, 0.8);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

// // components/VisualVoicePlayer.tsx
// import { useEffect, useRef, useState } from "react";

// interface Recording {
//   id: string;
//   mediaUrl: string;
//   playbackToken: string;
//   promptText: string;
//   promptId: number | null;
//   contributorName: string;
//   contributorAvatar: string | null;
//   enhancedText: string;
//   contextPhoto: string | null;
//   duration: number;
//   sortOrder: number;
//   mediaType?: "audio" | "video";
// }

// interface VisualVoicePlayerProps {
//   recording: Recording;
//   onNext?: () => void;
//   onClose?: () => void;
//   hasNext?: boolean;
// }

// export default function VisualVoicePlayer({
//   recording,
//   onNext,
//   onClose,
//   hasNext,
// }: VisualVoicePlayerProps) {
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const [currentTime, setCurrentTime] = useState("0:00");
//   const [duration, setDuration] = useState("0:00");
//   const [showControls, setShowControls] = useState(true);
//   const [imageLoaded, setImageLoaded] = useState(false);

//   const audioRef = useRef<HTMLAudioElement>(null);
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const controlsTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

//   const isVideo = recording.mediaType === "video";
//   const hasContextPhoto = !isVideo && !!recording.contextPhoto;

//   // Format time helper
//   const formatTime = (seconds: number): string => {
//     const mins = Math.floor(seconds / 60);
//     const secs = Math.floor(seconds % 60);
//     return `${mins}:${secs.toString().padStart(2, "0")}`;
//   };

//   // Auto-hide controls after 3s of inactivity
//   const resetControlsTimeout = () => {
//     if (controlsTimeoutRef.current) {
//       clearTimeout(controlsTimeoutRef.current);
//     }
//     setShowControls(true);
//     if (isPlaying) {
//       controlsTimeoutRef.current = setTimeout(() => {
//         setShowControls(false);
//       }, 3000);
//     }
//   };

//   // Media progress tracking
//   useEffect(() => {
//     const media = isVideo ? videoRef.current : audioRef.current;
//     if (!media) return;

//     const updateProgress = () => {
//       const current = media.currentTime || 0;
//       const total = media.duration || 1;
//       setProgress((current / total) * 100);
//       setCurrentTime(formatTime(current));
//     };

//     const updateDuration = () => {
//       setDuration(formatTime(media.duration || 0));
//     };

//     const handlePlay = () => {
//       setIsPlaying(true);
//       resetControlsTimeout();
//     };

//     const handlePause = () => {
//       setIsPlaying(false);
//       setShowControls(true);
//       if (controlsTimeoutRef.current) {
//         clearTimeout(controlsTimeoutRef.current);
//       }
//     };

//     const handleEnded = () => {
//       setIsPlaying(false);
//       setShowControls(true);
//       if (hasNext && onNext) {
//         // Auto-advance to next story after 1s
//         setTimeout(() => onNext(), 1000);
//       }
//     };

//     media.addEventListener("timeupdate", updateProgress);
//     media.addEventListener("loadedmetadata", updateDuration);
//     media.addEventListener("play", handlePlay);
//     media.addEventListener("pause", handlePause);
//     media.addEventListener("ended", handleEnded);

//     return () => {
//       media.removeEventListener("timeupdate", updateProgress);
//       media.removeEventListener("loadedmetadata", updateDuration);
//       media.removeEventListener("play", handlePlay);
//       media.removeEventListener("pause", handlePause);
//       media.removeEventListener("ended", handleEnded);
//       if (controlsTimeoutRef.current) {
//         clearTimeout(controlsTimeoutRef.current);
//       }
//     };
//   }, [isVideo, isPlaying, hasNext, onNext]);

//   // Auto-play on mount
//   useEffect(() => {
//     const media = isVideo ? videoRef.current : audioRef.current;
//     if (media) {
//       const playPromise = media.play();
//       if (playPromise !== undefined) {
//         playPromise.catch((error) => {
//           console.log("Auto-play prevented:", error);
//           setIsPlaying(false);
//           setShowControls(true);
//         });
//       }
//     }
//   }, [isVideo]);

//   // Handle user interactions for controls
//   const handleInteraction = () => {
//     resetControlsTimeout();
//   };

//   // Toggle play/pause
//   const togglePlay = () => {
//     const media = isVideo ? videoRef.current : audioRef.current;
//     if (!media) return;
//     if (isPlaying) {
//       media.pause();
//     } else {
//       media.play();
//     }
//   };

//   // Seek functionality
//   const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
//     const media = isVideo ? videoRef.current : audioRef.current;
//     if (!media) return;

//     const rect = e.currentTarget.getBoundingClientRect();
//     const clickX = e.clientX - rect.left;
//     const percentage = clickX / rect.width;
//     media.currentTime = percentage * media.duration;
//   };

//   // LAYOUT 1: Video Only
//   if (isVideo) {
//     return (
//       <div
//         className="relative w-full h-full bg-black"
//         onMouseMove={handleInteraction}
//         onTouchStart={handleInteraction}
//         onClick={handleInteraction}
//       >
//         {/* Video Player */}
//         <video
//           ref={videoRef}
//           src={recording.mediaUrl}
//           className="absolute inset-0 w-full h-full object-contain"
//           playsInline
//           preload="metadata"
//         />

//         {/* Top Overlay - Prompt & Close (fade when controls hidden) */}
//         <div
//           className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 via-black/40 to-transparent p-6 transition-opacity duration-300 ${
//             showControls ? "opacity-100" : "opacity-0"
//           }`}
//         >
//           <div className="flex items-start justify-between gap-4">
//             <p className="text-white text-lg md:text-xl font-bold leading-tight flex-1">
//               {recording.promptText}
//             </p>
//             <button
//               onClick={onClose}
//               className="flex-shrink-0 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
//               aria-label="Close player"
//             >
//               <span className="text-white text-xl">✕</span>
//             </button>
//           </div>
//         </div>

//         {/* Bottom Controls (fade when hidden) */}
//         <div
//           className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 transition-opacity duration-300 ${
//             showControls ? "opacity-100" : "opacity-0"
//           }`}
//         >
//           {/* Contributor Info */}
//           <div className="flex items-center gap-3 mb-4">
//             {recording.contributorAvatar ? (
//               <img
//                 src={recording.contributorAvatar}
//                 alt={recording.contributorName}
//                 className="w-10 h-10 rounded-full object-cover ring-2 ring-white/30"
//               />
//             ) : (
//               <div className="w-10 h-10 rounded-full bg-awa-gold flex items-center justify-center text-white font-bold">
//                 {recording.contributorName.charAt(0).toUpperCase()}
//               </div>
//             )}
//             <div className="flex-1 min-w-0">
//               <p className="text-white font-semibold text-sm">
//                 {recording.contributorName}
//               </p>
//               <p className="text-white/70 text-xs">Storyteller</p>
//             </div>
//             <div className="flex-shrink-0 bg-red-500/90 px-3 py-1 rounded-full">
//               <span className="text-white text-xs font-bold">🎥 VIDEO</span>
//             </div>
//           </div>

//           {/* Progress Bar */}
//           <div
//             onClick={handleSeek}
//             className="h-1.5 bg-white/20 rounded-full overflow-hidden mb-3 cursor-pointer group"
//           >
//             <div
//               className="h-full bg-awa-gold transition-all duration-200 group-hover:bg-awa-gold-light"
//               style={{ width: `${progress}%` }}
//             />
//           </div>

//           {/* Controls */}
//           <div className="flex items-center justify-between">
//             <button
//               onClick={togglePlay}
//               className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
//             >
//               {isPlaying ? (
//                 <span className="text-2xl">⏸️</span>
//               ) : (
//                 <span className="text-2xl ml-1">▶️</span>
//               )}
//             </button>

//             <div className="flex items-center gap-3 text-white text-sm font-medium">
//               <span>{currentTime}</span>
//               <span className="text-white/50">/</span>
//               <span>{duration}</span>
//             </div>

//             {hasNext && onNext && (
//               <button
//                 onClick={onNext}
//                 className="bg-awa-gold hover:bg-awa-gold-light text-white px-6 py-3 rounded-full font-bold text-sm transition-colors shadow-lg"
//               >
//                 Next Story →
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // LAYOUT 2: Audio + Photo (Ken Burns)
//   if (hasContextPhoto) {
//     return (
//       <div className="relative w-full h-full bg-black overflow-hidden">
//         {/* Background Photo with Ken Burns */}
//         <div className="absolute inset-0">
//           {!imageLoaded && (
//             <div className="absolute inset-0 bg-awa-charcoal animate-pulse" />
//           )}
//           <img
//             src={recording.contextPhoto!}
//             alt="Story context"
//             className={`w-full h-full object-cover transition-opacity duration-500 ${
//               imageLoaded ? "opacity-100 animate-ken-burns" : "opacity-0"
//             }`}
//             onLoad={() => setImageLoaded(true)}
//             style={{
//               willChange: "transform",
//               backfaceVisibility: "hidden",
//             }}
//           />
//           {/* Dark overlay for readability */}
//           <div className="absolute inset-0 bg-black/40" />
//         </div>

//         {/* Audio element */}
//         <audio ref={audioRef} src={recording.mediaUrl} preload="metadata" />

//         {/* Top Overlay - Prompt & Close */}
//         <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 via-black/50 to-transparent p-6 z-10">
//           <div className="flex items-start justify-between gap-4">
//             <p className="text-white text-lg md:text-xl font-bold leading-tight flex-1 drop-shadow-lg">
//               {recording.promptText}
//             </p>
//             <button
//               onClick={onClose}
//               className="flex-shrink-0 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
//               aria-label="Close player"
//             >
//               <span className="text-white text-xl">✕</span>
//             </button>
//           </div>
//         </div>

//         {/* Center - Floating Avatar with pulse effect */}
//         <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
//           <div className="relative">
//             {recording.contributorAvatar ? (
//               <img
//                 src={recording.contributorAvatar}
//                 alt={recording.contributorName}
//                 className={`w-24 h-24 md:w-32 md:h-32 rounded-full object-cover ring-4 ring-white shadow-2xl ${
//                   isPlaying ? "animate-pulse-ring" : ""
//                 }`}
//               />
//             ) : (
//               <div
//                 className={`w-24 h-24 md:w-32 md:h-32 rounded-full bg-awa-gold flex items-center justify-center text-white text-4xl md:text-5xl font-bold ring-4 ring-white shadow-2xl ${
//                   isPlaying ? "animate-pulse-ring" : ""
//                 }`}
//               >
//                 {recording.contributorName.charAt(0).toUpperCase()}
//               </div>
//             )}
//             {isPlaying && (
//               <div className="absolute inset-0 rounded-full ring-4 ring-awa-gold animate-ping" />
//             )}
//           </div>
//         </div>

//         {/* Bottom Controls */}
//         <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6 z-10">
//           {/* Contributor Info */}
//           <div className="flex items-center gap-3 mb-4">
//             <div className="flex-1 min-w-0">
//               <p className="text-white font-bold text-base drop-shadow-lg">
//                 {recording.contributorName}
//               </p>
//               <p className="text-white/80 text-sm">Storyteller</p>
//             </div>
//             <div className="flex-shrink-0 bg-awa-gold/90 px-3 py-1 rounded-full">
//               <span className="text-white text-xs font-bold">🎤 AUDIO</span>
//             </div>
//           </div>

//           {/* Progress Bar */}
//           <div
//             onClick={handleSeek}
//             className="h-2 bg-white/20 rounded-full overflow-hidden mb-4 cursor-pointer group"
//           >
//             <div
//               className="h-full bg-awa-gold transition-all duration-200 group-hover:bg-awa-gold-light"
//               style={{ width: `${progress}%` }}
//             />
//           </div>

//           {/* Controls */}
//           <div className="flex items-center justify-between">
//             <button
//               onClick={togglePlay}
//               className="w-14 h-14 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-2xl"
//             >
//               {isPlaying ? (
//                 <span className="text-3xl">⏸️</span>
//               ) : (
//                 <span className="text-3xl ml-1">▶️</span>
//               )}
//             </button>

//             <div className="flex items-center gap-3 text-white text-base font-semibold drop-shadow-lg">
//               <span>{currentTime}</span>
//               <span className="text-white/50">/</span>
//               <span>{duration}</span>
//             </div>

//             {hasNext && onNext && (
//               <button
//                 onClick={onNext}
//                 className="bg-awa-gold hover:bg-awa-gold-light text-white px-6 py-3 rounded-full font-bold text-sm transition-all shadow-lg hover:shadow-awa-gold"
//               >
//                 Next Story →
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // LAYOUT 3: Audio Only (Large Avatar)
//   return (
//     <div className="relative w-full h-full bg-gradient-to-br from-awa-charcoal via-awa-charcoal-light to-awa-charcoal overflow-hidden">
//       {/* Audio element */}
//       <audio ref={audioRef} src={recording.mediaUrl} preload="metadata" />

//       {/* Top Overlay - Close Button */}
//       <div className="absolute top-0 left-0 right-0 p-6 z-10">
//         <div className="flex justify-end">
//           <button
//             onClick={onClose}
//             className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
//             aria-label="Close player"
//           >
//             <span className="text-white text-xl">✕</span>
//           </button>
//         </div>
//       </div>

//       {/* Center - Large Avatar & Prompt */}
//       <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-10">
//         {/* Large Avatar */}
//         <div className="relative mb-8">
//           {recording.contributorAvatar ? (
//             <img
//               src={recording.contributorAvatar}
//               alt={recording.contributorName}
//               className={`w-40 h-40 md:w-48 md:h-48 rounded-full object-cover ring-8 ring-awa-gold shadow-awa-gold ${
//                 isPlaying ? "animate-pulse-ring" : ""
//               }`}
//             />
//           ) : (
//             <div
//               className={`w-40 h-40 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-awa-gold to-awa-gold-dark flex items-center justify-center text-white text-7xl md:text-8xl font-black ring-8 ring-awa-gold shadow-awa-gold ${
//                 isPlaying ? "animate-pulse-ring" : ""
//               }`}
//             >
//               {recording.contributorName.charAt(0).toUpperCase()}
//             </div>
//           )}
//           {isPlaying && (
//             <>
//               <div className="absolute inset-0 rounded-full ring-8 ring-awa-gold animate-ping opacity-75" />
//               <div
//                 className="absolute inset-0 rounded-full ring-8 ring-awa-gold-light animate-ping opacity-50"
//                 style={{ animationDelay: "0.3s" }}
//               />
//             </>
//           )}
//         </div>

//         {/* Contributor Name */}
//         <h2 className="text-white text-2xl md:text-3xl font-bold mb-2 text-center">
//           {recording.contributorName}
//         </h2>
//         <p className="text-awa-gold-light text-sm md:text-base font-medium mb-8">
//           Storyteller
//         </p>

//         {/* Prompt Text */}
//         <div className="max-w-2xl mx-auto text-center mb-8">
//           <p className="text-white text-lg md:text-xl font-semibold leading-relaxed">
//             {recording.promptText}
//           </p>
//         </div>

//         {/* Media Type Badge */}
//         <div className="bg-awa-gold/20 border-2 border-awa-gold px-4 py-2 rounded-full">
//           <span className="text-awa-gold text-sm font-bold">
//             🎤 AUDIO STORY
//           </span>
//         </div>
//       </div>

//       {/* Bottom Controls */}
//       <div className="absolute bottom-0 left-0 right-0 bg-awa-charcoal-dark/90 p-6 z-10">
//         {/* Progress Bar */}
//         <div
//           onClick={handleSeek}
//           className="h-2 bg-white/10 rounded-full overflow-hidden mb-4 cursor-pointer group"
//         >
//           <div
//             className="h-full bg-awa-gold transition-all duration-200 group-hover:bg-awa-gold-light"
//             style={{ width: `${progress}%` }}
//           />
//         </div>

//         {/* Controls */}
//         <div className="flex items-center justify-between">
//           <button
//             onClick={togglePlay}
//             className="w-16 h-16 bg-awa-gold hover:bg-awa-gold-light rounded-full flex items-center justify-center transition-all shadow-lg hover:shadow-awa-gold hover:scale-105"
//           >
//             {isPlaying ? (
//               <span className="text-3xl">⏸️</span>
//             ) : (
//               <span className="text-3xl ml-1">▶️</span>
//             )}
//           </button>

//           <div className="flex items-center gap-3 text-white text-base font-semibold">
//             <span>{currentTime}</span>
//             <span className="text-white/50">/</span>
//             <span>{duration}</span>
//           </div>

//           {hasNext && onNext && (
//             <button
//               onClick={onNext}
//               className="bg-awa-gold hover:bg-awa-gold-light text-white px-8 py-4 rounded-full font-bold text-base transition-all shadow-lg hover:shadow-awa-gold hover:scale-105"
//             >
//               Next Story →
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Animated Background Elements */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute -top-24 -right-24 w-96 h-96 bg-awa-gold/5 rounded-full blur-3xl animate-pulse" />
//         <div
//           className="absolute -bottom-24 -left-24 w-96 h-96 bg-awa-gold/5 rounded-full blur-3xl animate-pulse"
//           style={{ animationDelay: "1s" }}
//         />
//       </div>

//       <style jsx>{`
//         @keyframes pulse-ring {
//           0%,
//           100% {
//             transform: scale(1);
//             opacity: 1;
//           }
//           50% {
//             transform: scale(1.05);
//             opacity: 0.9;
//           }
//         }
//         .animate-pulse-ring {
//           animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
//         }
//       `}</style>
//     </div>
//   );
// }
