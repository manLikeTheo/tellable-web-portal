// app/c/[token]/page.tsx
//
// Server Component. Validates the magic link token before rendering anything.
// Invalid/expired tokens never reach the client recording component.

import { Metadata } from "next";
import { validateToken } from "@/lib/contributor";
import TokenInvalid from "@/components/frame-contributor/TokenInvalid";
import RecordingClient from "./RecordingClient";

interface Props {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  return {
    title: "Add Your Voice — AwaChapter",
    description:
      "You've been invited to add your voice to a Living Frame on AwaChapter.",
    openGraph: {
      title: "Add Your Voice — AwaChapter",
      description:
        "Leave a personal voice or video message for a Living Frame.",
      url: `https://awachapter.com/c/${token}`,
    },
  };
}

export default async function ContributorPage({ params }: Props) {
  const { token } = await params;
  const result = await validateToken(token);

  if (!result.valid) {
    return <TokenInvalid reason={result.reason} />;
  }

  return (
    <RecordingClient
      contributorId={result.contributor.id}
      storyPageId={result.contributor.story_page_id}
      token={token}
    />
  );
}
