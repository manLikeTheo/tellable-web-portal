// src/pages/play/[token].tsx
// Standalone Visual Voice Page (for individual story QR codes)
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { supabaseServer } from "@/lib/supabase-server";
import { X, Pause, Play } from "lucide-react";

interface MediaItem {
  id: string;
  media_path: string;
  media_type: "audio" | "video";
  enhanced_text: string | null;
  caption: string | null;
  prompt_id?: number | null;
  chapter_id?: string | null;
  user_id?: string | null;
}

interface PlayPageProps {
  mediaItem: MediaItem | null;
  mediaUrl: string | null;
  promptText?: string;
  contributorName?: string;
  contributorAvatar?: string | null;
  contextPhoto?: string | null;
  chapterTitle?: string;
  bookTitle?: string;
  authorName?: string;
  error?: string;
}

export default function VisualVoiceStandalonePage({
  mediaItem,
  mediaUrl,
  promptText,
  contributorName,
  contributorAvatar,
  contextPhoto,
  chapterTitle,
  bookTitle,
  error,
}: PlayPageProps) {
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

  // Auto-play on mount
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(console.error);
    }
  }, []);

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

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, []);

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

  // Error state
  if (error || !mediaItem || !mediaUrl) {
    return (
      <div className="min-h-screen bg-awa-charcoal flex items-center justify-center p-6">
        <Head>
          <title>Story Not Found | AwaChapter</title>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
        </Head>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-awa-xl p-10 text-center max-w-md">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="font-serif text-2xl text-white mb-4">
            Story not found
          </h1>
          <p className="text-white/60 font-sans text-sm">
            This story could not be found or has been removed.
          </p>
        </div>
      </div>
    );
  }

  const displayPrompt = promptText || "A story to remember";
  const displayContributor = contributorName || "A Storyteller";
  const displayAvatar = contributorAvatar || null;
  const hasContextPhoto = !!contextPhoto;
  const enhancedText = mediaItem.enhanced_text || mediaItem.caption;

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <Head>
        <title>{`${displayContributor}'s Story | ${
          bookTitle || "AwaChapter"
        }`}</title>
        <meta name="description" content={displayPrompt} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#000000" />
      </Head>

      {/* Hidden audio element */}
      <audio ref={audioRef} src={mediaUrl} preload="metadata" />

      {/* Layer 1: Full-bleed background with Ken Burns */}
      <div className="absolute inset-0 overflow-hidden">
        {hasContextPhoto ? (
          <img
            src={contextPhoto}
            alt="Story context"
            className="w-full h-full object-cover animate-kenburns"
            style={{ filter: "brightness(0.5)" }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-awa-charcoal via-awa-charcoal-light to-awa-charcoal" />
        )}
      </div>

      {/* Layer 2: Content overlay */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Top: Chapter context (if available) */}
        <div className="bg-scrim-top p-6">
          {chapterTitle && (
            <div className="inline-flex items-center gap-2 bg-black/30 backdrop-blur-xl border border-white/20 rounded-full px-4 py-2">
              <span className="text-white/70 font-sans text-xs">
                From: {chapterTitle}
              </span>
            </div>
          )}
        </div>

        {/* Middle: Prompt + Speaker */}
        <div className="flex-1 flex flex-col justify-between px-6 pb-6">
          {/* Prompt (Serif, Large) */}
          <div className="animate-slideUp">
            <h1 className="font-serif text-3xl md:text-4xl text-white leading-tight mb-4 text-shadow-awa">
              {displayPrompt}
            </h1>
          </div>

          {/* Speaker Pill */}
          <div className="animate-fadeIn" style={{ animationDelay: "0.2s" }}>
            <div className="inline-flex items-center gap-3 bg-black/30 backdrop-blur-xl border border-white/20 rounded-full px-5 py-3 shadow-2xl">
              {displayAvatar ? (
                <img
                  src={displayAvatar}
                  alt={displayContributor}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-white/30"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-awa-gold flex items-center justify-center text-white font-bold text-lg ring-2 ring-white/30">
                  {displayContributor.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-white font-sans font-semibold text-sm leading-tight">
                  {displayContributor}
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
            <div className="mb-6 max-h-32 overflow-y-auto animate-slideUp awa-scrollbar">
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
                  <Pause
                    className="w-6 h-6 text-awa-charcoal"
                    fill="currentColor"
                  />
                ) : (
                  <Play
                    className="w-6 h-6 text-awa-charcoal ml-1"
                    fill="currentColor"
                  />
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

      {/* Footer CTA (Subtle) */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 text-center pointer-events-none">
        <a
          href="https://awachapter.com"
          className="inline-block text-white/40 hover:text-white/60 text-xs font-sans font-medium transition-colors pointer-events-auto"
          target="_blank"
          rel="noopener noreferrer"
        >
          Created with AwaChapter
        </a>
      </div>
    </div>
  );
}

// Server-side data fetching
export const getServerSideProps: GetServerSideProps = async ({
  params,
  req,
}) => {
  const token = params?.token as string;

  if (!token) {
    return {
      props: {
        mediaItem: null,
        mediaUrl: null,
        error: "Invalid link",
      },
    };
  }

  try {
    // Fetch media item
    const { data: mediaItem, error: mediaError } = await supabaseServer
      .from("media_items")
      .select(
        "id, media_path, media_type, enhanced_text, caption, prompt_id, chapter_id, user_id"
      )
      .eq("playback_token", token)
      .single();

    if (mediaError || !mediaItem) {
      return {
        props: {
          mediaItem: null,
          mediaUrl: null,
          error: "Story not found",
        },
      };
    }

    // Check for context photo
    let contextPhoto: string | null = null;
    if (mediaItem.media_type === "audio") {
      const { data: photoItems } = await supabaseServer
        .from("media_items")
        .select("media_path")
        .eq("chapter_id", mediaItem.chapter_id)
        .eq("prompt_id", mediaItem.prompt_id)
        .eq("user_id", mediaItem.user_id)
        .eq("media_type", "image")
        .limit(1);

      if (photoItems && photoItems.length > 0) {
        const photoPath = photoItems[0].media_path;
        if (photoPath.startsWith("http")) {
          contextPhoto = photoPath;
        } else {
          const { data: signedPhotoUrl } = await supabaseServer.storage
            .from("book-media")
            .createSignedUrl(photoPath, 3600);
          contextPhoto = signedPhotoUrl?.signedUrl || null;
        }
      }
    }

    // Fetch related data
    let promptText = "";
    let contributorName = "A Storyteller";
    let contributorAvatar = null;
    let chapterTitle = "";
    let bookTitle = "A Memory Book";

    if (mediaItem.prompt_id) {
      const { data: prompt } = await supabaseServer
        .from("prompts")
        .select("prompt_text")
        .eq("id", mediaItem.prompt_id)
        .single();
      if (prompt) promptText = prompt.prompt_text;
    }

    if (mediaItem.user_id) {
      const { data: profile } = await supabaseServer
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", mediaItem.user_id)
        .single();
      if (profile) {
        contributorName = profile.full_name || contributorName;
        contributorAvatar = profile.avatar_url;
      }
    }

    if (mediaItem.chapter_id) {
      const { data: chapter } = await supabaseServer
        .from("chapters")
        .select("title, book_id")
        .eq("id", mediaItem.chapter_id)
        .single();

      if (chapter) {
        chapterTitle = chapter.title;

        const { data: book } = await supabaseServer
          .from("books")
          .select("title")
          .eq("id", chapter.book_id)
          .single();

        if (book) bookTitle = book.title;
      }
    }

    // Track scan
    const userAgent = req.headers["user-agent"] || "";
    const deviceType = /mobile|android|iphone|ipad/i.test(userAgent)
      ? "mobile"
      : "desktop";
    const ipAddress =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] || null;

    await supabaseServer.from("qr_scans").insert({
      media_item_id: mediaItem.id,
      user_agent: userAgent,
      device_type: deviceType,
      ip_address: ipAddress,
    });

    // Get media URL
    let mediaUrl: string;
    if (mediaItem.media_path.startsWith("http")) {
      mediaUrl = mediaItem.media_path;
    } else {
      const { data: signedUrlData, error: urlError } =
        await supabaseServer.storage
          .from("book-media")
          .createSignedUrl(mediaItem.media_path, 3600);

      if (urlError || !signedUrlData) {
        return {
          props: {
            mediaItem: null,
            mediaUrl: null,
            error: "Media unavailable",
          },
        };
      }
      mediaUrl = signedUrlData.signedUrl;
    }

    return {
      props: {
        mediaItem,
        mediaUrl,
        promptText,
        contributorName,
        contributorAvatar,
        contextPhoto,
        chapterTitle,
        bookTitle,
      },
    };
  } catch (error: any) {
    console.error("Error:", error);
    return {
      props: {
        mediaItem: null,
        mediaUrl: null,
        error: "Something went wrong",
      },
    };
  }
};

// // pages/play/[token].tsx - VISUAL VOICE VERSION
// import { GetServerSideProps } from "next";
// import Head from "next/head";
// import { useEffect, useRef, useState } from "react";
// import { supabaseServer } from "@/lib/supabase-server";

// interface MediaItem {
//   id: string;
//   media_path: string;
//   media_type: "audio" | "video";
//   enhanced_text: string | null;
//   caption: string | null;
//   prompt_id?: number | null;
//   chapter_id?: string | null;
//   user_id?: string | null;
// }

// interface PlayPageProps {
//   mediaItem: MediaItem | null;
//   mediaUrl: string | null;
//   promptText?: string;
//   contributorName?: string;
//   contributorAvatar?: string | null;
//   contextPhoto?: string | null; // Photo uploaded with recording
//   chapterTitle?: string;
//   bookTitle?: string;
//   authorName?: string;
//   error?: string;
// }

// export default function VisualVoicePlayPage({
//   mediaItem,
//   mediaUrl,
//   promptText,
//   contributorName,
//   contributorAvatar,
//   contextPhoto,
//   chapterTitle,
//   bookTitle,
//   authorName,
//   error,
// }: PlayPageProps) {
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const [currentTime, setCurrentTime] = useState("0:00");
//   const [duration, setDuration] = useState("0:00");
//   const audioRef = useRef<HTMLAudioElement>(null);

//   // Format time helper
//   const formatTime = (seconds: number): string => {
//     const mins = Math.floor(seconds / 60);
//     const secs = Math.floor(seconds % 60);
//     return `${mins}:${secs.toString().padStart(2, "0")}`;
//   };

//   // Audio progress tracking
//   useEffect(() => {
//     const audio = audioRef.current;
//     if (!audio) return;

//     const updateProgress = () => {
//       const current = audio.currentTime || 0;
//       const total = audio.duration || 1;
//       setProgress((current / total) * 100);
//       setCurrentTime(formatTime(current));
//     };

//     const updateDuration = () => {
//       setDuration(formatTime(audio.duration || 0));
//     };

//     audio.addEventListener("timeupdate", updateProgress);
//     audio.addEventListener("loadedmetadata", updateDuration);
//     audio.addEventListener("play", () => setIsPlaying(true));
//     audio.addEventListener("pause", () => setIsPlaying(false));

//     return () => {
//       audio.removeEventListener("timeupdate", updateProgress);
//       audio.removeEventListener("loadedmetadata", updateDuration);
//       audio.removeEventListener("play", () => setIsPlaying(true));
//       audio.removeEventListener("pause", () => setIsPlaying(false));
//     };
//   }, []);

//   // Toggle play/pause
//   const togglePlay = () => {
//     if (!audioRef.current) return;
//     if (isPlaying) {
//       audioRef.current.pause();
//     } else {
//       audioRef.current.play();
//     }
//   };

//   // Error state
//   if (error || !mediaItem || !mediaUrl) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center p-4">
//         <Head>
//           <title>Story Not Found | AwaChapter</title>
//           <meta
//             name="viewport"
//             content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
//           />
//         </Head>
//         <div className="bg-white rounded-3xl shadow-2xl p-10 text-center max-w-md">
//           <div className="text-6xl mb-4">😔</div>
//           <h1 className="text-2xl font-bold text-red-600 mb-4">
//             Story not found
//           </h1>
//           <p className="text-gray-600">
//             This story could not be found or has been removed.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   const displayPrompt = promptText || "A story to remember";
//   const displayContributor = contributorName || "A Storyteller";
//   const displayAvatar = contributorAvatar || null;
//   const hasContextPhoto = !!contextPhoto;

//   return (
//     <div className="relative h-screen w-screen overflow-hidden bg-black">
//       <Head>
//         <title>{`${displayContributor}'s Story | ${
//           bookTitle || "AwaChapter"
//         }`}</title>
//         <meta name="description" content={displayPrompt} />
//         <meta
//           name="viewport"
//           content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
//         />
//         <meta name="theme-color" content="#000000" />
//       </Head>

//       {/* Layer 1: Hero Background Image */}
//       {hasContextPhoto ? (
//         <img
//           src={contextPhoto}
//           alt="Story context"
//           className="absolute inset-0 w-full h-full object-cover"
//           style={{ filter: "brightness(0.6)" }}
//         />
//       ) : (
//         <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800" />
//       )}

//       {/* Layer 2: Content Overlay */}
//       <div className="relative z-10 h-full flex flex-col justify-between p-6">
//         {/* Top: Prompt Text */}
//         <div className="bg-gradient-to-b from-black/80 via-black/50 to-transparent p-6 rounded-2xl">
//           <p className="text-white text-2xl md:text-3xl font-bold leading-tight">
//             {displayPrompt}
//           </p>
//           {chapterTitle && (
//             <p className="text-purple-200 text-sm mt-3 font-medium">
//               From: {chapterTitle}
//             </p>
//           )}
//         </div>

//         {/* Spacer to push controls to bottom */}
//         <div className="flex-1" />

//         {/* Middle: Floating Speaker Avatar */}
//         <div className="mb-6 ml-0">
//           <div
//             className={`relative inline-block ${
//               isPlaying ? "animate-pulse-ring" : ""
//             }`}
//           >
//             {displayAvatar ? (
//               <img
//                 src={displayAvatar}
//                 alt={displayContributor}
//                 className="w-20 h-20 rounded-full border-4 border-white shadow-2xl object-cover"
//               />
//             ) : (
//               <div className="w-20 h-20 rounded-full border-4 border-white shadow-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
//                 {displayContributor.charAt(0).toUpperCase()}
//               </div>
//             )}
//             {isPlaying && (
//               <div className="absolute inset-0 rounded-full border-4 border-green-400 animate-ping" />
//             )}
//           </div>
//           <p className="text-white font-semibold mt-2 text-sm drop-shadow-lg">
//             {displayContributor}
//           </p>
//         </div>

//         {/* Bottom: Audio Controls */}
//         <div className="bg-black/80 backdrop-blur-lg rounded-2xl p-5 shadow-2xl mb-4">
//           <audio ref={audioRef} src={mediaUrl} preload="metadata" />

//           <div className="flex items-center gap-4">
//             {/* Play/Pause Button */}
//             <button
//               onClick={togglePlay}
//               className="w-14 h-14 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg flex-shrink-0"
//             >
//               {isPlaying ? (
//                 <span className="text-2xl">⏸️</span>
//               ) : (
//                 <span className="text-2xl ml-1">▶️</span>
//               )}
//             </button>

//             {/* Progress Bar */}
//             <div className="flex-1">
//               <div className="h-2 bg-gray-600 rounded-full overflow-hidden mb-2">
//                 <div
//                   className="h-full bg-white transition-all duration-200 rounded-full"
//                   style={{ width: `${progress}%` }}
//                 />
//               </div>
//               <div className="flex justify-between text-white text-xs">
//                 <span>{currentTime}</span>
//                 <span>{duration}</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Footer CTA (Subtle) */}
//       <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 text-center">
//         <a
//           href="https://awachapter.com"
//           className="inline-block text-white/70 hover:text-white text-xs font-medium transition-colors"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Created with AwaChapter
//         </a>
//       </div>

//       <style jsx>{`
//         @keyframes pulse-ring {
//           0%,
//           100% {
//             transform: scale(1);
//             opacity: 1;
//           }
//           50% {
//             transform: scale(1.08);
//             opacity: 0.85;
//           }
//         }
//         .animate-pulse-ring {
//           animation: pulse-ring 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
//         }
//         * {
//           -webkit-tap-highlight-color: transparent;
//         }
//       `}</style>
//     </div>
//   );
// }

// export const getServerSideProps: GetServerSideProps = async ({
//   params,
//   req,
// }) => {
//   const token = params?.token as string;

//   if (!token) {
//     return {
//       props: {
//         mediaItem: null,
//         mediaUrl: null,
//         error: "Invalid link",
//       },
//     };
//   }

//   try {
//     console.log("🔍 Looking up token:", token);

//     // Step 1: Fetch base media item
//     const { data: mediaItem, error: mediaError } = await supabaseServer
//       .from("media_items")
//       .select(
//         "id, media_path, media_type, enhanced_text, caption, prompt_id, chapter_id, user_id"
//       )
//       .eq("playback_token", token)
//       .single();

//     if (mediaError || !mediaItem) {
//       console.error("❌ Media not found:", mediaError);
//       return {
//         props: {
//           mediaItem: null,
//           mediaUrl: null,
//           error: "Story not found",
//         },
//       };
//     }

//     console.log("✅ Found media item:", mediaItem.id);

//     // Step 2: Check for context photo (photo uploaded WITH this recording)
//     let contextPhoto: string | null = null;
//     if (mediaItem.media_type === "audio") {
//       // Look for image media_item with same chapter_id, prompt_id, user_id
//       const { data: photoItems } = await supabaseServer
//         .from("media_items")
//         .select("media_path")
//         .eq("chapter_id", mediaItem.chapter_id)
//         .eq("prompt_id", mediaItem.prompt_id)
//         .eq("user_id", mediaItem.user_id)
//         .eq("media_type", "image")
//         .limit(1);

//       if (photoItems && photoItems.length > 0) {
//         const photoPath = photoItems[0].media_path;
//         if (photoPath.startsWith("http")) {
//           contextPhoto = photoPath;
//         } else {
//           const { data: signedPhotoUrl } = await supabaseServer.storage
//             .from("book-media")
//             .createSignedUrl(photoPath, 3600);
//           contextPhoto = signedPhotoUrl?.signedUrl || null;
//         }
//       }
//     }

//     // Step 3: Fetch related data
//     let promptText = "";
//     let contributorName = "A Storyteller";
//     let contributorAvatar = null;
//     let chapterTitle = "A Chapter";
//     let bookTitle = "A Memory Book";
//     let authorName = contributorName;

//     // Get prompt
//     if (mediaItem.prompt_id) {
//       const { data: prompt } = await supabaseServer
//         .from("prompts")
//         .select("prompt_text")
//         .eq("id", mediaItem.prompt_id)
//         .single();
//       if (prompt) promptText = prompt.prompt_text;
//     }

//     // Get contributor
//     if (mediaItem.user_id) {
//       const { data: profile } = await supabaseServer
//         .from("profiles")
//         .select("full_name, avatar_url")
//         .eq("id", mediaItem.user_id)
//         .single();
//       if (profile) {
//         contributorName = profile.full_name || contributorName;
//         contributorAvatar = profile.avatar_url;
//       }
//     }

//     // Get chapter and book
//     if (mediaItem.chapter_id) {
//       const { data: chapter } = await supabaseServer
//         .from("chapters")
//         .select("title, book_id")
//         .eq("id", mediaItem.chapter_id)
//         .single();

//       if (chapter) {
//         chapterTitle = chapter.title;

//         const { data: book } = await supabaseServer
//           .from("books")
//           .select("title, user_id")
//           .eq("id", chapter.book_id)
//           .single();

//         if (book) {
//           bookTitle = book.title;

//           const { data: author } = await supabaseServer
//             .from("profiles")
//             .select("full_name")
//             .eq("id", book.user_id)
//             .single();

//           if (author) authorName = author.full_name || authorName;
//         }
//       }
//     }

//     // Track scan
//     const userAgent = req.headers["user-agent"] || "";
//     const deviceType = /mobile|android|iphone|ipad/i.test(userAgent)
//       ? "mobile"
//       : "desktop";
//     const ipAddress =
//       (req.headers["x-forwarded-for"] as string)?.split(",")[0] || null;

//     await supabaseServer.from("qr_scans").insert({
//       media_item_id: mediaItem.id,
//       user_agent: userAgent,
//       device_type: deviceType,
//       ip_address: ipAddress,
//     });

//     // Get media URL
//     let mediaUrl: string;
//     if (mediaItem.media_path.startsWith("http")) {
//       mediaUrl = mediaItem.media_path;
//     } else {
//       const { data: signedUrlData, error: urlError } =
//         await supabaseServer.storage
//           .from("book-media")
//           .createSignedUrl(mediaItem.media_path, 3600);

//       if (urlError || !signedUrlData) {
//         return {
//           props: {
//             mediaItem: null,
//             mediaUrl: null,
//             error: "Media unavailable",
//           },
//         };
//       }
//       mediaUrl = signedUrlData.signedUrl;
//     }

//     console.log("🎉 Visual Voice playback ready!");

//     return {
//       props: {
//         mediaItem,
//         mediaUrl,
//         promptText,
//         contributorName,
//         contributorAvatar,
//         contextPhoto,
//         chapterTitle,
//         bookTitle,
//         authorName,
//       },
//     };
//   } catch (error: any) {
//     console.error("💥 Error:", error);
//     return {
//       props: {
//         mediaItem: null,
//         mediaUrl: null,
//         error: "Something went wrong",
//       },
//     };
//   }
// };
