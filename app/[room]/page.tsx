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
  FocusLayout, // Added
  CarouselLayout, // Added
  usePinnedTracks, // Added
  RoomAudioRenderer, // Added
  useSpeakingParticipants,
  useParticipants,
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
  const cameraTracks = useTracks([Track.Source.Camera]);
  const screenTracks = useTracks([Track.Source.ScreenShare]);
  const layoutContext = useLayoutContext(); // Get full context
  const { widget } = layoutContext;

  const pinnedTracks = usePinnedTracks(layoutContext);
  const activeSpeakers = useSpeakingParticipants();
  const participants = useParticipants();
  const [showParticipants, setShowParticipants] = useState(false);
  const [lastSpeakerSid, setLastSpeakerSid] = useState<string | null>(null);

  // Remember the last person who spoke
  useEffect(() => {
    if (activeSpeakers.length > 0) {
      setLastSpeakerSid(activeSpeakers[0].sid);
    }
  }, [activeSpeakers]);

  const isScreenSharing = screenTracks.length > 0;
  
  let focusTrack: any = pinnedTracks[0];
  if (!focusTrack && activeSpeakers.length > 0) {
    focusTrack = cameraTracks.find((t) => t.participant.sid === activeSpeakers[0].sid);
  }
  if (!focusTrack && lastSpeakerSid) {
    focusTrack = cameraTracks.find((t) => t.participant.sid === lastSpeakerSid);
  }
  if (!focusTrack && cameraTracks.length > 0) {
    // Default to the first remote participant if nobody has spoken yet
    focusTrack = cameraTracks.find((t) => !t.participant.isLocal) || cameraTracks[0]; 
  }

  const isFocusing = focusTrack !== undefined && participants.length > 1;
  const showChat = widget.state?.showChat;

  const isMobile = typeof window !== "undefined" && /Android|iPhone|iPad/i.test(navigator.userAgent);

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-black overflow-hidden relative">
      {/* Screen Share (Prioritized) */}
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

      {/* Main Content (Focus or Grid) */}
      <div className={`${isScreenSharing ? "h-[30%]" : "flex-1"} overflow-y-auto`}>
        {!isScreenSharing && isFocusing && focusTrack ? (
          <div className="h-full w-full flex flex-col md:flex-row">
            <div className="flex-1 h-[70%] md:h-full">
              <FocusLayout trackRef={focusTrack as any} className="h-full w-full" />
            </div>
            <div className="h-[30%] md:h-full md:w-[250px] overflow-y-auto bg-[#111] p-2 border-l border-[#222]">
              {/* Pass all tracks to Carousel for stability. */}
              <CarouselLayout tracks={cameraTracks}>
                <ParticipantTile />
              </CarouselLayout>
            </div>
          </div>
        ) : (
          <GridLayout tracks={cameraTracks} className="h-full w-full">
            <ParticipantTile />
          </GridLayout>
        )}
      </div>

      {/* Chat Overlay (Persistent for History) */}
      <div
        className={`absolute top-0 right-0 h-[calc(100%-72px)] w-full sm:w-[350px] glass-panel z-50 overflow-hidden transition-all duration-300 ease-in-out transform ${showChat
          ? "translate-x-0 opacity-100"
          : "translate-x-full opacity-0 pointer-events-none"
          }`}
      >
        <Chat />
      </div>

      {/* Participants Sidebar */}
      <div
        className={`absolute top-0 right-0 h-[calc(100%-72px)] w-full sm:w-[320px] glass-panel z-[45] flex flex-col overflow-hidden transition-all duration-300 ease-in-out transform ${showParticipants
          ? "translate-x-0 opacity-100"
          : "translate-x-full opacity-0 pointer-events-none"
          }`}
      >
        <div className="p-4 border-b border-[rgba(255,255,255,0.08)] flex items-center justify-between shrink-0">
          <h3 className="font-bold text-lg text-white tracking-tight">Participants ({participants.length})</h3>
          <button onClick={() => setShowParticipants(false)} className="text-gray-400 hover:text-white transition-colors p-1 rounded-md hover:bg-[rgba(255,255,255,0.1)]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {participants.map((p) => (
            <div key={p.sid} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#333] flex items-center justify-center text-white font-bold shrink-0 shadow-inner">
                {p.identity.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col overflow-hidden text-ellipsis whitespace-nowrap opacity-90">
                <span className="text-white text-sm font-medium">
                  {p.identity} {p.isLocal ? "(You)" : ""}
                </span>
                {/* Could add mic/video status icons here in the future if needed */}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="h-[72px] shrink-0 bg-black border-t border-[#333] flex items-center justify-center gap-4 z-[100] relative">
        <div className="flex items-center justify-center mr-2">
          <button
            onClick={isRecording ? onStopRecording : onStartRecording}
            className={`flex items-center gap-2 px-3 py-2 rounded-md font-semibold transition-colors ${isRecording
              ? "bg-red-600 hover:bg-red-700 text-white animate-pulse"
              : "bg-[#1f1f1f] hover:bg-[#2f2f2f] text-white border border-[#333]"
              }`}
            title={isRecording ? "Stop Recording" : "Start Recording"}
          >
            <div
              className={`w-3 h-3 rounded-full ${isRecording ? "bg-white" : "bg-red-500"
                }`}
            />
            <span className="text-sm">{isRecording ? "REC" : "Record"}</span>
          </button>
        </div>

        {/* Controls center wrapper */}
        <div className="flex flex-1 items-center justify-center gap-2">
          <ControlBar
            controls={{
              screenShare: !isMobile,
              microphone: true,
              camera: true,
              chat: true,
              leave: true,
            }}
          />
          <button 
             onClick={() => setShowParticipants(!showParticipants)} 
             className="px-3 py-2 rounded-lg font-semibold bg-[#1f1f1f] hover:bg-[#2f2f2f] text-white border border-[#333] flex items-center gap-2 transition-all duration-200"
          >
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
               <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="currentColor"/>
             </svg>
             <span className="hidden sm:inline">People</span>
             <div className="px-1.5 py-0.5 bg-[#333] rounded-md text-[11px] font-bold ml-1">{participants.length}</div>
          </button>
        </div>

        {/* Branding (Bottom Right) */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden md:flex flex-col items-end pointer-events-none opacity-80">
          <span className="text-white font-bold text-lg leading-tight tracking-wide">Hey Attrangi</span>
          <span className="text-gray-400 text-[10px] tracking-wider uppercase">well monitored therapy platform</span>
        </div>
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
          <RoomAudioRenderer />
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
