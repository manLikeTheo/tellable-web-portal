// components/portal/OnboardingPortal.tsx
import React, { useState } from "react";
import { InvitationDetails } from "../../types/portal";

interface OnboardingPortalProps {
  invitation: InvitationDetails;
  onStartRecording: (name: string) => void;
}

const OnboardingPortal: React.FC<OnboardingPortalProps> = ({
  invitation,
  onStartRecording,
}) => {
  const [guestName, setGuestName] = useState(invitation.invitee_name || "");
  const [isReady, setIsReady] = useState(false);

  const handleGetStarted = () => {
    if (guestName.trim()) {
      onStartRecording(guestName.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to AwaChapter! 👋
          </h1>
          <p className="text-gray-600">
            <span className="font-semibold">{invitation.inviter_name}</span>{" "}
            invited you to contribute to
          </p>
          <p className="text-xl font-semibold text-purple-700 mt-1">
            "{invitation.book_title}"
          </p>
        </div>

        {/* Custom Message */}
        {invitation.custom_message && (
          <div className="bg-purple-50 rounded-xl p-4 mb-6">
            <p className="text-gray-800 italic">
              "{invitation.custom_message}"
            </p>
          </div>
        )}

        {/* How it works */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            How it works:
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-bold text-sm">1</span>
              </div>
              <p className="text-gray-700">Share your name and get ready</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-bold text-sm">2</span>
              </div>
              <p className="text-gray-700">
                Record your voice story (2-3 minutes)
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-bold text-sm">3</span>
              </div>
              <p className="text-gray-700">
                Your story becomes part of the family book!
              </p>
            </div>
          </div>
        </div>

        {/* Name Input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            What should we call you?
          </label>
          <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Enter your name..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
            maxLength={50}
          />
        </div>

        {/* Privacy Notice */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex items-start space-x-2">
            <svg
              className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Your privacy matters
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Your recording is securely stored and only shared with the book
                owner.
              </p>
            </div>
          </div>
        </div>

        {/* Get Started Button */}
        <button
          onClick={handleGetStarted}
          disabled={!guestName.trim()}
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
            guestName.trim()
              ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transform hover:scale-[1.02] active:scale-[0.98]"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          🎤 Start Recording Your Story
        </button>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            Powered by AwaChapter • No app required
          </p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPortal;
