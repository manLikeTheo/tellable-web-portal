// pages/play/[token].tsx - SIMPLIFIED VERSION
// Use this if the nested query still has issues
// =======================================================

import { GetServerSideProps } from "next";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

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
  chapterTitle?: string;
  bookTitle?: string;
  authorName?: string;
  error?: string;
  debugInfo?: any;
}

export default function PlayPage({
  mediaItem,
  mediaUrl,
  promptText,
  contributorName,
  contributorAvatar,
  chapterTitle,
  bookTitle,
  authorName,
  error,
  debugInfo,
}: PlayPageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const mediaElement =
      mediaItem?.media_type === "audio" ? audioRef.current : videoRef.current;
    if (mediaElement) {
      mediaElement.play().catch(() => {
        console.log("Auto-play prevented");
      });
    }
  }, [mediaItem]);

  useEffect(() => {
    if (process.env.NODE_ENV === "development" && debugInfo) {
      console.log("🔍 Debug Info:", debugInfo);
    }
  }, [debugInfo]);

  if (error || !mediaItem || !mediaUrl) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center p-4">
        <Head>
          <title>Story Not Found | AwaChapter</title>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
          />
        </Head>
        <div className="bg-white rounded-3xl shadow-2xl p-10 text-center max-w-md animate-slideIn">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Story not found
          </h1>
          <p className="text-gray-600 mb-4">
            This story could not be found or has been removed.
          </p>
          {process.env.NODE_ENV === "development" && debugInfo && (
            <details className="text-left text-xs bg-gray-100 p-4 rounded mt-4">
              <summary className="cursor-pointer font-semibold">
                Debug Info
              </summary>
              <pre className="mt-2 overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }

  const storyText = mediaItem.enhanced_text || mediaItem.caption || "";
  const displayPrompt = promptText || "";
  const displayContributor = contributorName || "A Storyteller";
  const displayAvatar = contributorAvatar || null;
  const displayChapter = chapterTitle || "A Chapter";
  const displayBook = bookTitle || "A Memory Book";
  const displayAuthor = authorName || displayContributor;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 flex items-center justify-center p-4">
      <Head>
        <title>{`${displayChapter} | ${displayBook}`}</title>
        <meta name="description" content={storyText.substring(0, 150)} />
        <meta
          property="og:title"
          content={`${displayChapter} - ${displayBook}`}
        />
        <meta property="og:description" content={storyText.substring(0, 150)} />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <meta name="theme-color" content="#7c3aed" />
      </Head>

      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden animate-slideIn">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 md:p-8 text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {displayChapter}
          </h1>
          <p className="text-purple-100 text-sm md:text-base">
            From "{displayBook}" by {displayAuthor}
          </p>
        </div>

        <div className="p-6 md:p-8">
          <div className="flex items-center gap-4 pb-6 border-b border-gray-200 mb-6">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xl font-semibold flex-shrink-0 shadow-lg">
              {displayAvatar ? (
                <img
                  src={displayAvatar}
                  alt={displayContributor}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                displayContributor.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {displayContributor}'s Story
              </h3>
              <p className="text-sm text-gray-500">Shared with love ❤️</p>
            </div>
          </div>

          {displayPrompt && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-6">
              <p className="text-blue-900 italic text-sm md:text-base">
                💭 {displayPrompt}
              </p>
            </div>
          )}

          <div className="bg-gray-900 rounded-xl overflow-hidden shadow-lg mb-6">
            {mediaItem.media_type === "audio" ? (
              <audio
                ref={audioRef}
                className="w-full"
                src={mediaUrl}
                controls
                preload="metadata"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                style={{
                  width: "100%",
                  height: "54px",
                  backgroundColor: "#1f2937",
                }}
              >
                Your browser does not support audio playback.
              </audio>
            ) : (
              <video
                ref={videoRef}
                controls
                playsInline
                preload="metadata"
                className="w-full max-h-96 bg-black"
                src={mediaUrl}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              >
                Your browser does not support video playback.
              </video>
            )}
          </div>

          {storyText && (
            <div className="bg-gray-50 p-6 rounded-xl mb-6 shadow-inner">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                {storyText}
              </p>
            </div>
          )}

          <div className="text-center mt-6">
            <span className="inline-block bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-5 py-2 rounded-full text-sm font-semibold shadow-sm">
              ✨ Captured with AwaChapter
            </span>
          </div>
        </div>

        <div className="border-t border-gray-200 p-6 text-center bg-gradient-to-b from-gray-50 to-white">
          <p className="text-gray-600 text-sm mb-3">
            Create your own family memory book
          </p>
          <a
            href="https://awachapter.com"
            className="inline-block bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
            target="_blank"
            rel="noopener noreferrer"
          >
            Start Your Book
          </a>
        </div>
      </div>

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
        .animate-slideIn {
          animation: slideIn 0.5s ease-out;
        }
        audio::-webkit-media-controls-panel {
          background-color: #1f2937;
        }
        * {
          -webkit-tap-highlight-color: transparent;
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
  const debugInfo: any = {
    token,
    timestamp: new Date().toISOString(),
  };

  if (!token) {
    return {
      props: {
        mediaItem: null,
        mediaUrl: null,
        error: "Invalid link",
        debugInfo: { ...debugInfo, error: "No token" },
      },
    };
  }

  try {
    console.log("🔍 Looking up token:", token);

    // Step 1: Fetch base media item
    const { data: mediaItem, error: mediaError } = await supabase
      .from("media_items")
      .select(
        "id, media_path, media_type, enhanced_text, caption, prompt_id, chapter_id, user_id"
      )
      .eq("playback_token", token)
      .single();

    if (mediaError || !mediaItem) {
      console.error("❌ Media not found:", mediaError);
      return {
        props: {
          mediaItem: null,
          mediaUrl: null,
          error: "Story not found",
          debugInfo: { ...debugInfo, mediaError },
        },
      };
    }

    console.log("✅ Found media item:", mediaItem.id);

    // Step 2: Fetch related data separately
    let promptText = "";
    let contributorName = "A Storyteller";
    let contributorAvatar = null;
    let chapterTitle = "A Chapter";
    let bookTitle = "A Memory Book";
    let authorName = contributorName;

    // Get prompt
    if (mediaItem.prompt_id) {
      const { data: prompt } = await supabase
        .from("prompts")
        .select("prompt_text")
        .eq("id", mediaItem.prompt_id)
        .single();
      if (prompt) promptText = prompt.prompt_text;
    }

    // Get contributor
    if (mediaItem.user_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", mediaItem.user_id)
        .single();
      if (profile) {
        contributorName = profile.full_name || contributorName;
        contributorAvatar = profile.avatar_url;
      }
    }

    // Get chapter and book
    if (mediaItem.chapter_id) {
      const { data: chapter } = await supabase
        .from("chapters")
        .select("title, book_id")
        .eq("id", mediaItem.chapter_id)
        .single();

      if (chapter) {
        chapterTitle = chapter.title;

        // Get book
        const { data: book } = await supabase
          .from("books")
          .select("title, user_id")
          .eq("id", chapter.book_id)
          .single();

        if (book) {
          bookTitle = book.title;

          // Get author
          const { data: author } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", book.user_id)
            .single();

          if (author) authorName = author.full_name || authorName;
        }
      }
    }

    // Track scan
    const userAgent = req.headers["user-agent"] || "";
    const deviceType = /mobile|android|iphone|ipad/i.test(userAgent)
      ? "mobile"
      : "desktop";
    const ipAddress =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] || null;

    await supabase.from("qr_scans").insert({
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
      const { data: signedUrlData, error: urlError } = await supabase.storage
        .from("book-media")
        .createSignedUrl(mediaItem.media_path, 3600);

      if (urlError || !signedUrlData) {
        return {
          props: {
            mediaItem: null,
            mediaUrl: null,
            error: "Media unavailable",
            debugInfo: { ...debugInfo, urlError },
          },
        };
      }
      mediaUrl = signedUrlData.signedUrl;
    }

    console.log("🎉 Playback ready!");

    return {
      props: {
        mediaItem,
        mediaUrl,
        promptText,
        contributorName,
        contributorAvatar,
        chapterTitle,
        bookTitle,
        authorName,
      },
    };
  } catch (error: any) {
    console.error("💥 Error:", error);
    return {
      props: {
        mediaItem: null,
        mediaUrl: null,
        error: "Something went wrong",
        debugInfo: { ...debugInfo, error: error.message },
      },
    };
  }
};
