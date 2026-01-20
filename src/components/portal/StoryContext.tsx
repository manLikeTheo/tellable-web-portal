// components/portal/StoryContext.tsx
import React, { useState, useEffect } from "react";
import { InvitationDetails } from "../../types/portal";
import {
  BookOpen,
  BookMarked,
  MessageCircle,
  Lightbulb,
  ArrowRight,
  Mic,
  CheckCircle,
  Sparkles,
  ChevronDown,
} from "lucide-react";

interface StoryContextProps {
  invitation: InvitationDetails;
  onNext: () => void;
  onBack: () => void;
}

const StoryContext: React.FC<StoryContextProps> = ({
  invitation,
  onNext,
  onBack,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showTips, setShowTips] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8 animate-fade-in">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/40"></div>
          <div className="w-3 h-3 rounded-full bg-gray-600"></div>
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
            <h1 className="text-3xl md:text-4xl font-black text-white mb-3">
              Your Story Request
            </h1>
            <p className="text-gray-300">
              Here's what{" "}
              <span className="font-semibold text-yellow-400">
                {invitation.inviter_name}
              </span>{" "}
              would like to know
            </p>
          </div>

          {/* Book Card with Cover Preview */}
          <div
            className="bg-gradient-to-br from-yellow-900/40 to-yellow-800/40 rounded-2xl p-6 mb-6 border-2 border-yellow-600/30 animate-fade-in-up"
            style={{ animationDelay: "300ms" }}
          >
            <div className="flex items-center gap-4 mb-3">
              {invitation.book_cover_path ? (
                <div className="w-14 h-14 rounded-xl overflow-hidden shadow-md border-2 border-yellow-500/50">
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${invitation.book_cover_path}`}
                    alt={invitation.book_title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-14 h-14 bg-gray-700 rounded-xl flex items-center justify-center shadow-md">
                  <BookOpen
                    className="w-10 h-10 text-yellow-500"
                    strokeWidth={2}
                  />
                </div>
              )}
              <div>
                <p className="text-yellow-500 text-xs font-bold uppercase tracking-wider">
                  Memory Book
                </p>
                <p className="text-white text-xl font-bold">
                  {invitation.book_title}
                </p>
              </div>
            </div>
          </div>

          {/* Chapter Card */}
          {invitation.chapter_title && (
            <div
              className="bg-gray-700/50 rounded-xl p-4 mb-6 border border-yellow-600/20 animate-fade-in-up"
              style={{ animationDelay: "400ms" }}
            >
              <div className="flex items-center gap-3">
                <BookMarked
                  className="w-7 h-7 text-yellow-400"
                  strokeWidth={2}
                />
                <div>
                  <p className="text-yellow-500/80 text-xs font-semibold uppercase">
                    Chapter
                  </p>
                  <p className="text-white font-bold">
                    {invitation.chapter_title}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Prompt Card */}
          <div
            className="relative mb-8 animate-fade-in-up"
            style={{ animationDelay: "500ms" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-2xl blur-xl opacity-20"></div>
            <div className="relative bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-2xl p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <MessageCircle
                    className="w-6 h-6 text-white"
                    strokeWidth={2.5}
                  />
                </div>
                <span className="text-white/90 text-sm font-bold uppercase tracking-wider">
                  Your Question
                </span>
              </div>
              <p className="text-white text-xl md:text-2xl leading-relaxed font-medium">
                {invitation.prompt_content}
              </p>
            </div>
          </div>

          {/* Custom Message */}
          {invitation.custom_message && (
            <div
              className="bg-yellow-900/30 border-2 border-yellow-600/40 rounded-xl p-5 mb-8 animate-fade-in-up"
              style={{ animationDelay: "600ms" }}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-yellow-600/40 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">💌</span>
                </div>
                <div className="flex-1">
                  <p className="text-yellow-400 font-bold text-sm mb-1">
                    Personal note from {invitation.inviter_name}:
                  </p>
                  <p className="text-gray-200 italic leading-relaxed">
                    "{invitation.custom_message}"
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 3-Step Instruction Graphic */}
          <div
            className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-2xl p-6 mb-8 border border-yellow-500/20 animate-fade-in-up"
            style={{ animationDelay: "700ms" }}
          >
            <h3 className="text-center text-white font-bold text-lg mb-6">
              How it works
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {/* Step 1 */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-yellow-600 rounded-full flex items-center justify-center mb-3 shadow-lg">
                  <Mic className="w-8 h-8 text-white" strokeWidth={2.5} />
                </div>
                <div className="w-8 h-1 bg-yellow-600/40 mx-auto mb-2"></div>
                <p className="text-yellow-400 font-bold text-sm">Tap</p>
                <p className="text-gray-400 text-xs mt-1">Start recording</p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-yellow-500 rounded-full flex items-center justify-center mb-3 shadow-lg">
                  <MessageCircle
                    className="w-8 h-8 text-white"
                    strokeWidth={2.5}
                  />
                </div>
                <div className="w-8 h-1 bg-yellow-500/40 mx-auto mb-2"></div>
                <p className="text-yellow-400 font-bold text-sm">Speak</p>
                <p className="text-gray-400 text-xs mt-1">Share your story</p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-green-600 rounded-full flex items-center justify-center mb-3 shadow-lg">
                  <CheckCircle
                    className="w-8 h-8 text-white"
                    strokeWidth={2.5}
                  />
                </div>
                <div className="w-8 h-1 bg-green-600/40 mx-auto mb-2"></div>
                <p className="text-green-400 font-bold text-sm">Done</p>
                <p className="text-gray-400 text-xs mt-1">That's it!</p>
              </div>
            </div>
          </div>

          {/* Professional Keepsake Message */}
          <div
            className="bg-gradient-to-r from-yellow-600/80 to-yellow-700/80 rounded-xl p-5 mb-8 animate-fade-in-up"
            style={{ animationDelay: "800ms" }}
          >
            <div className="flex items-start gap-3">
              <Sparkles
                className="w-6 h-6 text-yellow-300 flex-shrink-0"
                strokeWidth={2}
              />
              <div>
                <p className="text-white font-bold text-sm mb-1">
                  Your Story Becomes a Keepsake
                </p>
                <p className="text-gray-100 text-sm leading-relaxed">
                  Your recording will be enhanced with AI and become part of a
                  professional memory book that families treasure forever.
                </p>
              </div>
            </div>
          </div>

          {/* Tips Box - Expandable */}
          <div
            className="bg-gray-700/50 rounded-xl overflow-hidden animate-fade-in-up"
            style={{ animationDelay: "900ms" }}
          >
            <button
              onClick={() => setShowTips(!showTips)}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-700/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Lightbulb
                  className="w-7 h-7 text-yellow-400"
                  strokeWidth={2}
                />
                <span className="text-white font-bold text-sm">
                  What makes a great story?
                </span>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-gray-400 transition-transform ${
                  showTips ? "rotate-180" : ""
                }`}
                strokeWidth={2}
              />
            </button>
            {showTips && (
              <div className="px-5 pb-4 pt-2 bg-gray-700/30 animate-expand-down">
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Speak from the heart, be yourself</li>
                  <li>• Share specific memories and details</li>
                  <li>• Don't worry about being "perfect"</li>
                  <li>• Your unique perspective is valuable</li>
                </ul>
              </div>
            )}
          </div>

          {/* Next Button */}
          <button
            onClick={onNext}
            className="w-full bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 text-gray-900 py-5 rounded-2xl font-black text-xl shadow-xl hover:shadow-yellow-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] animate-fade-in-up"
            style={{ animationDelay: "1000ms" }}
          >
            <div className="flex items-center justify-center gap-3">
              <span>Next: Get Ready</span>
              <ArrowRight className="w-6 h-6" strokeWidth={2.5} />
            </div>
          </button>
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
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
          animation-fill-mode: both;
        }
      `}</style>
    </div>
  );
};

export default StoryContext;
