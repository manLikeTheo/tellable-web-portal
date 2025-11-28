// components/portal/WelcomeSplash.tsx
import React, { useEffect, useState } from "react";
import { InvitationDetails } from "../../types/portal";

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
    // Trigger fade-in animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      {/* Main Content */}
      <div
        className={`relative z-10 text-center max-w-md w-full transition-all duration-1000 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        {/* Animated Gift Icon */}
        <div className="mb-8 relative">
          <div className="w-32 h-32 mx-auto bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center animate-scale-in shadow-2xl border-4 border-white/30">
            <div className="text-6xl animate-bounce-gentle">🎁</div>
          </div>
          {/* Pulsing Ring */}
          <div className="absolute inset-0 w-32 h-32 mx-auto rounded-full border-4 border-white/40 animate-ping"></div>
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 drop-shadow-lg animate-fade-in-up">
          You've Been Invited! ✨
        </h1>

        {/* Personal Message */}
        <div
          className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/30 shadow-xl animate-fade-in-up"
          style={{ animationDelay: "200ms" }}
        >
          <p className="text-white text-lg leading-relaxed">
            <span className="font-bold text-xl">{invitation.inviter_name}</span>{" "}
            wants to preserve a precious memory with you in their family story
            collection
          </p>
        </div>

        {/* Book Preview */}
        <div
          className="bg-white/10 backdrop-blur-md rounded-xl p-4 mb-8 border border-white/20 animate-fade-in-up"
          style={{ animationDelay: "400ms" }}
        >
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl">📚</span>
            <div className="text-left">
              <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">
                Contributing to
              </p>
              <p className="text-white text-lg font-bold">
                "{invitation.book_title}"
              </p>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={onContinue}
          className="group relative w-full bg-white text-purple-700 py-5 px-8 rounded-2xl font-black text-xl shadow-2xl hover:shadow-white/30 transition-all transform hover:scale-[1.03] active:scale-[0.98] overflow-hidden animate-fade-in-up"
          style={{ animationDelay: "600ms" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-indigo-100 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative flex items-center justify-center gap-3">
            <span>Continue</span>
            <span className="text-2xl group-hover:translate-x-1 transition-transform">
              →
            </span>
          </div>
        </button>

        {/* Footer Note */}
        <p
          className="text-white/60 text-sm mt-6 animate-fade-in"
          style={{ animationDelay: "800ms" }}
        >
          Takes about 2-3 minutes • No account required
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
