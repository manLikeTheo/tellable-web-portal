import React from "react";
import { InvitationDetails } from "../../types/portal";

interface SuccessPageProps {
  invitation: InvitationDetails;
  submissionId: string;
}

const SuccessPage: React.FC<SuccessPageProps> = ({
  invitation,
  submissionId,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full text-center">
        {/* Success Animation */}
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <svg
              className="w-12 h-12 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-green-200 rounded-full animate-ping opacity-20"></div>
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Story Shared! 🎉
        </h1>

        <p className="text-gray-600 mb-6">
          Thank you for contributing to{" "}
          <span className="font-semibold">"{invitation.book_title}"</span>!
        </p>

        {/* What Happens Next */}
        <div className="bg-purple-50 rounded-xl p-6 mb-8 text-left">
          <h3 className="text-lg font-semibold text-purple-900 mb-3">
            What happens next?
          </h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-700 font-bold text-xs">1</span>
              </div>
              <p className="text-purple-800">
                <strong>{invitation.inviter_name}</strong> will review your
                story
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-700 font-bold text-xs">2</span>
              </div>
              <p className="text-purple-800">
                Once approved, your voice becomes part of the family book
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-700 font-bold text-xs">3</span>
              </div>
              <p className="text-purple-800">
                You might receive more invitations to share other stories!
              </p>
            </div>
          </div>
        </div>

        {/* Submission Details */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-600">
            Submission ID:{" "}
            <span className="font-mono text-gray-800">
              {submissionId.slice(0, 8)}...
            </span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Submitted {new Date().toLocaleString()}
          </p>
        </div>

        {/* Call to Action */}
        <div className="border-t border-gray-100 pt-6">
          <p className="text-sm text-gray-600 mb-4">
            Want to create your own family story book?
          </p>
          <a
            href="https://voicevault.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-full font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
          >
            <span>Get VoiceVault</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            This page will remain open for your reference
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
