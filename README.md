# AwaChapter Guest Portal

Tokenized web portal enabling async voice story submissions from external collaborators without requiring account creation.

## Overview

Guest-facing web interface that allows users and collaborators to contribute voice inputs to collaborative memory books via secure, expiring invitation links. Built with Next.js for optimal SSR performance and deployed on Render.

## Key Features

- **Tokenized Access** - Secure, time-limited invitation links for guest access
- **Voice Recording** - Browser-based audio capture with real-time preview
- **Auto-Transcription** - Groq Whisper integration for speech-to-text conversion
- **Zero Friction** - No login/signup required for contributors
- **Mobile Optimized** - Responsive design for recording on any device

## Technical Architecture

### Stack
- **Framework:** Next.js 15 (SSR)
- **Database:** Supabase (PostgreSQL + Edge Functions)
- **Transcription:** Groq Whisper API
- **Storage:** S3 storageUploadt-media bucket)
- **Deployment:** Render
- **Styling:** Tailwind CSS

### Data Flow
```
Supabasereceives invite link with token
  ↓
Portal validates token via RPC (get_invitation_details_final_v4)
  ↓
User contributes rcontributesn browser
  ↓
Upload to media-bucket
  ↓
Trigger transcription Edge Function (Groq Whisper)
  ↓
Submit to database
  ↓
Approval triggers sync to media_items via PostgreSQL trigger
```

## Key Technical Decisions

### 1. Server-Side Rendering (SSR)
Used `getServerSideProps` for token validation to prevent invalid link access at the routing level, improving security and UX.

### 2. Client-Side Duration Calculation
Audio duration computed in-browser using native Audio API rather than server-side processing, eliminating ffmpeg dependency and reducing server load.

### 3. Automatic Enhancement Sync
Database triggers ensure AI-enhanced stories automatically propagate from `guest_submissions` to `media_items` without manual intervention, solving async race conditions.

### 4. Retry Logic with Exponential Backoff
Transcription requests retry up to 3 times with exponential backoff (1s, 2s, 4s) to handle network instability and API rate limits.

## Repository Structure

```
pages/
  ├── api/
  │   └── portal/
  │       ├── upload-audio.ts      # Audio file upload handler
  │       ├── submit-story.ts      # Story submission with transcription
  │       └── track-click.ts       # Analytics tracking
  └── portal/
      └── [token].tsx              # Dynamic token-based portal page

components/
  └── portal/
      ├── PortalApp.tsx            # Main portal controller
      ├── RecordingInterface.tsx   # Audio recording UI
      ├── PromptSpecificPortal.tsx # Prompt-based entry
      └── SuccessPage.tsx          # Post-submission confirmation

lib/
  ├── supabase.ts                  # Client-side Supabase config
  └── supabase-server.ts           # Server-side Supabase config
```

## Environment Variables

```bash
encryption
Guestvesates## Status

**Production** - Actively used for guest story collection

---

**Part of the AwaChapter ecosystem** - Building voice-first legacy preservation infrastructure.
