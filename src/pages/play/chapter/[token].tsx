// pages/play/chapter/[token].tsx - PHASE 3: POLISHED & OPTIMIZED
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { supabaseServer } from "@/lib/supabase-server";

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

// Skeleton Loader Components
const StatCardSkeleton = () => (
  <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 animate-pulse">
    <div className="w-8 h-8 bg-white/20 rounded-full mx-auto mb-2"></div>
    <div className="h-6 bg-white/20 rounded w-12 mx-auto mb-1"></div>
    <div className="h-3 bg-white/20 rounded w-16 mx-auto"></div>
  </div>
);

const PromptCardSkeleton = () => (
  <div className="bg-white rounded-3xl shadow-xl p-6 animate-pulse">
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 bg-gray-200 rounded-2xl flex-shrink-0"></div>
      <div className="flex-1">
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  </div>
);

export default function EnhancedChapterPlaylistPage({
  chapter,
  recordings,
  promptGroups,
  totalPrompts,
  uniqueContributors,
  error,
}: ChapterPlaylistProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [expandedPrompts, setExpandedPrompts] = useState<Set<number>>(
    new Set()
  );
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [recordingsWithDuration, setRecordingsWithDuration] =
    useState<Recording[]>(recordings);
  const [isLoadingDurations, setIsLoadingDurations] = useState(true);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Helper functions
  const formatDuration = (seconds: number): string => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDurationMinutes = (seconds: number): string => {
    if (!seconds) return "0 min";
    const mins = Math.ceil(seconds / 60);
    return `${mins} min`;
  };

  // Page load animation
  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Fetch audio durations on mount
  useEffect(() => {
    const fetchDurations = async () => {
      setIsLoadingDurations(true);
      const updatedRecordings = await Promise.all(
        recordings.map(async (recording) => {
          try {
            const audio = new Audio(recording.mediaUrl);
            await new Promise((resolve, reject) => {
              const timeout = setTimeout(
                () => reject(new Error("Timeout")),
                5000
              );
              audio.addEventListener("loadedmetadata", () => {
                clearTimeout(timeout);
                resolve(true);
              });
              audio.addEventListener("error", () => {
                clearTimeout(timeout);
                reject(new Error("Load error"));
              });
              audio.load();
            });
            return { ...recording, duration: audio.duration || 0 };
          } catch (error) {
            console.error("Error loading audio duration:", error);
            return { ...recording, duration: 180 }; // Default 3 min fallback
          }
        })
      );
      setRecordingsWithDuration(updatedRecordings);
      setIsLoadingDurations(false);
    };

    if (recordings.length > 0) {
      fetchDurations();
    } else {
      setIsLoadingDurations(false);
    }
  }, [recordings]);

  // Image preloading
  const handleImageLoad = (imageUrl: string) => {
    setLoadedImages((prev) => new Set(prev).add(imageUrl));
  };

  const totalRecordings = recordingsWithDuration.length;
  const hasRecordings = recordingsWithDuration.length > 0;
  const completionPercentage =
    totalPrompts > 0
      ? Math.round(
          (promptGroups.filter((g) => g.recordings.length > 0).length /
            totalPrompts) *
            100
        )
      : 0;
  const totalDurationSeconds = recordingsWithDuration.reduce(
    (sum, r) => sum + (r.duration || 0),
    0
  );

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

  const openVisualVoice = (playbackToken: string) => {
    router.push(`/play/${playbackToken}`);
  };

  const handlePlayAll = () => {
    if (recordingsWithDuration.length === 0) return;
    setIsPlayingAll(true);
    setCurrentIndex(0);
    setTimeout(() => {
      audioRef.current?.play();
    }, 100);
  };

  const handleTrackEnd = () => {
    if (isPlayingAll && currentIndex < recordingsWithDuration.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setTimeout(() => {
        audioRef.current?.play();
      }, 300);
    } else if (
      isPlayingAll &&
      currentIndex === recordingsWithDuration.length - 1
    ) {
      setIsPlayingAll(false);
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (audioRef.current && recordingsWithDuration[currentIndex]) {
      audioRef.current.src = recordingsWithDuration[currentIndex].mediaUrl;
      audioRef.current.load();
    }
  }, [currentIndex, recordingsWithDuration]);

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
        <div className="bg-white rounded-3xl shadow-2xl p-10 text-center max-w-md animate-fadeIn">
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

  const currentRecording = recordingsWithDuration[currentIndex];
  const promptGroupsWithDuration = promptGroups.map((group) => ({
    ...group,
    recordings: group.recordings.map((rec) => {
      const withDuration = recordingsWithDuration.find((r) => r.id === rec.id);
      return withDuration || rec;
    }),
  }));

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 pb-32 transition-opacity duration-500 ${
        isPageLoaded ? "opacity-100" : "opacity-0"
      }`}
    >
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

      <div className="max-w-4xl mx-auto">
        {/* Enhanced Hero Section */}
        <div className="relative bg-gradient-to-b from-black/30 to-transparent backdrop-blur-md border-b border-white/10 px-6 pt-10 pb-8 animate-slideDown">
          <div className="text-center">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-xl px-5 py-2.5 rounded-full mb-6 border border-white/30 shadow-lg animate-fadeIn">
              <div className="relative">
                <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full block animate-pulse"></span>
                <span className="absolute inset-0 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></span>
              </div>
              <span className="text-white text-sm font-semibold tracking-wide">
                CHAPTER PLAYLIST
              </span>
            </div>

            {/* Chapter Title */}
            <h1
              className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight drop-shadow-2xl animate-fadeInUp"
              style={{ animationDelay: "100ms" }}
            >
              {chapter.title}
            </h1>

            {/* Book Info */}
            <div
              className="space-y-2 mb-8 animate-fadeInUp"
              style={{ animationDelay: "200ms" }}
            >
              <p className="text-purple-100 text-xl font-medium">
                From "
                <span className="font-bold text-white">
                  {chapter.bookTitle}
                </span>
                "
              </p>
              <p className="text-purple-200 text-base">
                Curated by{" "}
                <span className="font-semibold text-white">
                  {chapter.authorName}
                </span>
              </p>
            </div>

            {/* Enhanced Stats Grid with Loading States */}
            <div
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-2xl mx-auto animate-fadeInUp"
              style={{ animationDelay: "300ms" }}
            >
              {isLoadingDurations ? (
                <>
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                </>
              ) : (
                <>
                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 hover:bg-white/15 transition-all hover:scale-105 active:scale-95">
                    <div className="text-3xl mb-2">🎙️</div>
                    <div className="text-2xl font-bold text-white">
                      {totalRecordings}
                    </div>
                    <div className="text-xs text-purple-200 font-medium">
                      {totalRecordings === 1 ? "Story" : "Stories"}
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 hover:bg-white/15 transition-all hover:scale-105 active:scale-95">
                    <div className="text-3xl mb-2">💬</div>
                    <div className="text-2xl font-bold text-white">
                      {totalPrompts}
                    </div>
                    <div className="text-xs text-purple-200 font-medium">
                      {totalPrompts === 1 ? "Prompt" : "Prompts"}
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 hover:bg-white/15 transition-all hover:scale-105 active:scale-95">
                    <div className="text-3xl mb-2">👥</div>
                    <div className="text-2xl font-bold text-white">
                      {uniqueContributors}
                    </div>
                    <div className="text-xs text-purple-200 font-medium">
                      {uniqueContributors === 1 ? "Voice" : "Voices"}
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 hover:bg-white/15 transition-all hover:scale-105 active:scale-95">
                    <div className="text-3xl mb-2">✨</div>
                    <div className="text-2xl font-bold text-white">
                      {completionPercentage}%
                    </div>
                    <div className="text-xs text-purple-200 font-medium">
                      Complete
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Enhanced Play All Button with Duration */}
            {hasRecordings && (
              <div
                className="animate-fadeInUp"
                style={{ animationDelay: "400ms" }}
              >
                <button
                  onClick={handlePlayAll}
                  disabled={isPlayingAll && isPlaying}
                  className="group relative w-full max-w-md mx-auto bg-gradient-to-r from-white to-purple-50 text-purple-700 py-6 px-10 rounded-3xl font-black text-xl shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:scale-[1.03] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 animate-shimmer"></div>
                  <div className="relative flex items-center justify-center gap-4">
                    <div className="text-4xl group-hover:scale-110 transition-transform">
                      {isPlayingAll && isPlaying ? "🔊" : "▶️"}
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="tracking-wide leading-tight">
                        {isPlayingAll && isPlaying
                          ? "PLAYING ALL STORIES"
                          : "PLAY ALL STORIES"}
                      </span>
                      {totalDurationSeconds > 0 && !isLoadingDurations && (
                        <span className="text-sm font-semibold text-purple-500 mt-1">
                          ({formatDurationMinutes(totalDurationSeconds)})
                        </span>
                      )}
                      {isLoadingDurations && (
                        <span className="text-sm font-semibold text-purple-400 mt-1 animate-pulse">
                          Loading durations...
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              </div>
            )}

            {!hasRecordings && (
              <div
                className="bg-amber-500/20 backdrop-blur-xl border-2 border-amber-400/40 rounded-3xl p-6 max-w-md mx-auto animate-fadeInUp"
                style={{ animationDelay: "400ms" }}
              >
                <div className="text-5xl mb-3">📝</div>
                <p className="text-white font-semibold text-lg">
                  No recordings yet
                </p>
                <p className="text-amber-100 text-sm mt-2">
                  Start adding stories to bring this chapter to life!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar (when playing) */}
        {isPlayingAll && hasRecordings && (
          <div className="sticky top-0 z-40 bg-gradient-to-r from-purple-900/95 to-indigo-900/95 backdrop-blur-xl border-b border-white/10 px-6 py-5 shadow-lg animate-slideDown">
            <div className="flex items-center justify-between text-white mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-sm">▶️</span>
                </div>
                <span className="text-sm font-bold tracking-wide">
                  NOW PLAYING
                </span>
              </div>
              <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
                {currentIndex + 1} of {totalRecordings}
              </span>
            </div>
            <div className="bg-white/20 rounded-full h-3 overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500 h-full transition-all duration-500 rounded-full shadow-lg"
                style={{
                  width: `${((currentIndex + 1) / totalRecordings) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Enhanced Prompt Groups with Loading States */}
        <div className="p-6 space-y-5">
          <h2 className="text-white font-black text-2xl px-2 mb-6 flex items-center gap-3 drop-shadow-lg animate-fadeInUp">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
              <span className="text-xl">🎧</span>
            </div>
            <span>Stories by Prompt</span>
          </h2>

          {isLoadingDurations ? (
            <div className="space-y-4">
              <PromptCardSkeleton />
              <PromptCardSkeleton />
              <PromptCardSkeleton />
            </div>
          ) : (
            promptGroupsWithDuration.map((group, groupIdx) => {
              const isExpanded = expandedPrompts.has(groupIdx);
              const hasRecordings = group.recordings.length > 0;
              const completionRate = group.completionRate;

              return (
                <div
                  key={`prompt-${group.promptId || groupIdx}`}
                  className="bg-gradient-to-br from-white to-purple-50 rounded-3xl shadow-2xl overflow-hidden transition-all hover:shadow-purple-500/30 border border-purple-100 animate-fadeInUp"
                  style={{ animationDelay: `${groupIdx * 100}ms` }}
                >
                  {/* Prompt Header */}
                  <button
                    onClick={() => togglePrompt(groupIdx)}
                    className="w-full px-6 py-5 flex items-start gap-4 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-all text-left group active:scale-[0.99]"
                  >
                    {/* Expand Indicator */}
                    <div className="flex-shrink-0 mt-1">
                      <div
                        className={`w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center transition-all duration-300 shadow-lg group-hover:shadow-purple-500/50 ${
                          isExpanded ? "rotate-90 scale-110" : ""
                        }`}
                      >
                        <span className="text-white text-lg font-bold">▶</span>
                      </div>
                    </div>

                    {/* Prompt Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-lg leading-snug mb-2 group-hover:text-purple-700 transition-colors">
                        {group.promptText}
                      </h3>
                      <div className="flex items-center gap-3 flex-wrap">
                        {hasRecordings ? (
                          <>
                            {group.recordings.map((rec, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-full hover:bg-indigo-200 transition-colors"
                              >
                                <span>⏱️</span>
                                {formatDuration(rec.duration)}
                              </span>
                            ))}
                            {completionRate > 0 && (
                              <span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full">
                                <span>✓</span>
                                {completionRate}% complete
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="inline-flex items-center gap-2 bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-full">
                            <span>⏳</span>
                            Waiting for stories
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Recording Count Badge */}
                    {hasRecordings && (
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <span className="text-white text-2xl font-black">
                            {group.recordings.length}
                          </span>
                        </div>
                      </div>
                    )}
                  </button>

                  {/* Expanded Recording Cards */}
                  {isExpanded && (
                    <div className="border-t-2 border-purple-100 bg-gradient-to-b from-gray-50 to-white px-6 py-6 space-y-4 animate-expandDown">
                      {hasRecordings ? (
                        group.recordings.map((recording, recIdx) => {
                          const globalIndex = recordingsWithDuration.findIndex(
                            (r) => r.id === recording.id
                          );
                          const isCurrentlyPlaying =
                            globalIndex === currentIndex && isPlaying;
                          const isHovered = hoveredCard === recording.id;
                          const imageLoaded = recording.contextPhoto
                            ? loadedImages.has(recording.contextPhoto)
                            : true;

                          return (
                            <div
                              key={recording.id}
                              onClick={() =>
                                openVisualVoice(recording.playbackToken)
                              }
                              onMouseEnter={() => setHoveredCard(recording.id)}
                              onMouseLeave={() => setHoveredCard(null)}
                              className={`relative rounded-2xl cursor-pointer transition-all overflow-hidden group animate-fadeInUp ${
                                isCurrentlyPlaying
                                  ? "bg-gradient-to-br from-purple-100 to-indigo-100 border-3 border-purple-500 shadow-xl scale-[1.02]"
                                  : "bg-white border-2 border-gray-200 hover:border-purple-400 hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99]"
                              }`}
                              style={{ animationDelay: `${recIdx * 50}ms` }}
                            >
                              {/* Background gradient overlay on hover */}
                              <div
                                className={`absolute inset-0 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 transition-opacity duration-300 ${
                                  isHovered ? "opacity-100" : "opacity-0"
                                }`}
                              ></div>

                              <div className="relative p-5 flex items-center gap-4">
                                {/* Visual Voice Indicator (Left) */}
                                <div className="flex-shrink-0">
                                  <div
                                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg transition-all duration-300 ${
                                      isHovered ? "scale-110 rotate-3" : ""
                                    }`}
                                  >
                                    <span className="text-3xl">🎬</span>
                                  </div>
                                </div>

                                {/* Contributor Avatar & Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-3 mb-2">
                                    {recording.contributorAvatar ? (
                                      <img
                                        src={recording.contributorAvatar}
                                        alt={recording.contributorName}
                                        className="w-12 h-12 rounded-full object-cover ring-4 ring-white shadow-md"
                                      />
                                    ) : (
                                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-black text-xl ring-4 ring-white shadow-md">
                                        {recording.contributorName
                                          .charAt(0)
                                          .toUpperCase()}
                                      </div>
                                    )}
                                    <div className="flex-1">
                                      <p className="font-bold text-gray-900 text-base leading-tight">
                                        {recording.contributorName}
                                      </p>
                                      <p className="text-xs text-gray-500 font-medium">
                                        Storyteller
                                      </p>
                                    </div>
                                  </div>
                                  {recording.enhancedText && (
                                    <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
                                      {recording.enhancedText.substring(0, 120)}
                                      ...
                                    </p>
                                  )}
                                </div>

                                {/* Duration & Context Photo */}
                                <div className="flex-shrink-0 flex flex-col items-end gap-2">
                                  {recording.duration > 0 && (
                                    <div className="bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                                      ⏱️ {formatDuration(recording.duration)}
                                    </div>
                                  )}
                                  {recording.contextPhoto && (
                                    <div className="relative w-16 h-16 rounded-xl overflow-hidden ring-2 ring-purple-300 shadow-lg">
                                      {!imageLoaded && (
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-200 to-indigo-200 animate-pulse"></div>
                                      )}
                                      <img
                                        src={recording.contextPhoto}
                                        alt="Story context"
                                        className={`w-full h-full object-cover transition-opacity duration-500 ${
                                          imageLoaded
                                            ? "opacity-100"
                                            : "opacity-0"
                                        }`}
                                        onLoad={() =>
                                          handleImageLoad(
                                            recording.contextPhoto!
                                          )
                                        }
                                        loading="lazy"
                                      />
                                    </div>
                                  )}
                                  {isCurrentlyPlaying && (
                                    <div className="bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full animate-pulse shadow-md">
                                      🔊 PLAYING
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Hover Arrow Indicator */}
                              <div
                                className={`absolute right-5 top-1/2 -translate-y-1/2 text-purple-600 text-2xl transition-all duration-300 ${
                                  isHovered
                                    ? "translate-x-0 opacity-100"
                                    : "translate-x-2 opacity-0"
                                }`}
                              >
                                →
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-3 border-dashed border-gray-300 rounded-2xl p-8 text-center animate-fadeIn">
                          <div className="text-6xl mb-4">🎙️</div>
                          <p className="text-gray-700 font-bold text-lg mb-2">
                            No recordings yet
                          </p>
                          <p className="text-sm text-gray-500">
                            This prompt is waiting for a storyteller's voice
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Enhanced Footer CTA */}
        <div className="mt-10 mx-6 bg-gradient-to-br from-white to-purple-50 rounded-3xl shadow-2xl p-8 text-center border-2 border-purple-200 animate-fadeInUp hover:scale-[1.02] transition-transform">
          <div className="text-5xl mb-4 animate-bounce">✨</div>
          <h3 className="text-2xl font-black text-gray-900 mb-3">
            Create Your Own Story Collection
          </h3>
          <p className="text-gray-600 text-base mb-6 max-w-md mx-auto">
            Build beautiful family memory books with AI-enhanced storytelling
          </p>
          <a
            href="https://awachapter.com"
            className="inline-block bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95"
            target="_blank"
            rel="noopener noreferrer"
          >
            START YOUR BOOK
          </a>
          <div className="mt-6 flex items-center justify-center gap-2 text-gray-500">
            <span className="text-xl">🌟</span>
            <p className="text-xs font-semibold tracking-wider">
              POWERED BY AWACHAPTER
            </p>
          </div>
        </div>
      </div>

      {/* Sticky Enhanced Audio Player - Clickable to open Visual Voice */}
      {hasRecordings && currentRecording && (
        <div
          onClick={() => openVisualVoice(currentRecording.playbackToken)}
          className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-gray-800 border-t-4 border-purple-500 shadow-2xl z-50 cursor-pointer hover:border-purple-400 transition-all active:scale-[0.99]"
        >
          <div className="max-w-4xl mx-auto px-6 py-5">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 animate-pulse">
                <span className="text-2xl">🎵</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-purple-300 text-xs font-bold mb-1 tracking-wide flex items-center gap-2">
                  NOW PLAYING
                  <span className="text-purple-400 text-xs hidden md:inline">
                    • Tap to open Visual Voice
                  </span>
                </div>
                <div className="text-white text-sm font-semibold truncate">
                  {currentRecording?.promptText}
                </div>
              </div>
            </div>
            <audio
              ref={audioRef}
              controls
              preload="metadata"
              className="w-full mb-2 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={handleTrackEnd}
              style={{
                width: "100%",
                height: "54px",
                backgroundColor: "#1f2937",
                borderRadius: "12px",
              }}
            >
              Your browser does not support audio playback.
            </audio>
            <div className="flex items-center justify-between text-xs">
              <div className="text-gray-400 truncate">
                By{" "}
                <span className="text-purple-300 font-semibold">
                  {currentRecording?.contributorName}
                </span>
              </div>
              <div className="text-gray-500 font-mono">
                {currentIndex + 1}/{totalRecordings}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes expandDown {
          from {
            opacity: 0;
            max-height: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            max-height: 2000px;
            transform: translateY(0);
          }
        }
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out;
          animation-fill-mode: both;
        }
        .animate-slideDown {
          animation: slideDown 0.4s ease-out;
        }
        .animate-expandDown {
          animation: expandDown 0.4s ease-out;
        }
        .animate-shimmer::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          animation: shimmer 2s infinite;
        }

        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 10px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
          transition: background 0.3s;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }

        /* Remove tap highlight */
        * {
          -webkit-tap-highlight-color: transparent;
        }

        /* Audio player styling */
        audio::-webkit-media-controls-panel {
          background-color: #1f2937;
        }

        /* Touch-friendly tap targets */
        button,
        a {
          min-height: 44px;
          min-width: 44px;
        }

        /* Skeleton shimmer effect */
        @keyframes skeleton-shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        .animate-pulse {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.1) 0%,
            rgba(255, 255, 255, 0.2) 50%,
            rgba(255, 255, 255, 0.1) 100%
          );
          background-size: 200% 100%;
          animation: skeleton-shimmer 1.5s ease-in-out infinite;
        }

        /* Optimize animations on mobile */
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
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
      console.error("Chapter not found:", chapterError);
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

    // Fetch context photos for each recording
    const recordings: Recording[] = await Promise.all(
      items.map(async (item: any) => {
        let mediaUrl = item.media_path;

        if (!mediaUrl.startsWith("http")) {
          const { data: urlData } = await supabaseServer.storage
            .from("book-media")
            .createSignedUrl(item.media_path, 3600);
          mediaUrl = urlData?.signedUrl || mediaUrl;
        }

        // Look for context photo
        let contextPhoto: string | null = null;
        const { data: photoItems } = await supabaseServer
          .from("media_items")
          .select("media_path")
          .eq("chapter_id", chapter.id)
          .eq("prompt_id", item.prompt_id)
          .eq("user_id", item.user_id)
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
          duration: 0, // Will be updated from audio metadata on client
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
        error: "Something went wrong loading this chapter",
      },
    };
  }
};
