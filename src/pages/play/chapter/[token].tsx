// src/pages/play/chapter/[token].tsx - GLASS DECK DESIGN
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useState } from "react";
import { supabaseServer } from "@/lib/supabase-server";
import { VisualVoicePlayer } from "@/components/playback/VisualVoicePlayer";
import { Play } from "lucide-react";

interface Recording {
  id: string;
  mediaUrl: string;
  playbackToken: string;
  promptText: string;
  promptId: number | null;
  contributorName: string;
  contributorAvatar: string | null;
  enhancedText: string;
  contextPhoto: string | null;
  duration: number;
  sortOrder: number;
}

interface PromptGroup {
  promptId: number | null;
  promptText: string;
  recordings: Recording[];
  completionRate: number;
}

interface ChapterPlaylistProps {
  chapter: {
    id: string;
    title: string;
    storyText: string;
    bookTitle: string;
    authorName: string;
    authorAvatar: string | null;
  } | null;
  recordings: Recording[];
  promptGroups: PromptGroup[];
  totalPrompts: number;
  uniqueContributors: number;
  error?: string;
}

export default function GlassDeckChapterPage({
  chapter,
  recordings,
  promptGroups,
  totalPrompts,
  uniqueContributors,
  error,
}: ChapterPlaylistProps) {
  const [activeStory, setActiveStory] = useState<Recording | null>(null);
  const [currentPlayIndex, setCurrentPlayIndex] = useState(0);

  // Handle story end - auto-advance
  const handleStoryEnd = () => {
    if (currentPlayIndex < recordings.length - 1) {
      const nextIndex = currentPlayIndex + 1;
      setCurrentPlayIndex(nextIndex);
      setActiveStory(recordings[nextIndex]);
    } else {
      setActiveStory(null);
      setCurrentPlayIndex(0);
    }
  };

  // Play specific story
  const playStory = (recording: Recording) => {
    const index = recordings.findIndex((r) => r.id === recording.id);
    setCurrentPlayIndex(index);
    setActiveStory(recording);
  };

  // Play all from first
  const playAll = () => {
    if (recordings.length > 0) {
      setCurrentPlayIndex(0);
      setActiveStory(recordings[0]);
    }
  };

  // Error state
  if (error || !chapter) {
    return (
      <div className="min-h-screen bg-awa-charcoal flex items-center justify-center p-6">
        <Head>
          <title>Chapter Not Found | AwaChapter</title>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
        </Head>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-awa-xl p-10 text-center max-w-md">
          <div className="text-6xl mb-4">📖</div>
          <h1 className="font-serif text-2xl text-white mb-4">
            Chapter not found
          </h1>
          <p className="text-white/60 font-sans text-sm">
            {error || "This chapter could not be found."}
          </p>
        </div>
      </div>
    );
  }

  const hasRecordings = recordings.length > 0;
  const completionPercentage =
    totalPrompts > 0
      ? Math.round(
          (promptGroups.filter((g) => g.recordings.length > 0).length /
            totalPrompts) *
            100
        )
      : 0;

  // Get backdrop image (first context photo or fallback)
  const backdropImage =
    recordings.find((r) => r.contextPhoto)?.contextPhoto || null;
  console.log("🖼️ Backdrop image:", backdropImage); // Debug
  console.log(
    "📸 All recordings:",
    recordings.map((r) => ({ id: r.id, hasPhoto: !!r.contextPhoto }))
  ); // Debug

  return (
    <>
      <Head>
        <title>{`${chapter.title} | ${chapter.bookTitle}`}</title>
        <meta
          name="description"
          content={chapter.storyText.substring(0, 150)}
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <meta name="theme-color" content="#1A1A1A" />
      </Head>

      {/* CONTAINER - 100dvh, No Scroll */}
      <div className="relative h-screen overflow-hidden bg-awa-charcoal">
        {/* LAYER 0: Radial Gold Glow Background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center top, rgba(212, 181, 116, 0.08) 0%, rgba(26, 26, 26, 1) 60%)",
          }}
        />

        {/* LAYER 1: Immersive Backdrop (65%) */}
        <div className="absolute top-0 left-0 right-0 h-[55%] overflow-hidden">
          {backdropImage ? (
            <>
              <img
                src={backdropImage}
                alt="Chapter backdrop"
                className="w-full h-full object-cover animate-kenburns"
                style={{ filter: "brightness(0.7)" }}
              />
              {/* Fade mask at bottom */}
              <div
                className="absolute bottom-0 left-0 right-0 h-[40%] pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to bottom, transparent 0%, #1a1a1a 100%)",
                }}
              />
            </>
          ) : (
            <div
              className="w-full h-full"
              style={{
                background: "linear-gradient(135deg, #2a1a4a 0%, #1a1a2e 100%)",
              }}
            />
          )}
        </div>

        {/* LAYER 2: Top Branding Bar */}
        <div
          className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center px-5 py-4"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 100%)",
          }}
        >
          {/* Logo */}
          <div className="flex items-center gap-2">
            <a
              href="https://awachapter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full backdrop-blur-md border border-awa-gold/90 flex items-center justify-center text-lg active:scale-95 transition-transform hover:*:scale-90 duration-600 ease-in-out"
            >
              <img
                src="/awachapter-logo.png"
                alt="AwaChapter"
                className="h-13 w-auto mx-auto"
              />
            </a>
          </div>
        </div>

        {/* LAYER 3: The Glass Deck (55%) */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[55%] z-10 rounded-t-[32px] border-t border-white/10 px-5 pt-6 pb-5 flex flex-col gap-3"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.6) 100%)",
            backdropFilter: "blur(40px) saturate(180%)",
            WebkitBackdropFilter: "blur(40px) saturate(180%)",
            boxShadow: "0 -10px 60px rgba(212, 181, 116, 0.15)",
          }}
        >
          {/* Golden glow top border */}
          <div
            className="absolute top-0 left-0 right-0 h-[1px]"
            style={{
              background:
                "linear-gradient(to right, transparent 0%, rgba(212, 181, 116, 0.5) 50%, transparent 100%)",
            }}
          />

          {/* Chapter Title */}
          <div className="text-center">
            <h1
              className="font-serif text-[26px] font-bold text-white leading-tight mb-1.5"
              style={{ textShadow: "0 2px 12px rgba(0, 0, 0, 0.4)" }}
            >
              {chapter.title}
            </h1>
            <p className="font-sans text-[12px] tracking-wide text-white/70 font-medium">
              From "{chapter.bookTitle}" • by {chapter.authorName}
            </p>
          </div>

          {/* Compact Stats */}
          <div className="flex justify-center gap-2 mb-1">
            <div className="px-2 py-1.5 bg-white/8 backdrop-blur-md border border-white/12 rounded-full flex items-center gap-1.5">
              <span className="text-awa-gold text-xs">▶️</span>
              <span className="text-white font-sans text-[11px] font-semibold">
                {recordings.length}{" "}
                {recordings.length === 1 ? "Story" : "Stories"}
              </span>
            </div>
            <div className="px-2 py-1.5 bg-white/8 backdrop-blur-md border border-white/12 rounded-full flex items-center gap-1.5">
              <span className="text-awa-gold text-xs">💬</span>
              <span className="text-white font-sans text-[11px] font-semibold">
                {totalPrompts} {totalPrompts === 1 ? "Prompt" : "Prompts"}
              </span>
            </div>
            <div className="px-2 py-1.5 bg-white/8 backdrop-blur-md border border-white/12 rounded-full flex items-center gap-1.5">
              <span className="text-awa-gold text-xs">✓</span>
              <span className="text-white font-sans text-[11px] font-semibold">
                {completionPercentage}%
              </span>
            </div>
          </div>

          {/* Metallic Gold Play Button */}
          {hasRecordings && (
            <button
              onClick={playAll}
              className="relative w-full py-4 px-5 rounded-full font-sans font-extrabold text-base text-awa-charcoal flex items-center justify-center gap-2.5 overflow-hidden active:scale-[0.97] transition-transform"
              style={{
                background:
                  "linear-gradient(135deg, #D4B574 5%, #C9A961 50%, #B89650 100%)",
                boxShadow:
                  "0 4px 20px rgba(212, 181, 116, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -1px 0 rgba(0, 0, 0, 0.2)",
              }}
            >
              <Play className="w-8 h-8" fill="currentColor" />
              <span>Play Chapter</span>
            </button>
          )}

          {/* Divider */}
          <div className="text-center font-sans text-[13px] font-extrabold tracking-[3px] p-1 text-white uppercase mt-0">
            STORIES BY PROMPT
          </div>

          {/* Compact Playlist - Scrollable */}
          <div className="flex-1 overflow-y-auto -mx-2 px-2 awa-scrollbar">
            {promptGroups.map((group, idx) => (
              <PromptCard
                key={group.promptId || idx}
                group={group}
                onPlayStory={playStory}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Visual Voice Player Modal */}
      {activeStory && (
        <VisualVoicePlayer
          mediaUrl={activeStory.mediaUrl}
          promptText={activeStory.promptText}
          enhancedText={activeStory.enhancedText}
          contextPhoto={activeStory.contextPhoto}
          contributorName={activeStory.contributorName}
          contributorAvatar={activeStory.contributorAvatar}
          isOpen={!!activeStory}
          onClose={() => setActiveStory(null)}
          onEnded={handleStoryEnd}
        />
      )}
    </>
  );
}

// Compact Prompt Card Component
const PromptCard = ({
  group,
  onPlayStory,
}: {
  group: PromptGroup;
  onPlayStory: (r: Recording) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasRecordings = group.recordings.length > 0;

  if (!hasRecordings) {
    // Collapsed view for empty prompts
    return (
      <div className="bg-white/5 border border-white/8 rounded-xl p-3 mb-2 flex justify-between items-center gap-3">
        <p className="flex-1 font-sans text-[13px] text-white font-medium leading-snug line-clamp-2">
          {group.promptText}
        </p>
        <span className="text-[10px] font-sans font-semibold text-awa-gold/60 whitespace-nowrap">
          0 stories
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/8 rounded-xl mb-2 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex justify-between items-center gap-3 active:bg-white/10 transition-colors"
      >
        <p className="flex-1 font-sans text-[13px] text-white font-medium leading-snug line-clamp-2 text-left">
          {group.promptText}
        </p>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Avatar stack */}
          <div className="flex -space-x-2">
            {group.recordings.slice(0, 3).map((rec, idx) => (
              <div
                key={rec.id}
                className="w-7 h-7 rounded-full border-2 border-awa-charcoal flex items-center justify-center text-[11px] font-bold text-awa-charcoal"
                style={{
                  background: "linear-gradient(135deg, #D4B574, #C9A961)",
                  zIndex: 3 - idx,
                }}
              >
                {rec.contributorAvatar ? (
                  <img
                    src={rec.contributorAvatar}
                    alt={rec.contributorName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  rec.contributorName.charAt(0).toUpperCase()
                )}
              </div>
            ))}
          </div>
          {/* Completion badge */}
          <span className="text-[10px] font-sans font-semibold text-awa-gold">
            {group.completionRate}%
          </span>
        </div>
      </button>

      {/* Expanded recordings */}
      {isExpanded && (
        <div className="border-t border-white/8 bg-white/5 p-2 space-y-1.5">
          {group.recordings.map((recording) => (
            <button
              key={recording.id}
              onClick={() => onPlayStory(recording)}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/8 rounded-lg p-2.5 flex items-center gap-3 active:scale-[0.98] transition-all"
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full flex-shrink-0 overflow-hidden">
                {recording.contributorAvatar ? (
                  <img
                    src={recording.contributorAvatar}
                    alt={recording.contributorName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-awa-gold flex items-center justify-center text-awa-charcoal font-bold text-sm">
                    {recording.contributorName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 text-left">
                <p className="font-sans font-semibold text-white text-xs leading-tight mb-0.5">
                  {recording.contributorName}
                </p>
                {recording.enhancedText && (
                  <p className="font-sans text-white/60 text-[11px] line-clamp-1">
                    {recording.enhancedText.substring(0, 60)}...
                  </p>
                )}
              </div>

              {/* Play icon */}
              <div className="w-8 h-8 rounded-full bg-awa-gold flex items-center justify-center flex-shrink-0">
                <Play
                  className="w-4 h-4 text-awa-charcoal ml-0.5"
                  fill="currentColor"
                />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Keep the existing getServerSideProps exactly as-is
export const getServerSideProps: GetServerSideProps = async ({
  params,
  req,
}) => {
  const token = params?.token as string;

  if (!token) {
    return {
      props: {
        chapter: null,
        recordings: [],
        promptGroups: [],
        totalPrompts: 0,
        uniqueContributors: 0,
        error: "Invalid chapter link",
      },
    };
  }

  try {
    const { data: chapter, error: chapterError } = await supabaseServer
      .from("chapters")
      .select("id, title, final_story_text, book_id")
      .eq("playback_token", token)
      .single();

    if (chapterError || !chapter) {
      return {
        props: {
          chapter: null,
          recordings: [],
          promptGroups: [],
          totalPrompts: 0,
          uniqueContributors: 0,
          error: "Chapter not found",
        },
      };
    }

    const { data: bookData } = await supabaseServer
      .from("books")
      .select("title, user_id")
      .eq("id", chapter.book_id)
      .single();

    let profileData = null;
    if (bookData?.user_id) {
      const { data: profile } = await supabaseServer
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", bookData.user_id)
        .single();
      profileData = profile;
    }

    const { data: chapterPrompts } = await supabaseServer
      .from("user_prompt_progress")
      .select("prompt_id")
      .eq("chapter_id", chapter.id)
      .order("prompt_id", { ascending: true });

    const promptIds = Array.from(
      new Set((chapterPrompts || []).map((cp: any) => cp.prompt_id))
    );

    const { data: prompts } = await supabaseServer
      .from("prompts")
      .select("id, prompt_text")
      .in("id", promptIds);

    const uniquePrompts = (prompts || []).map((p: any) => ({
      promptId: p.id,
      promptText: p.prompt_text,
    }));

    const { data: mediaItems } = await supabaseServer
      .from("media_items")
      .select(
        "id, media_path, media_type, enhanced_text, caption, sort_order, prompt_id, user_id, playback_token"
      )
      .eq("chapter_id", chapter.id)
      .in("media_type", ["audio", "video"])
      .eq("status", "completed")
      .order("sort_order", { ascending: true });

    const items = mediaItems || [];
    const userIds = Array.from(
      new Set(items.map((item: any) => item.user_id).filter(Boolean))
    );
    const uniqueContributors = userIds.length;

    const { data: contributors } = await supabaseServer
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", userIds);

    const contributorMap = new Map(
      (contributors || []).map((c: any) => [c.id, c])
    );

    const mediaPromptIds = Array.from(
      new Set(items.map((item: any) => item.prompt_id).filter(Boolean))
    );
    const { data: mediaPrompts } = await supabaseServer
      .from("prompts")
      .select("id, prompt_text")
      .in("id", mediaPromptIds);

    const promptMap = new Map((mediaPrompts || []).map((p: any) => [p.id, p]));

    const recordings: Recording[] = await Promise.all(
      items.map(async (item: any) => {
        let mediaUrl = item.media_path;

        if (!mediaUrl.startsWith("http")) {
          const { data: urlData } = await supabaseServer.storage
            .from("book-media")
            .createSignedUrl(item.media_path, 3600);
          mediaUrl = urlData?.signedUrl || mediaUrl;
        }

        let contextPhoto: string | null = null;
        const { data: photoItems } = await supabaseServer
          .from("media_items")
          .select("media_path")
          .eq("chapter_id", chapter.id)
          // .eq("prompt_id", item.prompt_id)
          // .eq("user_id", item.user_id)
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

        const prompt = promptMap.get(item.prompt_id);
        const contributor = contributorMap.get(item.user_id);

        return {
          id: item.id,
          mediaUrl,
          playbackToken: item.playback_token || "",
          promptText: prompt?.prompt_text || "A story to remember",
          promptId: item.prompt_id,
          contributorName: contributor?.full_name || "Anonymous",
          contributorAvatar: contributor?.avatar_url || null,
          enhancedText: item.enhanced_text || item.caption || "",
          contextPhoto,
          duration: 0,
          sortOrder: item.sort_order,
        };
      })
    );

    const promptGroups: PromptGroup[] = uniquePrompts.map((prompt: any) => {
      const promptRecordings = recordings.filter(
        (r: Recording) => r.promptId === prompt.promptId
      );
      const completionRate = promptRecordings.length > 0 ? 100 : 0;

      return {
        promptId: prompt.promptId,
        promptText: prompt.promptText,
        recordings: promptRecordings,
        completionRate,
      };
    });

    const userAgent = req.headers["user-agent"] || "";
    const deviceType = /mobile|android|iphone|ipad/i.test(userAgent)
      ? "mobile"
      : "desktop";
    const ipAddress =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] || null;

    await supabaseServer.from("qr_scans").insert({
      chapter_id: chapter.id,
      user_agent: userAgent,
      device_type: deviceType,
      ip_address: ipAddress,
    });

    return {
      props: {
        chapter: {
          id: chapter.id,
          title: chapter.title,
          storyText: chapter.final_story_text || "",
          bookTitle: bookData?.title || "Untitled Book",
          authorName: profileData?.full_name || "Anonymous",
          authorAvatar: profileData?.avatar_url || null,
        },
        recordings,
        promptGroups,
        totalPrompts: uniquePrompts.length,
        uniqueContributors,
      },
    };
  } catch (error: any) {
    console.error("Server error:", error);
    return {
      props: {
        chapter: null,
        recordings: [],
        promptGroups: [],
        totalPrompts: 0,
        uniqueContributors: 0,
        error: "Something went wrong",
      },
    };
  }
};

// // src/pages/play/chapter/[token].tsx
// import { GetServerSideProps } from "next";
// import Head from "next/head";
// import { useState } from "react";
// import { supabaseServer } from "@/lib/supabase-server";
// import { VisualVoicePlayer } from "@/components/playback/VisualVoicePlayer";
// import { Play, Users, MessageSquare, CheckCircle } from "lucide-react";

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
// }

// interface PromptGroup {
//   promptId: number | null;
//   promptText: string;
//   recordings: Recording[];
//   completionRate: number;
// }

// interface ChapterPlaylistProps {
//   chapter: {
//     id: string;
//     title: string;
//     storyText: string;
//     bookTitle: string;
//     authorName: string;
//     authorAvatar: string | null;
//   } | null;
//   recordings: Recording[];
//   promptGroups: PromptGroup[];
//   totalPrompts: number;
//   uniqueContributors: number;
//   error?: string;
// }

// export default function ChapterPlaylistPage({
//   chapter,
//   recordings,
//   promptGroups,
//   totalPrompts,
//   uniqueContributors,
//   error,
// }: ChapterPlaylistProps) {
//   const [activeStory, setActiveStory] = useState<Recording | null>(null);
//   const [currentPlayIndex, setCurrentPlayIndex] = useState(0);

//   // Handle story end - auto-advance
//   const handleStoryEnd = () => {
//     if (currentPlayIndex < recordings.length - 1) {
//       const nextIndex = currentPlayIndex + 1;
//       setCurrentPlayIndex(nextIndex);
//       setActiveStory(recordings[nextIndex]);
//     } else {
//       setActiveStory(null);
//       setCurrentPlayIndex(0);
//     }
//   };

//   // Play specific story
//   const playStory = (recording: Recording) => {
//     const index = recordings.findIndex((r) => r.id === recording.id);
//     setCurrentPlayIndex(index);
//     setActiveStory(recording);
//   };

//   // Error state
//   if (error || !chapter) {
//     return (
//       <div className="min-h-screen bg-awa-charcoal flex items-center justify-center p-6">
//         <Head>
//           <title>Chapter Not Found | AwaChapter</title>
//           <meta
//             name="viewport"
//             content="width=device-width, initial-scale=1.0"
//           />
//         </Head>
//         <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-awa-xl p-10 text-center max-w-md">
//           <div className="text-6xl mb-4">📖</div>
//           <h1 className="font-serif text-2xl text-white mb-4">
//             Chapter not found
//           </h1>
//           <p className="text-white/60 font-sans text-sm">
//             {error || "This chapter could not be found."}
//           </p>
//         </div>
//       </div>
//     );
//   }

//   const hasRecordings = recordings.length > 0;
//   const completionPercentage =
//     totalPrompts > 0
//       ? Math.round(
//           (promptGroups.filter((g) => g.recordings.length > 0).length /
//             totalPrompts) *
//             100
//         )
//       : 0;

//   return (
//     <div className="min-h-screen bg-awa-charcoal">
//       <Head>
//         <title>{`${chapter.title} | ${chapter.bookTitle}`}</title>
//         <meta
//           name="description"
//           content={chapter.storyText.substring(0, 150)}
//         />
//         <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//         <meta name="theme-color" content="#1A1A1A" />
//       </Head>

//       {/* Movie Poster Header */}
//       <div className="relative h-64 md:h-80 overflow-hidden">
//         {/* Blurred background */}
//         <div className="absolute inset-0">
//           <div className="w-full h-full bg-awa-gradient opacity-90" />
//         </div>

//         {/* Content */}
//         <div className="relative z-10 h-full flex flex-col justify-end p-6 bg-scrim-bottom">
//           <div className="max-w-4xl mx-auto w-full">
//             {/* Chapter badge */}
//             <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-4 py-2 mb-4">
//               <div className="w-2 h-2 bg-awa-gold rounded-full animate-pulse" />
//               <span className="text-white font-sans text-xs font-semibold tracking-wide uppercase">
//                 Chapter Playlist
//               </span>
//             </div>

//             {/* Title */}
//             <h1 className="font-serif text-4xl md:text-5xl text-white mb-3 leading-tight">
//               {chapter.title}
//             </h1>

//             {/* Metadata */}
//             <div className="flex items-center gap-4 text-white/70 font-sans text-sm">
//               <span>From "{chapter.bookTitle}"</span>
//               <span>•</span>
//               <span>by {chapter.authorName}</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Content Area */}
//       <div className="max-w-4xl mx-auto px-6 py-6">
//         {/* Stats Grid */}
//         <div className="grid grid-cols-4 gap-3 mb-6">
//           <StatCard
//             icon={<Play className="w-5 h-5" />}
//             value={recordings.length}
//             label="Stories"
//           />
//           <StatCard
//             icon={<MessageSquare className="w-5 h-5" />}
//             value={totalPrompts}
//             label="Prompts"
//           />
//           <StatCard
//             icon={<Users className="w-5 h-5" />}
//             value={uniqueContributors}
//             label="Voices"
//           />
//           <StatCard
//             icon={<CheckCircle className="w-5 h-5" />}
//             value={`${completionPercentage}%`}
//             label="Complete"
//           />
//         </div>

//         {/* Play All Button */}
//         {hasRecordings && (
//           <button
//             onClick={() => playStory(recordings[0])}
//             className="w-full bg-white hover:bg-white/90 text-awa-charcoal font-sans font-bold py-5 px-8 rounded-awa-lg mb-10 flex items-center justify-center gap-3 transition-all hover:shadow-awa-gold active:scale-[0.98]"
//           >
//             <Play className="w-6 h-6" fill="currentColor" />
//             <span className="text-lg">Play All Stories</span>
//           </button>
//         )}

//         {/* Prompt Groups */}
//         <div className="space-y-6">
//           <h2 className="font-serif text-2xl text-white mb-6">
//             Stories by Prompt
//           </h2>

//           {promptGroups.map((group, idx) => (
//             <PromptCard
//               key={group.promptId || idx}
//               group={group}
//               onPlayStory={playStory}
//             />
//           ))}
//         </div>

//         {/* Footer CTA */}
//         <div className="mt-12 relative overflow-hidden bg-gradient-to-br from-awa-gold/20 via-awa-gold/10 to-transparent border border-awa-gold/30 rounded-awa-xl p-8 text-center">
//           {/* Glow effect */}
//           <div className="absolute inset-0 bg-awa-gold/5 blur-3xl"></div>

//           <div className="relative z-10">
//             <div className="text-5xl mb-4">✨</div>
//             <h3 className="font-serif text-2xl text-white mb-2">
//               Create Your Own
//             </h3>
//             <p className="text-white/70 font-sans text-sm mb-6 max-w-sm mx-auto">
//               Build beautiful family memory books with AI-enhanced storytelling
//             </p>
//             <a
//               href="https://awachapter.com"
//               className="inline-block bg-awa-gold hover:bg-awa-gold-dark text-awa-charcoal font-sans font-bold px-8 py-3.5 rounded-awa transition-all hover:shadow-awa-gold active:scale-95"
//               target="_blank"
//               rel="noopener noreferrer"
//             >
//               Start Your Book
//             </a>

//             {/* AwaChapter branding */}
//             <div className="mt-6 flex items-center justify-center gap-2 opacity-50">
//               <span className="text-awa-gold text-xl">📖</span>
//               <p className="text-xs font-sans font-semibold tracking-wider text-white/60">
//                 POWERED BY AWACHAPTER
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Visual Voice Player Modal */}
//       {activeStory && (
//         <VisualVoicePlayer
//           mediaUrl={activeStory.mediaUrl}
//           promptText={activeStory.promptText}
//           enhancedText={activeStory.enhancedText}
//           contextPhoto={activeStory.contextPhoto}
//           contributorName={activeStory.contributorName}
//           contributorAvatar={activeStory.contributorAvatar}
//           isOpen={!!activeStory}
//           onClose={() => setActiveStory(null)}
//           onEnded={handleStoryEnd}
//         />
//       )}
//     </div>
//   );
// }

// // Stat Card Component
// const StatCard = ({
//   icon,
//   value,
//   label,
// }: {
//   icon: React.ReactNode;
//   value: number | string;
//   label: string;
// }) => (
//   <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-awa p-3 text-center hover:bg-white/10 transition-all">
//     <div className="text-awa-gold mb-2 flex justify-center">{icon}</div>
//     <div className="text-2xl font-bold text-white font-sans mb-1">{value}</div>
//     <div className="text-xs text-white/60 font-sans font-medium">{label}</div>
//   </div>
// );

// // Prompt Card Component
// const PromptCard = ({
//   group,
//   onPlayStory,
// }: {
//   group: PromptGroup;
//   onPlayStory: (r: Recording) => void;
// }) => {
//   const [isExpanded, setIsExpanded] = useState(false);
//   const hasRecordings = group.recordings.length > 0;

//   return (
//     <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-awa-lg overflow-hidden hover:border-white/20 transition-all">
//       {/* Prompt Header */}
//       <button
//         onClick={() => setIsExpanded(!isExpanded)}
//         className="w-full px-6 py-5 text-left hover:bg-white/5 transition-all"
//       >
//         <div className="flex items-start gap-4">
//           {/* Expand indicator */}
//           <div
//             className={`w-8 h-8 rounded-full bg-awa-gold/20 flex items-center justify-center flex-shrink-0 transition-transform ${
//               isExpanded ? "rotate-90" : ""
//             }`}
//           >
//             <span className="text-awa-gold text-lg">▶</span>
//           </div>

//           {/* Prompt text */}
//           <div className="flex-1">
//             <h3 className="font-serif text-lg text-white mb-2 leading-snug">
//               {group.promptText}
//             </h3>
//             <div className="flex items-center gap-3 flex-wrap">
//               {hasRecordings ? (
//                 <>
//                   <span className="text-xs font-sans font-semibold text-awa-gold">
//                     {group.recordings.length}{" "}
//                     {group.recordings.length === 1 ? "story" : "stories"}
//                   </span>
//                   {group.completionRate > 0 && (
//                     <span className="text-xs font-sans text-white/50">
//                       • {group.completionRate}% complete
//                     </span>
//                   )}
//                 </>
//               ) : (
//                 <span className="text-xs font-sans text-white/40">
//                   No stories yet
//                 </span>
//               )}
//             </div>
//           </div>

//           {/* Avatar stack */}
//           {hasRecordings && (
//             <div className="flex -space-x-2">
//               {group.recordings.slice(0, 3).map((rec, idx) => (
//                 <div
//                   key={rec.id}
//                   className="w-10 h-10 rounded-full ring-2 ring-awa-charcoal overflow-hidden"
//                   style={{ zIndex: 3 - idx }}
//                 >
//                   {rec.contributorAvatar ? (
//                     <img
//                       src={rec.contributorAvatar}
//                       alt={rec.contributorName}
//                       className="w-full h-full object-cover"
//                     />
//                   ) : (
//                     <div className="w-full h-full bg-awa-gold flex items-center justify-center text-white text-xs font-bold">
//                       {rec.contributorName.charAt(0).toUpperCase()}
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </button>

//       {/* Expanded recordings */}
//       {isExpanded && hasRecordings && (
//         <div className="border-t border-white/10 bg-white/5 p-4 space-y-3">
//           {group.recordings.map((recording) => (
//             <button
//               key={recording.id}
//               onClick={() => onPlayStory(recording)}
//               className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-awa p-4 flex items-center gap-4 transition-all text-left active:scale-[0.98]"
//             >
//               {/* Avatar */}
//               <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
//                 {recording.contributorAvatar ? (
//                   <img
//                     src={recording.contributorAvatar}
//                     alt={recording.contributorName}
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <div className="w-full h-full bg-awa-gold flex items-center justify-center text-white font-bold">
//                     {recording.contributorName.charAt(0).toUpperCase()}
//                   </div>
//                 )}
//               </div>

//               {/* Info */}
//               <div className="flex-1 min-w-0">
//                 <p className="font-sans font-semibold text-white text-sm mb-1">
//                   {recording.contributorName}
//                 </p>
//                 {recording.enhancedText && (
//                   <p className="font-sans text-white/60 text-xs line-clamp-1">
//                     {recording.enhancedText.substring(0, 80)}...
//                   </p>
//                 )}
//               </div>

//               {/* Play icon */}
//               <div className="w-10 h-10 rounded-full bg-awa-gold flex items-center justify-center flex-shrink-0">
//                 <Play
//                   className="w-5 h-5 text-awa-charcoal ml-0.5"
//                   fill="currentColor"
//                 />
//               </div>
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// // Server-side data fetching (keep your existing getServerSideProps)
// export const getServerSideProps: GetServerSideProps = async ({
//   params,
//   req,
// }) => {
//   const token = params?.token as string;

//   if (!token) {
//     return {
//       props: {
//         chapter: null,
//         recordings: [],
//         promptGroups: [],
//         totalPrompts: 0,
//         uniqueContributors: 0,
//         error: "Invalid chapter link",
//       },
//     };
//   }

//   try {
//     const { data: chapter, error: chapterError } = await supabaseServer
//       .from("chapters")
//       .select("id, title, final_story_text, book_id")
//       .eq("playback_token", token)
//       .single();

//     if (chapterError || !chapter) {
//       return {
//         props: {
//           chapter: null,
//           recordings: [],
//           promptGroups: [],
//           totalPrompts: 0,
//           uniqueContributors: 0,
//           error: "Chapter not found",
//         },
//       };
//     }

//     const { data: bookData } = await supabaseServer
//       .from("books")
//       .select("title, user_id")
//       .eq("id", chapter.book_id)
//       .single();

//     let profileData = null;
//     if (bookData?.user_id) {
//       const { data: profile } = await supabaseServer
//         .from("profiles")
//         .select("full_name, avatar_url")
//         .eq("id", bookData.user_id)
//         .single();
//       profileData = profile;
//     }

//     const { data: chapterPrompts } = await supabaseServer
//       .from("user_prompt_progress")
//       .select("prompt_id")
//       .eq("chapter_id", chapter.id)
//       .order("prompt_id", { ascending: true });

//     const promptIds = Array.from(
//       new Set((chapterPrompts || []).map((cp: any) => cp.prompt_id))
//     );

//     const { data: prompts } = await supabaseServer
//       .from("prompts")
//       .select("id, prompt_text")
//       .in("id", promptIds);

//     const uniquePrompts = (prompts || []).map((p: any) => ({
//       promptId: p.id,
//       promptText: p.prompt_text,
//     }));

//     const { data: mediaItems } = await supabaseServer
//       .from("media_items")
//       .select(
//         "id, media_path, media_type, enhanced_text, caption, sort_order, prompt_id, user_id, playback_token"
//       )
//       .eq("chapter_id", chapter.id)
//       .in("media_type", ["audio", "video"])
//       .eq("status", "completed")
//       .order("sort_order", { ascending: true });

//     const items = mediaItems || [];
//     const userIds = Array.from(
//       new Set(items.map((item: any) => item.user_id).filter(Boolean))
//     );
//     const uniqueContributors = userIds.length;

//     const { data: contributors } = await supabaseServer
//       .from("profiles")
//       .select("id, full_name, avatar_url")
//       .in("id", userIds);

//     const contributorMap = new Map(
//       (contributors || []).map((c: any) => [c.id, c])
//     );

//     const mediaPromptIds = Array.from(
//       new Set(items.map((item: any) => item.prompt_id).filter(Boolean))
//     );
//     const { data: mediaPrompts } = await supabaseServer
//       .from("prompts")
//       .select("id, prompt_text")
//       .in("id", mediaPromptIds);

//     const promptMap = new Map((mediaPrompts || []).map((p: any) => [p.id, p]));

//     // Fetch recordings with context photos
//     const recordings: Recording[] = await Promise.all(
//       items.map(async (item: any) => {
//         let mediaUrl = item.media_path;

//         if (!mediaUrl.startsWith("http")) {
//           const { data: urlData } = await supabaseServer.storage
//             .from("book-media")
//             .createSignedUrl(item.media_path, 3600);
//           mediaUrl = urlData?.signedUrl || mediaUrl;
//         }

//         // Look for context photo
//         let contextPhoto: string | null = null;
//         const { data: photoItems } = await supabaseServer
//           .from("media_items")
//           .select("media_path")
//           .eq("chapter_id", chapter.id)
//           .eq("prompt_id", item.prompt_id)
//           .eq("user_id", item.user_id)
//           .eq("media_type", "image")
//           .limit(1);

//         if (photoItems && photoItems.length > 0) {
//           const photoPath = photoItems[0].media_path;
//           if (photoPath.startsWith("http")) {
//             contextPhoto = photoPath;
//           } else {
//             const { data: signedPhotoUrl } = await supabaseServer.storage
//               .from("book-media")
//               .createSignedUrl(photoPath, 3600);
//             contextPhoto = signedPhotoUrl?.signedUrl || null;
//           }
//         }

//         const prompt = promptMap.get(item.prompt_id);
//         const contributor = contributorMap.get(item.user_id);

//         return {
//           id: item.id,
//           mediaUrl,
//           playbackToken: item.playback_token || "",
//           promptText: prompt?.prompt_text || "A story to remember",
//           promptId: item.prompt_id,
//           contributorName: contributor?.full_name || "Anonymous",
//           contributorAvatar: contributor?.avatar_url || null,
//           enhancedText: item.enhanced_text || item.caption || "",
//           contextPhoto,
//           duration: 0,
//           sortOrder: item.sort_order,
//         };
//       })
//     );

//     const promptGroups: PromptGroup[] = uniquePrompts.map((prompt: any) => {
//       const promptRecordings = recordings.filter(
//         (r: Recording) => r.promptId === prompt.promptId
//       );
//       const completionRate = promptRecordings.length > 0 ? 100 : 0;

//       return {
//         promptId: prompt.promptId,
//         promptText: prompt.promptText,
//         recordings: promptRecordings,
//         completionRate,
//       };
//     });

//     // Track scan
//     const userAgent = req.headers["user-agent"] || "";
//     const deviceType = /mobile|android|iphone|ipad/i.test(userAgent)
//       ? "mobile"
//       : "desktop";
//     const ipAddress =
//       (req.headers["x-forwarded-for"] as string)?.split(",")[0] || null;

//     await supabaseServer.from("qr_scans").insert({
//       chapter_id: chapter.id,
//       user_agent: userAgent,
//       device_type: deviceType,
//       ip_address: ipAddress,
//     });

//     return {
//       props: {
//         chapter: {
//           id: chapter.id,
//           title: chapter.title,
//           storyText: chapter.final_story_text || "",
//           bookTitle: bookData?.title || "Untitled Book",
//           authorName: profileData?.full_name || "Anonymous",
//           authorAvatar: profileData?.avatar_url || null,
//         },
//         recordings,
//         promptGroups,
//         totalPrompts: uniquePrompts.length,
//         uniqueContributors,
//       },
//     };
//   } catch (error: any) {
//     console.error("Server error:", error);
//     return {
//       props: {
//         chapter: null,
//         recordings: [],
//         promptGroups: [],
//         totalPrompts: 0,
//         uniqueContributors: 0,
//         error: "Something went wrong",
//       },
//     };
//   }
// };
