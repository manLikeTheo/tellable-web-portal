// components/portal/WelcomeSplash.tsx
import React, { useEffect, useState } from "react";
import { InvitationDetails } from "../../types/portal";
import { BookOpen, ArrowRight, Shield } from "lucide-react";

interface WelcomeSplashProps {
  invitation: InvitationDetails;
  onContinue: () => void;
}

const WelcomeSplash: React.FC<WelcomeSplashProps> = ({
  invitation,
  onContinue,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-600/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      {/* Main Content */}
      <div
        className={`relative z-10 text-center max-w-md w-full transition-all duration-1000 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        {/* AwaChapter Logo - Top */}
        <div className="mb-4 animate-fade-in">
          <img
            src="/awachapter-logo.png"
            alt="AwaChapter"
            className="h-24 w-auto mx-auto"
          />
        </div>

        {/* Creator Avatar with Pulsing Animation */}
        <div className="mb-6 relative">
          {invitation.inviter_avatar ? (
            <div className="w-24 h-24 mx-auto rounded-full border-4 border-yellow-500/30 overflow-hidden bg-gray-800 shadow-2xl animate-scale-in">
              <img
                src={invitation.inviter_avatar}
                alt={invitation.inviter_name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-24 h-24 mx-auto rounded-full border-4 border-yellow-500/30 bg-gradient-to-br from-yellow-600 to-yellow-800 shadow-2xl animate-scale-in flex items-center justify-center">
              <span className="text-white text-3xl font-bold">
                {invitation.inviter_name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          {/* Pulsing Ring Animation */}
          <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full border-4 border-yellow-500/40 animate-ping"></div>

          {/* Verified Badge */}
          <div className="absolute bottom-0 right-1/2 translate-x-12 w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center shadow-lg border-2 border-yellow-500">
            <Shield
              className="w-4 h-4 text-yellow-500"
              fill="currentColor"
              strokeWidth={0}
            />
          </div>
        </div>

        {/* Animated Gift Icon */}
        {/* <div className="mb-6 relative">
          <div className="w-20 h-20 mx-auto bg-yellow-500/20 backdrop-blur-xl rounded-full flex items-center justify-center animate-scale-in shadow-2xl border-4 border-yellow-500/30">
            <Gift
              className="w-10 h-10 text-yellow-400 animate-bounce-gentle"
              strokeWidth={2.5}
            />
          </div>
          <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full border-4 border-yellow-500/40 animate-ping"></div>
        </div> */}

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 drop-shadow-lg animate-fade-in-up">
          You've Been Invited!
        </h1>

        {/* Personal Message */}
        <div
          className="bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-yellow-500/20 shadow-xl animate-fade-in-up"
          style={{ animationDelay: "200ms" }}
        >
          <p className="text-gray-100 text-lg leading-relaxed">
            <span className="font-bold text-xl text-yellow-400">
              {invitation.inviter_name}
            </span>{" "}
            wants to preserve a precious memory with you in their family story
            collection
          </p>
        </div>

        {/* Book Preview */}
        <div
          className="bg-gray-800/60 backdrop-blur-md rounded-xl p-4 mb-6 border border-yellow-500/20 animate-fade-in-up"
          style={{ animationDelay: "400ms" }}
        >
          <div className="flex items-center justify-center gap-3">
            {invitation.book_cover_path ? (
              <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-yellow-500/30">
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${invitation.book_cover_path}`}
                  alt={invitation.book_title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <BookOpen className="w-8 h-8 text-yellow-400" strokeWidth={2} />
            )}
            <div className="text-left">
              <p className="text-yellow-500/70 text-xs font-semibold uppercase tracking-wider">
                Contributing to
              </p>
              <p className="text-white text-lg font-bold">
                "{invitation.book_title}"
              </p>
            </div>
          </div>
        </div>

        {/* Trust Signals */}
        <div
          className="bg-gray-800/60 backdrop-blur-md rounded-xl p-4 mb-8 border border-yellow-500/20 animate-fade-in-up"
          style={{ animationDelay: "500ms" }}
        >
          <div className="flex items-center justify-center gap-6 text-gray-300 text-xs">
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4 text-yellow-500" strokeWidth={2} />
              <span>Private & Secure</span>
            </div>
            <div className="w-px h-4 bg-yellow-500/30"></div>
            <div className="flex items-center gap-1">
              <span>⏱️</span>
              <span>2-3 minutes</span>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={onContinue}
          className="group relative w-full bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 text-gray-900 py-5 px-8 rounded-2xl font-black text-xl shadow-2xl hover:shadow-yellow-500/30 transition-all transform hover:scale-[1.03] active:scale-[0.98] overflow-hidden animate-fade-in-up"
          style={{ animationDelay: "600ms" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative flex items-center justify-center gap-3">
            <span>Continue</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Footer Note */}
        <p
          className="text-gray-400 text-sm mt-6 animate-fade-in"
          style={{ animationDelay: "800ms" }}
        >
          No account required • Your voice matters
        </p>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }
        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(20px) translateX(-10px);
          }
        }
        @keyframes bounce-gentle {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        @keyframes scale-in {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
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
        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
        }
        .animate-scale-in {
          animation: scale-in 0.6s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
          animation-fill-mode: both;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
          animation-fill-mode: both;
        }
      `}</style>
    </div>
  );
};

export default WelcomeSplash;
