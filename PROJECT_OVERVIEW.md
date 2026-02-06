# Project Overview: Hey Attrangi Meet

## Introduction
**Hey Attrangi Meet** is a modern video conferencing application built with **Next.js 16** (App Router) and **LiveKit**. It provides real-time video and audio communication features, screen sharing, chat, and meeting recording capabilities. The application is designed to be a "well-monitored therapy platform" as indicated by the branding.

## Technology Stack

### Core Frameworks
- **Next.js 15+ (App Router):** The React framework for production.
- **React 19:** UI library.
- **TypeScript:** Static type checking.
- **Tailwind CSS:** Utility-first CSS framework for styling.

### Real-Time Communication
- **LiveKit:**
    - `livekit-client`: Core WebRTC client.
    - `@livekit/components-react`: Pre-built React components for video conferences.
    - `livekit-server-sdk`: Server-side SDK for generating access tokens.

### Backend & Services
- **Cloudinary:** Used for storing meeting recordings (audio uploads converted/stored as video resources).
- **Supabase:** Database and backend services (initialized in `lib/supabase.ts`).
- **Firebase:** Included as a dependency (likely for authentication or legacy services).

### Utilities
- **Sonner:** For toast notifications.
- **Lucide React:** Icons (implied by typical Next.js/Shadcn usage, though specific imports weren't strictly verified, commonly used with `geist`).

## Project Structure

```
├── app/
│   ├── [room]/             # Dynamic route for meeting rooms
│   │   ├── page.tsx        # Main conference UI logic (Room connection, recording, layout)
│   │   ├── left/           # "You left the meeting" page
│   │   └── lobby/          # Pre-join lobby (implied)
│   ├── api/
│   │   ├── token/          # Generates LiveKit access tokens (POST)
│   │   ├── upload-audio/   # Handles file uploads to Cloudinary (POST)
│   │   ├── recording/      # Recording control endpoints
│   │   └── debug-env/      # Environment debugging endpoint
│   ├── layout.tsx          # Root layout with fonts (Geist)
│   └── page.tsx            # Landing page
├── lib/
│   ├── cloudinary.ts       # Cloudinary configuration
│   └── supabase.ts         # Supabase client initialization
├── public/                 # Static assets
└── ...config files         # next.config.ts, tailwind, etc.
```

## Key Features

1.  **Video Conferencing:** Real-time video/audio using WebRTC (LiveKit).
2.  **Screen Sharing:** Participants can share their screens.
3.  **Chat:** Integrated chat functionality within the room.
4.  **Recording:**
    - Custom recording logic using `MediaRecorder` in the browser.
    - Uploads recorded audio blobs to Cloudinary via `/api/upload-audio`.
5.  **Role Management:**
    - Distinction between "Host" and "Guest".
    - Host-specific capabilities (e.g., ending the meeting for everyone).
6.  **Responsive Design:** Mobile-optimized layout with adaptive controls.

## Configuration & Setup

The application requires the following environment variables (likely in `.env.local`):

### LiveKit
- `LIVEKIT_API_KEY`: API Key for LiveKit Cloud/Server.
- `LIVEKIT_API_SECRET`: Secret Key for LiveKit.
- `NEXT_PUBLIC_LK_SERVER_URL`: Public URL of the LiveKit server.

### Cloudinary
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### Supabase
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
