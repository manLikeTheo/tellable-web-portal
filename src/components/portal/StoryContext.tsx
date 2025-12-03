// components/portal/StoryContext.tsx
import React, { useState, useEffect } from "react";
import { InvitationDetails } from "../../types/portal";
import {
  BookOpen,
  BookMarked,
  MessageCircle,
  Lightbulb,
  ArrowRight,
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

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8 animate-fade-in">
          <div className="w-3 h-3 rounded-full bg-purple-600"></div>
          <div className="w-3 h-3 rounded-full bg-purple-300"></div>
          <div className="w-3 h-3 rounded-full bg-gray-300"></div>
          <div className="w-3 h-3 rounded-full bg-gray-300"></div>
          <div className="w-3 h-3 rounded-full bg-gray-300"></div>
        </div>

        {/* Main Card */}
        <div
          className={`bg-white rounded-3xl shadow-2xl p-8 md:p-10 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          {/* Back Button */}
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors group"
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
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
              Your Story Request
            </h1>
            <p className="text-gray-600">
              Here's what{" "}
              <span className="font-semibold text-purple-700">
                {invitation.inviter_name}
              </span>{" "}
              would like to know
            </p>
          </div>

          {/* Book Card */}
          <div
            className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl p-6 mb-6 border-2 border-purple-200 animate-fade-in-up"
            style={{ animationDelay: "300ms" }}
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-md">
                <span className="text-3xl">
                  <BookOpen
                    className="w-10 h-10 text-purple-600"
                    strokeWidth={2}
                  />
                </span>
              </div>
              <div>
                <p className="text-purple-700 text-xs font-bold uppercase tracking-wider">
                  Memory Book
                </p>
                <p className="text-gray-900 text-xl font-bold">
                  {invitation.book_title}
                </p>
              </div>
            </div>
          </div>

          {/* Chapter Card (if exists) */}
          {invitation.chapter_title && (
            <div
              className="bg-indigo-50 rounded-xl p-4 mb-6 border border-indigo-200 animate-fade-in-up"
              style={{ animationDelay: "400ms" }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  <BookMarked
                    className="w-7 h-7 text-indigo-600"
                    strokeWidth={2}
                  />
                </span>
                <div>
                  <p className="text-indigo-700 text-xs font-semibold uppercase">
                    Chapter
                  </p>
                  <p className="text-gray-900 font-bold">
                    {invitation.chapter_title}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Prompt Card - The Star */}
          <div
            className="relative mb-8 animate-fade-in-up"
            style={{ animationDelay: "500ms" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl blur-xl opacity-20"></div>
            <div className="relative bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <span className="text-xl">
                    <MessageCircle
                      className="w-6 h-6 text-white"
                      strokeWidth={2.5}
                    />
                  </span>
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

          {/* Custom Message (if exists) */}
          {invitation.custom_message && (
            <div
              className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-5 mb-8 animate-fade-in-up"
              style={{ animationDelay: "600ms" }}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-yellow-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">💌</span>
                </div>
                <div className="flex-1">
                  <p className="text-yellow-800 font-bold text-sm mb-1">
                    Personal note from {invitation.inviter_name}:
                  </p>
                  <p className="text-yellow-900 italic leading-relaxed">
                    "{invitation.custom_message}"
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div
            className="bg-gray-50 rounded-xl p-5 mb-8 animate-fade-in-up"
            style={{ animationDelay: "700ms" }}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">
                <Lightbulb className="w-7 h-7 text-gray-700" strokeWidth={2} />
              </span>
              <div>
                <p className="text-gray-900 font-bold text-sm mb-2">
                  What makes a great story?
                </p>
                <ul className="text-gray-700 text-sm space-y-1">
                  <li>• Speak from the heart, be yourself</li>
                  <li>• Share specific memories and details</li>
                  <li>• Don't worry about being "perfect"</li>
                  <li>• Your unique perspective is valuable</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Next Button */}
          <button
            onClick={onNext}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] animate-fade-in-up"
            style={{ animationDelay: "800ms" }}
          >
            <div className="flex items-center justify-center gap-3">
              <span>Next: Get Ready</span>
              <span className="text-2xl">
                <ArrowRight className="w-6 h-6" strokeWidth={2.5} />
              </span>
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
