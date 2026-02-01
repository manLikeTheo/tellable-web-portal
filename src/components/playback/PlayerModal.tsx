// components/PlayerModal.tsx
import { useEffect } from "react";
import { createPortal } from "react-dom";

interface PlayerModalProps {
  children: React.ReactNode;
  onClose: () => void;
  isOpen?: boolean;
}

export default function PlayerModal({
  children,
  onClose,
  isOpen = true,
}: PlayerModalProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Create portal to render at document root (for proper z-index)
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="player-modal"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/95"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Close modal"
      />
      {/* <div
        className="absolute inset-0 bg-black/95 backdrop-blur-none"
        onClick={onClose}
        aria-label="Close modal"
      /> */}

      {/* Modal Content Container */}
      <div
        className="relative w-full h-full max-w-7xl mx-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.25s ease-out;
        }

        /* Ensure modal is always on top */
        :global(body:has(.fixed.z-\\[9999\\])) {
          overflow: hidden;
        }
      `}</style>
    </div>,
    document.body
  );
}
