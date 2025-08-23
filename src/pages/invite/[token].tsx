// Next.js page for handling invitations: /pages/invite/[token].tsx
// This is where guests land when they click WhatsApp links

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabase";

interface InvitationDetails {
  book_title: string;
  chapter_title: string | null;
  prompt_text: string | null;
  inviter_name: string;
  custom_message: string | null;
  is_expired: boolean;
  book_id: string;
  prompt_id: number | null;
  chapter_id: string | null;
}

export default function InvitationPage() {
  const router = useRouter();
  const { token } = router.query;

  const [invitationDetails, setInvitationDetails] =
    useState<InvitationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [story, setStory] = useState("");
  const [guestName, setGuestName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (token && typeof token === "string") {
      loadInvitationDetails(token);
    }
  }, [token]);

  //   const loadInvitationDetails = async (invitationToken: string) => {
  //     try {
  //       const { data, error } = await supabase.rpc("get_invitation_details_v0", {
  //         p_token: invitationToken,
  //       });

  //       if (error) throw error;

  //       if (data && data.length > 0) {
  //         const details = data[0];

  //         if (details.is_expired) {
  //           setError(
  //             "This invitation has expired. Please contact the book owner for a new invitation."
  //           );
  //         } else {
  //           setInvitationDetails(details);
  //         }
  //       } else {
  //         setError(
  //           "Invalid invitation link. Please check the link and try again."
  //         );
  //       }
  //     } catch (err: any) {
  //       console.error("Error loading invitation:", err);
  //       setError("Could not load invitation details. Please try again.");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  const loadInvitationDetails = async (invitationToken: string) => {
    try {
      console.log("Loading invitation for token:", invitationToken); // Debug log

      const { data, error } = await supabase.rpc("get_invitation_details_v0", {
        p_token: invitationToken,
      });

      console.log("Supabase response:", { data, error }); // Debug log

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      // IMPORTANT: Check if data exists AND is not empty array
      if (data && Array.isArray(data) && data.length > 0) {
        const details = data[0];
        console.log("Invitation details:", details); // Debug log

        // Check if the invitation is expired
        if (details.is_expired) {
          setError(
            "This invitation has expired. Please contact the book owner for a new invitation."
          );
        } else {
          // SUCCESS: Set the invitation details
          setInvitationDetails(details);
          console.log("Successfully loaded invitation details"); // Debug log
        }
      } else {
        // This is where your error is coming from
        console.log("No data returned or empty array:", data); // Debug log
        setError(
          "Invalid invitation link. Please check the link and try again."
        );
      }
    } catch (err: any) {
      console.error("Error loading invitation:", err);
      setError("Could not load invitation details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitStory = async () => {
    if (!story.trim() || !guestName.trim() || !token) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.rpc("submit_guest_story", {
        p_invitation_token: token as string,
        p_guest_name: guestName.trim(),
        p_story_title: null, // Could add title input if desired
        p_story_content: story.trim(),
        p_audio_url: null, // Audio recording integration would go here
      });

      if (error) throw error;

      if (data && data.length > 0 && data[0].success) {
        // Show success message
        alert(
          "Thank you! Your story has been submitted successfully. The book owner will review it soon."
        );

        // Optionally redirect or show different UI
        router.push("/thank-you");
      } else {
        throw new Error(data?.[0]?.message || "Failed to submit story");
      }
    } catch (err: any) {
      console.error("Error submitting story:", err);
      alert("Could not submit your story. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-6">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Oops!</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!invitationDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No invitation found.</p>
        </div>
      </div>
    );
  }

  const isGeneralInvite = !invitationDetails.prompt_text;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to VoiceVault! 👋
          </h1>
          <p className="text-lg text-gray-600">
            {invitationDetails.inviter_name} invited you to contribute to
          </p>
          <h2 className="text-2xl font-semibold text-blue-600 mt-1">
            "{invitationDetails.book_title}"
          </h2>
        </div>

        {/* Custom Message */}
        {invitationDetails.custom_message && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
            <p className="text-blue-800 italic">
              "{invitationDetails.custom_message}"
            </p>
            <p className="text-blue-600 text-sm mt-2">
              - {invitationDetails.inviter_name}
            </p>
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          {isGeneralInvite ? (
            // General Welcome Invitation
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">📖</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Share Your Story
              </h3>
              <p className="text-gray-600 mb-6">
                You've been invited to contribute to this family story book.
                Start by introducing yourself and sharing what this project
                means to you.
              </p>
            </div>
          ) : (
            // Prompt-Specific Invitation
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <div className="text-2xl mr-3">❓</div>
                <div>
                  <p className="text-sm text-gray-500">
                    Chapter: {invitationDetails.chapter_title}
                  </p>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Your Question
                  </h3>
                </div>
              </div>

              <div className="bg-gray-50 border-l-4 border-blue-500 p-4 mb-6">
                <p className="text-gray-800 font-medium">
                  {invitationDetails.prompt_text}
                </p>
              </div>

              <p className="text-gray-600 text-center">
                Take 2-3 minutes to share your thoughts. Your voice matters! ❤️
              </p>
            </div>
          )}

          {/* Input Form */}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="guestName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Your Name *
              </label>
              <input
                type="text"
                id="guestName"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label
                htmlFor="story"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Your Story *
              </label>
              <textarea
                id="story"
                value={story}
                onChange={(e) => setStory(e.target.value)}
                placeholder={
                  isGeneralInvite
                    ? "Tell us about yourself and what this family story project means to you..."
                    : "Share your thoughts and memories about this question..."
                }
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                {story.length}/2000 characters
              </p>
            </div>

            {/* Audio Recording Option (Future Enhancement) */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <div className="text-gray-400 text-3xl mb-2">🎤</div>
              <p className="text-sm text-gray-500 mb-2">Audio Recording</p>
              <p className="text-xs text-gray-400">
                Coming soon: Record your voice for an even more personal touch!
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8">
            <button
              onClick={handleSubmitStory}
              disabled={isSubmitting || !story.trim() || !guestName.trim()}
              className={`w-full py-3 px-6 rounded-md text-white font-medium transition-colors ${
                isSubmitting || !story.trim() || !guestName.trim()
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting Your Story...
                </span>
              ) : (
                "Submit My Story"
              )}
            </button>
          </div>

          {/* Footer Info */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              Your story will be reviewed by {invitationDetails.inviter_name}{" "}
              and added to the book.
            </p>
            <p className="mt-1">
              Powered by VoiceVault - Preserving Family Stories
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Thank you page: /pages/thank-you.tsx
export function ThankYouPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-6">
        <div className="text-green-500 text-6xl mb-6">✅</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h1>
        <p className="text-lg text-gray-600 mb-6">
          Your story has been submitted successfully. The book owner will review
          it and add it to the family story collection.
        </p>
        <p className="text-sm text-gray-500">
          You'll be notified when your story is approved and becomes part of the
          book.
        </p>

        {/* Optional: Link to view other stories or create their own book */}
        <div className="mt-8">
          <a
            href="https://voicevault.app"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            Create Your Own Family Story Book
          </a>
        </div>
      </div>
    </div>
  );
}
