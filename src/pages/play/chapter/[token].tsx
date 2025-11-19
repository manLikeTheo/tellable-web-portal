// pages/play/chapter/[token].tsx
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { supabaseServer } from "@/lib/supabase-server";

interface Recording {
  id: string;
  mediaUrl: string;
  promptText: string;
  promptId: number | null;
  contributorName: string;
  contributorAvatar: string | null;
  enhancedText: string;
  sortOrder: number;
}

interface PromptGroup {
  promptId: number | null;
  promptText: string;
  recordings: Recording[];
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
  error?: string;
}

export default function ChapterPlaylistPage({
  chapter,
  recordings,
  promptGroups,
  totalPrompts,
  error,
}: ChapterPlaylistProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [expandedPrompts, setExpandedPrompts] = useState<Set<number>>(
    new Set()
  );
  const audioRef = useRef<HTMLAudioElement>(null);

  const totalRecordings = recordings.length;
  const hasRecordings = recordings.length > 0;
  const promptsWithRecordings = promptGroups.filter(
    (g) => g.recordings.length > 0
  ).length;

  // Toggle prompt group expansion
  const togglePrompt = (promptId: number) => {
    setExpandedPrompts((prev) => {
      const next = new Set(prev);
      if (next.has(promptId)) {
        next.delete(promptId);
      } else {
        next.add(promptId);
      }
      return next;
    });
  };

  // Handle Play All button
  const handlePlayAll = () => {
    if (recordings.length === 0) return;
    setIsPlayingAll(true);
    setCurrentIndex(0);
    setTimeout(() => {
      audioRef.current?.play();
    }, 100);
  };

  // Auto-advance to next track
  const handleTrackEnd = () => {
    if (isPlayingAll && currentIndex < recordings.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setTimeout(() => {
        audioRef.current?.play();
      }, 300);
    } else if (isPlayingAll && currentIndex === recordings.length - 1) {
      setIsPlayingAll(false);
      setIsPlaying(false);
    }
  };

  // Handle individual track selection
  const handleTrackSelect = (index: number) => {
    setCurrentIndex(index);
    setIsPlayingAll(false);
    setTimeout(() => {
      audioRef.current?.play();
    }, 100);
  };

  // Update audio source when track changes
  useEffect(() => {
    if (audioRef.current && recordings[currentIndex]) {
      audioRef.current.src = recordings[currentIndex].mediaUrl;
      audioRef.current.load();
    }
  }, [currentIndex, recordings]);

  // Error state
  if (error || !chapter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 flex items-center justify-center p-4">
        <Head>
          <title>Chapter Not Found | AwaChapter</title>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
          />
        </Head>
        <div className="bg-white rounded-3xl shadow-2xl p-10 text-center max-w-md animate-slideIn">
          <div className="text-6xl mb-4">📖</div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Chapter not found
          </h1>
          <p className="text-gray-600">
            {error || "This chapter could not be found."}
          </p>
        </div>
      </div>
    );
  }

  const currentRecording = recordings[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 pb-32">
      <Head>
        <title>{`${chapter.title} | ${chapter.bookTitle}`}</title>
        <meta
          name="description"
          content={chapter.storyText.substring(0, 150)}
        />
        <meta
          property="og:title"
          content={`${chapter.title} - ${chapter.bookTitle}`}
        />
        <meta
          property="og:description"
          content={`Listen to ${totalRecordings} stories from ${totalPrompts} prompts`}
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <meta name="theme-color" content="#7c3aed" />
      </Head>

      <div className="max-w-2xl mx-auto">
        {/* Hero Section */}
        <div className="relative bg-white/10 backdrop-blur-lg border-b border-white/20 px-6 pt-8 pb-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-white text-sm font-medium">
                Chapter Playlist
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
              {chapter.title}
            </h1>

            <p className="text-purple-100 text-lg mb-1">
              From "{chapter.bookTitle}"
            </p>
            <p className="text-purple-200 text-sm mb-6">
              by {chapter.authorName}
            </p>

            {/* Stats */}
            <div className="flex justify-center gap-6 text-white/90 text-sm mb-6">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎙️</span>
                <span className="font-medium">{totalRecordings} Stories</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">💬</span>
                <span className="font-medium">{totalPrompts} Prompts</span>
              </div>
            </div>

            {/* Big Play All Button */}
            {hasRecordings && (
              <button
                onClick={handlePlayAll}
                disabled={isPlayingAll && isPlaying}
                className="relative group w-full max-w-md mx-auto bg-white text-purple-700 py-5 px-8 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <div className="relative flex items-center justify-center gap-3">
                  <span className="text-3xl">▶️</span>
                  <span>
                    {isPlayingAll && isPlaying
                      ? "Playing All..."
                      : `Play All Stories`}
                  </span>
                </div>
              </button>
            )}

            {!hasRecordings && (
              <div className="bg-amber-500/20 backdrop-blur-sm border border-amber-400/30 rounded-2xl p-4">
                <p className="text-white text-sm">
                  📝 No recordings yet. Start adding stories to bring this
                  chapter to life!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Progress Indicator (when playing) */}
        {isPlayingAll && hasRecordings && (
          <div className="bg-white/10 backdrop-blur-lg border-b border-white/20 px-6 py-4">
            <div className="flex items-center justify-between text-white mb-2">
              <span className="text-sm font-medium">Playing</span>
              <span className="text-sm">
                {currentIndex + 1} of {totalRecordings}
              </span>
            </div>
            <div className="bg-white/20 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-400 to-emerald-500 h-full transition-all duration-500 rounded-full"
                style={{
                  width: `${((currentIndex + 1) / totalRecordings) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Collapsible Prompt Groups */}
        <div className="p-4 space-y-3">
          <h2 className="text-white font-bold text-lg px-2 mb-4 flex items-center gap-2">
            <span>🎧</span>
            <span>Stories by Prompt</span>
          </h2>

          {promptGroups.map((group, groupIdx) => {
            const isExpanded = expandedPrompts.has(groupIdx);
            const hasRecordings = group.recordings.length > 0;

            return (
              <div
                key={`prompt-${group.promptId || groupIdx}`}
                className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all"
              >
                {/* Prompt Header (Clickable) */}
                <button
                  onClick={() => togglePrompt(groupIdx)}
                  className="w-full px-5 py-4 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left"
                >
                  {/* Expand Icon */}
                  <div className="flex-shrink-0 mt-1">
                    <div
                      className={`w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center transition-transform ${
                        isExpanded ? "rotate-90" : ""
                      }`}
                    >
                      <span className="text-purple-600 text-sm">▶</span>
                    </div>
                  </div>

                  {/* Prompt Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-base leading-snug mb-1">
                      {group.promptText}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {hasRecordings
                        ? `${group.recordings.length} ${
                            group.recordings.length === 1 ? "story" : "stories"
                          }`
                        : "No recordings yet"}
                    </p>
                  </div>

                  {/* Recording Count Badge */}
                  {hasRecordings && (
                    <div className="flex-shrink-0 bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full">
                      {group.recordings.length}
                    </div>
                  )}
                </button>

                {/* Expanded Recordings */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50 px-5 py-4 space-y-3 animate-slideDown">
                    {hasRecordings ? (
                      group.recordings.map((recording) => {
                        const globalIndex = recordings.findIndex(
                          (r) => r.id === recording.id
                        );
                        const isCurrentlyPlaying =
                          globalIndex === currentIndex && isPlaying;

                        return (
                          <div
                            key={recording.id}
                            onClick={() => handleTrackSelect(globalIndex)}
                            className={`relative p-4 rounded-xl cursor-pointer transition-all ${
                              isCurrentlyPlaying
                                ? "bg-purple-100 border-2 border-purple-400 shadow-md"
                                : "bg-white border-2 border-gray-200 hover:border-purple-300 hover:shadow-md"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {/* Contributor Avatar */}
                              <div className="flex-shrink-0">
                                {recording.contributorAvatar ? (
                                  <img
                                    src={recording.contributorAvatar}
                                    alt={recording.contributorName}
                                    className="w-12 h-12 rounded-full object-cover ring-2 ring-white"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg ring-2 ring-white">
                                    {recording.contributorName
                                      .charAt(0)
                                      .toUpperCase()}
                                  </div>
                                )}
                              </div>

                              {/* Recording Info */}
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 text-sm mb-1">
                                  {recording.contributorName}'s story
                                </p>
                                {recording.enhancedText && (
                                  <p className="text-xs text-gray-600 line-clamp-2">
                                    {recording.enhancedText.substring(0, 100)}
                                    ...
                                  </p>
                                )}
                              </div>

                              {/* Play Button */}
                              <div className="flex-shrink-0">
                                {isCurrentlyPlaying ? (
                                  <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center animate-pulse">
                                    <span className="text-white text-lg">
                                      🔊
                                    </span>
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-purple-100 transition-colors">
                                    <span className="text-purple-600 text-lg">
                                      ▶️
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                        <p className="text-gray-600 text-sm mb-1">
                          🎙️ No recordings yet
                        </p>
                        <p className="text-xs text-gray-400">
                          This prompt is waiting for a response
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer CTA */}
        <div className="mt-8 mx-4 bg-white rounded-3xl shadow-2xl p-6 text-center">
          <p className="text-gray-700 text-sm mb-4">
            Create your own family memory book with stories like these
          </p>
          <a
            href="https://awachapter.com"
            className="inline-block bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            target="_blank"
            rel="noopener noreferrer"
          >
            Start Your Book
          </a>
          <p className="text-xs text-gray-500 mt-4">✨ Powered by AwaChapter</p>
        </div>
      </div>

      {/* Sticky Audio Player (Bottom) */}
      {hasRecordings && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t-4 border-purple-500 shadow-2xl z-50">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <div className="text-white mb-2 text-sm truncate">
              <span className="text-purple-400 font-semibold">
                Now Playing:
              </span>{" "}
              {currentRecording?.promptText}
            </div>
            <audio
              ref={audioRef}
              controls
              preload="metadata"
              className="w-full"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={handleTrackEnd}
              style={{
                width: "100%",
                height: "48px",
                backgroundColor: "#1f2937",
              }}
            >
              Your browser does not support audio playback.
            </audio>
            <div className="text-gray-400 text-xs mt-2 truncate">
              By {currentRecording?.contributorName}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 1000px;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.5s ease-out;
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        audio::-webkit-media-controls-panel {
          background-color: #1f2937;
        }
        * {
          -webkit-tap-highlight-color: transparent;
        }
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
}

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
      console.error("Chapter not found:", chapterError);
      return {
        props: {
          chapter: null,
          recordings: [],
          promptGroups: [],
          totalPrompts: 0,
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

    const { data: mediaItems, error: mediaError } = await supabaseServer
      .from("media_items")
      .select(
        "id, media_path, media_type, enhanced_text, caption, sort_order, prompt_id, user_id"
      )
      .eq("chapter_id", chapter.id)
      .in("media_type", ["audio", "video"])
      .eq("status", "completed")
      .order("sort_order", { ascending: true });

    if (mediaError) {
      console.error("Media fetch error:", mediaError);
    }

    const items = mediaItems || [];

    const userIds = Array.from(
      new Set(items.map((item: any) => item.user_id).filter(Boolean))
    );
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

        const prompt = promptMap.get(item.prompt_id);
        const contributor = contributorMap.get(item.user_id);

        return {
          id: item.id,
          mediaUrl,
          promptText: prompt?.prompt_text || "A story to remember",
          promptId: item.prompt_id,
          contributorName: contributor?.full_name || "Anonymous",
          contributorAvatar: contributor?.avatar_url || null,
          enhancedText: item.enhanced_text || item.caption || "",
          sortOrder: item.sort_order,
        };
      })
    );

    const promptGroups: PromptGroup[] = uniquePrompts.map((prompt: any) => ({
      promptId: prompt.promptId,
      promptText: prompt.promptText,
      recordings: recordings.filter(
        (r: Recording) => r.promptId === prompt.promptId
      ),
    }));

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
        error: "Something went wrong loading this chapter",
      },
    };
  }
};
