// types/portal.ts
export interface InvitationDetails {
  invitation_id: string;
  book_id: string;
  book_title: string;
  inviter_name: string;
  prompt_id?: number;
  prompt_text?: string;
  chapter_title?: string;
  invitation_type: "general" | "prompt_specific";
  custom_message?: string;
  status: string;
  invitee_name?: string;
}

export interface SubmissionResponse {
  submissionId: string;
  success: boolean;
  message: string;
  createdUserId: string;
}
