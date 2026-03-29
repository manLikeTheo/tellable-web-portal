// components/contributor/TokenInvalid.tsx

import React from "react";

interface Props {
  reason: "not_found" | "expired" | "already_submitted";
}

const COPY: Record<Props["reason"], { heading: string; body: string }> = {
  not_found: {
    heading: "Link not found",
    body: "This invite link is invalid. Please check the link you received and try again, or ask the frame owner to share a new one.",
  },
  expired: {
    heading: "This link has expired",
    body: "Invite links are valid for 7 days. This one has expired. Ask the frame owner to send you a fresh link.",
  },
  already_submitted: {
    heading: "Voice already added",
    body: "Your message has already been recorded for this Living Frame. Each invite link can only be used once.",
  },
};

export default function TokenInvalid({ reason }: Props) {
  const { heading, body } = COPY[reason];

  return (
    <main className="min-h-screen bg-[#f5f2ec] flex items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        {/* Logo */}
        <div className="mb-10">
          <span className="text-2xl font-bold tracking-tight text-[#1a3e5c]">
            Awa<span className="text-[#C9A961]">Chapter</span>
          </span>
        </div>

        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-white border border-[#e8e3d8] flex items-center justify-center mx-auto mb-6">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#bdc3c7"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-[#2c3e50] mb-3 tracking-tight">
          {heading}
        </h1>
        <p className="text-[#7f8c8d] leading-relaxed text-base">{body}</p>

        <p className="mt-10 text-xs text-[#bdc3c7]">
          AwaChapter · Legacy preserved, voices remembered
        </p>
      </div>
    </main>
  );
}
