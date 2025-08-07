"use client";
// src/pages/join.tsx - Fixed for Pages Router
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import Head from "next/head";

// --- Types and Interfaces ---
interface InviteDetails {
  valid: boolean;
  error?: string;
  invite_id?: string;
  book_id?: string;
  book_title?: string;
  inviter_name?: string;
  prompt_text?: string;
}

type RecordingState =
  | "idle"
  | "recording"
  | "stopped"
  | "uploading"
  | "error"
  | "success";

// --- Supabase Client Initialization ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- Main Page Component ---
export default function JoinPage() {
  const router = useRouter();
  const { token } = router.query;

  // State Management
  const [inviteDetails, setInviteDetails] = useState<InviteDetails | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>(0);

  // --- Effects ---
  useEffect(() => {
    const validateToken = async () => {
      if (typeof token !== "string") {
        setInviteDetails({ valid: false, error: "Invalid invitation link." });
        setIsLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase.rpc(
          "validate_invitation_token",
          { p_token: token }
        );
        if (error) throw error;
        setInviteDetails(data);
      } catch (err: any) {
        setInviteDetails({ valid: false, error: err.message });
      } finally {
        setIsLoading(false);
      }
    };

    if (router.isReady) {
      validateToken();
    }
  }, [token, router.isReady]);

  // Enhanced recording timer
  useEffect(() => {
    if (recordingState === "recording") {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recordingState === "idle") setRecordingTime(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recordingState]);

  // Audio level visualization
  const updateAudioLevel = () => {
    if (analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(average);
      animationRef.current = requestAnimationFrame(updateAudioLevel);
    }
  };

  // --- Recording Logic ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Set up audio visualization
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      source.connect(analyserRef.current);
      updateAudioLevel();

      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setRecordingState("stopped");
        cancelAnimationFrame(animationRef.current);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setRecordingState("recording");
    } catch (err) {
      alert(
        "Could not access microphone. Please grant permission and try again."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingState === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  // --- Submission Logic ---
  const handleSubmitRecording = async () => {
    if (!audioBlob || !token) return;
    setRecordingState("uploading");

    try {
      const fileName = `${Date.now()}.webm`;
      const filePath = `guest-uploads/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from("book-media")
        .upload(filePath, audioBlob);
      if (uploadError) throw uploadError;

      const { error: submissionError } = await supabase.rpc(
        "handle_guest_submission",
        {
          p_token: token,
          p_media_path: filePath,
        }
      );
      if (submissionError) throw submissionError;

      setRecordingState("success");
    } catch (err: any) {
      console.error("Submission failed:", err);
      setRecordingState("error");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // --- Render Logic ---
  if (isLoading) {
    return (
      <>
        <Head>
          <title>Joining Memory Book... | VoiceVault</title>
        </Head>
        <div style={styles.container}>
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Validating your invitation...</p>
          </div>
        </div>
      </>
    );
  }

  if (!inviteDetails?.valid) {
    return (
      <>
        <Head>
          <title>Invalid Invitation | VoiceVault</title>
        </Head>
        <div style={styles.container}>
          <div style={styles.errorContainer}>
            <div style={styles.errorIcon}>❌</div>
            <h2>Oops!</h2>
            <p>
              {inviteDetails?.error || "This link is invalid or has expired."}
            </p>
          </div>
        </div>
      </>
    );
  }

  if (recordingState === "success") {
    return (
      <>
        <Head>
          <title>Story Submitted! | VoiceVault</title>
        </Head>
        <div style={styles.container}>
          <div style={styles.successContainer}>
            <div style={styles.successIcon}>🎉</div>
            <h1 style={styles.successTitle}>Thank You!</h1>
            <p style={styles.successText}>
              Your story has been successfully submitted.{" "}
              {inviteDetails.inviter_name} has been notified and will review it
              soon.
            </p>
            <div style={styles.successFooter}>
              <p>Your voice matters. Thank you for sharing your memory! 💙</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Contribute to {inviteDetails.book_title} | VoiceVault</title>
        <meta
          name="description"
          content={`Share your memory for ${inviteDetails.book_title} by ${inviteDetails.inviter_name}`}
        />
      </Head>

      <div style={styles.container}>
        <div style={styles.backgroundGradient}></div>

        <header style={styles.header}>
          <div style={styles.headerContent}>
            <div style={styles.inviteIcon}>📖</div>
            <h2 style={styles.inviteTitle}>You're invited to contribute to:</h2>
            <h1 style={styles.bookTitle}>{inviteDetails.book_title}</h1>
            <p style={styles.inviterName}>by {inviteDetails.inviter_name}</p>
          </div>
        </header>

        <main style={styles.main}>
          <div style={styles.promptCard}>
            <div style={styles.promptIcon}>💭</div>
            <p style={styles.promptText}>
              {inviteDetails.prompt_text ||
                "Share your memory for this chapter."}
            </p>
          </div>

          <div style={styles.recordingSection}>
            {recordingState === "idle" && (
              <div style={styles.idleState}>
                <button onClick={startRecording} style={styles.primaryButton}>
                  <span style={styles.buttonIcon}>🎤</span>
                  Start Recording
                </button>
                <p style={styles.helpText}>Tap to begin sharing your story</p>
              </div>
            )}

            {recordingState === "recording" && (
              <div style={styles.recordingState}>
                <div
                  style={{
                    ...styles.recordingVisual,
                    transform: `scale(${1 + audioLevel / 500})`,
                  }}
                >
                  <div style={styles.pulseRing}></div>
                  <div style={styles.recordingDot}></div>
                </div>
                <p style={styles.recordingTime}>{formatTime(recordingTime)}</p>
                <button onClick={stopRecording} style={styles.stopButton}>
                  <span style={styles.buttonIcon}>⏹️</span>
                  Stop Recording
                </button>
                <p style={styles.recordingHint}>
                  Speak clearly and take your time
                </p>
              </div>
            )}

            {recordingState === "stopped" && audioBlob && (
              <div style={styles.reviewState}>
                <div style={styles.audioPlayer}>
                  <audio
                    src={URL.createObjectURL(audioBlob)}
                    controls
                    style={styles.audioControls}
                  />
                </div>
                <p style={styles.reviewText}>Review your recording above</p>
                <div style={styles.buttonGroup}>
                  <button
                    onClick={() => {
                      setRecordingState("idle");
                      setAudioBlob(null);
                    }}
                    style={styles.secondaryButton}
                  >
                    🔄 Re-record
                  </button>
                  <button
                    onClick={handleSubmitRecording}
                    style={styles.primaryButton}
                  >
                    <span style={styles.buttonIcon}>📤</span>
                    Submit Story
                  </button>
                </div>
              </div>
            )}

            {recordingState === "uploading" && (
              <div style={styles.uploadingState}>
                <div style={styles.uploadSpinner}></div>
                <p style={styles.uploadingText}>Uploading your story...</p>
                <p style={styles.uploadingHint}>Please don't close this page</p>
              </div>
            )}

            {recordingState === "error" && (
              <div style={styles.errorState}>
                <div style={styles.errorIcon}>⚠️</div>
                <p style={styles.errorText}>
                  Something went wrong. Please try again.
                </p>
                <button
                  onClick={() => setRecordingState("stopped")}
                  style={styles.primaryButton}
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </main>

        <footer style={styles.footer}>
          <p style={styles.footerText}>Powered by VoiceVault</p>
        </footer>
      </div>
    </>
  );
}

// --- Styles (same as before) ---
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    position: "relative",
    display: "flex",
    flexDirection: "column",
  },

  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)",
    pointerEvents: "none",
  },

  header: {
    padding: "2rem 1rem 1rem",
    textAlign: "center" as const,
  },

  headerContent: {
    maxWidth: "400px",
    margin: "0 auto",
  },

  inviteIcon: {
    fontSize: "3rem",
    marginBottom: "1rem",
  },

  inviteTitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: "0.9rem",
    fontWeight: "400",
    marginBottom: "0.5rem",
    textTransform: "uppercase" as const,
    letterSpacing: "1px",
  },

  bookTitle: {
    color: "white",
    fontSize: "1.8rem",
    fontWeight: "700",
    marginBottom: "0.5rem",
    lineHeight: "1.2",
  },

  inviterName: {
    color: "rgba(255,255,255,0.8)",
    fontSize: "1rem",
    fontWeight: "500",
  },

  main: {
    flex: 1,
    padding: "0 1rem 2rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2rem",
  },

  promptCard: {
    background: "rgba(255,255,255,0.95)",
    backdropFilter: "blur(10px)",
    borderRadius: "16px",
    padding: "1.5rem",
    maxWidth: "400px",
    width: "100%",
    boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
    border: "1px solid rgba(255,255,255,0.2)",
  },

  promptIcon: {
    fontSize: "1.5rem",
    marginBottom: "0.5rem",
  },

  promptText: {
    fontSize: "1.1rem",
    lineHeight: "1.5",
    color: "#333",
    margin: 0,
    fontWeight: "500",
  },

  recordingSection: {
    maxWidth: "400px",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  idleState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1rem",
  },

  recordingState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1.5rem",
  },

  recordingVisual: {
    position: "relative",
    transition: "transform 0.1s ease",
  },

  pulseRing: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "120px",
    height: "120px",
    border: "2px solid rgba(255,59,59,0.3)",
    borderRadius: "50%",
    animation: "pulse 2s infinite",
  },

  recordingDot: {
    width: "80px",
    height: "80px",
    background: "#ff3b3b",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2rem",
    animation: "recordingPulse 1s infinite alternate",
  },

  recordingTime: {
    color: "white",
    fontSize: "1.5rem",
    fontWeight: "600",
    fontFamily: "monospace",
  },

  recordingHint: {
    color: "rgba(255,255,255,0.8)",
    fontSize: "0.9rem",
    textAlign: "center" as const,
  },

  reviewState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1.5rem",
    width: "100%",
  },

  audioPlayer: {
    width: "100%",
  },

  audioControls: {
    width: "100%",
    height: "60px",
    borderRadius: "30px",
    outline: "none",
  },

  reviewText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: "0.9rem",
  },

  buttonGroup: {
    display: "flex",
    gap: "1rem",
    width: "100%",
  },

  primaryButton: {
    background: "linear-gradient(45deg, #4CAF50, #45a049)",
    color: "white",
    border: "none",
    padding: "16px 24px",
    borderRadius: "25px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(76,175,80,0.3)",
    flex: 1,
    minHeight: "54px",
  },

  secondaryButton: {
    background: "rgba(255,255,255,0.2)",
    color: "white",
    border: "2px solid rgba(255,255,255,0.3)",
    padding: "14px 24px",
    borderRadius: "25px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    flex: 1,
    minHeight: "54px",
  },

  stopButton: {
    background: "linear-gradient(45deg, #f44336, #d32f2f)",
    color: "white",
    border: "none",
    padding: "16px 24px",
    borderRadius: "25px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(244,67,54,0.3)",
  },

  buttonIcon: {
    fontSize: "1.2rem",
  },

  helpText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: "0.9rem",
    textAlign: "center" as const,
  },

  uploadingState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1rem",
  },

  uploadSpinner: {
    width: "40px",
    height: "40px",
    border: "3px solid rgba(255,255,255,0.3)",
    borderTop: "3px solid white",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  uploadingText: {
    color: "white",
    fontSize: "1.1rem",
    fontWeight: "600",
  },

  uploadingHint: {
    color: "rgba(255,255,255,0.8)",
    fontSize: "0.9rem",
  },

  errorState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1rem",
  },

  errorIcon: {
    fontSize: "3rem",
  },

  errorText: {
    color: "white",
    fontSize: "1rem",
    textAlign: "center" as const,
  },

  successContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2rem",
    padding: "2rem",
    maxWidth: "400px",
    margin: "auto",
    textAlign: "center" as const,
  },

  successIcon: {
    fontSize: "4rem",
    animation: "bounce 0.6s ease-in-out",
  },

  successTitle: {
    color: "white",
    fontSize: "2.5rem",
    fontWeight: "700",
    margin: 0,
  },

  successText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: "1.1rem",
    lineHeight: "1.6",
  },

  successFooter: {
    background: "rgba(255,255,255,0.1)",
    padding: "1rem",
    borderRadius: "12px",
    marginTop: "1rem",
  },

  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2rem",
    padding: "4rem 2rem",
  },

  spinner: {
    width: "50px",
    height: "50px",
    border: "3px solid rgba(255,255,255,0.3)",
    borderTop: "3px solid white",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  loadingText: {
    color: "white",
    fontSize: "1.1rem",
  },

  errorContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1.5rem",
    padding: "4rem 2rem",
    textAlign: "center" as const,
    color: "white",
  },

  footer: {
    padding: "1rem",
    textAlign: "center" as const,
  },

  footerText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: "0.8rem",
  },
};
// // pages/join.tsx - Enhanced Next.js page for VoiceVault guest invitations
// import { useRouter } from "next/router";
// import { useEffect, useState, useRef } from "react";
// import { createClient, SupabaseClient } from "@supabase/supabase-js";

// // --- Types and Interfaces (UNCHANGED) ---
// interface InviteDetails {
//   valid: boolean;
//   error?: string;
//   invite_id?: string;
//   book_id?: string;
//   book_title?: string;
//   inviter_name?: string;
//   prompt_text?: string;
// }

// type RecordingState =
//   | "idle"
//   | "recording"
//   | "stopped"
//   | "uploading"
//   | "error"
//   | "success";

// // --- Supabase Client Initialization (UNCHANGED) ---
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
// const supabase = createClient(supabaseUrl, supabaseAnonKey);

// // --- Main Page Component ---
// export default function JoinPage() {
//   const router = useRouter();
//   const { token } = router.query;

//   // State Management (UNCHANGED CORE LOGIC)
//   const [inviteDetails, setInviteDetails] = useState<InviteDetails | null>(
//     null
//   );
//   const [isLoading, setIsLoading] = useState(true);
//   const [recordingState, setRecordingState] = useState<RecordingState>("idle");
//   const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
//   const [recordingTime, setRecordingTime] = useState(0);
//   const [audioLevel, setAudioLevel] = useState(0);

//   const mediaRecorderRef = useRef<MediaRecorder | null>(null);
//   const audioChunksRef = useRef<Blob[]>([]);
//   const timerRef = useRef<NodeJS.Timeout | null>(null);
//   const audioContextRef = useRef<AudioContext | null>(null);
//   const analyserRef = useRef<AnalyserNode | null>(null);
//   const animationRef = useRef<number>(0);

//   // --- Effects (CORE VALIDATION UNCHANGED) ---
//   useEffect(() => {
//     const validateToken = async () => {
//       if (typeof token !== "string") {
//         setInviteDetails({ valid: false, error: "Invalid invitation link." });
//         setIsLoading(false);
//         return;
//       }
//       try {
//         const { data, error } = await supabase.rpc(
//           "validate_invitation_token",
//           { p_token: token }
//         );
//         if (error) throw error;
//         setInviteDetails(data);
//       } catch (err: any) {
//         setInviteDetails({ valid: false, error: err.message });
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     if (router.isReady) {
//       validateToken();
//     }
//   }, [token, router.isReady]);

//   // Enhanced recording timer
//   useEffect(() => {
//     if (recordingState === "recording") {
//       timerRef.current = setInterval(() => {
//         setRecordingTime((prev) => prev + 1);
//       }, 1000);
//     } else {
//       if (timerRef.current) clearInterval(timerRef.current);
//       if (recordingState === "idle") setRecordingTime(0);
//     }
//     return () => {
//       if (timerRef.current) clearInterval(timerRef.current);
//     };
//   }, [recordingState]);

//   // Audio level visualization
//   const updateAudioLevel = () => {
//     if (analyserRef.current) {
//       const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
//       analyserRef.current.getByteFrequencyData(dataArray);
//       const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
//       setAudioLevel(average);
//       animationRef.current = requestAnimationFrame(updateAudioLevel);
//     }
//   };

//   // --- Enhanced Recording Logic (CORE FUNCTIONALITY PRESERVED) ---
//   const startRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

//       // Set up audio visualization
//       audioContextRef.current = new (window.AudioContext ||
//         (window as any).webkitAudioContext)();
//       const source = audioContextRef.current.createMediaStreamSource(stream);
//       analyserRef.current = audioContextRef.current.createAnalyser();
//       source.connect(analyserRef.current);
//       updateAudioLevel();

//       mediaRecorderRef.current = new MediaRecorder(stream);
//       audioChunksRef.current = [];

//       mediaRecorderRef.current.ondataavailable = (event) => {
//         audioChunksRef.current.push(event.data);
//       };

//       mediaRecorderRef.current.onstop = () => {
//         const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
//         setAudioBlob(blob);
//         setRecordingState("stopped");
//         cancelAnimationFrame(animationRef.current);
//         stream.getTracks().forEach((track) => track.stop());
//       };

//       mediaRecorderRef.current.start();
//       setRecordingState("recording");
//     } catch (err) {
//       alert(
//         "Could not access microphone. Please grant permission and try again."
//       );
//     }
//   };

//   const stopRecording = () => {
//     if (mediaRecorderRef.current && recordingState === "recording") {
//       mediaRecorderRef.current.stop();
//     }
//   };

//   // --- Submission Logic (UNCHANGED) ---
//   const handleSubmitRecording = async () => {
//     if (!audioBlob || !token) return;
//     setRecordingState("uploading");

//     try {
//       const fileName = `${Date.now()}.webm`;
//       const filePath = `guest-uploads/${fileName}`;
//       const { error: uploadError } = await supabase.storage
//         .from("book-media")
//         .upload(filePath, audioBlob);
//       if (uploadError) throw uploadError;

//       const { error: submissionError } = await supabase.rpc(
//         "handle_guest_submission",
//         {
//           p_token: token,
//           p_media_path: filePath,
//         }
//       );
//       if (submissionError) throw submissionError;

//       setRecordingState("success");
//     } catch (err: any) {
//       console.error("Submission failed:", err);
//       setRecordingState("error");
//     }
//   };

//   const formatTime = (seconds: number) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}:${secs.toString().padStart(2, "0")}`;
//   };

//   // --- Enhanced Render Logic ---
//   if (isLoading) {
//     return (
//       <div style={styles.container}>
//         <div style={styles.loadingContainer}>
//           <div style={styles.spinner}></div>
//           <p style={styles.loadingText}>Validating your invitation...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!inviteDetails?.valid) {
//     return (
//       <div style={styles.container}>
//         <div style={styles.errorContainer}>
//           <div style={styles.errorIcon}>❌</div>
//           <h2>Oops!</h2>
//           <p>
//             {inviteDetails?.error || "This link is invalid or has expired."}
//           </p>
//         </div>
//       </div>
//     );
//   }

//   if (recordingState === "success") {
//     return (
//       <div style={styles.container}>
//         <div style={styles.successContainer}>
//           <div style={styles.successIcon}>🎉</div>
//           <h1 style={styles.successTitle}>Thank You!</h1>
//           <p style={styles.successText}>
//             Your story has been successfully submitted.{" "}
//             {inviteDetails.inviter_name} has been notified and will review it
//             soon.
//           </p>
//           <div style={styles.successFooter}>
//             <p>Your voice matters. Thank you for sharing your memory! 💙</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div style={styles.container}>
//       <div style={styles.backgroundGradient}></div>

//       <header style={styles.header}>
//         <div style={styles.headerContent}>
//           <div style={styles.inviteIcon}>📖</div>
//           <h2 style={styles.inviteTitle}>You're invited to contribute to:</h2>
//           <h1 style={styles.bookTitle}>{inviteDetails.book_title}</h1>
//           <p style={styles.inviterName}>by {inviteDetails.inviter_name}</p>
//         </div>
//       </header>

//       <main style={styles.main}>
//         <div style={styles.promptCard}>
//           <div style={styles.promptIcon}>💭</div>
//           <p style={styles.promptText}>
//             {inviteDetails.prompt_text || "Share your memory for this chapter."}
//           </p>
//         </div>

//         <div style={styles.recordingSection}>
//           {recordingState === "idle" && (
//             <div style={styles.idleState}>
//               <button onClick={startRecording} style={styles.primaryButton}>
//                 <span style={styles.buttonIcon}>🎤</span>
//                 Start Recording
//               </button>
//               <p style={styles.helpText}>Tap to begin sharing your story</p>
//             </div>
//           )}

//           {recordingState === "recording" && (
//             <div style={styles.recordingState}>
//               <div
//                 style={{
//                   ...styles.recordingVisual,
//                   transform: `scale(${1 + audioLevel / 500})`,
//                 }}
//               >
//                 <div style={styles.pulseRing}></div>
//                 <div style={styles.recordingDot}></div>
//               </div>
//               <p style={styles.recordingTime}>{formatTime(recordingTime)}</p>
//               <button onClick={stopRecording} style={styles.stopButton}>
//                 <span style={styles.buttonIcon}>⏹️</span>
//                 Stop Recording
//               </button>
//               <p style={styles.recordingHint}>
//                 Speak clearly and take your time
//               </p>
//             </div>
//           )}

//           {recordingState === "stopped" && audioBlob && (
//             <div style={styles.reviewState}>
//               <div style={styles.audioPlayer}>
//                 <audio
//                   src={URL.createObjectURL(audioBlob)}
//                   controls
//                   style={styles.audioControls}
//                 />
//               </div>
//               <p style={styles.reviewText}>Review your recording above</p>
//               <div style={styles.buttonGroup}>
//                 <button
//                   onClick={() => {
//                     setRecordingState("idle");
//                     setAudioBlob(null);
//                   }}
//                   style={styles.secondaryButton}
//                 >
//                   🔄 Re-record
//                 </button>
//                 <button
//                   onClick={handleSubmitRecording}
//                   style={styles.primaryButton}
//                 >
//                   <span style={styles.buttonIcon}>📤</span>
//                   Submit Story
//                 </button>
//               </div>
//             </div>
//           )}

//           {recordingState === "uploading" && (
//             <div style={styles.uploadingState}>
//               <div style={styles.uploadSpinner}></div>
//               <p style={styles.uploadingText}>Uploading your story...</p>
//               <p style={styles.uploadingHint}>Please don't close this page</p>
//             </div>
//           )}

//           {recordingState === "error" && (
//             <div style={styles.errorState}>
//               <div style={styles.errorIcon}>⚠️</div>
//               <p style={styles.errorText}>
//                 Something went wrong. Please try again.
//               </p>
//               <button
//                 onClick={() => setRecordingState("stopped")}
//                 style={styles.primaryButton}
//               >
//                 Try Again
//               </button>
//             </div>
//           )}
//         </div>
//       </main>

//       <footer style={styles.footer}>
//         <p style={styles.footerText}>Powered by VoiceVault</p>
//       </footer>
//     </div>
//   );
// }

// // --- Enhanced Styles ---
// const styles: { [key: string]: React.CSSProperties } = {
//   container: {
//     fontFamily:
//       '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
//     minHeight: "100vh",
//     background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
//     position: "relative",
//     display: "flex",
//     flexDirection: "column",
//   },

//   backgroundGradient: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     background:
//       "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)",
//     pointerEvents: "none",
//   },

//   header: {
//     padding: "2rem 1rem 1rem",
//     textAlign: "center" as const,
//   },

//   headerContent: {
//     maxWidth: "400px",
//     margin: "0 auto",
//   },

//   inviteIcon: {
//     fontSize: "3rem",
//     marginBottom: "1rem",
//   },

//   inviteTitle: {
//     color: "rgba(255,255,255,0.9)",
//     fontSize: "0.9rem",
//     fontWeight: "400",
//     marginBottom: "0.5rem",
//     textTransform: "uppercase" as const,
//     letterSpacing: "1px",
//   },

//   bookTitle: {
//     color: "white",
//     fontSize: "1.8rem",
//     fontWeight: "700",
//     marginBottom: "0.5rem",
//     lineHeight: "1.2",
//   },

//   inviterName: {
//     color: "rgba(255,255,255,0.8)",
//     fontSize: "1rem",
//     fontWeight: "500",
//   },

//   main: {
//     flex: 1,
//     padding: "0 1rem 2rem",
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//     gap: "2rem",
//   },

//   promptCard: {
//     background: "rgba(255,255,255,0.95)",
//     backdropFilter: "blur(10px)",
//     borderRadius: "16px",
//     padding: "1.5rem",
//     maxWidth: "400px",
//     width: "100%",
//     boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
//     border: "1px solid rgba(255,255,255,0.2)",
//   },

//   promptIcon: {
//     fontSize: "1.5rem",
//     marginBottom: "0.5rem",
//   },

//   promptText: {
//     fontSize: "1.1rem",
//     lineHeight: "1.5",
//     color: "#333",
//     margin: 0,
//     fontWeight: "500",
//   },

//   recordingSection: {
//     maxWidth: "400px",
//     width: "100%",
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//   },

//   idleState: {
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//     gap: "1rem",
//   },

//   recordingState: {
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//     gap: "1.5rem",
//   },

//   recordingVisual: {
//     position: "relative",
//     transition: "transform 0.1s ease",
//   },

//   pulseRing: {
//     position: "absolute",
//     top: "50%",
//     left: "50%",
//     transform: "translate(-50%, -50%)",
//     width: "120px",
//     height: "120px",
//     border: "2px solid rgba(255,59,59,0.3)",
//     borderRadius: "50%",
//     animation: "pulse 2s infinite",
//   },

//   recordingDot: {
//     width: "80px",
//     height: "80px",
//     background: "#ff3b3b",
//     borderRadius: "50%",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     fontSize: "2rem",
//     animation: "recordingPulse 1s infinite alternate",
//   },

//   recordingTime: {
//     color: "white",
//     fontSize: "1.5rem",
//     fontWeight: "600",
//     fontFamily: "monospace",
//   },

//   recordingHint: {
//     color: "rgba(255,255,255,0.8)",
//     fontSize: "0.9rem",
//     textAlign: "center" as const,
//   },

//   reviewState: {
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//     gap: "1.5rem",
//     width: "100%",
//   },

//   audioPlayer: {
//     width: "100%",
//   },

//   audioControls: {
//     width: "100%",
//     height: "60px",
//     borderRadius: "30px",
//     outline: "none",
//   },

//   reviewText: {
//     color: "rgba(255,255,255,0.9)",
//     fontSize: "0.9rem",
//   },

//   buttonGroup: {
//     display: "flex",
//     gap: "1rem",
//     width: "100%",
//   },

//   primaryButton: {
//     background: "linear-gradient(45deg, #4CAF50, #45a049)",
//     color: "white",
//     border: "none",
//     padding: "16px 24px",
//     borderRadius: "25px",
//     fontSize: "1rem",
//     fontWeight: "600",
//     cursor: "pointer",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: "0.5rem",
//     transition: "all 0.3s ease",
//     boxShadow: "0 4px 15px rgba(76,175,80,0.3)",
//     flex: 1,
//     minHeight: "54px",
//   },

//   secondaryButton: {
//     background: "rgba(255,255,255,0.2)",
//     color: "white",
//     border: "2px solid rgba(255,255,255,0.3)",
//     padding: "14px 24px",
//     borderRadius: "25px",
//     fontSize: "1rem",
//     fontWeight: "600",
//     cursor: "pointer",
//     transition: "all 0.3s ease",
//     flex: 1,
//     minHeight: "54px",
//   },

//   stopButton: {
//     background: "linear-gradient(45deg, #f44336, #d32f2f)",
//     color: "white",
//     border: "none",
//     padding: "16px 24px",
//     borderRadius: "25px",
//     fontSize: "1rem",
//     fontWeight: "600",
//     cursor: "pointer",
//     display: "flex",
//     alignItems: "center",
//     gap: "0.5rem",
//     transition: "all 0.3s ease",
//     boxShadow: "0 4px 15px rgba(244,67,54,0.3)",
//   },

//   buttonIcon: {
//     fontSize: "1.2rem",
//   },

//   helpText: {
//     color: "rgba(255,255,255,0.8)",
//     fontSize: "0.9rem",
//     textAlign: "center" as const,
//   },

//   uploadingState: {
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//     gap: "1rem",
//   },

//   uploadSpinner: {
//     width: "40px",
//     height: "40px",
//     border: "3px solid rgba(255,255,255,0.3)",
//     borderTop: "3px solid white",
//     borderRadius: "50%",
//     animation: "spin 1s linear infinite",
//   },

//   uploadingText: {
//     color: "white",
//     fontSize: "1.1rem",
//     fontWeight: "600",
//   },

//   uploadingHint: {
//     color: "rgba(255,255,255,0.8)",
//     fontSize: "0.9rem",
//   },

//   errorState: {
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//     gap: "1rem",
//   },

//   errorIcon: {
//     fontSize: "3rem",
//   },

//   errorText: {
//     color: "white",
//     fontSize: "1rem",
//     textAlign: "center" as const,
//   },

//   successContainer: {
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//     gap: "2rem",
//     padding: "2rem",
//     maxWidth: "400px",
//     margin: "auto",
//     textAlign: "center" as const,
//   },

//   successIcon: {
//     fontSize: "4rem",
//     animation: "bounce 0.6s ease-in-out",
//   },

//   successTitle: {
//     color: "white",
//     fontSize: "2.5rem",
//     fontWeight: "700",
//     margin: 0,
//   },

//   successText: {
//     color: "rgba(255,255,255,0.9)",
//     fontSize: "1.1rem",
//     lineHeight: "1.6",
//   },

//   successFooter: {
//     background: "rgba(255,255,255,0.1)",
//     padding: "1rem",
//     borderRadius: "12px",
//     marginTop: "1rem",
//   },

//   loadingContainer: {
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//     gap: "2rem",
//     padding: "4rem 2rem",
//   },

//   spinner: {
//     width: "50px",
//     height: "50px",
//     border: "3px solid rgba(255,255,255,0.3)",
//     borderTop: "3px solid white",
//     borderRadius: "50%",
//     animation: "spin 1s linear infinite",
//   },

//   loadingText: {
//     color: "white",
//     fontSize: "1.1rem",
//   },

//   errorContainer: {
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//     gap: "1.5rem",
//     padding: "4rem 2rem",
//     textAlign: "center" as const,
//     color: "white",
//   },

//   footer: {
//     padding: "1rem",
//     textAlign: "center" as const,
//   },

//   footerText: {
//     color: "rgba(255,255,255,0.6)",
//     fontSize: "0.8rem",
//   },
// };

// // Add CSS animations via a style tag (you'd typically put this in a CSS file)
// if (typeof document !== "undefined") {
//   const style = document.createElement("style");
//   style.textContent = `
//     @keyframes pulse {
//       0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
//       100% { transform: translate(-50%, -50%) scale(1.2); opacity: 0; }
//     }
//     @keyframes recordingPulse {
//       0% { opacity: 1; }
//       100% { opacity: 0.7; }
//     }
//     @keyframes spin {
//       0% { transform: rotate(0deg); }
//       100% { transform: rotate(360deg); }
//     }
//     @keyframes bounce {
//       0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
//       40% { transform: translateY(-10px); }
//       60% { transform: translateY(-5px); }
//     }
//   `;
//   document.head.appendChild(style);
// }
