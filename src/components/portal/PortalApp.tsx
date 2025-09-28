// components/portal/PortalApp.tsx
import React, { useState, useEffect } from "react";
import { InvitationDetails } from "../../types/portal";
// import SmartPortalRouter from "./SmartPortalRouter";
import PromptSpecificPortal from "./PromptSpecificPortal";
import RecordingInterface from "./RecordingInterface";
import SuccessPage from "./SuccessPage";

type PortalStep = "welcome" | "recording" | "success";

interface PortalAppProps {
  token: string;
  invitation: InvitationDetails;
}

const PortalApp: React.FC<PortalAppProps> = ({ token, invitation }) => {
  const [currentStep, setCurrentStep] = useState<PortalStep>("welcome");
  const [guestName, setGuestName] = useState("");
  const [submissionId, setSubmissionId] = useState<string>("");

  // Track interaction analytics
  useEffect(() => {
    // Mark invitation as clicked
    fetch("/api/portal/track-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
  }, [token]);

  const handleStartRecording = (name: string) => {
    setGuestName(name);
    setCurrentStep("recording");
  };

  const handleSubmissionSuccess = (submissionId: string) => {
    setSubmissionId(submissionId);
    setCurrentStep("success");
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "welcome":
        return (
          <PromptSpecificPortal
            invitation={invitation}
            onStartRecording={handleStartRecording}
          />
        );

      case "recording":
        return (
          <RecordingInterface
            token={token}
            invitation={invitation}
            guestName={guestName}
            onSuccess={handleSubmissionSuccess}
            onBack={() => setCurrentStep("welcome")}
          />
        );

      case "success":
        return (
          <SuccessPage invitation={invitation} submissionId={submissionId} />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {renderCurrentStep()}
    </div>
  );
};

export default PortalApp;
