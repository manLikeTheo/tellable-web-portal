// components/portal/PortalApp.tsx - ENHANCED 5-SCREEN FLOW
import React, { useState, useEffect } from "react";
import { InvitationDetails } from "../../types/portal";
import WelcomeSplash from "./WelcomeSplash";
import StoryContext from "./StoryContext";
import RecordingPrep from "./RecordingPrep";
import RecordingInterface from "./RecordingInterface";
import ReviewSubmit from "./ReviewSubmit";
import SuccessPage from "./SuccessPage";

type PortalStep =
  | "splash"
  | "context"
  | "prep"
  | "recording"
  | "review"
  | "success";

interface PortalAppProps {
  token: string;
  invitation: InvitationDetails;
}

const PortalApp: React.FC<PortalAppProps> = ({ token, invitation }) => {
  const [currentStep, setCurrentStep] = useState<PortalStep>("splash");
  const [guestName, setGuestName] = useState("");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [submissionId, setSubmissionId] = useState<string>("");

  // Track interaction analytics
  useEffect(() => {
    fetch("/api/portal/track-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
  }, [token]);

  // Navigation handlers
  const handleContinueFromSplash = () => {
    setCurrentStep("context");
  };

  const handleNextFromContext = () => {
    setCurrentStep("prep");
  };

  const handleStartRecording = (name: string) => {
    setGuestName(name);
    setCurrentStep("recording");
  };

  const handleRecordingComplete = (blob: Blob, duration: number) => {
    setAudioBlob(blob);
    setAudioDuration(duration);
    setCurrentStep("review");
  };

  const handleReRecord = () => {
    setAudioBlob(null);
    setAudioDuration(0);
    setCurrentStep("recording");
  };

  const handleSubmissionSuccess = (submissionId: string) => {
    setSubmissionId(submissionId);
    setCurrentStep("success");
  };

  // Step navigation helpers
  const goBack = () => {
    const stepOrder: PortalStep[] = [
      "splash",
      "context",
      "prep",
      "recording",
      "review",
      "success",
    ];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  // Render current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case "splash":
        return (
          <WelcomeSplash
            invitation={invitation}
            onContinue={handleContinueFromSplash}
          />
        );

      case "context":
        return (
          <StoryContext
            invitation={invitation}
            onNext={handleNextFromContext}
            onBack={goBack}
          />
        );

      case "prep":
        return (
          <RecordingPrep
            invitation={invitation}
            onStartRecording={handleStartRecording}
            onBack={goBack}
          />
        );

      case "recording":
        return (
          <RecordingInterface
            invitation={invitation}
            guestName={guestName}
            onComplete={handleRecordingComplete}
            onBack={goBack}
          />
        );

      case "review":
        return audioBlob ? (
          <ReviewSubmit
            invitation={invitation}
            audioBlob={audioBlob}
            audioDuration={audioDuration}
            guestName={guestName}
            token={token}
            onSuccess={handleSubmissionSuccess}
            onReRecord={handleReRecord}
          />
        ) : null;

      case "success":
        return (
          <SuccessPage invitation={invitation} submissionId={submissionId} />
        );

      default:
        return null;
    }
  };

  return <div className="min-h-screen">{renderCurrentStep()}</div>;
};

export default PortalApp;

// // components/portal/PortalApp.tsx -- OLD
// import React, { useState, useEffect } from "react";
// import { InvitationDetails } from "../../types/portal";
// // import SmartPortalRouter from "./SmartPortalRouter";
// import PromptSpecificPortal from "./PromptSpecificPortal";
// import RecordingInterface from "./RecordingInterface";
// import SuccessPage from "./SuccessPage";

// type PortalStep = "welcome" | "recording" | "success";

// interface PortalAppProps {
//   token: string;
//   invitation: InvitationDetails;
// }

// const PortalApp: React.FC<PortalAppProps> = ({ token, invitation }) => {
//   const [currentStep, setCurrentStep] = useState<PortalStep>("welcome");
//   const [guestName, setGuestName] = useState("");
//   const [submissionId, setSubmissionId] = useState<string>("");

//   // Track interaction analytics
//   useEffect(() => {
//     // Mark invitation as clicked
//     fetch("/api/portal/track-click", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ token }),
//     });
//   }, [token]);

//   const handleStartRecording = (name: string) => {
//     setGuestName(name);
//     setCurrentStep("recording");
//   };

//   const handleSubmissionSuccess = (submissionId: string) => {
//     setSubmissionId(submissionId);
//     setCurrentStep("success");
//   };

//   const renderCurrentStep = () => {
//     switch (currentStep) {
//       case "welcome":
//         return (
//           <PromptSpecificPortal
//             invitation={invitation}
//             onStartRecording={handleStartRecording}
//           />
//         );

//       case "recording":
//         return (
//           <RecordingInterface
//             token={token}
//             invitation={invitation}
//             guestName={guestName}
//             onSuccess={handleSubmissionSuccess}
//             onBack={() => setCurrentStep("welcome")}
//           />
//         );

//       case "success":
//         return (
//           <SuccessPage invitation={invitation} submissionId={submissionId} />
//         );

//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
//       {renderCurrentStep()}
//     </div>
//   );
// };

// export default PortalApp;
