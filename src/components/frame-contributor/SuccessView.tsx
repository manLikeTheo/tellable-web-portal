// components/contributor/SuccessView.tsx

import React from "react";

interface Props {
  contributorName: string;
}

export default function SuccessView({ contributorName }: Props) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
      {/* Checkmark */}
      <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-6">
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#10B981"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h1 className="text-2xl font-extrabold text-[#2c3e50] tracking-tight mb-3">
        Your voice has been added
      </h1>
      <p className="text-[#7f8c8d] text-base leading-relaxed max-w-xs">
        {contributorName ? `Thank you, ${contributorName}. ` : "Thank you. "}
        Your message is now part of this Living Frame. When the owner scans the
        QR code, your voice will be heard.
      </p>

      <div className="mt-10 w-full max-w-xs bg-[#eef4fa] border border-[#cde0f5] rounded-2xl px-5 py-4 text-left">
        <p className="text-xs font-bold text-[#2C5F8A] uppercase tracking-wider mb-1">
          What happens next
        </p>
        <p className="text-sm text-[#7f8c8d] leading-relaxed">
          The frame owner will lock contributions when everyone has recorded.
          The AI will weave all voices into one narrative story, available every
          time the frame's QR code is scanned.
        </p>
      </div>

      <div className="mt-auto pt-10">
        <p className="text-xs text-[#bdc3c7]">
          Powered by{" "}
          <span className="font-bold text-[#1a3e5c]">
            Awa<span className="text-[#C9A961]">Chapter</span>
          </span>
        </p>
      </div>
    </div>
  );
}
