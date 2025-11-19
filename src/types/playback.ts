// types/playback.ts
// Type definitions for playback system

export interface PlaybackMediaItem {
  id: string;
  media_path: string;
  media_type: "audio" | "video";
  enhanced_text: string | null;
  caption: string | null;
  prompts?: {
    prompt_text: string;
  } | null;
  chapters?: {
    title: string;
    books?: {
      title: string;
      profiles?: {
        full_name: string;
        avatar_url: string | null;
      } | null;
    } | null;
  } | null;
  profiles?: {
    full_name: string;
    avatar_url: string | null;
  } | null;
}

export interface QRScanEvent {
  media_item_id: string;
  user_agent: string;
  device_type: "mobile" | "desktop";
  ip_address: string | null;
  country?: string | null;
  city?: string | null;
  referrer?: string | null;
}
