// components/portal/SuccessCelebration.tsx
import React, { useEffect, useState } from "react";
import { InvitationDetails } from "../../types/portal";

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
    // Trigger animations
    const timer = setTimeout(() => setIsVisible(true), 100);

    // Generate confetti
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4 relative overflow-hidden">
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
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-200/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-2xl">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8 animate-fade-in">
          <div className="w-3 h-3 rounded-full bg-green-600"></div>
          <div className="w-3 h-3 rounded-full bg-green-600"></div>
          <div className="w-3 h-3 rounded-full bg-green-600"></div>
          <div className="w-3 h-3 rounded-full bg-green-600"></div>
          <div className="w-3 h-3 rounded-full bg-green-600"></div>
        </div>

        {/* Success Card */}
        <div
          className={`bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center transition-all duration-1000 ${
            isVisible
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-10 scale-95"
          }`}
        >
          {/* Animated Checkmark */}
          <div className="relative mb-8">
            <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-scale-in">
              <svg
                className="w-16 h-16 text-white animate-draw-check"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            {/* Pulsing Rings */}
            <div className="absolute inset-0 w-32 h-32 mx-auto rounded-full border-4 border-green-400 animate-ping opacity-30"></div>
            <div
              className="absolute inset-0 w-32 h-32 mx-auto rounded-full border-4 border-green-300 animate-ping opacity-20"
              style={{ animationDelay: "0.5s" }}
            ></div>
          </div>

          {/* Success Message */}
          <h1
            className="text-4xl md:text-5xl font-black text-gray-900 mb-4 animate-fade-in-up"
            style={{ animationDelay: "300ms" }}
          >
            Story Shared! 🎉
          </h1>

          <p
            className="text-xl text-gray-600 mb-8 animate-fade-in-up"
            style={{ animationDelay: "400ms" }}
          >
            Thank you for contributing to{" "}
            <span className="font-bold text-green-700">
              "{invitation.book_title}"
            </span>
            !
          </p>

          {/* What's Next Card */}
          <div
            className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8 mb-8 text-left border-2 border-purple-200 animate-fade-in-up"
            style={{ animationDelay: "500ms" }}
          >
            <h3 className="text-2xl font-black text-gray-900 mb-6 text-center">
              What happens next?
            </h3>

            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="text-white font-black text-xl">1</span>
                </div>
                <div className="flex-1 pt-2">
                  <p className="text-gray-800 leading-relaxed">
                    <span className="font-bold text-purple-700">
                      {invitation.inviter_name}
                    </span>{" "}
                    will review your story
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="text-white font-black text-xl">2</span>
                </div>
                <div className="flex-1 pt-2">
                  <p className="text-gray-800 leading-relaxed">
                    Once approved, your voice becomes a{" "}
                    <span className="font-bold text-purple-700">
                      permanent part
                    </span>{" "}
                    of the family book
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="text-white font-black text-xl">3</span>
                </div>
                <div className="flex-1 pt-2">
                  <p className="text-gray-800 leading-relaxed">
                    You might receive{" "}
                    <span className="font-bold text-purple-700">
                      more invitations
                    </span>{" "}
                    to share other stories!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Submission Details */}
          <div
            className="bg-gray-50 rounded-xl p-5 mb-8 animate-fade-in-up"
            style={{ animationDelay: "600ms" }}
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="text-gray-500 text-xs uppercase font-bold mb-1">
                  Submission ID
                </p>
                <p className="text-gray-800 font-mono text-sm">
                  {submissionId.slice(0, 8)}...
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-xs uppercase font-bold mb-1">
                  Submitted
                </p>
                <p className="text-gray-800 text-sm">
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Viral CTA */}
          <div
            className="border-t-2 border-gray-100 pt-8 animate-fade-in-up"
            style={{ animationDelay: "700ms" }}
          >
            <p className="text-gray-700 text-lg mb-2">
              Want to create your own family story book?
            </p>
            <p className="text-gray-500 text-sm mb-6">
              Preserve memories that matter with AwaChapter
            </p>

            <a
              href="https://awachapter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95"
            >
              <span>Start Your Book</span>
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </a>
          </div>

          {/* Footer */}
          <div
            className="mt-8 pt-6 border-t border-gray-100 animate-fade-in-up"
            style={{ animationDelay: "800ms" }}
          >
            <p className="text-gray-400 text-xs">
              ✨ This page will remain open for your reference
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

// import React from "react";
// import { InvitationDetails } from "../../types/portal";

// interface SuccessPageProps {
//   invitation: InvitationDetails;
//   submissionId: string;
// }

// const SuccessPage: React.FC<SuccessPageProps> = ({
//   invitation,
//   submissionId,
// }) => {
//   return (
//     <div className="min-h-screen flex items-center justify-center p-4">
//       <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full text-center">
//         {/* Success Animation */}
//         <div className="relative mb-8">
//           <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
//             <svg
//               className="w-12 h-12 text-green-600"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M5 13l4 4L19 7"
//               />
//             </svg>
//           </div>
//           <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-green-200 rounded-full animate-ping opacity-20"></div>
//         </div>

//         {/* Success Message */}
//         <h1 className="text-3xl font-bold text-gray-900 mb-4">
//           Story Shared! 🎉
//         </h1>

//         <p className="text-gray-600 mb-6">
//           Thank you for contributing to{" "}
//           <span className="font-semibold">"{invitation.book_title}"</span>!
//         </p>

//         {/* What Happens Next */}
//         <div className="bg-purple-50 rounded-xl p-6 mb-8 text-left">
//           <h3 className="text-lg font-semibold text-purple-900 mb-3">
//             What happens next?
//           </h3>
//           <div className="space-y-3">
//             <div className="flex items-start space-x-3">
//               <div className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
//                 <span className="text-purple-700 font-bold text-xs">1</span>
//               </div>
//               <p className="text-purple-800">
//                 <strong>{invitation.inviter_name}</strong> will review your
//                 story
//               </p>
//             </div>
//             <div className="flex items-start space-x-3">
//               <div className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
//                 <span className="text-purple-700 font-bold text-xs">2</span>
//               </div>
//               <p className="text-purple-800">
//                 Once approved, your voice becomes part of the family book
//               </p>
//             </div>
//             <div className="flex items-start space-x-3">
//               <div className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
//                 <span className="text-purple-700 font-bold text-xs">3</span>
//               </div>
//               <p className="text-purple-800">
//                 You might receive more invitations to share other stories!
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Submission Details */}
//         <div className="bg-gray-50 rounded-xl p-4 mb-6">
//           <p className="text-sm text-gray-600">
//             Submission ID:{" "}
//             <span className="font-mono text-gray-800">
//               {submissionId.slice(0, 8)}...
//             </span>
//           </p>
//           <p className="text-xs text-gray-500 mt-1">
//             Submitted {new Date().toLocaleString()}
//           </p>
//         </div>

//         {/* Call to Action */}
//         <div className="border-t border-gray-100 pt-6">
//           <p className="text-sm text-gray-600 mb-4">
//             Want to create your own family story book?
//           </p>
//           <a
//             href="https://voicevault.app"
//             target="_blank"
//             rel="noopener noreferrer"
//             className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-full font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
//           >
//             <span>Get VoiceVault</span>
//             <svg
//               className="w-4 h-4"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
//               />
//             </svg>
//           </a>
//         </div>

//         {/* Footer */}
//         <div className="mt-6 pt-4 border-t border-gray-100">
//           <p className="text-xs text-gray-400">
//             This page will remain open for your reference
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SuccessPage;
