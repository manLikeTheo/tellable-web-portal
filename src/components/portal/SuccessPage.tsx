// components/portal/SuccessCelebration.tsx
import React, { useEffect, useState } from "react";
import { InvitationDetails } from "../../types/portal";
import { CheckCircle, ArrowRight, Sparkles } from "lucide-react";

interface SuccessPageProps {
  invitation: InvitationDetails;
  submissionId: string;
}

const SuccessPage: React.FC<SuccessPageProps> = ({
  invitation,
  submissionId,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState<
    Array<{ id: number; left: number; delay: number; duration: number }>
  >([]);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);

    const pieces = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
    }));
    setConfettiPieces(pieces);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Confetti Animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {confettiPieces.map((piece) => (
          <div
            key={piece.id}
            className="absolute top-0 w-3 h-3 animate-confetti-fall"
            style={{
              left: `${piece.left}%`,
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
              backgroundColor: [
                "#f59e0b",
                "#ef4444",
                "#8b5cf6",
                "#06b6d4",
                "#10b981",
              ][Math.floor(Math.random() * 5)],
              borderRadius: Math.random() > 0.5 ? "50%" : "0",
            }}
          ></div>
        ))}
      </div>

      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-600/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-2xl">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8 animate-fade-in">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
        </div>

        {/* Success Card */}
        <div
          className={`bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 text-center border border-yellow-500/20 transition-all duration-1000 ${
            isVisible
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-10 scale-95"
          }`}
        >
          {/* Animated Logo */}
          <div className="relative mb-8">
            <div className="w-32 h-32 bg-gradient-to-br from-transparent via-[#f59e0b]-500 to-[#ef4444]-600 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-scale-in">
              <img
                src="/awachapter-logo.png"
                alt="AwaChapter"
                className="h-36 w-auto mx-auto"
              />
            </div>
            <div className="absolute inset-0 w-32 h-32 mx-auto rounded-full border-4 border-[#f59e0b]-500 animate-ping opacity-40"></div>
            <div className="absolute inset-0 w-32 h-32 mx-auto rounded-full border-4 border-yellow-500 animate-ping opacity-30"></div>
            <div
              className="absolute inset-0 w-32 h-32 mx-auto rounded-full border-4 border-yellow-600 animate-ping opacity-20"
              style={{ animationDelay: "0.5s" }}
            ></div>
          </div>

          {/* Success Message */}
          <div className="mb-3 animate-fade-in-up text-center md:text-left flex flex-col items-center">
            <h1
              className="text-4xl md:text-5xl font-black text-white mb-4 animate-fade-in-up"
              style={{ animationDelay: "400ms" }}
            >
              Story Shared!
            </h1>
            <CheckCircle
              className="w-16 h-16 text-emerald-400 animate-draw-check"
              strokeWidth={3}
            />
          </div>
          <p
            className="text-xl text-gray-300 mb-8 animate-fade-in-up"
            style={{ animationDelay: "500ms" }}
          >
            Thank you for contributing to{" "}
            <span className="font-bold text-yellow-400">
              "{invitation.book_title}"
            </span>
            !
          </p>

          {/* What's Next Card */}
          <div
            className="bg-gray-700/50 rounded-2xl p-6 mb-8 border-2 border-yellow-500/20 animate-fade-in-up"
            style={{ animationDelay: "500ms" }}
          >
            <h3 className="text-xl font-black text-white mb-4 text-center flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" strokeWidth={2} />
              What happens next?
            </h3>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-200 text-sm">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-black text-xs">1</span>
                </div>
                <p>
                  <span className="font-bold text-yellow-400">
                    {invitation.inviter_name}
                  </span>{" "}
                  reviews your story
                </p>
              </div>

              <div className="flex items-center gap-3 text-gray-200 text-sm">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-black text-xs">2</span>
                </div>
                <p>
                  You're{" "}
                  <span className="font-bold text-yellow-400">officially</span>{" "}
                  in the book! 🎊
                </p>
              </div>

              <div className="flex items-center gap-3 text-gray-200 text-sm">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-black text-xs">3</span>
                </div>
                <p>
                  <span className="font-bold text-yellow-400">
                    More stories
                  </span>{" "}
                  might be coming your way 📲
                </p>
              </div>
            </div>
          </div>

          {/* Submission Details */}
          <div
            className="bg-gray-700/50 rounded-xl p-5 mb-8 animate-fade-in-up"
            style={{ animationDelay: "600ms" }}
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="text-gray-400 text-xs uppercase font-bold mb-1">
                  Submission ID
                </p>
                <p className="text-gray-200 font-mono text-sm">
                  {submissionId.slice(0, 8)}...
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-xs uppercase font-bold mb-1">
                  Submitted
                </p>
                <p className="text-gray-200 text-sm">
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Viral CTA */}
          <div
            className="border-t-2 border-gray-700 pt-8 animate-fade-in-up"
            style={{ animationDelay: "700ms" }}
          >
            <p className="text-gray-200 text-lg mb-2 tracking-wide">
              Want to create your own keepsake book?
            </p>
            <p className="text-gray-300 text-sm mb-6 tracking-wide italic">
              Preserve memories that matter with AwaChapter
            </p>

            <a
              href="https://awachapter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 bg-gradient-to-r from-yellow-600 to-yellow-500 text-gray-900 px-8 py-4 rounded-2xl font-black text-lg shadow-xl hover:shadow-yellow-500/30 transition-all transform hover:scale-105 active:scale-95"
            >
              <span>Start Your Book</span>
              <ArrowRight
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                strokeWidth={2.5}
              />
            </a>
          </div>

          {/* Footer */}
          <div
            className="mt-8 pt-6 border-t border-gray-600 animate-fade-in-up"
            style={{ animationDelay: "800ms" }}
          >
            <p className="text-gray-400 text-xs">
              <div className="flex items-center justify-center gap-2">
                {/* <Sparkles className="w-4 h-4 text-gray-300" strokeWidth={2} /> */}
                <img
                  src="/awachapter-logo.png"
                  alt="AwaChapter"
                  className="h-8 w-auto mx-auto"
                />
                <span>This page will remain open for your reference</span>
              </div>
            </p>
          </div>
        </div>
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
        @keyframes confetti-fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        @keyframes scale-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes draw-check {
          0% {
            stroke-dasharray: 0 100;
          }
          100% {
            stroke-dasharray: 100 0;
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
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        .animate-confetti-fall {
          animation: confetti-fall linear forwards;
        }
        .animate-scale-in {
          animation: scale-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .animate-draw-check {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: draw-check 0.6s ease-out 0.4s forwards;
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

export default SuccessPage;
