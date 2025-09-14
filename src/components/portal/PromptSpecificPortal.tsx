// components/portal/PromptSpecificPortal.tsx
import React, { useState } from "react";
import { InvitationDetails } from "../../types/portal";

interface PromptSpecificPortalProps {
  invitation: InvitationDetails;
  onStartRecording: (name: string) => void;
}

const PromptSpecificPortal: React.FC<PromptSpecificPortalProps> = ({
  invitation,
  onStartRecording,
}) => {
  const [guestName, setGuestName] = useState(invitation.invitee_name || "");

  const handleGetStarted = () => {
    if (guestName.trim()) {
      onStartRecording(guestName.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full">
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
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Hi{invitation.invitee_name ? ` ${invitation.invitee_name}` : ""}! 👋
          </h1>
          <p className="text-gray-600">
            <span className="font-semibold">{invitation.inviter_name}</span> has
            a special question for you about
          </p>
          <p className="text-xl font-semibold text-purple-700 mt-1">
            "{invitation.book_title}"
          </p>
        </div>

        {/* Chapter Context */}
        {invitation.chapter_title && (
          <div className="bg-indigo-50 rounded-xl p-4 mb-6">
            <p className="text-sm font-medium text-indigo-800 mb-1">
              📖 Chapter: {invitation.chapter_title}
            </p>
          </div>
        )}

        {/* The Prompt */}
        <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-2xl p-6 mb-8">
          <div className="flex items-center space-x-2 mb-3">
            <svg
              className="w-5 h-5 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm font-semibold text-purple-800">
              Your Question
            </span>
          </div>
          <p className="text-lg text-gray-900 leading-relaxed">
            {invitation.prompt_text}
          </p>
        </div>

        {/* Custom Message */}
        {invitation.custom_message && (
          <div className="bg-yellow-50 rounded-xl p-4 mb-6 border border-yellow-200">
            <div className="flex items-start space-x-2">
              <svg
                className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Personal note from {invitation.inviter_name}:
                </p>
                <p className="text-sm text-yellow-700 mt-1 italic">
                  "{invitation.custom_message}"
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recording Tips */}
        <div className="bg-gray-50 rounded-xl p-4 mb-8">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            💡 Quick tips for a great story:
          </h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Find a quiet spot</li>
            <li>• Speak naturally, like you're talking to a friend</li>
            <li>• Take your time - there's no rush!</li>
            <li>• You can re-record if needed</li>
          </ul>
        </div>

        {/* Name Input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Confirm your name for the story
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

        {/* Action Button */}
        <button
          onClick={handleGetStarted}
          disabled={!guestName.trim()}
          className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
            guestName.trim()
              ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transform hover:scale-[1.02] active:scale-[0.98]"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          🎤 Ready to Share Your Story
        </button>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            This should take about 2-3 minutes • No account required
          </p>
        </div>
      </div>
    </div>
  );
};
export default PromptSpecificPortal;
