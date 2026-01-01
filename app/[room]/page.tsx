"use client";

import {
  LiveKitRoom,
  VideoConference,
  ControlBar, // Added
  useRoomContext,
  useLocalParticipant, // Added
  LayoutContextProvider, // Added
  GridLayout, // Added
  ParticipantTile, // Added
  useTracks, // Added
  Chat, // Added
  useLayoutContext, // Added
} from "@livekit/components-react";
import "@livekit/components-styles";
import { RoomEvent, Participant, Track } from "livekit-client"; // Added Track

import { useEffect, useState, useRef, Suspense } from "react"; // Added Suspense
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";

interface CustomConferenceProps {
  isHost: boolean;
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

function CustomConference({ isHost, isRecording, onStartRecording, onStopRecording }: CustomConferenceProps) {
  const cameraTracks = useTracks([Track.Source.Camera], { onlySubscribed: true });
  const screenTracks = useTracks([Track.Source.ScreenShare], { onlySubscribed: true });
  const { widget } = useLayoutContext();

  const isScreenSharing = screenTracks.length > 0;
  const showChat = widget.state?.showChat;

  const isMobile = typeof window !== "undefined" && /Android|iPhone|iPad/i.test(navigator.userAgent);

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-black overflow-hidden relative">
      {/* Screen Share */}
      {isScreenSharing && (
        <div className="flex-1 flex items-center justify-center bg-black">
          {screenTracks.map((track) => (
            <ParticipantTile
              key={track.publication.trackSid}
              trackRef={track}
              className="max-h-full max-w-full aspect-video"
            />
          ))}
        </div>
      )}

      {/* Camera Grid */}
      <div className={`${isScreenSharing ? "h-[30%]" : "flex-1"} overflow-y-auto`}>
        <GridLayout tracks={cameraTracks} className="h-full w-full">
          <ParticipantTile />
        </GridLayout>
      </div>

      {/* Chat Overlay */}
      {showChat && (
        <div className="absolute top-0 right-0 h-[calc(100%-72px)] w-full sm:w-80 bg-[#111] border-l border-[#333] z-50">
          <Chat />
        </div>
      )}

      {/* Controls */}
      <div className="h-[72px] shrink-0 bg-black border-t border-[#333] flex items-center justify-center gap-4">
        {/* Host Recording Button */}
        {isHost && (
          <button
            onClick={isRecording ? onStopRecording : onStartRecording}
            className={`p-3 rounded-full transition-colors ${isRecording ? "bg-red-600 hover:bg-red-700" : "bg-gray-800 hover:bg-gray-700"
              }`}
            title={isRecording ? "Stop Recording" : "Start Recording"}
          >
            <div className={`w-5 h-5 rounded-full ${isRecording ? "animate-pulse bg-white" : "bg-red-500"}`} />
          </button>
        )}

        <ControlBar
          controls={{
            screenShare: !isMobile,
            microphone: true,
            camera: true,
            chat: true,
            leave: true,
          }}
        />
      </div>
    </div>
  );
}

export default function RoomPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RoomPageContent />
    </Suspense>
  );
}

function RoomPageContent() { // Renamed and wrapped existing content
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const roomName = params.room as string;
  const username = searchParams.get("user") || "Guest";
  // 🔹 Simple way to check if user is host (in real app, use auth)
  const isInitialHost = searchParams.get("host") === "true"; // Renamed isHost to isInitialHost

  const [token, setToken] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // 🔹 Get token
  useEffect(() => {
    async function getToken() {
      const res = await fetch("/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName,
          userName: username,
          isHost: isInitialHost, // 🟢 Send host status to server (updated to isInitialHost)
        }),
      });

      const data = await res.json();
      setToken(data.token);
    }

    getToken();
  }, [roomName, username, isInitialHost]); // Updated dependency

  // 🔴 START RECORDING
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        await uploadRecording(audioBlob);
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error("Error starting recording:", err);
      alert("Failed to access microphone for recording.");
    }
  }

  // ⏹ STOP RECORDING
  function stopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  }

  async function uploadRecording(blob: Blob) {
    const formData = new FormData();
    formData.append("file", blob);
    formData.append("roomName", roomName);

    try {
      const res = await fetch("/api/upload-audio", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        console.log("Upload success:", data.path);
        toast.success("Recording saved successfully!");
      } else {
        console.error("Upload failed:", data.error);
        toast.error("Failed to save recording.");
      }
    } catch (err) {
      console.error("Error uploading recording:", err);
      toast.error("Error uploading recording.");
    }
  }

  if (!token) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        Joining meeting…
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-black">
      <Toaster position="top-center" richColors />

      <LiveKitRoom
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LK_SERVER_URL!}
        connect={true}
        video={true}
        audio={true}
        onDisconnected={() => router.push(`/${roomName}/left`)}
        className="h-screen w-screen overflow-hidden"
      >
        <LayoutContextProvider>
          <div className="flex h-full w-full flex-col overflow-hidden relative">
            {/* Main Conference Area */}
            <div className="flex-1 w-full h-full">
              <CustomConference
                isHost={isInitialHost}
                isRecording={recording}
                onStartRecording={startRecording}
                onStopRecording={stopRecording}
              />
            </div>

          </div>

          <RoomEvents router={router} />
        </LayoutContextProvider>
      </LiveKitRoom>
    </div>
  );
}

// 🟢 Inner Component to listen to Room Events
function RoomEvents({ router }: { router: any }) {
  const room = useRoomContext();

  useEffect(() => {
    if (!room) return;

    const handleParticipantConnected = (participant: Participant) => {
      toast.success(`${participant.identity} joined the room`);
    };

    const handleParticipantDisconnected = (participant: Participant) => {
      toast.info(`${participant.identity} left the room`);

      // 🛑 Check if the participant who left was the HOST
      if (participant.metadata) {
        try {
          const metadata = JSON.parse(participant.metadata);
          if (metadata.isHost) {
            toast.error("Host ended the meeting.");
            setTimeout(() => {
              room.disconnect();
              router.push("/left"); // Redirect everyone
            }, 2000);
          }
        } catch (e) {
          console.error("Error parsing metadata:", e);
        }
      }
    };

    room.on(RoomEvent.ParticipantConnected, handleParticipantConnected);
    room.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);

    return () => {
      room.off(RoomEvent.ParticipantConnected, handleParticipantConnected);
      room.off(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
    };
  }, [room, router]);

  return null;
}
