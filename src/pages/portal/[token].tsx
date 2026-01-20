// pages/portal/[token].tsx
import { GetServerSideProps } from "next";
import { supabaseServer } from "@/lib/supabase-server";
import PortalApp from "../../components/portal/PortalApp";

interface InvitationDetails {
  invitation_id: string;
  book_id: string;
  book_title: string;
  inviter_name: string;
  inviter_avatar?: string;
  book_cover_path?: string;
  prompt_id?: number;
  prompt_content?: string;
  chapter_title?: string;
  invitation_type: "general" | "prompt_specific";
  custom_message?: string;
  status: string;
}

interface PortalPageProps {
  token: string;
  invitation: InvitationDetails | null;
  error?: string;
}

export default function PortalPage({
  token,
  invitation,
  error,
}: PortalPageProps) {
  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.766 0L3.048 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error === "expired" ? "Link Expired" : "Invalid Link"}
          </h1>
          <p className="text-gray-600 mb-6">
            {error === "expired"
              ? "This invitation link has expired. Please ask for a new one."
              : "This invitation link is invalid or has been used. Please check your link or ask for a new one."}
          </p>
          <div className="text-sm text-gray-500">
            If you need help, contact the person who sent you this link.
          </div>
        </div>
      </div>
    );
  }

  return <PortalApp token={token} invitation={invitation} />;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { token } = context.params!;

  console.log("1. Token received:", token);
  console.log("2. Token type:", typeof token);
  console.log("3. Token length:", token?.length);

  if (!token || typeof token !== "string") {
    console.log("4. Token validation failed");
    return {
      props: { token: "", invitation: null, error: "invalid" },
    };
  }

  try {
    console.log("5. Calling RPC with token:", token);
    // Test basic Supabase connection
    const testConnection = await supabaseServer
      .from("collaboration_invites")
      .select("id, token, status")
      .eq("token", token)
      .single();

    console.log("Test connection result:", testConnection);
    const { data, error } = await supabaseServer
      .rpc("get_invitation_details_final_v5", { p_token: token })
      .single();

    console.log("6. RPC Response data:", data);
    console.log("7. RPC Response error:", error);
    console.log("8. Data type:", typeof data);
    console.log("9. Data is null?", data === null);

    const invitation = data as InvitationDetails | null;

    console.log("📸 Avatar:", invitation?.inviter_avatar);
    console.log("📖 Cover:", invitation?.book_cover_path);
    if (error) {
      console.log("10. RPC Error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return {
        props: { token, invitation: null, error: "invalid" },
      };
    }

    if (!invitation) {
      console.log("11. No invitation found for token");
      return {
        props: { token, invitation: null, error: "invalid" },
      };
    }

    console.log("12. Successfully found invitation:", invitation.invitation_id);
    return { props: { token, invitation } };
  } catch (err) {
    console.error("13. Portal SSR error:", err);
    console.error(
      "14. Error stack:",
      err instanceof Error ? err.stack : "No stack"
    );
    return {
      props: { token, invitation: null, error: "invalid" },
    };
  }
};
